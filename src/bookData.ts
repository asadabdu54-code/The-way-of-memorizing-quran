import source from "./data/book.json";

export interface ChapterDefinition {
  title: string;
  pdfTitle: string;
  arabic: string;
  subtitle: string;
  sections: string[];
}

export const chapters: ChapterDefinition[] = [
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

const chapterWords = ["One", "Two", "Three", "Four", "Five"];
const sectionWords = ["One", "Two", "Three", "Four", "Five", "Six"];
const pages = source.pages;
const introductionParagraphs: ContentParagraph[] = [
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

function getChapterIndex(paragraph: string): number {
  return chapters.findIndex(
    (chapter, index) =>
      paragraph === `Chapter ${chapterWords[index]}: ${chapter.pdfTitle}`,
  );
}

function getSectionIndex(
  chapterIndex: number,
  paragraph: string,
): number {
  const chapter = chapters[chapterIndex];
  if (!chapter) return -1;

  return chapter.sections.findIndex((section, index) =>
    paragraph.startsWith(`Section ${sectionWords[index]}: ${section}`),
  );
}

function isSubheading(paragraph: string): boolean {
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

function isFootnoteText(paragraph: string): boolean {
  return /^[.(]?\(?[0-9٠-٩١٢٣٤٥٦٧٨٩]+[).]?/u.test(paragraph);
}

export function buildBookSegments(): BookSegment[] {
  const segments: BookSegment[] = [];
  let chapterIndex = -1;
  let sectionIndex = -1;
  let insideFootnotes = false;
  let hasReachedFirstChapter = false;
  let current: TextGroup = {
    type: "text",
    kind: "frontmatter",
    paragraphs: introductionParagraphs,
  };

  const flush = () => {
    if (current.paragraphs.length > 0) segments.push(current);
  };

  for (const page of pages) {
    for (const rawParagraph of page.paragraphs) {
      const paragraph = rawParagraph.trim();
      if (!paragraph) continue;

      const matchedChapter = getChapterIndex(paragraph);
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
        chapterIndex >= 0 ? getSectionIndex(chapterIndex, paragraph) : -1;
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

      if (paragraph.startsWith("Table of Contents and the Author's Works")) {
        flush();
        chapterIndex = -1;
        sectionIndex = -1;
        insideFootnotes = false;
        current = { type: "text", kind: "appendix", paragraphs: [] };
      }

      if (/^Footnotes?(?:\s|:|$)/iu.test(paragraph)) {
        insideFootnotes = true;
        current.paragraphs.push({ text: paragraph, kind: "subheading" });
        continue;
      }

      if (insideFootnotes && !isFootnoteText(paragraph)) {
        insideFootnotes = false;
      }

      current.paragraphs.push({
        text: paragraph,
        kind: insideFootnotes
          ? "footnote"
          : isSubheading(paragraph)
            ? "subheading"
            : "body",
      });
    }
  }

  flush();
  return segments;
}

export function sectionId(chapterIndex: number, sectionIndex: number): string {
  return `chapter-${chapterIndex + 1}-section-${sectionIndex + 1}`;
}

export const initialBookmarks = [
  {
    title: chapters[2].sections[2],
    chapter: chapters[2].title,
    sectionId: sectionId(2, 2),
  },
  {
    title: chapters[3].sections[0],
    chapter: chapters[3].title,
    sectionId: sectionId(3, 0),
  },
];

export const initialNotes = [
  {
    title: "Daily Amount",
    text: "Begin with half a page after Fajr and review before sleep.",
    sectionId: sectionId(2, 1),
  },
  {
    title: "Similar Verses",
    text: "Make a comparison sheet for recurring endings.",
    sectionId: sectionId(2, 5),
  },
];
