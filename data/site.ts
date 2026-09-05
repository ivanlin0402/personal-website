import type { Locale } from "@/lib/i18n/config";

export type SiteLocaleContent = {
  tagline: string;
  description: string;
  about: {
    introduction: string;
    interests: string[];
    skills: string[];
    learning: string[];
    background: string;
  };
};

export type SiteConfig = {
  name: string;
  email: string;
  socialLinks: { label: string; href: string }[];
  /** Bilingual site copy — switched by the header language control */
  content: Record<Locale, SiteLocaleContent>;
};

export const siteConfig: SiteConfig = {
  name: "Ivan Lin",
  email: "ivan0402.lin@gmail.com",
  socialLinks: [
    { label: "GitHub", href: "https://github.com/ivanlin0402" },
    { label: "Instagram", href: "https://www.instagram.com/yenchenglin042/" },
  ],
  content: {
    en: {
      tagline:
        "I build things, explore ideas, and document projects I'm working on.",
      description:
        "A personal hub for projects, activities, and things worth documenting.",
      about: {
        introduction:
          "I'm someone who likes building things, figuring out how they work, and writing down what I learn along the way. This site is a home for those projects and notes.",
        interests: [
          "Building and documenting side projects",
          "Hardware tinkering and repair",
          "Programming and interactive experiments",
          "Community and volunteer work",
        ],
        skills: [
          "Web development",
          "Problem solving",
          "Project planning",
          "Technical writing",
        ],
        learning: [
          "Deeper systems and hardware knowledge",
          "Game and interactive design",
          "Better ways to organize and share work",
        ],
        background:
          "I explore ideas across programming, hardware, creative work, and community projects. The goal of this site is simple: keep a clear record of what I'm working on and how it evolves over time.",
      },
    },
    zh: {
      tagline: "我喜歡動手做東西、探索想法，並記錄正在進行的專案。",
      description: "一個用來整理專案、活動，以及值得記錄事物的個人網站。",
      about: {
        introduction:
          "我喜歡動手做東西、弄清楚它們怎麼運作，並把學到的東西寫下來。這個網站就是這些專案和筆記的家。",
        interests: [
          "建構並記錄個人專案",
          "硬體動手與維修",
          "程式與互動實驗",
          "社群與志願工作",
        ],
        skills: ["網頁開發", "問題解決", "專案規劃", "技術寫作"],
        learning: [
          "更深入的系統與硬體知識",
          "遊戲與互動設計",
          "更好的整理與分享方式",
        ],
        background:
          "我在程式、硬體、創作和社群專案之間探索想法。這個網站的目標很簡單：清楚記錄我正在做什麼，以及它如何隨時間變化。",
      },
    },
  },
};

export function getSiteContent(locale: Locale): SiteLocaleContent {
  return siteConfig.content[locale] ?? siteConfig.content.en;
}
