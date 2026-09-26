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
    playInBrowser: string;
    viewPhotos: string;
    backToProject: string;
    previousPhoto: string;
    nextPhoto: string;
    board: string;
    pgnLabel: string;
    loadPgn: string;
    exampleNote: string;
    play: string;
    pause: string;
    toStart: string;
    previousMove: string;
    nextMove: string;
    toEnd: string;
    invalidPgn: string;
    white: string;
    black: string;
    startingPosition: string;
    chessGames: string;
    sortBy: string;
    sortTime: string;
    sortAccuracy: string;
    chessOpponent: string;
    chessYou: string;
    chessWin: string;
    chessLoss: string;
    chessDraw: string;
    viewGame: string;
    openOnChesscom: string;
    showMoreGames: string;
    chessBrilliants: string;
    brilliantBenefit: string;
    brilliantNote: string;
    chessRatings: string;
    chessRecord: string;
    chessCurrent: string;
    chessBest: string;
    ratingChartNote: string;
    reviewedGamesNote: string;
    boardMine: string;
    boardOwn: string;
    boardMineNote: string;
    reviewGame: string;
    cancelReview: string;
    analyzingGame: string;
    reviewFailed: string;
    engineAccuracy: string;
    evalBefore: string;
    evalAfter: string;
    bestMoveLabel: string;
    bestLineLabel: string;
    showFullLine: string;
    hideFullLine: string;
    reviewDebug: string;
    github: string;
    demo: string;
    documentation: string;
  };
  footer: {
    visits: string;
  };
  notFound: {
    title: string;
    description: string;
    backHome: string;
  };
  status: Record<ProjectStatus, string>;
  updateStatus: Record<UpdateStatus, string>;
  categories: Record<string, string>;
  tags: Record<string, string>;
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
    playInBrowser: "Play in browser →",
    viewPhotos: "View photos →",
    backToProject: "← Back to project",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    board: "Board",
    pgnLabel: "PGN",
    loadPgn: "Load game",
    exampleNote: "Example game. Paste your own PGN to replace it.",
    play: "Play",
    pause: "Pause",
    toStart: "Start",
    previousMove: "Previous move",
    nextMove: "Next move",
    toEnd: "End",
    invalidPgn: "That PGN could not be read. Check the moves and try again.",
    white: "White",
    black: "Black",
    startingPosition: "Starting position",
    chessGames: "Games",
    sortBy: "Sort by",
    sortTime: "Time",
    sortAccuracy: "Accuracy",
    chessOpponent: "Opponent",
    chessYou: "You",
    chessWin: "Win",
    chessLoss: "Loss",
    chessDraw: "Draw",
    viewGame: "View game",
    openOnChesscom: "Chess.com",
    showMoreGames: "Show more",
    chessBrilliants: "Brilliant moves",
    brilliantBenefit: "Effect",
    brilliantNote: "Sorted by how many of your brilliant moves (!!) the game contains.",
    chessRatings: "Ratings",
    chessRecord: "Record",
    chessCurrent: "Current",
    chessBest: "Best",
    ratingChartNote: "Your Chess.com rating across the reviewed games.",
    reviewedGamesNote:
      "374 public games from 25 Aug to 25 Sep 2026. Accuracy is a Stockfish estimate, not Chess.com Game Review.",
    boardMine: "My games",
    boardOwn: "Your game",
    boardMineNote: "Open a game from Games or Brilliant moves to analyze it here.",
    reviewGame: "Review game",
    cancelReview: "Cancel",
    analyzingGame: "Analyzing game...",
    reviewFailed: "The engine could not review this game.",
    engineAccuracy: "Accuracy",
    evalBefore: "Before",
    evalAfter: "After",
    bestMoveLabel: "Best move",
    bestLineLabel: "Best was",
    showFullLine: "Show the line",
    hideFullLine: "Shorter line",
    reviewDebug: "Debug",
    github: "GitHub",
    demo: "Demo",
    documentation: "Documentation",
  },
  footer: {
    visits: "visits",
  },
  notFound: {
    title: "Page not found",
    description: "That page doesn't exist or the project slug is wrong.",
    backHome: "← Back home",
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
    Learning: "Learning",
    Hardware: "Hardware",
    Creative: "Creative",
    Experiments: "Experiments",
    Other: "Other",
  },
  tags: {
    Hardware: "Hardware",
    Community: "Community",
    Donation: "Donation",
    Programming: "Programming",
    Games: "Games",
    Experiments: "Experiments",
    Pygame: "Pygame",
    Website: "Website",
    Web: "Web",
    Design: "Design",
    Networking: "Networking",
    Servers: "Servers",
    "School Club": "School Club",
    Drone: "Drone",
    Learning: "Learning",
    "Summer Camp": "Summer Camp",
    Taipei: "Taipei",
    Chess: "Chess",
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
    description: "聯絡我的方式。",
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
    playInBrowser: "在瀏覽器遊玩 →",
    viewPhotos: "查看照片 →",
    backToProject: "← 回到專案",
    previousPhoto: "上一張照片",
    nextPhoto: "下一張照片",
    board: "棋盤",
    pgnLabel: "PGN",
    loadPgn: "載入棋局",
    exampleNote: "範例棋局。貼上你自己的 PGN 即可換成這一盤。",
    play: "播放",
    pause: "暫停",
    toStart: "開局",
    previousMove: "上一步",
    nextMove: "下一步",
    toEnd: "終局",
    invalidPgn: "這份 PGN 讀不到。請檢查棋步後再試一次。",
    white: "白方",
    black: "黑方",
    startingPosition: "初始局面",
    chessGames: "棋局",
    sortBy: "排序",
    sortTime: "時間",
    sortAccuracy: "準確率",
    chessOpponent: "對手",
    chessYou: "你",
    chessWin: "勝",
    chessLoss: "負",
    chessDraw: "和",
    viewGame: "看整盤",
    openOnChesscom: "Chess.com",
    showMoreGames: "顯示更多",
    chessBrilliants: "精彩棋步",
    brilliantBenefit: "影響",
    brilliantNote: "依你在這盤裡的精彩棋步（!!）數量排序，多的排前面。",
    chessRatings: "等級分",
    chessRecord: "戰績",
    chessCurrent: "目前",
    chessBest: "最高",
    ratingChartNote: "這些已分析棋局裡，你的 Chess.com 等級分變化。",
    reviewedGamesNote:
      "2026 年 8 月 25 日至 9 月 25 日的 374 盤公開棋局。準確率是 Stockfish 的估計，不是 Chess.com 的 Game Review。",
    boardMine: "我的棋局",
    boardOwn: "自己的棋局",
    boardMineNote: "從「棋局」或「精彩棋步」選一盤，在這裡分析。",
    reviewGame: "分析棋局",
    cancelReview: "取消",
    analyzingGame: "分析中…",
    reviewFailed: "引擎沒辦法分析這盤棋。",
    engineAccuracy: "準確率",
    evalBefore: "之前",
    evalAfter: "之後",
    bestMoveLabel: "最佳著法",
    bestLineLabel: "最佳繼續",
    showFullLine: "展開變化",
    hideFullLine: "收合變化",
    reviewDebug: "除錯",
    github: "GitHub",
    demo: "示範",
    documentation: "文件",
  },
  footer: {
    visits: "次瀏覽",
  },
  notFound: {
    title: "找不到頁面",
    description: "這個頁面不存在，或專案網址不正確。",
    backHome: "← 回到首頁",
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
    Learning: "學習",
    Hardware: "硬體",
    Creative: "創作",
    Experiments: "實驗",
    Other: "其他",
  },
  tags: {
    Hardware: "硬體",
    Community: "社群",
    Donation: "捐贈",
    Programming: "程式",
    Games: "遊戲",
    Experiments: "實驗",
    Pygame: "Pygame",
    Website: "網站",
    Web: "網頁",
    Design: "設計",
    Networking: "網路管理",
    Servers: "伺服器",
    "School Club": "社團",
    Drone: "無人機",
    Learning: "學習",
    "Summer Camp": "暑假營隊",
    Taipei: "臺北",
    Chess: "西洋棋",
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
