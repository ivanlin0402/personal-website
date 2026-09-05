import type { Locale } from "@/lib/i18n/config";
import type { ProjectStatus, UpdateStatus } from "@/lib/types";

export type Dictionary = {
  nav: {
    home: string;
    projects: string;
    about: string;
    contact: string;
  };
  language: string;
  home: {
    eyebrow: string;
    greeting: string;
    viewProjects: string;
    featuredTitle: string;
    featuredDescription: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
  };
  projectsPage: {
    title: string;
    description: string;
    all: string;
    empty: string;
  };
  aboutPage: {
    title: string;
    description: string;
    introduction: string;
    interests: string;
    skills: string;
    learning: string;
    background: string;
  };
  contactPage: {
    title: string;
    description: string;
    email: string;
  };
  project: {
    back: string;
    viewProject: string;
    overview: string;
    timeline: string;
    games: string;
    goals: string;
    process: string;
    technicalDetails: string;
    results: string;
    lessons: string;
    media: string;
    links: string;
    openGithub: string;
  };
  status: Record<ProjectStatus, string>;
  updateStatus: Record<UpdateStatus, string>;
  categories: Record<string, string>;
};

const en: Dictionary = {
  nav: {
    home: "Home",
    projects: "Projects",
    about: "About",
    contact: "Contact",
  },
  language: "Language",
  home: {
    eyebrow: "Personal project hub",
    greeting: "Hi, I'm {name}.",
    viewProjects: "View Projects",
    featuredTitle: "Featured Projects",
    featuredDescription:
      "A selection of things I'm building, exploring, or documenting.",
    ctaTitle: "Browse all projects",
    ctaDescription:
      "Filter by category and open any project for the full write-up.",
    ctaButton: "View All Projects",
  },
  projectsPage: {
    title: "Projects",
    description:
      "Everything collected in one place. Filter by category or open a project for more detail.",
    all: "All",
    empty: "No projects in this category yet.",
  },
  aboutPage: {
    title: "About",
    description:
      "A short look at who I am, what I care about, and what I'm exploring.",
    introduction: "Introduction",
    interests: "Interests",
    skills: "Skills",
    learning: "Currently Learning",
    background: "Background",
  },
  contactPage: {
    title: "Contact",
    description: "Simple ways to reach me.",
    email: "Email",
  },
  project: {
    back: "← All projects",
    viewProject: "View project →",
    overview: "Overview",
    timeline: "Progress / Timeline",
    games: "Games",
    goals: "Goals",
    process: "Process",
    technicalDetails: "Technical Details",
    results: "Results",
    lessons: "What I Learned",
    media: "Media",
    links: "Links",
    openGithub: "Open on GitHub →",
  },
  status: {
    Idea: "Idea",
    Planning: "Planning",
    "In Progress": "In Progress",
    Testing: "Testing",
    Completed: "Completed",
  },
  updateStatus: {
    completed: "Completed",
    current: "Current",
    upcoming: "Upcoming",
  },
  categories: {
    Community: "Community",
    Programming: "Programming",
    Hardware: "Hardware",
    Creative: "Creative",
    Experiments: "Experiments",
    Other: "Other",
  },
};

const zh: Dictionary = {
  nav: {
    home: "首頁",
    projects: "專案",
    about: "關於",
    contact: "聯絡",
  },
  language: "語言",
  home: {
    eyebrow: "個人專案主頁",
    greeting: "你好，我是 {name}。",
    viewProjects: "查看專案",
    featuredTitle: "精選專案",
    featuredDescription: "我正在建構、探索或記錄的一部分內容。",
    ctaTitle: "瀏覽全部專案",
    ctaDescription: "可依分類篩選，並開啟任意專案查看完整內容。",
    ctaButton: "查看全部專案",
  },
  projectsPage: {
    title: "專案",
    description: "所有內容集中在這裡。可依分類篩選，或開啟專案查看詳情。",
    all: "全部",
    empty: "此分類下暫時沒有專案。",
  },
  aboutPage: {
    title: "關於",
    description: "簡單介紹我是誰、我在意什麼，以及我正在探索的方向。",
    introduction: "簡介",
    interests: "興趣",
    skills: "技能",
    learning: "正在學習",
    background: "背景",
  },
  contactPage: {
    title: "聯絡",
    description: "聯絡我的簡單方式。",
    email: "電子郵件",
  },
  project: {
    back: "← 全部專案",
    viewProject: "查看專案 →",
    overview: "概述",
    timeline: "進度 / 時間軸",
    games: "遊戲",
    goals: "目標",
    process: "過程",
    technicalDetails: "技術細節",
    results: "成果",
    lessons: "我學到了什麼",
    media: "媒體",
    links: "連結",
    openGithub: "在 GitHub 開啟 →",
  },
  status: {
    Idea: "構想",
    Planning: "規劃中",
    "In Progress": "進行中",
    Testing: "測試中",
    Completed: "已完成",
  },
  updateStatus: {
    completed: "已完成",
    current: "進行中",
    upcoming: "即將開始",
  },
  categories: {
    Community: "社群",
    Programming: "程式",
    Hardware: "硬體",
    Creative: "創作",
    Experiments: "實驗",
    Other: "其他",
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  zh,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function formatGreeting(template: string, name: string): string {
  return template.replace("{name}", name);
}
