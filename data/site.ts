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
        "First-year at HSNU — I build projects, follow sports I love, and keep learning.",
      description:
        "A personal hub for school, clubs, games, and things worth documenting.",
      about: {
        introduction:
          "I'm Ivan Lin, a first-year student at HSNU (National Taiwan Normal University Affiliated High School), the second-best high school in Taiwan. I like figuring out how systems work, making small games, and writing down what I learn. This site is where I keep those projects and notes.",
        interests: [
          "Watching Formula 1, baseball, and basketball",
          "Playing chess",
          "Building and documenting side projects",
          "Network management and servers through CNMC, my school club",
          "Hardware tinkering and interactive experiments",
        ],
        skills: [
          "Web development",
          "Python / pygame game experiments",
          "Project planning and note-taking",
          "Problem solving",
        ],
        learning: [
          "Keeping my school grades strong this year",
          "Network management and server basics in CNMC",
          "Game and interactive design",
          "Learning as much as I can across school and projects",
        ],
        background:
          "I started with small programs and games, then built this site so I had one place to collect them. My favorite project so far is F1 Time Trial — it features one of my favorite sports, and it's the most complete game I've made. Outside of coding I watch F1, baseball, and basketball, and I play chess. This year my goal is simple: keep my grades up and learn as much as I can.",
      },
    },
    zh: {
      tagline: "師大附中一年級——做專案、追喜歡的運動，並持續學習。",
      description: "用來整理學校、社團、遊戲，以及值得記錄事物的個人網站。",
      about: {
        introduction:
          "我是 Ivan Lin，目前就讀國立臺灣師範大學附屬高級中學（師大附中）一年級，是臺灣排名第二的高中。我喜歡弄清楚系統怎麼運作、做一些小遊戲，並把學到的東西寫下來。這個網站就是這些專案與筆記的家。",
        interests: [
          "觀看 Formula 1、棒球與籃球",
          "下西洋棋",
          "建構並記錄個人專案",
          "透過學校社團 CNMC 學習網路管理與伺服器",
          "硬體動手與互動實驗",
        ],
        skills: [
          "網頁開發",
          "Python／pygame 遊戲實驗",
          "專案規劃與筆記",
          "問題解決",
        ],
        learning: [
          "維持今年學校成績",
          "在 CNMC 學習網路管理與伺服器基礎",
          "遊戲與互動設計",
          "在課業與專案中盡量多學",
        ],
        background:
          "我從小型程式與遊戲開始，後來做了這個網站，好把作品集中在一處。目前最喜歡的專案是 F1 Time Trial——它結合了我最喜歡的運動之一，也是我完成度最高的遊戲。課外我會看 F1、棒球、籃球，也會下西洋棋。今年的目標很單純：把成績顧好，並盡可能多學一些。",
      },
    },
  },
};

export function getSiteContent(locale: Locale): SiteLocaleContent {
  return siteConfig.content[locale] ?? siteConfig.content.en;
}
