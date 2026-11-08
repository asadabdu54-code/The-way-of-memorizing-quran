import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  FileText,
  Home,
  List,
  Menu,
  Moon,
  MoreHorizontal,
  Search,
  Sparkles,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  buildBookSegments,
  chapters,
  initialBookmarks,
  initialNotes,
  sectionId,
  type BookSegment,
  type ContentParagraph,
  type TextGroup,
} from "./bookData";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

type Theme = "light" | "dark";
type NavigationId =
  | "home"
  | "reader"
  | "contents"
  | "bookmarks"
  | "notes"
  | "progress";

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

interface SectionReference {
  chapterIndex: number;
  sectionIndex: number;
  id: string;
}

interface SearchResult {
  title: string;
  chapter: string;
  excerpt: string;
  id: string;
}

interface NavigationItem {
  label: string;
  id: NavigationId;
  target: string;
  Icon: LucideIcon;
}

const navigationItems: NavigationItem[] = [
  { label: "Home", id: "home", target: "home", Icon: Home },
  { label: "Read the Book", id: "reader", target: "reader", Icon: BookOpen },
  { label: "Table of Contents", id: "contents", target: "contents", Icon: List },
  {
    label: "My Bookmarks",
    id: "bookmarks",
    target: "bookmarks",
    Icon: Bookmark,
  },
  { label: "My Notes", id: "notes", target: "notes", Icon: FileText },
  {
    label: "Reading Progress",
    id: "progress",
    target: "progress",
    Icon: BarChart3,
  },
];

const chapterJumpLabels = [
  "The Noble Qur'an",
  "Learning the Noble Qur'an",
  "Memorizing",
  "Reviewing",
  "The Isnād in the Noble Qur'an",
];

const suggestions = ["memorization", "review", "isnād", "recitation"];
const lineHeightSteps = [1.9, 2.1, 1.7];
const sectionCount = chapters.reduce(
  (count, chapter) => count + chapter.sections.length,
  0,
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSectionReference(
  title: string,
  chapterTitle?: string,
): SectionReference | undefined {
  for (const [chapterIndex, chapter] of chapters.entries()) {
    if (chapterTitle && chapter.title !== chapterTitle) continue;
    const sectionIndex = chapter.sections.indexOf(title);
    if (sectionIndex >= 0) {
      return {
        chapterIndex,
        sectionIndex,
        id: sectionId(chapterIndex, sectionIndex),
      };
    }
  }
  return undefined;
}

function loadSavedPassages(): SavedPassage[] {
  try {
    const stored = localStorage.getItem("quran-bookmarks");
    if (!stored) return initialBookmarks;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.warn("Stored bookmarks are not a list. Restoring the sample bookmarks.");
      return initialBookmarks;
    }

    const bookmarks: SavedPassage[] = [];
    for (const item of parsed) {
      if (!isRecord(item) || typeof item.title !== "string") {
        console.warn("Ignoring a bookmark with an invalid shape.");
        continue;
      }

      const chapterTitle =
        typeof item.chapter === "string" ? item.chapter : undefined;
      const reference = getSectionReference(item.title, chapterTitle);
      const id =
        typeof item.sectionId === "string"
          ? item.sectionId
          : reference?.id;
      const matched = id
        ? chapters.some((chapter, chapterIndex) =>
            chapter.sections.some(
              (title, sectionIndex) =>
                title === item.title &&
                sectionId(chapterIndex, sectionIndex) === id,
            ),
          )
        : false;

      if (!reference || !id || !matched) {
        console.warn(`Ignoring bookmark "${item.title}" because its section is unavailable.`);
        continue;
      }

      bookmarks.push({
        title: item.title,
        chapter: chapterTitle ?? chapters[reference.chapterIndex].title,
        sectionId: id,
      });
    }
    return bookmarks;
  } catch (error) {
    console.warn("Could not read bookmarks from local storage.", error);
    return initialBookmarks;
  }
}

function loadReadingNotes(): ReadingNote[] {
  try {
    const stored = localStorage.getItem("quran-notes");
    if (!stored) return initialNotes;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.warn("Stored notes are not a list. Restoring the sample notes.");
      return initialNotes;
    }

    const notes: ReadingNote[] = [];
    for (const item of parsed) {
      if (
        !isRecord(item) ||
        typeof item.title !== "string" ||
        typeof item.text !== "string"
      ) {
        console.warn("Ignoring a note with an invalid shape.");
        continue;
      }

      const reference =
        typeof item.sectionId === "string"
          ? chapters
              .flatMap((chapter, chapterIndex) =>
                chapter.sections.map((title, sectionIndex) => ({
                  title,
                  chapterIndex,
                  sectionIndex,
                  id: sectionId(chapterIndex, sectionIndex),
                })),
              )
              .find((section) => section.id === item.sectionId)
          : getSectionReference(
              typeof item.section === "string" ? item.section : item.title,
            );

      if (!reference) {
        console.warn(`Ignoring note "${item.title}" because its section is unavailable.`);
        continue;
      }

      notes.push({
        title: item.title,
        text: item.text,
        sectionId: reference.id,
      });
    }
    return notes;
  } catch (error) {
    console.warn("Could not read notes from local storage.", error);
    return initialNotes;
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

function getParagraphs(group: TextGroup): ContentParagraph[] {
  return group.paragraphs;
}

function isArabicText(text: string): boolean {
  return /[\u0600-\u06ff]/u.test(text) && !/[A-Za-z]{12,}/u.test(text);
}

function Paragraph({ paragraph }: { paragraph: ContentParagraph }) {
  if (paragraph.kind === "subheading") {
    if (paragraph.text === "INTRODUCTION") {
      return <span className="document-subheading">{paragraph.text}</span>;
    }

    return <h4 className="document-subheading">{paragraph.text}</h4>;
  }

  const className = [
    "document-paragraph",
    paragraph.kind === "footnote" ? "document-footnote" : "",
    isArabicText(paragraph.text) ? "document-arabic" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={className} dir="auto">
      {paragraph.text}
    </p>
  );
}

function TextGroupContent({ group }: { group: TextGroup }) {
  return (
    <>
      {getParagraphs(group).map((paragraph, index) => (
        <Paragraph key={`${index}-${paragraph.text.slice(0, 20)}`} paragraph={paragraph} />
      ))}
    </>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
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
          أسهل طريقة لحفظ القرآن الكريم
        </strong>
        <small>Qur’an learning companion</small>
      </span>
    </a>
  );
}

function Topbar({
  progress,
  onBookmark,
  onSearch,
  onTheme,
  onMenu,
  mobile,
  bookmarked,
  searchTriggerRef,
}: {
  progress: number;
  onBookmark: () => void;
  onSearch: () => void;
  onTheme: () => void;
  onMenu: () => void;
  mobile: boolean;
  bookmarked: boolean;
  searchTriggerRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button
          className="header-icon menu-trigger"
          type="button"
          aria-label="Open navigation"
          onClick={onMenu}
        >
          <Menu aria-hidden="true" />
        </button>
        <Logo />
        <button
          ref={searchTriggerRef}
          className={`top-search ${mobile ? "top-search-compact" : ""}`}
          type="button"
          onClick={onSearch}
          aria-label="Search the book"
        >
          <Search aria-hidden="true" />
          <span>Search the book</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="top-progress">
          <span
            className="top-progress-ring"
            style={{ "--progress-angle": `${progress * 3.6}deg` } as CSSProperties}
            role="img"
            aria-label={`${progress}% reading progress`}
          >
            <span>{progress}%</span>
          </span>
        </div>
        <div className="topbar-actions">
          <button
            className={`header-icon ${bookmarked ? "is-active" : ""}`}
            type="button"
            onClick={onBookmark}
            aria-label={bookmarked ? "Remove current bookmark" : "Bookmark current section"}
            title={bookmarked ? "Remove bookmark" : "Bookmark current section"}
            aria-pressed={bookmarked}
          >
            <Bookmark aria-hidden="true" />
          </button>
          <button
            className="header-icon"
            type="button"
            onClick={onTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
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
  expandedChapters,
  isOpen,
  isMobile,
  onClose,
  onNavigate,
  onToggleChapter,
}: {
  activeChapterIndex: number;
  activeNavigation: NavigationId;
  activeSectionId: string;
  bookmarks: SavedPassage[];
  expandedChapters: number[];
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
  onToggleChapter: (chapterIndex: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && isMobile) closeRef.current?.focus();
  }, [isMobile, isOpen]);

  return (
    <>
      {isMobile && isOpen && (
        <button
          className="drawer-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
        aria-hidden={isMobile && !isOpen}
      >
        <div className="drawer-header">
          <Logo compact />
          <button
            ref={closeRef}
            className="header-icon drawer-close"
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav className="main-nav" aria-label="Your library">
          <p className="eyebrow sidebar-label">Your library</p>
          {navigationItems.map(({ label, id, target, Icon }) => (
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
          ))}
        </nav>

        <section className="sidebar-toc" id="sidebar-book-contents">
          <p className="eyebrow toc-heading">
            <span>Book contents</span>
            <ChevronDown size={16} aria-hidden="true" />
          </p>
          {chapters.map((chapter, chapterIndex) => {
            const expanded = expandedChapters.includes(chapterIndex);
            return (
              <div className="toc-chapter" key={chapter.title}>
                <div className="toc-chapter-row">
                  <button
                    className={`toc-chapter-number ${chapterIndex === activeChapterIndex ? "current" : ""}`}
                    type="button"
                    aria-label={`Go to chapter ${chapterIndex + 1}`}
                    onClick={() => onNavigate(`chapter-${chapterIndex + 1}`, "reader")}
                  >
                    {String(chapterIndex + 1).padStart(2, "0")}
                  </button>
                  <button
                    className="toc-chapter-title"
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => {
                      onToggleChapter(chapterIndex);
                    }}
                  >
                    <span>{chapter.title}</span>
                    {expanded ? (
                      <ChevronDown size={15} aria-hidden="true" />
                    ) : (
                      <ChevronRight size={15} aria-hidden="true" />
                    )}
                  </button>
                </div>
                {expanded && (
                  <div className="toc-section-list">
                    {chapter.sections.map((title, sectionIndex) => {
                      const id = sectionId(chapterIndex, sectionIndex);
                      return (
                        <a
                          key={id}
                          className={`toc-section-link ${activeSectionId === id ? "active" : ""}`}
                          href={`#${id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            onNavigate(id, "reader");
                          }}
                        >
                          <span className="toc-dot" aria-hidden="true" />
                          <span>{title}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="sidebar-goal" aria-label="Weekly reading goal">
          <div className="goal-heading">
            <span>Weekly reading goal</span>
            <strong>4 of 5 days</strong>
          </div>
          <p>One more day to reach your goal</p>
          <div className="goal-track" aria-label="4 of 5 days complete">
            <span />
          </div>
        </section>
      </aside>
    </>
  );
}

function ChapterNavigation({
  activeChapterIndex,
  onNavigate,
}: {
  activeChapterIndex: number;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
}) {
  return (
    <section className="chapter-nav-wrap" id="contents" aria-label="Chapter navigation">
      <div className="chapter-nav-inner">
        <span className="eyebrow jump-label">Jump to</span>
        {chapters.map((chapter, index) => (
          <button
            key={chapter.title}
            className={`chapter-jump ${activeChapterIndex === index ? "active" : ""}`}
            type="button"
            onClick={() => onNavigate(`chapter-${index + 1}`, "reader")}
            aria-label={`Go to chapter ${index + 1}: ${chapter.title}`}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{chapterJumpLabels[index]}</strong>
          </button>
        ))}
        <button
          className="chapter-jump all-contents"
          type="button"
          onClick={() => onNavigate("reader", "reader")}
        >
          <List size={15} aria-hidden="true" />
          <strong>All contents</strong>
        </button>
      </div>
    </section>
  );
}

function ChapterCard({ chapterIndex }: { chapterIndex: number }) {
  const chapter = chapters[chapterIndex];

  return (
    <section
      className="chapter-header"
      id={`chapter-${chapterIndex + 1}`}
      aria-labelledby={`chapter-title-${chapterIndex + 1}`}
    >
      <div className="chapter-number">
        <span className="eyebrow">Chapter</span>
        <strong>{String(chapterIndex + 1).padStart(2, "0")}</strong>
      </div>
      <div className="chapter-heading-copy">
        <p className="chapter-arabic" lang="ar" dir="rtl">
          {chapter.arabic}
        </p>
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
  onBeginAgain,
  onBookmark,
  segments,
}: {
  activeSectionId: string;
  bookmarkedSections: Set<string>;
  onBeginAgain: () => void;
  onBookmark: (id: string) => void;
  segments: BookSegment[];
}) {
  return (
    <article className="book-document" id="book-content">
      <header className="book-opening">
        <p className="bismillah" lang="ar" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
        </p>
        <p className="bismillah-translation">
          In the name of Allah, the Most Compassionate, the Most Merciful
        </p>
        <div className="author-rule" />
        <h2>Dr. ʿAbd al-Muḥsin ibn Muḥammad al-Qāsim</h2>
        <p>Imam and Khatib of the Prophet&apos;s Mosque</p>
        <strong className="edition">First edition · 1443 AH / 2022 CE</strong>
      </header>

      {segments.map((segment, index) => {
        if (segment.type === "chapter") {
          return (
            <ChapterCard
              key={`chapter-${segment.chapterIndex}-${index}`}
              chapterIndex={segment.chapterIndex}
            />
          );
        }

        if (segment.kind === "section") {
          const chapterIndex = segment.chapterIndex ?? 0;
          const sectionIndex = segment.sectionIndex ?? 0;
          const id = sectionId(chapterIndex, sectionIndex);
          const title = chapters[chapterIndex].sections[sectionIndex];
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
                    aria-label={saved ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
                    aria-pressed={saved}
                    onClick={() => onBookmark(id)}
                  >
                    <Bookmark size={16} aria-hidden="true" />
                  </button>
                </div>
                <TextGroupContent group={segment} />
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
            <TextGroupContent group={segment} />
          </section>
        );
      })}
      <section className="book-complete" aria-labelledby="book-complete-heading">
        <span className="complete-mark" aria-hidden="true">
          <Check size={28} />
        </span>
        <span className="eyebrow">BOOK COMPLETE</span>
        <h2 id="book-complete-heading">
          May the Qur&apos;an remain
          <br />a light in your heart.
        </h2>
        <p>
          You have reached the end of this reading edition. Return often to review, reflect,
          and renew your intention.
        </p>
        <button className="button button-green" type="button" onClick={onBeginAgain}>
          Begin again <ChevronUp size={16} aria-hidden="true" />
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
}) {
  return (
    <div className="reader-toolbar" aria-label="Reader controls">
      <div className="font-controls">
        <span className="eyebrow">Text</span>
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
        title={`Paragraph spacing: ${["default", "wide", "compact"][spacingStep]}`}
      >
        <span className="spacing-glyph" aria-hidden="true">
          ≡
        </span>
        <span>Spacing</span>
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
        <span>{theme === "dark" ? "Light" : "Focus"}</span>
      </button>
      <button
        className="tool-button"
        type="button"
        aria-label="Bookmark current section"
        onClick={onBookmark}
      >
        <Bookmark size={16} aria-hidden="true" />
        <span>Save</span>
      </button>
      <button className="tool-button" type="button" onClick={onNote} aria-label="Add a note">
        <FileText size={16} aria-hidden="true" />
        <span>Note</span>
      </button>
      <button className="tool-button" type="button" onClick={onSearch} aria-label="Find in book">
        <Search size={16} aria-hidden="true" />
        <span>Find</span>
      </button>
    </div>
  );
}

function Hero({
  progress,
  onNavigate,
  currentSection,
  currentChapter,
  currentSectionId,
}: {
  progress: number;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
  currentSection: string;
  currentChapter: number;
  currentSectionId: string;
}) {
  return (
    <section className="welcome" id="home">
      <div className="welcome-pattern" aria-hidden="true" />
      <div className="welcome-copy">
        <p className="hero-kicker">
          <span aria-hidden="true" />
          A guided path to memorization
        </p>
        <h1 lang="ar" dir="rtl">
          أسهل طريقة لحفظ
          <br />
          القرآن الكريم
        </h1>
        <h2>The Easiest Method for Memorizing the Noble Qur&apos;an</h2>
        <p className="hero-description">
          A practical, structured companion for learning, memorizing, and preserving the words of
          Allah with consistency and reverence.
        </p>
        <div className="hero-actions">
          <a
            className="button button-gold"
            href="#reader"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("reader", "reader");
            }}
          >
            Start reading <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a
            className="button button-quiet"
            href="#contents"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("contents", "contents");
            }}
          >
            <List size={16} aria-hidden="true" />
            View contents
          </a>
        </div>
      </div>
      <a
        className="journey-card"
        href="#reader"
        aria-label={`Continue your journey from ${currentSection}`}
        onClick={(event) => {
          event.preventDefault();
          const target = document.getElementById(currentSectionId);
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <span
          className="journey-ring"
          style={{ "--progress-angle": `${progress * 3.6}deg` } as CSSProperties}
          role="img"
          aria-label={`${progress}% complete`}
        >
          <span>{progress}%</span>
        </span>
        <span className="journey-copy">
          <span className="eyebrow">Your journey</span>
          <strong>Chapter {currentChapter + 1} of 5</strong>
          <span>
            Continue from <u>{currentSection}</u>
          </span>
        </span>
      </a>
    </section>
  );
}

function LearningSpace({
  activeChapterIndex,
  bookmarks,
  chapterStatuses,
  completedChapterCount,
  notes,
  progress,
  onAddNote,
  onNavigate,
}: {
  activeChapterIndex: number;
  bookmarks: SavedPassage[];
  chapterStatuses: string[];
  completedChapterCount: number;
  notes: ReadingNote[];
  progress: number;
  onAddNote: () => void;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
}) {
  return (
    <section className="student-section" aria-labelledby="learning-heading">
      <div className="learning-inner">
        <div className="learning-heading">
          <div>
            <p className="eyebrow">Your learning space</p>
            <h2 id="learning-heading">Continue your journey</h2>
            <p>Small, consistent steps build a lasting relationship with the Qur&apos;an.</p>
          </div>
          <a
            className="outline-button"
            href="#progress"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("progress", "progress");
            }}
          >
            View full progress <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="learning-grid">
          <section className="learning-card progress-card" id="progress">
            <div className="progress-card-heading">
              <div>
                <p className="eyebrow">Overall progress</p>
                <strong className="progress-number">{progress}%</strong>
              </div>
              <span
                className="large-progress-ring"
                style={{ "--progress-angle": `${progress * 3.6}deg` } as CSSProperties}
                role="img"
                aria-label={`${progress}% complete`}
              >
                {progress}%
              </span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Overall reading progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="reading-stats">
              <span>
                <BookOpen size={16} aria-hidden="true" />
                {completedChapterCount} of 5 chapters
              </span>
              <span>
                <Clock3 size={16} aria-hidden="true" />
                42 min read
              </span>
            </div>
            <div className="chapter-progress-list">
              {chapters.map((chapter, chapterIndex) => {
                const state = chapterStatuses[chapterIndex];
                const isCompleted = state === "Completed";
                const isCurrent =
                  chapterIndex === activeChapterIndex &&
                  state.startsWith("In progress");
                const isSelected = chapterIndex === activeChapterIndex;
                return (
                  <button
                    type="button"
                    className={`chapter-progress-item${isCompleted ? " is-completed" : ""}${isCurrent ? " is-current" : ""}${isSelected ? " is-selected" : ""}`}
                    key={chapter.title}
                    onClick={() => onNavigate(`chapter-${chapterIndex + 1}`, "reader")}
                    aria-current={isSelected ? "step" : undefined}
                  >
                    <span className="chapter-progress-number">
                      {isCompleted ? (
                        <span className="chapter-completed-icon" role="img" aria-label="Completed">
                          <Check size={14} aria-hidden="true" />
                        </span>
                      ) : (
                        chapterIndex + 1
                      )}
                    </span>
                    <span className="chapter-progress-copy">
                      <strong>{chapter.title}</strong>
                      <small>{state}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="learning-stack">
            <section className="learning-card" id="bookmarks">
              <div className="card-title-row">
                <h3>
                  <Bookmark size={18} aria-hidden="true" />
                  Saved bookmarks
                </h3>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onNavigate("bookmarks", "bookmarks")}
                >
                  View all
                </button>
              </div>
              <div className="saved-list">
                {bookmarks.length === 0 ? (
                  <p className="empty-state">Your saved passages will appear here.</p>
                ) : (
                  bookmarks.map((item) => (
                    <button
                      className="saved-row"
                      type="button"
                      key={item.sectionId}
                      onClick={() => onNavigate(item.sectionId, "reader")}
                    >
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.chapter}</small>
                      </span>
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  ))
                )}
              </div>
            </section>
            <section className="learning-card" id="notes">
              <div className="card-title-row">
                <h3>
                  <FileText size={18} aria-hidden="true" />
                  Personal notes
                </h3>
                <button
                  className="text-button"
                  type="button"
                  aria-label="Add note"
                  onClick={onAddNote}
                >
                  + Add note
                </button>
              </div>
              <div className="saved-list notes-list">
                {notes.length === 0 ? (
                  <p className="empty-state">Your reflections will appear here.</p>
                ) : (
                  notes.map((note, index) => (
                    <button
                      className="note-row"
                      type="button"
                      key={`${note.sectionId}-${index}`}
                      onClick={() => onNavigate(note.sectionId, "reader")}
                    >
                      <span className="note-label">{note.title}</span>
                      <span className="note-description">{note.text}</span>
                    </button>
                  ))
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
  onClose,
  onNavigate,
  onQueryChange,
  query,
  results,
}: {
  onClose: () => void;
  onNavigate: (target: string, navigationId?: NavigationId) => void;
  onQueryChange: (query: string) => void;
  query: string;
  results: SearchResult[];
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
        aria-label="Search the book"
      >
        <div className="search-input-wrap">
          <Search size={19} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search chapters, passages, and topics…"
            autoComplete="off"
          />
          <button className="escape-key" type="button" onClick={onClose}>
            Esc
          </button>
        </div>
        <div className="search-results">
          {!query.trim() ? (
            <>
              <p className="eyebrow">Try searching for</p>
              <div className="search-suggestions">
                {suggestions.map((suggestion) => (
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
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))
          ) : (
            <p className="search-empty">No matching sections. Try another word.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function NoteDialog({
  currentSection,
  onClose,
  onSave,
}: {
  currentSection: string;
  onClose: () => void;
  onSave: (text: string) => void;
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
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Personal note</p>
            <h2 id="note-dialog-title">{currentSection}</h2>
          </div>
          <button
            className="header-icon dialog-close"
            type="button"
            onClick={onClose}
            aria-label="Close note editor"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <label className="sr-only" htmlFor="note-input">
          Write a reflection or reminder for this section
        </label>
        <textarea
          id="note-input"
          ref={inputRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (event.target.value.trim()) setError(false);
          }}
          placeholder="Write a reflection or reminder for this section…"
          aria-describedby={error ? "note-error" : undefined}
        />
        {error && (
          <p className="form-error" id="note-error" role="alert">
            Please write a note before saving.
          </p>
        )}
        <div className="dialog-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-green" type="button" onClick={save}>
            Save note
          </button>
        </div>
      </section>
    </div>
  );
}

function PreviewBar() {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!visible) return null;

  return (
    <aside className="figma-preview" aria-label="Figma Make preview controls">
      <Sparkles size={16} aria-hidden="true" />
      <strong>Created with Figma Make</strong>
      <a
        className="remix-button"
        href="https://guard-geo-18796015.figma.site/"
        target="_blank"
        rel="noreferrer"
      >
        Remix
      </a>
      <button
        className="preview-more"
        type="button"
        aria-label="More preview options"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MoreHorizontal size={17} aria-hidden="true" />
      </button>
      <button
        className="preview-close"
        type="button"
        aria-label="Close preview bar"
        onClick={() => setVisible(false)}
      >
        <X size={16} aria-hidden="true" />
      </button>
      {menuOpen && (
        <div className="preview-menu">
          <a
            href="https://guard-geo-18796015.figma.site/"
            target="_blank"
            rel="noreferrer"
          >
            Open the published design
          </a>
        </div>
      )}
    </aside>
  );
}

function getSearchResults(
  query: string,
  segments: BookSegment[],
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
      const chapter = chapters[segment.chapterIndex];
      if (`${chapter.title} ${chapter.subtitle}`.toLocaleLowerCase().includes(normalized)) {
        addResult({
          title: chapter.title,
          chapter: `Chapter ${segment.chapterIndex + 1}`,
          excerpt: chapter.subtitle,
          id: `chapter-${segment.chapterIndex + 1}`,
        });
      }
      continue;
    }

    if (segment.kind === "section") {
      const chapterIndex = segment.chapterIndex ?? 0;
      const sectionIndex = segment.sectionIndex ?? 0;
      const title = chapters[chapterIndex].sections[sectionIndex];
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
          chapter: chapters[chapterIndex].title,
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
      addResult({
        title:
          segment.kind === "chapter-intro"
            ? chapters[segment.chapterIndex ?? 0].title
            : paragraph.kind === "subheading"
              ? paragraph.text
              : "Introduction",
        chapter:
          segment.kind === "chapter-intro"
            ? chapters[segment.chapterIndex ?? 0].title
            : "The Easiest Method for Memorizing the Noble Qur'an",
        excerpt: paragraph.text,
        id,
      });
    }
  }

  return results.slice(0, 24);
}

function App() {
  const segments = useMemo(() => buildBookSegments(), []);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [fontSize, setFontSize] = useState(18);
  const [spacingStep, setSpacingStep] = useState(0);
  const [bookmarks, setBookmarks] = useState<SavedPassage[]>(loadSavedPassages);
  const [notes, setNotes] = useState<ReadingNote[]>(loadReadingNotes);
  const [activeSectionId, setActiveSectionId] = useState(sectionId(0, 0));
  const [visitedSections, setVisitedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(
    () => new Set([0]),
  );
  const [hasStartedReading, setHasStartedReading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeNavigation, setActiveNavigation] = useState<NavigationId>("reader");
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteContext, setNoteContext] = useState(sectionId(0, 0));
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const resettingProgressRef = useRef(false);

  const currentReference = useMemo(() => {
    for (const [chapterIndex, chapter] of chapters.entries()) {
      for (const [sectionIndex, title] of chapter.sections.entries()) {
        if (sectionId(chapterIndex, sectionIndex) === activeSectionId) {
          return { chapterIndex, sectionIndex, title };
        }
      }
    }
    return { chapterIndex: 0, sectionIndex: 0, title: chapters[0].sections[0] };
  }, [activeSectionId]);

  const readingProgress = hasStartedReading
    ? 18 + Math.round((visitedSections.size / sectionCount) * 82)
    : 18;
  const chapterStatuses = chapters.map((chapter, chapterIndex) => {
    if (!hasStartedReading) {
      if (chapterIndex === 0) return "Completed";
      if (chapterIndex === 1) return "In progress · 36%";
      return "Not started";
    }

    const visitedCount = chapter.sections.filter((_, sectionIndex) =>
      visitedSections.has(sectionId(chapterIndex, sectionIndex)),
    ).length;
    if (
      completedChapters.has(chapterIndex) ||
      visitedCount === chapter.sections.length
    ) {
      return "Completed";
    }

    const currentSectionIsVisited = visitedSections.has(
      sectionId(chapterIndex, currentReference.sectionIndex),
    );
    const currentCount =
      chapterIndex === currentReference.chapterIndex
        ? visitedCount + (currentSectionIsVisited ? 0 : 1)
        : visitedCount;
    if (currentCount > 0) {
      const percent = Math.round((currentCount / chapter.sections.length) * 100);
      return `In progress · ${percent}%`;
    }
    return "Not started";
  });
  const dashboardActiveChapterIndex = hasStartedReading
    ? currentReference.chapterIndex
    : 1;
  const bookmarkedSections = useMemo(
    () => new Set(bookmarks.map((bookmark) => bookmark.sectionId)),
    [bookmarks],
  );
  const searchResults = useMemo(
    () => getSearchResults(searchQuery, segments),
    [searchQuery, segments],
  );
  const readerStyle = {
    "--book-font-size": `${fontSize}px`,
    "--reader-line-height": lineHeightSteps[spacingStep],
  } as CSSProperties;

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
    const updateProgress = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable <= 0
          ? 0
          : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      setScrollProgress(progress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-reader-section]");
    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (resettingProgressRef.current) return;
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
        setHasStartedReading(true);
        setActiveSectionId(nextId);
        setActiveNavigation("reader");
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [segments]);

  useEffect(() => {
    if (!hasStartedReading || resettingProgressRef.current) return;
    const sectionToMark = activeSectionId;
    const timeoutId = window.setTimeout(() => {
      if (resettingProgressRef.current) return;
      setVisitedSections((previous) => {
        if (previous.has(sectionToMark)) return previous;
        return new Set(previous).add(sectionToMark);
      });
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [activeSectionId, hasStartedReading]);

  useEffect(() => {
    setCompletedChapters((previous) => {
      const next = new Set(previous);
      chapters.forEach((chapter, chapterIndex) => {
        if (
          chapter.sections.every((_, sectionIndex) =>
            visitedSections.has(sectionId(chapterIndex, sectionIndex)),
          )
        ) {
          next.add(chapterIndex);
        }
      });
      return next.size === previous.size ? previous : next;
    });
  }, [visitedSections]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchQuery("");
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setSearchOpen(false);
        setNoteOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigateTo(target: string, navigationId?: NavigationId) {
    let element = document.getElementById(target);
    if (!element) {
      console.warn(`Could not navigate to missing reader section "${target}".`);
      return;
    }

    if (target.startsWith("chapter-")) {
      const chapterIndex = Number(target.split("-")[1]) - 1;
      const firstSection = document.getElementById(sectionId(chapterIndex, 0));
      if (!firstSection) {
        console.warn(`Could not navigate to the first section of "${target}".`);
        return;
      }
      element = firstSection;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNavigation(navigationId ?? "reader");
    setDrawerOpen(false);

    const section = element.closest<HTMLElement>("[data-reader-section]");
    if (section) {
      setActiveSectionId(section.id);
      setHasStartedReading(true);
    }
  }

  function toggleBookmark(id: string) {
    const reference = chapters
      .flatMap((chapter, chapterIndex) =>
        chapter.sections.map((title, sectionIndex) => ({
          title,
          chapter: chapter.title,
          id: sectionId(chapterIndex, sectionIndex),
        })),
      )
      .find((section) => section.id === id);
    if (!reference) {
      console.warn(`Could not bookmark missing reader section "${id}".`);
      return;
    }

    setBookmarks((previous) =>
      previous.some((bookmark) => bookmark.sectionId === id)
        ? previous.filter((bookmark) => bookmark.sectionId !== id)
        : [
            {
              title: reference.title,
              chapter: reference.chapter,
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
    const reference = chapters
      .flatMap((chapter, chapterIndex) =>
        chapter.sections.map((title, sectionIndex) => ({
          title,
          id: sectionId(chapterIndex, sectionIndex),
        })),
      )
      .find((section) => section.id === noteContext);
    if (!reference) {
      console.warn(`Could not attach a note to missing reader section "${noteContext}".`);
      return;
    }

    setNotes((previous) => [
      { title: reference.title, text, sectionId: reference.id },
      ...previous,
    ]);
    setNoteOpen(false);
  }

  function toggleChapter(chapterIndex: number) {
    setExpandedChapters((previous) =>
      previous.includes(chapterIndex)
        ? previous.filter((index) => index !== chapterIndex)
        : [...previous, chapterIndex],
    );
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

    resettingProgressRef.current = true;
    setHasStartedReading(false);
    setVisitedSections(new Set());
    setCompletedChapters(new Set([0]));
    setActiveSectionId(sectionId(0, 0));
    setActiveNavigation("reader");
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    beginning.scrollIntoView({ behavior: "auto", block: "start" });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    window.requestAnimationFrame(() => {
      resettingProgressRef.current = false;
    });
  }

  const currentBookmarked = bookmarkedSections.has(activeSectionId);
  const currentNoteSection =
    chapters[currentReference.chapterIndex].sections[currentReference.sectionIndex];
  return (
    <div className="app-shell">
      <Topbar
        progress={readingProgress}
        onBookmark={onBookmarkCurrent}
        onSearch={openSearch}
        onTheme={toggleTheme}
        onMenu={() => setDrawerOpen(true)}
        mobile={isMobile}
        bookmarked={currentBookmarked}
        searchTriggerRef={searchTriggerRef}
      />
      <div className="app-body">
        <Sidebar
          activeChapterIndex={currentReference.chapterIndex}
          activeNavigation={activeNavigation}
          activeSectionId={activeSectionId}
          bookmarks={bookmarks}
          expandedChapters={expandedChapters}
          isOpen={drawerOpen}
          isMobile={isMobile}
          onClose={() => setDrawerOpen(false)}
          onNavigate={navigateTo}
          onToggleChapter={toggleChapter}
        />
        <main className="main-content">
          <Hero
            progress={readingProgress}
            onNavigate={navigateTo}
            currentSection={currentReference.title}
            currentChapter={currentReference.chapterIndex}
            currentSectionId={activeSectionId}
          />
          <ChapterNavigation
            activeChapterIndex={currentReference.chapterIndex}
            onNavigate={navigateTo}
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
            />
            <BookContent
              activeSectionId={activeSectionId}
              bookmarkedSections={bookmarkedSections}
              onBeginAgain={beginAgain}
              onBookmark={toggleBookmark}
              segments={segments}
            />
          </section>
          <LearningSpace
            activeChapterIndex={dashboardActiveChapterIndex}
            bookmarks={bookmarks}
            chapterStatuses={chapterStatuses}
            completedChapterCount={completedChapters.size}
            notes={notes}
            progress={readingProgress}
            onAddNote={openNote}
            onNavigate={navigateTo}
          />
        </main>
      </div>
      <button
        className={`back-to-top ${scrollProgress > 2 ? "visible" : ""}`}
        type="button"
        aria-label="Back to top"
        title="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={20} aria-hidden="true" />
      </button>
      <PreviewBar />
      {searchOpen && (
        <SearchDialog
          onClose={closeSearch}
          onNavigate={navigateTo}
          onQueryChange={setSearchQuery}
          query={searchQuery}
          results={searchResults}
        />
      )}
      {noteOpen && (
        <NoteDialog
          currentSection={currentNoteSection}
          onClose={() => setNoteOpen(false)}
          onSave={saveNote}
        />
      )}
    </div>
  );
}

export default App;
