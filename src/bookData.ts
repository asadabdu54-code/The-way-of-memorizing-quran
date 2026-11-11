import sourceEn from "./data/book.json";
import sourceAr from "./data/book_ar.json";

export type Language = "en" | "ar";

export interface ChapterDefinition {
  title: string;
  pdfTitle: string;
  arabic: string;
  subtitle: string;
  sections: string[];
}

export const chaptersEn: ChapterDefinition[] = [
  {
    title: "The Noble Qur'an",
    pdfTitle: "The Noble Qur'an",
    arabic: "القرآن الكريم",
    subtitle:
      "The status, magnificent attributes, inimitability, wisdom, and joy of the Book of Allah.",
    sections: [
      "The Status of the Qur'an",
      "The Attributes of the Qur'an",
      "The Inimitability of the Qur'an",
      "The Wisdom Behind the Revelation of the Qur'an",
      "Rejoicing in the Qur'an",
    ],
  },
  {
    title: "Learning the Noble Qur'an",
    pdfTitle: "Learning the Noble Qur'an",
    arabic: "تعلّم القرآن الكريم",
    subtitle:
      "The virtue of its gatherings, learning, recitation and memorization, and the station of those who carry it.",
    sections: [
      "Gatherings of the Qur'an",
      "The Virtue of Learning the Qur'an",
      "The Virtue of Reciting the Qur'an",
      "The Virtue of Memorizing the Qur'an",
      "Reverent Fear When Reciting the Qur'an",
      "The Station of the Bearer of the Qur'an",
    ],
  },
  {
    title: "The Easiest Method for Memorizing",
    pdfTitle: "The Easiest Method for Memorizing the Noble Qur'an",
    arabic: "أيسر طريقة للحفظ",
    subtitle:
      "The author's complete practical method: daily discipline, structured repetition, linking, and progressive review.",
    sections: [
      "Rules and Guidelines for Memorization",
      "The Daily Amount of Memorization",
      "The Method of Memorizing the Qur'an",
      "The Method of Reviewing the Previous Lesson",
      "Combining Memorization and Review",
      "How Do I Distinguish Between Similar Verses?",
    ],
  },
  {
    title: "The Easiest Method for Reviewing",
    pdfTitle: "The Easiest Method for Reviewing the Noble Qur'an",
    arabic: "أيسر طريقة للمراجعة",
    subtitle:
      "A clear path from preserving memorization to year-long mastery and a weekly completion cycle.",
    sections: [
      "The Importance of Reviewing the Qur'an",
      "The Method of Mastering the Qur'an",
      "In How Many Days Should You Complete the Qur'an?",
    ],
  },
  {
    title: "The Isnād in the Noble Qur'an",
    pdfTitle: "The Isnād in the Noble Qur'an",
    arabic: "الإسناد في القرآن الكريم",
    subtitle:
      "The connected chain of recitation: its importance and examples of scholars and children who carried it.",
    sections: [
      "The Importance of the Isnād in the Qur'an",
      "Scholars Who Carry an Isnād in the Qur'an",
      "Children Who Carry an Isnād in the Qur'an",
    ],
  },
];

export const chaptersAr: ChapterDefinition[] = [
  {
    title: "القرآن الكريم",
    pdfTitle: "القرآن الكريم",
    arabic: "القرآن الكريم",
    subtitle:
      "مكانة القرآن العظيم، وصفاته الجليلة، وإعجازه، والحكمة من إنزاله، والفرح به.",
    sections: [
      "مكانة القرآن",
      "صفات القرآن",
      "إعجاز القرآن",
      "الحكمة من إنزال القرآن",
      "الفرح بالقرآن",
    ],
  },
  {
    title: "تعلم القرآن الكريم",
    pdfTitle: "تعلم القرآن الكريم",
    arabic: "تعلّم القرآن الكريم",
    subtitle:
      "فضل مجالس القرآن، وفضل تعلمه وتلاوته وحفظه، والخشية عند تلاوته، ومنزلة أهله.",
    sections: [
      "مجالس القرآن",
      "فضل تعلم القرآن",
      "فضل تلاوة القرآن",
      "فضل حفظ القرآن",
      "الخشية عند تلاوة القرآن",
      "منزلة صاحب القرآن",
    ],
  },
  {
    title: "أسهل طريقة لحفظ القرآن الكريم",
    pdfTitle: "أسهل طريقة لحفظ القرآن الكريم",
    arabic: "أيسر طريقة للحفظ",
    subtitle:
      "المنهج العملي الكامل: قواعد وضوابط الحفظ، المقدار اليومي، طريقة التكرار والربط، ومراجعة الحفظ الجديد.",
    sections: [
      "قواعد وضوابط في حفظ القرآن",
      "مقدار الحفظ اليومي",
      "طريقة حفظ القرآن الكريم",
      "طريقة مراجعة الحفظ الجديد",
      "الجمع بين الحفظ والمراجعة",
      "كيف أفرق بين المتشابهات؟",
    ],
  },
  {
    title: "أسهل طريقة لمراجعة القرآن الكريم",
    pdfTitle: "أسهل طريقة لمراجعة القرآن الكريم",
    arabic: "أيسر طريقة للمراجعة",
    subtitle:
      "طريقة إتقان القرآن الكريم بعد حفظه، وملازمة المراجعة لمدة سنة، وتحزيب الختم الأسبوعي (فمي بشوق).",
    sections: [
      "أهمية مراجعة القرآن",
      "طريقة إتقان القرآن",
      "في كم يختم القرآن؟",
    ],
  },
  {
    title: "الإسناد في القرآن الكريم",
    pdfTitle: "الإسناد في القرآن الكريم",
    arabic: "الإسناد في القرآن الكريم",
    subtitle:
      "أهمية الإسناد المتصل في القرآن، وتراجم ٢٨ عالماً وأئمة كبار وصغار حملوا الإسناد في الأمة.",
    sections: [
      "أهمية الإسناد في القرآن",
      "علماء يحملون إسناداً في القرآن",
      "صغار يحملون إسناداً في القرآن",
    ],
  },
];

export function getChapters(lang: Language): ChapterDefinition[] {
  return lang === "ar" ? chaptersAr : chaptersEn;
}

export const chapterOrder = [2, 3, 0, 1, 4] as const;

export const chapters = chaptersEn;

export interface ContentParagraph {
  text: string;
  kind: "body" | "footnote" | "subheading";
}

export interface TextGroup {
  type: "text";
  kind: "frontmatter" | "chapter-intro" | "section" | "appendix";
  chapterIndex?: number;
  sectionIndex?: number;
  paragraphs: ContentParagraph[];
}

export interface ChapterHeading {
  type: "chapter";
  chapterIndex: number;
}

export type BookSegment = TextGroup | ChapterHeading;

const chapterWordsEn = ["One", "Two", "Three", "Four", "Five"];
const sectionWordsEn = ["One", "Two", "Three", "Four", "Five", "Six"];

const arabicChapterPrefixes = [
  "الفصل الأول",
  "الفصل الثاني",
  "الفصل الثالث",
  "الفصل الرابع",
  "الفصل الخامس",
];

const arabicSectionPrefixes = [
  "المبحث الأول",
  "المبحث الثاني",
  "المبحث الثالث",
  "المبحث الرابع",
  "المبحث الخامس",
  "المبحث السادس",
];

const introductionParagraphsEn: ContentParagraph[] = [
  { text: "INTRODUCTION", kind: "subheading" },
  {
    text: "Praise be to Allah, Lord of the worlds, and may prayers and peace be upon our Prophet Muhammad, and upon his family and all his Companions.",
    kind: "body",
  },
  {
    text: "The Noble Qur'an is the speech of the Lord of the worlds. In it are light and guidance, and the earlier scriptures gave glad tidings of it. The Qur'an is an honor for the Prophet ﷺ and for his people, and an elevation for whoever recites it.",
    kind: "body",
  },
  {
    text: "For this reason Muslims strive to attain the reward of memorizing the Qur'an, and the methods of memorizing it have multiplied. In this book the author sets out an easy method distinguished by speed of memorization, mastery, and ease of recitation.",
    kind: "body",
  },
];

const introductionParagraphsAr: ContentParagraph[] = [
  { text: "المقدمة", kind: "subheading" },
  {
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى نَبِيِّنَا مُحَمَّدٍ، وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ، أَمَّا بَعْدُ:",
    kind: "body",
  },
  {
    text: "فإن القرآن العظيم كلام رب العالمين، فيه النور والهدى، وبشرت به الكتب السالفة، وهو شرف للنبي ﷺ ولأمته، ورفعة لمن تلاه، قال الله تعالى: {وَإِنَّهُ لَذِكْرٌ لَّكَ وَلِقَوْمِكَ وَسَوْفَ تُسْأَلُونَ} [الزخرف: ٤٤]، وقال ﷺ: «إِنَّ اللَّهَ يَرْفَعُ بِهَذَا الْكِتَابِ أَقْوَامًا وَيَضَعُ بِهِ آخَرِينَ».",
    kind: "body",
  },
  {
    text: "ولذا تسابق المسلمون لنيل ثواب حفظه، وتعددت طرق حفظه، وفي هذه الرسالة ذكر لطريقة سهلة تمتاز بسرعة الحفظ وقوته وسهولة المراجعة، نسأل الله أن ينفع بها، وأن يجعلنا من أهل القرآن الذين هم أهله وخاصته.",
    kind: "body",
  },
  {
    text: "وكتبه: د. عبد المحسن بن محمد القاسم — إمام وخطيب المسجد النبوي",
    kind: "body",
  },
];

function getChapterIndexEn(paragraph: string): number {
  return chaptersEn.findIndex(
    (chapter, index) =>
      paragraph === `Chapter ${chapterWordsEn[index]}: ${chapter.pdfTitle}`,
  );
}

function getSectionIndexEn(
  chapterIndex: number,
  paragraph: string,
): number {
  const chapter = chaptersEn[chapterIndex];
  if (!chapter) return -1;

  return chapter.sections.findIndex((section, index) =>
    paragraph.startsWith(`Section ${sectionWordsEn[index]}: ${section}`),
  );
}

function getChapterIndexAr(paragraph: string): number {
  return arabicChapterPrefixes.findIndex((prefix) =>
    paragraph.startsWith(prefix),
  );
}

function getSectionIndexAr(
  chapterIndex: number,
  paragraph: string,
): number {
  const chapter = chaptersAr[chapterIndex];
  if (!chapter) return -1;

  return arabicSectionPrefixes.findIndex((prefix) =>
    paragraph.startsWith(prefix),
  );
}

function isSubheadingEn(paragraph: string): boolean {
  return (
    paragraph === "Publication Details" ||
    paragraph === "Introduction" ||
    paragraph.startsWith("Plan of the Book") ||
    paragraph.startsWith("Table of Contents and the Author's Works") ||
    paragraph.startsWith("Ordering Information") ||
    paragraph.startsWith("Published Works of the Author") ||
    paragraph.startsWith("Table of Contents")
  );
}

function isSubheadingAr(paragraph: string): boolean {
  return (
    paragraph === "المقدمة" ||
    paragraph.startsWith("خطة الكتاب") ||
    paragraph.startsWith("فهرس الموضوعات") ||
    paragraph.startsWith("مؤلفات الشيخ") ||
    paragraph.startsWith("خاتمة ودعاء")
  );
}

function isFootnoteText(paragraph: string): boolean {
  return /^[.(]?\(?[0-9٠-٩١٢٣٤٥٦٧٨٩]+[).]?/u.test(paragraph);
}

export function buildBookSegments(lang: Language = "en"): BookSegment[] {
  const source = lang === "ar" ? sourceAr : sourceEn;
  const segments: BookSegment[] = [];
  let chapterIndex = -1;
  let sectionIndex = -1;
  let insideFootnotes = false;
  let hasReachedFirstChapter = false;
  let current: TextGroup = {
    type: "text",
    kind: "frontmatter",
    paragraphs:
      lang === "ar" ? introductionParagraphsAr : introductionParagraphsEn,
  };

  const flush = () => {
    if (current.paragraphs.length > 0) segments.push(current);
  };

  for (const page of source.pages) {
    for (const rawParagraph of page.paragraphs) {
      const paragraph = rawParagraph.trim();
      if (!paragraph) continue;

      const matchedChapter =
        lang === "ar"
          ? getChapterIndexAr(paragraph)
          : getChapterIndexEn(paragraph);

      if (matchedChapter >= 0) {
        flush();
        segments.push({ type: "chapter", chapterIndex: matchedChapter });
        chapterIndex = matchedChapter;
        sectionIndex = -1;
        insideFootnotes = false;
        hasReachedFirstChapter = true;
        current = {
          type: "text",
          kind: "chapter-intro",
          chapterIndex,
          paragraphs: [],
        };
        continue;
      }

      if (!hasReachedFirstChapter) continue;

      const matchedSection =
        chapterIndex >= 0
          ? lang === "ar"
            ? getSectionIndexAr(chapterIndex, paragraph)
            : getSectionIndexEn(chapterIndex, paragraph)
          : -1;

      if (matchedSection >= 0) {
        flush();
        sectionIndex = matchedSection;
        insideFootnotes = false;
        current = {
          type: "text",
          kind: "section",
          chapterIndex,
          sectionIndex,
          paragraphs: [],
        };
        continue;
      }

      if (
        paragraph.startsWith("Table of Contents and the Author's Works") ||
        paragraph.startsWith("فهرس الموضوعات ومؤلفات الشيخ")
      ) {
        flush();
        chapterIndex = -1;
        sectionIndex = -1;
        insideFootnotes = false;
        current = { type: "text", kind: "appendix", paragraphs: [] };
      }

      if (/^(?:Footnotes?|الحواشي|الهوامش)(?:\s|:|$)/iu.test(paragraph)) {
        insideFootnotes = true;
        current.paragraphs.push({ text: paragraph, kind: "subheading" });
        continue;
      }

      if (insideFootnotes && !isFootnoteText(paragraph)) {
        insideFootnotes = false;
      }

      const isSub =
        lang === "ar" ? isSubheadingAr(paragraph) : isSubheadingEn(paragraph);

      current.paragraphs.push({
        text: paragraph,
        kind: insideFootnotes ? "footnote" : isSub ? "subheading" : "body",
      });
    }
  }

  flush();

  const segmentsByChapter = new Map<number, BookSegment[]>();
  const openingSegments: BookSegment[] = [];
  const appendixSegments: BookSegment[] = [];

  for (const segment of segments) {
    const segmentChapterIndex =
      segment.type === "chapter" ? segment.chapterIndex : segment.chapterIndex;

    if (segmentChapterIndex !== undefined) {
      const chapterSegments = segmentsByChapter.get(segmentChapterIndex) ?? [];
      chapterSegments.push(segment);
      segmentsByChapter.set(segmentChapterIndex, chapterSegments);
    } else if (segment.type === "text" && segment.kind === "appendix") {
      appendixSegments.push(segment);
    } else {
      openingSegments.push(segment);
    }
  }

  return [
    ...openingSegments,
    ...chapterOrder.flatMap(
      (chapterIndex) => segmentsByChapter.get(chapterIndex) ?? [],
    ),
    ...appendixSegments,
  ];
}

export function sectionId(chapterIndex: number, sectionIndex: number): string {
  return `chapter-${chapterIndex + 1}-section-${sectionIndex + 1}`;
}

export function parseSectionId(
  id: string,
): { chapterIndex: number; sectionIndex: number } | undefined {
  const match = /^chapter-(\d+)-section-(\d+)$/.exec(id);
  if (!match) return undefined;
  const chapterIndex = Number(match[1]) - 1;
  const sectionIndex = Number(match[2]) - 1;
  if (chapterIndex < 0 || chapterIndex >= chaptersEn.length) return undefined;
  if (
    sectionIndex < 0 ||
    sectionIndex >= chaptersEn[chapterIndex].sections.length
  )
    return undefined;
  return { chapterIndex, sectionIndex };
}

export function getSectionMetadata(
  id: string,
  lang: Language,
): { title: string; chapter: string } | undefined {
  const parsed = parseSectionId(id);
  if (!parsed) return undefined;
  const currentChapters = getChapters(lang);
  const chapter = currentChapters[parsed.chapterIndex];
  if (!chapter) return undefined;
  const title = chapter.sections[parsed.sectionIndex];
  if (!title) return undefined;
  return { title, chapter: chapter.title };
}

export const initialBookmarks: {
  title: string;
  chapter: string;
  sectionId: string;
}[] = [];

export const initialNotes: {
  title: string;
  text: string;
  sectionId: string;
}[] = [];

export function toArabicDigits(num: number | string): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => digits[Number(d)] ?? d);
}

export interface WeeklyGoalInfo {
  daysRead: number;
  targetDays: number;
  percent: number;
  progressText: string;
  statusText: string;
}

export function getWeeklyGoalInfo(
  daysRead: number,
  lang: Language = "en",
): WeeklyGoalInfo {
  const targetDays = 5;
  const safeDays = Math.max(0, daysRead);
  const percent = Math.min(100, Math.round((safeDays / targetDays) * 100));

  if (lang === "ar") {
    const progressText = `${toArabicDigits(safeDays)} من ٥ أيام`;
    let statusText = "اقرأ اليوم للبدء في تحقيق هدفك الأسبوعي";
    if (safeDays >= targetDays) {
      statusText = "تم تحقيق هدفك الأسبوعي! ما شاء الله";
    } else if (safeDays === targetDays - 1) {
      statusText = "يوم إضافي لتحقيق هدفك";
    } else if (safeDays > 0) {
      statusText = `${toArabicDigits(targetDays - safeDays)} أيام متبقية لتحقيق هدفك`;
    }
    return { daysRead: safeDays, targetDays, percent, progressText, statusText };
  }

  const progressText = `${safeDays} of 5 days`;
  let statusText = "Read today to start your weekly goal";
  if (safeDays >= targetDays) {
    statusText = "Weekly goal achieved! Keep it up";
  } else if (safeDays === targetDays - 1) {
    statusText = "One more day to reach your goal";
  } else if (safeDays > 0) {
    statusText = `${targetDays - safeDays} more days to reach your goal`;
  }
  return { daysRead: safeDays, targetDays, percent, progressText, statusText };
}

export const uiTranslations = {
  en: {
    langLabel: "English",
    langName: "EN",
    langAlt: "العربية",
    langSwitchAria: "Switch to Arabic",
    siteTitle: "The Easiest Method for Memorizing the Noble Qur'an",
    siteSubtitle: "Qur’an learning companion",
    searchPlaceholder: "Search the book",
    searchKbd: "⌘ K",
    bookmarkCurrent: "Bookmark current section",
    removeBookmark: "Remove bookmark",
    toggleTheme: "Toggle theme",
    openNav: "Open navigation",
    closeNav: "Close navigation",
    library: "Your library",
    navHome: "Home",
    navReader: "Read the Book",
    navContents: "Book Contents",
    navBookmarks: "My Bookmarks",
    navNotes: "My Notes",
    weeklyGoal: "Weekly reading goal",
    goalProgress: "4 of 5 days",
    goalStatus: "One more day to reach your goal",
    heroKicker: "A guided path to memorization",
    heroArabicTitle: "أسهل طريقة لحفظ\nالقرآن الكريم",
    heroEnglishTitle: "The Easiest Method for Memorizing the Noble Qur'an",
    heroDesc:
      "A practical, structured companion for learning, memorizing, and preserving the words of Allah with consistency and reverence.",
    startReading: "Start reading",
    bookContentsBtn: "Book contents",
    continueReading: "Continue reading",
    returnToSection: "Return to this section",
    bismillah: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
    bismillahTrans:
      "In the name of Allah, the Most Compassionate, the Most Merciful",
    authorName: "Dr. ʿAbd al-Muḥsin ibn Muḥammad al-Qāsim",
    authorRole: "Imam and Khatib of the Prophet's Mosque",
    edition: "First edition · 1443 AH / 2022 CE",
    chapterLabel: "Chapter",
    toolbarText: "Text",
    toolbarSpacing: "Spacing",
    spacingLevels: ["default", "wide", "compact"],
    themeFocus: "Focus",
    themeLight: "Light",
    save: "Save",
    note: "Note",
    find: "Find",
    bookComplete: "BOOK COMPLETE",
    completeHeading: "May the Qur'an remain\na light in your heart.",
    completeDesc:
      "You have reached the end of this reading edition. Return often to review, reflect, and renew your intention.",
    beginAgain: "Begin again",
    learningSpaceEyebrow: "Your learning space",
    learningSpaceHeading: "Continue your journey",
    learningSpaceDesc:
      "Small, consistent steps build a lasting relationship with the Qur'an.",
    savedBookmarksHeading: "Saved bookmarks",
    viewAll: "View all",
    emptyBookmarks: "Your saved passages will appear here.",
    personalNotesHeading: "Personal notes",
    addNoteBtn: "+ Add note",
    emptyNotes: "Your reflections will appear here.",
    deleteNoteConfirm:
      "Delete this saved note? This action cannot be undone.",
    searchDialogAria: "Search the book",
    searchDialogPlaceholder: "Search chapters, passages, and topics…",
    trySearchingFor: "Try searching for",
    suggestions: ["memorization", "review", "isnād", "recitation"],
    noResults: "No matching sections. Try another word.",
    noteDialogEyebrow: "Personal note",
    notePlaceholder: "Write a reflection or reminder for this section…",
    noteError: "Please write a note before saving.",
    cancel: "Cancel",
    saveNote: "Save note",
    deleteNote: "Delete note",
    close: "Close",
    savedNoteEyebrow: "Saved note",
    backToTop: "Back to top",
    introduction: "INTRODUCTION",
  },
  ar: {
    langLabel: "العربية",
    langName: "عربي",
    langAlt: "EN",
    langSwitchAria: "التبديل إلى الإنجليزية",
    siteTitle: "أسهل طريقة لحفظ القرآن الكريم",
    siteSubtitle: "رفيقك لحفظ القرآن الكريم وتثبيته",
    searchPlaceholder: "البحث في الكتاب",
    searchKbd: "⌘ K",
    bookmarkCurrent: "حفظ الموضع الحالي",
    removeBookmark: "إزالة الإشارة المرجعية",
    toggleTheme: "تبديل المظهر",
    openNav: "فتح القائمة",
    closeNav: "إغلاق القائمة",
    library: "مكتبتك",
    navHome: "الرئيسية",
    navReader: "قراءة الكتاب",
    navContents: "فهرس الكتاب",
    navBookmarks: "إشاراتي المرجعية",
    navNotes: "ملاحظاتي",
    weeklyGoal: "هدف القراءة الأسبوعي",
    goalProgress: "٤ من ٥ أيام",
    goalStatus: "يوم إضافي لتحقيق هدفك",
    heroKicker: "طريق ميسر ومجرب لحفظ كتاب الله",
    heroArabicTitle: "أسهل طريقة لحفظ\nالقرآن الكريم",
    heroEnglishTitle: "The Easiest Method for Memorizing the Noble Qur'an",
    heroDesc:
      "دليل عملي منهجي لتعلّم القرآن الكريم وحفظه وإتقان مراجعته بثبات وإتقان وتدبر.",
    startReading: "ابدأ القراءة",
    bookContentsBtn: "فهرس الكتاب",
    continueReading: "متابعة القراءة",
    returnToSection: "العودة إلى هذا الموضع",
    bismillah: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
    bismillahTrans: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
    authorName: "فضيلة الشيخ د. عبد المحسن بن محمد القاسم",
    authorRole: "إمام وخطيب المسجد النبوي الشريف",
    edition: "الطبعة الأولى · ١٤٤٣هـ / ٢٠٢٢م",
    chapterLabel: "الفصل",
    toolbarText: "الخط",
    toolbarSpacing: "المسافات",
    spacingLevels: ["افتراضي", "واسع", "مضغوط"],
    themeFocus: "تركيز",
    themeLight: "نهاري",
    save: "حفظ",
    note: "ملاحظة",
    find: "بحث",
    bookComplete: "تم الكتاب بحمد الله",
    completeHeading: "جعل الله القرآن العظيم\nربيع قلوبكم ونور صدوركم",
    completeDesc:
      "وصلت إلى نهاية قراءة هذا الكتاب المبارك. داوم على المراجعة والتكرار واحتسب الأجر.",
    beginAgain: "البدء من جديد",
    learningSpaceEyebrow: "مساحة التعلم الخاصة بك",
    learningSpaceHeading: "واصل رحلتك مع القرآن",
    learningSpaceDesc:
      "خطوات صغيرة وثابتة تبني علاقة راسخة ودائمة مع كتاب الله.",
    savedBookmarksHeading: "الإشارات المرجعية المحفوظة",
    viewAll: "عرض الكل",
    emptyBookmarks: "ستظهر المقاطع المحفوظة هنا.",
    personalNotesHeading: "الملاحظات والفوائد",
    addNoteBtn: "+ إضافة فائدة",
    emptyNotes: "ستظهر فوائدك وتأملاتك هنا.",
    deleteNoteConfirm:
      "هل تريد حذف هذه الفائدة؟ لا يمكن التراجع عن هذا الإجراء.",
    searchDialogAria: "البحث في الكتاب",
    searchDialogPlaceholder: "ابحث في الفصول والمباحث والموضوعات…",
    trySearchingFor: "جرّب البحث عن",
    suggestions: ["الحفظ", "المراجعة", "الإسناد", "التلاوة", "سورة الجمعة"],
    noResults: "لا توجد نتائج مطابقة. جرب كلمة أخرى.",
    noteDialogEyebrow: "فائدة وملاحظة",
    notePlaceholder: "اكتب فائدة أو تدبراً أو تذكيراً لهذا الموضع…",
    noteError: "يرجى كتابة الملاحظة قبل الحفظ.",
    cancel: "إلغاء",
    saveNote: "حفظ الفائدة",
    deleteNote: "حذف الفائدة",
    close: "إغلاق",
    savedNoteEyebrow: "الفائدة المحفوظة",
    backToTop: "الرجوع للأعلى",
    introduction: "المقدمة",
  },
};
