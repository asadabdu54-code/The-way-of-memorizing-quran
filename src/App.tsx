import {
  ArrowRight,
  ArrowUp,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Home,
  List,
  Menu,
  Moon,
  Search,
  Sun,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  buildBookSegments,
  chaptersEn,
  getChapters,
  getSectionMetadata,
  getWeeklyGoalInfo,
  initialBookmarks,
  initialNotes,
  parseSectionId,
  sectionId,
  uiTranslations,
  type BookSegment,
  type ChapterDefinition,
  type ContentParagraph,
  type Language,
  type TextGroup,
  type WeeklyGoalInfo,
} from "./bookData";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";

type Theme = "light" | "dark";
type NavigationId =
  | "home"
  | "reader"
  | "contents"
  | "bookmarks"
  | "notes";

interface SavedPassage {
  title: string;
  chapter: string;
  sectionId: string;
}

interface ReadingNote {
  title: string;
  text: string;
  sectionId: string;
}

interface SearchResult {
  title: string;
  chapter: string;
  excerpt: string;
  id: string;
}

interface NavigationItemConfig {
  id: NavigationId;
  target: string;
  Icon: LucideIcon;
  labelKey: keyof (typeof uiTranslations)["en"];
}

const navigationConfig: NavigationItemConfig[] = [
  { labelKey: "navHome", id: "home", target: "home", Icon: Home },
  { labelKey: "navReader", id: "reader", target: "reader", Icon: BookOpen },
  {
    labelKey: "navContents",
    id: "contents",
    target: "sidebar-book-contents",
    Icon: List,
  },
  {
    labelKey: "navBookmarks",
    id: "bookmarks",
    target: "bookmarks",
    Icon: Bookmark,
  },
  { labelKey: "navNotes", id: "notes", target: "notes", Icon: FileText },
];

const lineHeightSteps = [1.9, 2.1, 1.7];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  // Monday is start of week: Monday=1, Sunday=0
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${dayOfMonth}`);
  }
  return dates;
}

function loadReadingActivity(): string[] {
  try {
    const stored = localStorage.getItem("quran-reading-activity");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function loadSavedPassages(): SavedPassage[] {
  try {
    const stored = localStorage.getItem("quran-bookmarks");
    if (!stored) return initialBookmarks; // Empty array [] by default

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const bookmarks: SavedPassage[] = [];
    for (const item of parsed) {
      if (!isRecord(item)) continue;

      let id = typeof item.sectionId === "string" ? item.sectionId : undefined;
      if (!id && typeof item.title === "string") {
        for (const [cIndex, ch] of chaptersEn.entries()) {
          const sIndex = ch.sections.indexOf(item.title);
          if (sIndex >= 0) {
            id = sectionId(cIndex, sIndex);
            break;
          }
        }
      }

      if (!id || !parseSectionId(id)) continue;
      const parsedMeta = parseSectionId(id)!;
      const chapter = chaptersEn[parsedMeta.chapterIndex];
      const title = chapter.sections[parsedMeta.sectionIndex];

      bookmarks.push({
        title: typeof item.title === "string" ? item.title : title,
        chapter: typeof item.chapter === "string" ? item.chapter : chapter.title,
        sectionId: id,
      });
    }
    return bookmarks;
  } catch (error) {
    console.warn("Could not read bookmarks from local storage.", error);
    return [];
  }
}

function loadReadingNotes(): ReadingNote[] {
  try {
    const stored = localStorage.getItem("quran-notes");
    if (!stored) return initialNotes; // Empty array [] by default

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const notes: ReadingNote[] = [];
    for (const item of parsed) {
      if (
        !isRecord(item) ||
        typeof item.title !== "string" ||
        typeof item.text !== "string"
      ) {
        continue;
      }

      let id = typeof item.sectionId === "string" ? item.sectionId : undefined;
      if (!id) {
        for (const [cIndex, ch] of chaptersEn.entries()) {
          const sIndex = ch.sections.indexOf(item.title);
          if (sIndex >= 0) {
            id = sectionId(cIndex, sIndex);
            break;
          }
        }
      }

      if (!id || !parseSectionId(id)) continue;

      notes.push({
        title: item.title,
        text: item.text,
        sectionId: id,
      });
    }
    return notes;
  } catch (error) {
    console.warn("Could not read notes from local storage.", error);
    return [];
  }
}

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem("quran-theme");
    return stored === "dark" ? "dark" : "light";
  } catch (error) {
    console.warn("Could not read the selected theme from local storage.", error);
    return "light";
  }
}

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem("quran-language");
    return stored === "ar" ? "ar" : "en";
  } catch (error) {
    console.warn("Could not read the selected language from local storage.", error);
    return "en";
  }
}

function getParagraphs(group: TextGroup): ContentParagraph[] {
  return group.paragraphs;
}

function isArabicText(text: string): boolean {
  return /[\u0600-\u06ff]/u.test(text) && !/[A-Za-z]{12,}/u.test(text);
}

function Paragraph({
  paragraph,
  language,
}: {
  paragraph: ContentParagraph;
  language: Language;
}) {
  if (paragraph.kind === "subheading") {
    if (
      paragraph.text === "INTRODUCTION" ||
      paragraph.text === "المقدمة"
    ) {
      return <span className="document-subheading">{paragraph.text}</span>;
    }

    return <h4 className="document-subheading">{paragraph.text}</h4>;
  }

  const isAr = language === "ar" || isArabicText(paragraph.text);
  const className = [
    "document-paragraph",
    paragraph.kind === "footnote" ? "document-footnote" : "",
    isAr ? "document-arabic" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={className} dir={isAr ? "rtl" : "ltr"}>
      {paragraph.text}
    </p>
  );
}

function TextGroupContent({
  group,
  language,
}: {
  group: TextGroup;
  language: Language;
}) {
  return (
    <>
      {getParagraphs(group).map((paragraph, index) => (
        <Paragraph
          key={`${index}-${paragraph.text.slice(0, 20)}`}
          paragraph={paragraph}
          language={language}
        />
      ))}
    </>
  );
}

function Logo({
  compact = false,
  t,
}: {
  compact?: boolean;
  t: (typeof uiTranslations)["en"];
}) {
  return (
    <a
      className={`brand ${compact ? "brand-compact" : ""}`}
      href="#home"
      aria-label="Qur'an reader home"
    >
      <span className="brand-mark" aria-hidden="true">
        <span lang="ar" dir="rtl">
          اقرأ
        </span>
      </span>
      <span className="brand-copy">
        <strong lang="ar" dir="rtl">
          {t.heroArabicTitle.replace("\n", " ")}
        </strong>
        <small>{t.siteSubtitle}</small>
      </span>
    </a>
  );
}

function Topbar({
  onBookmark,
  onSearch,
  onTheme,
  onMenu,
  onToggleLanguage,
  mobile,
  bookmarked,
  searchTriggerRef,
  language,
  t,
}: {
  onBookmark: () => void;
  onSearch: () => void;
  onTheme: () => void;
  onMenu: () => void;
  onToggleLanguage: () => void;
  mobile: boolean;
  bookmarked: boolean;
  searchTriggerRef: RefObject<HTMLButtonElement | null>;
  language: Language;
  t: (typeof uiTranslations)["en"];
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button
          className="header-icon menu-trigger"
          type="button"
          aria-label={t.openNav}
          onClick={onMenu}
        >
          <Menu aria-hidden="true" />
        </button>
        <Logo t={t} />
        <button
          ref={searchTriggerRef}
          className={`top-search ${mobile ? "top-search-compact" : ""}`}
          type="button"
          onClick={onSearch}
          aria-label={t.searchPlaceholder}
        >
          <Search aria-hidden="true" />
          <span>{t.searchPlaceholder}</span>
          <kbd>{t.searchKbd}</kbd>
        </button>
        <div className="topbar-actions">
          <button
            className="lang-selector"
            type="button"
            onClick={onToggleLanguage}
            aria-label={t.langSwitchAria}
            title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
          >
            <span className={language === "en" ? "lang-active" : ""}>EN</span>
            <span className="lang-sep">/</span>
            <span className={language === "ar" ? "lang-active" : ""}>عربي</span>
          </button>
          <button
            className={`header-icon ${bookmarked ? "is-active" : ""}`}
            type="button"
            onClick={onBookmark}
            aria-label={bookmarked ? t.removeBookmark : t.bookmarkCurrent}
            title={bookmarked ? t.removeBookmark : t.bookmarkCurrent}
            aria-pressed={bookmarked}
          >
            <Bookmark aria-hidden="true" />
          </button>
          <button
            className="header-icon"
            type="button"
            onClick={onTheme}
            aria-label={t.toggleTheme}
            title={t.toggleTheme}
          >
            <Moon className="moon-icon" aria-hidden="true" />
            <Sun className="sun-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({
  activeChapterIndex,
  activeNavigation,
  activeSectionId,
  bookmarks,
  bookContentsOpen,
  currentChapters,
  goalInfo,
  isOpen,
  isMobile,
  language,
  onClose,
  onCloseBookContents,
  onNavigate,
  onToggleBookContents,
  t,
}: {
  activeChapterIndex: number;
  activeNavigation: NavigationId;
  activeSectionId: string;
  bookmarks: SavedPassage[];
  bookContentsOpen: boolean;
  currentChapters: ChapterDefinition[];
  goalInfo: WeeklyGoalInfo;
  isOpen: boolean;
  isMobile: boolean;
  language: Language;
  onClose: () => void;
  onCloseBookContents: () => void;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
  onToggleBookContents: () => void;
  t: (typeof uiTranslations)["en"];
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const contentsRef = useRef<HTMLDivElement>(null);
  const contentsTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && isMobile) closeRef.current?.focus();
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!bookContentsOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !contentsRef.current?.contains(event.target)
      ) {
        onCloseBookContents();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [bookContentsOpen, onCloseBookContents]);

  function navigateFromContents(target: string) {
    onCloseBookContents();
    onNavigate(target, "reader");
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!bookContentsOpen) {
        onToggleBookContents();
      }
      setTimeout(() => {
        const firstItem = contentsRef.current?.querySelector<HTMLElement>(
          ".toc-dropdown button:not(:disabled), .toc-dropdown a[href]",
        );
        firstItem?.focus();
      }, 50);
    } else if (event.key === "Escape" && bookContentsOpen) {
      event.preventDefault();
      onCloseBookContents();
    }
  }

  function handleContentsKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCloseBookContents();
      contentsTriggerRef.current?.focus();
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href]",
      ),
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (currentIndex < 0) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (currentIndex +
              (event.key === "ArrowDown" ? 1 : items.length - 1)) %
            items.length;
    items[nextIndex]?.focus();
  }

  return (
    <>
      {isMobile && isOpen && (
        <button
          className="drawer-scrim"
          type="button"
          aria-label={t.closeNav}
          onClick={onClose}
        />
      )}
      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
        aria-hidden={isMobile && !isOpen}
      >
        <div className="drawer-header">
          <Logo compact t={t} />
          <button
            ref={closeRef}
            className="header-icon drawer-close"
            type="button"
            aria-label={t.closeNav}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav className="main-nav" aria-label={t.library}>
          <p className="eyebrow sidebar-label">{t.library}</p>
          {navigationConfig.map(({ labelKey, id, target, Icon }) => {
            const label = t[labelKey] as string;
            return id === "contents" ? (
              <div className="nav-dropdown" key={id} ref={contentsRef}>
                <button
                  ref={contentsTriggerRef}
                  id="book-contents-trigger"
                  className={`nav-link nav-dropdown-trigger ${activeNavigation === id || bookContentsOpen ? "active" : ""}`}
                  type="button"
                  aria-expanded={bookContentsOpen}
                  aria-controls="book-contents-dropdown"
                  aria-haspopup="true"
                  onClick={onToggleBookContents}
                  onKeyDown={handleTriggerKeyDown}
                >
                  <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                  <span>{label}</span>
                  <ChevronDown
                    className={`nav-dropdown-chevron${bookContentsOpen ? " is-open" : ""}`}
                    size={16}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id="book-contents-dropdown"
                  className={`toc-dropdown${bookContentsOpen ? " is-open" : ""}`}
                  aria-hidden={!bookContentsOpen}
                  aria-labelledby="book-contents-trigger"
                  role="region"
                  onKeyDown={handleContentsKeyDown}
                >
                  <nav className="toc-dropdown-inner" aria-label="Book chapters and sections">
                    {currentChapters.map((chapter, chapterIndex) => (
                      <div className="toc-chapter" key={`chapter-${chapterIndex}-${chapter.title}`}>
                        <button
                          className={`toc-chapter-title ${chapterIndex === activeChapterIndex ? "current" : ""}`}
                          type="button"
                          onClick={() =>
                            navigateFromContents(`chapter-${chapterIndex + 1}`)
                          }
                        >
                          <span className="toc-chapter-index">
                            {String(chapterIndex + 1).padStart(2, "0")}
                          </span>
                          <span>{chapter.title}</span>
                          <ChevronRight
                            size={14}
                            className={language === "ar" ? "rtl-flip" : ""}
                            aria-hidden="true"
                          />
                        </button>
                        <div className="toc-section-list">
                          {chapter.sections.map((title, sectionIndex) => {
                            const sectionTarget = sectionId(chapterIndex, sectionIndex);
                            return (
                              <a
                                key={sectionTarget}
                                className={`toc-section-link ${activeSectionId === sectionTarget ? "active" : ""}`}
                                href={`#${sectionTarget}`}
                                onClick={(event) => {
                                  event.preventDefault();
                                  navigateFromContents(sectionTarget);
                                }}
                              >
                                <span className="toc-dot" aria-hidden="true" />
                                <span>{title}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            ) : (
              <a
                key={id}
                className={`nav-link ${activeNavigation === id ? "active" : ""}`}
                href={`#${target}`}
                aria-current={activeNavigation === id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(target, id);
                }}
              >
                <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                <span>{label}</span>
                {id === "bookmarks" && (
                  <span className="nav-count">{bookmarks.length}</span>
                )}
              </a>
            );
          })}
        </nav>

        <section className="sidebar-goal" aria-label={t.weeklyGoal}>
          <div className="goal-heading">
            <span>{t.weeklyGoal}</span>
            <strong>{goalInfo.progressText}</strong>
          </div>
          <p>{goalInfo.statusText}</p>
          <div
            className="goal-track"
            aria-label={goalInfo.progressText}
            style={{ "--goal-progress": `${goalInfo.percent}%` } as CSSProperties}
          >
            <span />
          </div>
        </section>
      </aside>
    </>
  );
}

function ChapterCard({
  chapterIndex,
  currentChapters,
  language,
  t,
}: {
  chapterIndex: number;
  currentChapters: ChapterDefinition[];
  language: Language;
  t: (typeof uiTranslations)["en"];
}) {
  const chapter = currentChapters[chapterIndex];

  return (
    <section
      className="chapter-header"
      id={`chapter-${chapterIndex + 1}`}
      aria-labelledby={`chapter-title-${chapterIndex + 1}`}
    >
      <div className="chapter-number">
        <span className="eyebrow">{t.chapterLabel}</span>
        <strong>{String(chapterIndex + 1).padStart(2, "0")}</strong>
      </div>
      <div className="chapter-heading-copy">
        {language === "en" && (
          <p className="chapter-arabic" lang="ar" dir="rtl">
            {chapter.arabic}
          </p>
        )}
        <h2 id={`chapter-title-${chapterIndex + 1}`}>{chapter.title}</h2>
        <div className="gold-rule" aria-hidden="true" />
        <p className="chapter-subtitle">{chapter.subtitle}</p>
      </div>
    </section>
  );
}

function BookContent({
  activeSectionId,
  bookmarkedSections,
  currentChapters,
  language,
  onBeginAgain,
  onBookmark,
  segments,
  t,
}: {
  activeSectionId: string;
  bookmarkedSections: Set<string>;
  currentChapters: ChapterDefinition[];
  language: Language;
  onBeginAgain: () => void;
  onBookmark: (id: string) => void;
  segments: BookSegment[];
  t: (typeof uiTranslations)["en"];
}) {
  return (
    <article className="book-document" id="book-content" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="book-opening">
        <p className="bismillah" lang="ar" dir="rtl">
          {t.bismillah}
        </p>
        {language === "en" && (
          <p className="bismillah-translation">
            {t.bismillahTrans}
          </p>
        )}
        <div className="author-rule" />
        <h2>{t.authorName}</h2>
        <p>{t.authorRole}</p>
        <strong className="edition">{t.edition}</strong>
      </header>

      {segments.map((segment, index) => {
        if (segment.type === "chapter") {
          return (
            <ChapterCard
              key={`chapter-${segment.chapterIndex}-${index}`}
              chapterIndex={segment.chapterIndex}
              currentChapters={currentChapters}
              language={language}
              t={t}
            />
          );
        }

        if (segment.kind === "section") {
          const chapterIndex = segment.chapterIndex ?? 0;
          const sectionIndex = segment.sectionIndex ?? 0;
          const id = sectionId(chapterIndex, sectionIndex);
          const chapter = currentChapters[chapterIndex];
          const title = chapter ? chapter.sections[sectionIndex] : "";
          const saved = bookmarkedSections.has(id);

          return (
            <section
              className={`book-section ${activeSectionId === id ? "section-current" : ""}`}
              id={id}
              data-reader-section
              data-chapter-index={chapterIndex}
              data-section-index={sectionIndex}
              key={`section-${id}`}
              aria-labelledby={`${id}-title`}
            >
              <div className="section-rule" aria-hidden="true">
                <span>
                  {String(chapterIndex + 1).padStart(2, "0")}.
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
                <i />
              </div>
              <div className="section-content">
                <div className="section-heading-row">
                  <div>
                    <h3 id={`${id}-title`}>{title}</h3>
                  </div>
                  <button
                    className={`section-bookmark ${saved ? "saved" : ""}`}
                    type="button"
                    aria-label={saved ? `${t.removeBookmark}: ${title}` : `${t.bookmarkCurrent}: ${title}`}
                    aria-pressed={saved}
                    onClick={() => onBookmark(id)}
                  >
                    <Bookmark size={16} aria-hidden="true" />
                  </button>
                </div>
                <TextGroupContent group={segment} language={language} />
              </div>
            </section>
          );
        }

        const groupId =
          segment.kind === "frontmatter"
            ? "book-introduction"
            : segment.kind === "appendix"
              ? "book-appendices"
              : undefined;
        const groupClass = [
          "document-group",
          `document-group-${segment.kind}`,
        ].join(" ");

        return (
          <section
            className={groupClass}
            id={groupId}
            key={`${segment.kind}-${index}`}
          >
            <TextGroupContent group={segment} language={language} />
          </section>
        );
      })}
      <section className="book-complete" aria-labelledby="book-complete-heading">
        <span className="complete-mark" aria-hidden="true">
          <Check size={28} />
        </span>
        <span className="eyebrow">{t.bookComplete}</span>
        <h2 id="book-complete-heading">
          {t.completeHeading.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && <br />}
            </span>
          ))}
        </h2>
        <p>{t.completeDesc}</p>
        <button className="button button-green" type="button" onClick={onBeginAgain}>
          {t.beginAgain} <ChevronUp size={16} aria-hidden="true" />
        </button>
      </section>
    </article>
  );
}

function BookToolbar({
  fontSize,
  onFontChange,
  onNote,
  onBookmark,
  onSearch,
  onSpacing,
  onTheme,
  spacingStep,
  theme,
  t,
}: {
  fontSize: number;
  onFontChange: (delta: number) => void;
  onNote: () => void;
  onBookmark: () => void;
  onSearch: () => void;
  onSpacing: () => void;
  onTheme: () => void;
  spacingStep: number;
  theme: Theme;
  t: (typeof uiTranslations)["en"];
}) {
  return (
    <div className="reader-toolbar" aria-label="Reader controls">
      <div className="font-controls">
        <span className="eyebrow">{t.toolbarText}</span>
        <button
          className="text-control"
          type="button"
          aria-label="Decrease font size"
          disabled={fontSize <= 14}
          onClick={() => onFontChange(-2)}
        >
          −
        </button>
        <output aria-live="polite">{fontSize}</output>
        <button
          className="text-control"
          type="button"
          aria-label="Increase font size"
          disabled={fontSize >= 28}
          onClick={() => onFontChange(2)}
        >
          +
        </button>
      </div>
      <span className="toolbar-divider" aria-hidden="true" />
      <button
        className={`tool-button ${spacingStep !== 0 ? "tool-active" : ""}`}
        type="button"
        aria-label="Adjust paragraph spacing"
        onClick={onSpacing}
        aria-pressed={spacingStep !== 0}
        title={`${t.toolbarSpacing}: ${t.spacingLevels[spacingStep]}`}
      >
        <span className="spacing-glyph" aria-hidden="true">
          ≡
        </span>
        <span>{t.toolbarSpacing}</span>
      </button>
      <button
        className="tool-button"
        type="button"
        aria-label={theme === "dark" ? "Switch to light theme" : "Toggle focus theme"}
        onClick={onTheme}
      >
        {theme === "dark" ? (
          <Sun size={16} aria-hidden="true" />
        ) : (
          <Moon size={16} aria-hidden="true" />
        )}
        <span>{theme === "dark" ? t.themeLight : t.themeFocus}</span>
      </button>
      <button
        className="tool-button"
        type="button"
        aria-label={t.bookmarkCurrent}
        onClick={onBookmark}
      >
        <Bookmark size={16} aria-hidden="true" />
        <span>{t.save}</span>
      </button>
      <button className="tool-button" type="button" onClick={onNote} aria-label={t.note}>
        <FileText size={16} aria-hidden="true" />
        <span>{t.note}</span>
      </button>
      <button className="tool-button" type="button" onClick={onSearch} aria-label={t.find}>
        <Search size={16} aria-hidden="true" />
        <span>{t.find}</span>
      </button>
    </div>
  );
}

function Hero({
  onNavigate,
  currentSection,
  currentSectionId,
  language,
  t,
}: {
  onNavigate: (target: string, navigationId?: NavigationId) => void;
  currentSection: string;
  currentSectionId: string;
  language: Language;
  t: (typeof uiTranslations)["en"];
}) {
  return (
    <section className="welcome" id="home">
      <div className="welcome-pattern" aria-hidden="true" />
      <div className="welcome-copy">
        <p className="hero-kicker">
          <span aria-hidden="true" />
          {t.heroKicker}
        </p>
        <h1 lang="ar" dir="rtl">
          {t.heroArabicTitle.split("\n").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx === 0 && <br />}
            </span>
          ))}
        </h1>
        {language === "en" && <h2>{t.heroEnglishTitle}</h2>}
        <p className="hero-description">{t.heroDesc}</p>
        <div className="hero-actions">
          <a
            className="button button-gold"
            href="#reader"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("reader", "reader");
            }}
          >
            {t.startReading}
            <ArrowRight
              size={17}
              className={language === "ar" ? "rtl-flip" : ""}
              aria-hidden="true"
            />
          </a>
          <a
            className="button button-quiet"
            href="#chapter-1"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("chapter-1", "reader");
            }}
          >
            <List size={16} aria-hidden="true" />
            {t.bookContentsBtn}
          </a>
        </div>
      </div>
      <a
        className="journey-card"
        href="#reader"
        aria-label={`${t.continueReading} - ${currentSection}`}
        onClick={(event) => {
          event.preventDefault();
          const target = document.getElementById(currentSectionId);
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <span className="journey-copy">
          <span className="eyebrow">{t.continueReading}</span>
          <strong>{currentSection}</strong>
          <span>{t.returnToSection}</span>
        </span>
        <ArrowRight
          size={18}
          className={language === "ar" ? "rtl-flip" : ""}
          aria-hidden="true"
        />
      </a>
    </section>
  );
}

function LearningSpace({
  bookmarks,
  notes,
  language,
  onAddNote,
  onDeleteNote,
  onNavigate,
  onViewNote,
  t,
}: {
  bookmarks: SavedPassage[];
  notes: ReadingNote[];
  language: Language;
  onAddNote: () => void;
  onDeleteNote: (index: number) => void;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
  onViewNote: (note: ReadingNote) => void;
  t: (typeof uiTranslations)["en"];
}) {
  return (
    <section className="student-section" aria-labelledby="learning-heading">
      <div className="learning-inner">
        <div className="learning-heading">
          <div>
            <p className="eyebrow">{t.learningSpaceEyebrow}</p>
            <h2 id="learning-heading">{t.learningSpaceHeading}</h2>
            <p>{t.learningSpaceDesc}</p>
          </div>
        </div>
        <div className="learning-grid">
          <div className="learning-stack">
            <section className="learning-card" id="bookmarks">
              <div className="card-title-row">
                <h3>
                  <Bookmark size={18} aria-hidden="true" />
                  {t.savedBookmarksHeading}
                </h3>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onNavigate("bookmarks", "bookmarks")}
                >
                  {t.viewAll}
                </button>
              </div>
              <div className="saved-list">
                {bookmarks.length === 0 ? (
                  <p className="empty-state">{t.emptyBookmarks}</p>
                ) : (
                  bookmarks.map((item) => {
                    const meta = getSectionMetadata(item.sectionId, language);
                    const displayTitle = meta ? meta.title : item.title;
                    const displayChapter = meta ? meta.chapter : item.chapter;

                    return (
                      <button
                        className="saved-row"
                        type="button"
                        key={item.sectionId}
                        onClick={() => onNavigate(item.sectionId, "reader")}
                      >
                        <span>
                          <strong>{displayTitle}</strong>
                          <small>{displayChapter}</small>
                        </span>
                        <ChevronRight
                          size={16}
                          className={language === "ar" ? "rtl-flip" : ""}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </section>
            <section className="learning-card" id="notes">
              <div className="card-title-row">
                <h3>
                  <FileText size={18} aria-hidden="true" />
                  {t.personalNotesHeading}
                </h3>
                <button
                  className="text-button"
                  type="button"
                  aria-label={t.addNoteBtn}
                  onClick={onAddNote}
                >
                  {t.addNoteBtn}
                </button>
              </div>
              <div className="saved-list notes-list">
                {notes.length === 0 ? (
                  <p className="empty-state">{t.emptyNotes}</p>
                ) : (
                  notes.map((note, index) => {
                    const meta = getSectionMetadata(note.sectionId, language);
                    const displayTitle = meta ? meta.title : note.title;

                    return (
                      <div className="note-entry" key={`${note.sectionId}-${index}`}>
                        <button
                          className="note-row"
                          type="button"
                          onClick={() => onViewNote(note)}
                          aria-label={`View note: ${displayTitle}`}
                        >
                          <span className="note-label">{displayTitle}</span>
                          <span className="note-description">{note.text}</span>
                        </button>
                        <button
                          className="note-delete"
                          type="button"
                          onClick={() => onDeleteNote(index)}
                          aria-label={`Delete note: ${displayTitle}`}
                          title={t.deleteNote}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchDialog({
  language,
  onClose,
  onNavigate,
  onQueryChange,
  query,
  results,
  t,
}: {
  language: Language;
  onClose: () => void;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
  onQueryChange: (query: string) => void;
  query: string;
  results: SearchResult[];
  t: (typeof uiTranslations)["en"];
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t.searchDialogAria}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="search-input-wrap">
          <Search size={19} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t.searchDialogPlaceholder}
            autoComplete="off"
            dir={language === "ar" ? "rtl" : "ltr"}
          />
          <button className="escape-key" type="button" onClick={onClose}>
            Esc
          </button>
        </div>
        <div className="search-results">
          {!query.trim() ? (
            <>
              <p className="eyebrow">{t.trySearchingFor}</p>
              <div className="search-suggestions">
                {t.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onQueryChange(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                className="search-result"
                type="button"
                key={`${result.id}-${result.title}`}
                onClick={() => {
                  onClose();
                  onNavigate(result.id, "reader");
                }}
              >
                <span>
                  <strong>{result.title}</strong>
                  <small>{result.chapter}</small>
                  <span className="search-excerpt">{result.excerpt}</span>
                </span>
                <ArrowRight
                  size={16}
                  className={language === "ar" ? "rtl-flip" : ""}
                  aria-hidden="true"
                />
              </button>
            ))
          ) : (
            <p className="search-empty">{t.noResults}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function NoteDialog({
  currentSection,
  language,
  onClose,
  onSave,
  t,
}: {
  currentSection: string;
  language: Language;
  onClose: () => void;
  onSave: (text: string) => void;
  t: (typeof uiTranslations)["en"];
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const save = () => {
    const note = text.trim();
    if (!note) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    onSave(note);
  };

  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="note-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-dialog-title"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{t.noteDialogEyebrow}</p>
            <h2 id="note-dialog-title">{currentSection}</h2>
          </div>
          <button
            className="header-icon dialog-close"
            type="button"
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <label className="sr-only" htmlFor="note-input">
          {t.notePlaceholder}
        </label>
        <textarea
          id="note-input"
          ref={inputRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (event.target.value.trim()) setError(false);
          }}
          placeholder={t.notePlaceholder}
          aria-describedby={error ? "note-error" : undefined}
          dir={language === "ar" ? "rtl" : "ltr"}
        />
        {error && (
          <p className="form-error" id="note-error" role="alert">
            {t.noteError}
          </p>
        )}
        <div className="dialog-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="button button-green" type="button" onClick={save}>
            {t.saveNote}
          </button>
        </div>
      </section>
    </div>
  );
}

function NoteViewer({
  note,
  language,
  onClose,
  onDelete,
  t,
}: {
  note: ReadingNote;
  language: Language;
  onClose: () => void;
  onDelete: () => void;
  t: (typeof uiTranslations)["en"];
}) {
  const meta = getSectionMetadata(note.sectionId, language);
  const displayTitle = meta ? meta.title : note.title;

  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="note-dialog note-viewer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-note-title"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{t.savedNoteEyebrow}</p>
            <h2 id="saved-note-title">{displayTitle}</h2>
          </div>
          <button
            className="header-icon dialog-close"
            type="button"
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="saved-note-content" dir="auto">{note.text}</p>
        <div className="dialog-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>
            {t.close}
          </button>
          <button className="button button-danger" type="button" onClick={onDelete}>
            <Trash2 size={15} aria-hidden="true" />
            {t.deleteNote}
          </button>
        </div>
      </section>
    </div>
  );
}

function getSearchResults(
  query: string,
  segments: BookSegment[],
  currentChapters: ChapterDefinition[],
): SearchResult[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  const addResult = (result: SearchResult) => {
    const key = `${result.id}-${result.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(result);
  };

  for (const segment of segments) {
    if (segment.type === "chapter") {
      const chapter = currentChapters[segment.chapterIndex];
      if (
        chapter &&
        `${chapter.title} ${chapter.subtitle}`.toLocaleLowerCase().includes(normalized)
      ) {
        addResult({
          title: chapter.title,
          chapter: chapter.title,
          excerpt: chapter.subtitle,
          id: `chapter-${segment.chapterIndex + 1}`,
        });
      }
      continue;
    }

    if (segment.kind === "section") {
      const chapterIndex = segment.chapterIndex ?? 0;
      const sectionIndex = segment.sectionIndex ?? 0;
      const chapter = currentChapters[chapterIndex];
      if (!chapter) continue;
      const title = chapter.sections[sectionIndex] ?? "";
      const content = `${title} ${segment.paragraphs
        .map((paragraph) => paragraph.text)
        .join(" ")}`;
      if (content.toLocaleLowerCase().includes(normalized)) {
        const excerpt =
          segment.paragraphs.find((paragraph) =>
            paragraph.text.toLocaleLowerCase().includes(normalized),
          )?.text ?? title;
        addResult({
          title,
          chapter: chapter.title,
          excerpt,
          id: sectionId(chapterIndex, sectionIndex),
        });
      }
      continue;
    }

    for (const paragraph of segment.paragraphs) {
      if (!paragraph.text.toLocaleLowerCase().includes(normalized)) continue;
      const id =
        segment.kind === "appendix"
          ? "book-appendices"
          : segment.kind === "chapter-intro"
            ? `chapter-${(segment.chapterIndex ?? 0) + 1}`
            : "book-introduction";
      const chapter =
        segment.chapterIndex !== undefined
          ? currentChapters[segment.chapterIndex]
          : undefined;
      addResult({
        title:
          chapter
            ? chapter.title
            : paragraph.kind === "subheading"
              ? paragraph.text
              : "Introduction",
        chapter:
          chapter
            ? chapter.title
            : currentChapters[0]?.title ?? "Introduction",
        excerpt: paragraph.text,
        id,
      });
    }
  }

  return results.slice(0, 24);
}

function App() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const t = uiTranslations[language];
  const currentChapters = useMemo(() => getChapters(language), [language]);
  const segments = useMemo(() => buildBookSegments(language), [language]);

  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [fontSize, setFontSize] = useState(18);
  const [spacingStep, setSpacingStep] = useState(0);
  const [bookmarks, setBookmarks] = useState<SavedPassage[]>(loadSavedPassages);
  const [notes, setNotes] = useState<ReadingNote[]>(loadReadingNotes);
  const [readingActivity, setReadingActivity] = useState<string[]>(loadReadingActivity);
  const [activeSectionId, setActiveSectionId] = useState(sectionId(0, 0));
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeNavigation, setActiveNavigation] = useState<NavigationId>("reader");
  const [bookContentsOpen, setBookContentsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteContext, setNoteContext] = useState(sectionId(0, 0));
  const [viewingNote, setViewingNote] = useState<{
    note: ReadingNote;
    index: number;
  } | null>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  const currentReference = useMemo(() => {
    for (const [chapterIndex, chapter] of currentChapters.entries()) {
      for (const [sectionIndex, title] of chapter.sections.entries()) {
        if (sectionId(chapterIndex, sectionIndex) === activeSectionId) {
          return { chapterIndex, sectionIndex, title };
        }
      }
    }
    return {
      chapterIndex: 0,
      sectionIndex: 0,
      title: currentChapters[0]?.sections[0] ?? "",
    };
  }, [activeSectionId, currentChapters]);

  const bookmarkedSections = useMemo(
    () => new Set(bookmarks.map((bookmark) => bookmark.sectionId)),
    [bookmarks],
  );

  const searchResults = useMemo(
    () => getSearchResults(searchQuery, segments, currentChapters),
    [searchQuery, segments, currentChapters],
  );

  const daysReadThisWeek = useMemo(() => {
    const weekDates = getCurrentWeekDates();
    return readingActivity.filter((d) => weekDates.includes(d)).length;
  }, [readingActivity]);

  const goalInfo = useMemo(
    () => getWeeklyGoalInfo(daysReadThisWeek, language),
    [daysReadThisWeek, language],
  );

  const readerStyle = {
    "--book-font-size": `${fontSize}px`,
    "--reader-line-height": lineHeightSteps[spacingStep],
  } as CSSProperties;

  // Actual reading engagement tracker
  // Requires 15 continuous seconds of focused reading.
  // Conditions that must simultaneously hold:
  // 1. Browser tab is visible (document.visibilityState === "visible")
  // 2. Browser tab has focus (document.hasFocus())
  // 3. Reader container (#reader) is currently visible in the viewport
  // If ANY of these conditions ceases to be true, the continuous counter resets to 0.
  useEffect(() => {
    const today = getTodayString();
    if (readingActivity.includes(today)) {
      return;
    }

    let continuousSeconds = 0;
    const REQUIRED_CONTINUOUS_SECONDS = 15;

    const checkConditions = (): boolean => {
      if (document.visibilityState !== "visible") return false;
      if (!document.hasFocus()) return false;
      const readerElement = document.getElementById("reader");
      if (!readerElement) return false;
      const rect = readerElement.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 60;
    };

    const resetCounter = () => {
      continuousSeconds = 0;
    };

    const interval = window.setInterval(() => {
      if (checkConditions()) {
        continuousSeconds += 1;
        if (continuousSeconds >= REQUIRED_CONTINUOUS_SECONDS) {
          setReadingActivity((prev) => (prev.includes(today) ? prev : [...prev, today]));
          window.clearInterval(interval);
        }
      } else {
        continuousSeconds = 0;
      }
    }, 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        resetCounter();
      }
    };

    const onBlur = () => {
      resetCounter();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [readingActivity]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("quran-language", language);
    } catch (error) {
      console.warn("Could not save the selected language to local storage.", error);
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("quran-theme", theme);
    } catch (error) {
      console.warn("Could not save the selected theme.", error);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("quran-bookmarks", JSON.stringify(bookmarks));
    } catch (error) {
      console.warn("Could not save bookmarks to local storage.", error);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem("quran-notes", JSON.stringify(notes));
    } catch (error) {
      console.warn("Could not save notes to local storage.", error);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem("quran-reading-activity", JSON.stringify(readingActivity));
    } catch (error) {
      console.warn("Could not save reading activity to local storage.", error);
    }
  }, [readingActivity]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const updateLayout = () => setIsMobile(media.matches);
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!drawerOpen || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen, isMobile]);

  useEffect(() => {
    const updateBackToTopVisibility = () =>
      setShowBackToTop(window.scrollY > 2);

    updateBackToTopVisibility();
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateBackToTopVisibility);
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-reader-section]");
    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              right.intersectionRatio - left.intersectionRatio,
          )[0];
        if (!visible) return;

        const target = visible.target as HTMLElement;
        const nextId = target.id;
        const chapterIndex = Number(target.dataset.chapterIndex);
        if (!nextId || Number.isNaN(chapterIndex)) return;
        setActiveSectionId(nextId);
        setActiveNavigation("reader");
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [segments]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchQuery("");
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        if (bookContentsOpen) {
          closeBookContents();
          return;
        }
        setDrawerOpen(false);
        setSearchOpen(false);
        setNoteOpen(false);
        setViewingNote(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [bookContentsOpen]);

  function toggleLanguage() {
    const nextLang: Language = language === "en" ? "ar" : "en";
    setLanguage(nextLang);
    // Maintain active section after re-rendering in the other language
    setTimeout(() => {
      const element = document.getElementById(activeSectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  }

  function navigateTo(target: string, navigationId?: NavigationId) {
    let element = document.getElementById(target);
    if (!element) {
      console.warn(`Could not navigate to missing reader section "${target}".`);
      return;
    }

    if (target.startsWith("chapter-") && !target.includes("section")) {
      const chapterIndex = Number(target.split("-")[1]) - 1;
      const chapterHeader = document.getElementById(target);
      if (chapterHeader) {
        element = chapterHeader;
      } else {
        const firstSection = document.getElementById(sectionId(chapterIndex, 0));
        if (firstSection) element = firstSection;
      }
      setActiveSectionId(sectionId(chapterIndex, 0));
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNavigation(navigationId ?? "reader");
    setDrawerOpen(false);

    const section = element.closest<HTMLElement>("[data-reader-section]");
    if (section) {
      setActiveSectionId(section.id);
    }
  }

  function toggleBookmark(id: string) {
    const meta = getSectionMetadata(id, language);
    if (!meta) {
      console.warn(`Could not bookmark missing reader section "${id}".`);
      return;
    }

    setBookmarks((previous) =>
      previous.some((bookmark) => bookmark.sectionId === id)
        ? previous.filter((bookmark) => bookmark.sectionId !== id)
        : [
            {
              title: meta.title,
              chapter: meta.chapter,
              sectionId: id,
            },
            ...previous,
          ],
    );
  }

  function openSearch() {
    setSearchQuery("");
    setSearchOpen(true);
  }

  function openNote() {
    setNoteContext(activeSectionId);
    setNoteOpen(true);
  }

  function saveNote(text: string) {
    const meta = getSectionMetadata(noteContext, language);
    if (!meta) {
      console.warn(`Could not attach a note to missing reader section "${noteContext}".`);
      return;
    }

    setNotes((previous) => [
      { title: meta.title, text, sectionId: noteContext },
      ...previous,
    ]);
    setNoteOpen(false);
  }

  function deleteNote(index: number) {
    if (!window.confirm(t.deleteNoteConfirm)) {
      return;
    }

    setNotes((previous) => previous.filter((_, noteIndex) => noteIndex !== index));
    setViewingNote(null);
  }

  function closeBookContents() {
    setBookContentsOpen(false);
    if (activeNavigation === "contents") {
      setActiveNavigation("reader");
    }
  }

  function toggleBookContents() {
    setBookContentsOpen((previous) => {
      const next = !previous;
      if (!next && activeNavigation === "contents") {
        setActiveNavigation("reader");
      } else if (next) {
        setActiveNavigation("contents");
      }
      return next;
    });
  }

  function toggleTheme() {
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));
  }

  function onBookmarkCurrent() {
    toggleBookmark(activeSectionId);
  }

  function fontChange(delta: number) {
    setFontSize((previous) => Math.min(28, Math.max(14, previous + delta)));
  }

  function changeSpacing() {
    setSpacingStep((previous) => (previous + 1) % lineHeightSteps.length);
  }

  function closeSearch() {
    setSearchOpen(false);
    searchTriggerRef.current?.focus();
  }

  function beginAgain() {
    const beginning = document.getElementById("book-introduction");
    if (!beginning) {
      console.warn("Could not restart because the book introduction is unavailable.");
      return;
    }

    setActiveSectionId(sectionId(0, 0));
    setActiveNavigation("reader");
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    beginning.scrollIntoView({ behavior: "auto", block: "start" });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }

  const currentBookmarked = bookmarkedSections.has(activeSectionId);
  const currentNoteSection = currentReference.title;

  return (
    <div className="app-shell">
      <Topbar
        onBookmark={onBookmarkCurrent}
        onSearch={openSearch}
        onTheme={toggleTheme}
        onMenu={() => setDrawerOpen(true)}
        onToggleLanguage={toggleLanguage}
        mobile={isMobile}
        bookmarked={currentBookmarked}
        searchTriggerRef={searchTriggerRef}
        language={language}
        t={t}
      />
      <div className="app-body">
        <Sidebar
          activeChapterIndex={currentReference.chapterIndex}
          activeNavigation={activeNavigation}
          activeSectionId={activeSectionId}
          bookmarks={bookmarks}
          bookContentsOpen={bookContentsOpen}
          currentChapters={currentChapters}
          goalInfo={goalInfo}
          isOpen={drawerOpen}
          isMobile={isMobile}
          language={language}
          onClose={() => setDrawerOpen(false)}
          onCloseBookContents={closeBookContents}
          onNavigate={navigateTo}
          onToggleBookContents={toggleBookContents}
          t={t}
        />
        <main className="main-content">
          <Hero
            onNavigate={navigateTo}
            currentSection={currentReference.title}
            currentSectionId={activeSectionId}
            language={language}
            t={t}
          />
          <section className="reader-layout" id="reader" style={readerStyle}>
            <BookToolbar
              fontSize={fontSize}
              onFontChange={fontChange}
              onNote={openNote}
              onBookmark={onBookmarkCurrent}
              onSearch={openSearch}
              onSpacing={changeSpacing}
              onTheme={toggleTheme}
              spacingStep={spacingStep}
              theme={theme}
              t={t}
            />
            <BookContent
              activeSectionId={activeSectionId}
              bookmarkedSections={bookmarkedSections}
              currentChapters={currentChapters}
              language={language}
              onBeginAgain={beginAgain}
              onBookmark={toggleBookmark}
              segments={segments}
              t={t}
            />
          </section>
          <LearningSpace
            bookmarks={bookmarks}
            notes={notes}
            language={language}
            onAddNote={openNote}
            onDeleteNote={deleteNote}
            onNavigate={navigateTo}
            onViewNote={(note) =>
              setViewingNote({ note, index: notes.indexOf(note) })
            }
            t={t}
          />
        </main>
      </div>
      <button
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        type="button"
        aria-label={t.backToTop}
        title={t.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={20} aria-hidden="true" />
      </button>
      {searchOpen && (
        <SearchDialog
          language={language}
          onClose={closeSearch}
          onNavigate={navigateTo}
          onQueryChange={setSearchQuery}
          query={searchQuery}
          results={searchResults}
          t={t}
        />
      )}
      {noteOpen && (
        <NoteDialog
          currentSection={currentNoteSection}
          language={language}
          onClose={() => setNoteOpen(false)}
          onSave={saveNote}
          t={t}
        />
      )}
      {viewingNote && (
        <NoteViewer
          note={viewingNote.note}
          language={language}
          onClose={() => setViewingNote(null)}
          onDelete={() => deleteNote(viewingNote.index)}
          t={t}
        />
      )}
    </div>
  );
}

export default App;
