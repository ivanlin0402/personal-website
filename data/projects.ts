import type { ProjectWithI18n } from "@/lib/i18n/project";

export const projects: ProjectWithI18n[] = [
  {
    slug: "pc-donation",
    title: "PC Donation Project",
    description:
      "A project focused on assembling computers from individual components and donating them to communities or organizations that need them.",
    category: "Community",
    status: "Planning",
    year: "2026",
    featured: true,
    tags: ["Hardware", "Community", "Donation"],
    overview:
      "This project brings together hardware assembly and community support. The idea is to source or reuse components, build reliable PCs, and place them where they can make a practical difference.",
    goals: [
      "Define a reliable, affordable PC build for donation use cases",
      "Establish a repeatable assembly and testing checklist",
      "Identify partner organizations and donation workflows",
      "Document the process so others can follow or adapt it",
    ],
    process: [
      "Research component options and define minimum specs",
      "Estimate costs and outline donation coordination",
      "Assemble and test builds once the plan is solid",
      "Deliver systems and document the workflow",
    ],
    technicalDetails: [
      "Target a reliable mid-range component profile for donation use",
      "Prefer parts that are easy to source, repair, and replace",
      "Keep assembly and testing steps repeatable with a checklist",
    ],
    results: [
      "Still in planning",
      "Draft build profile started",
      "Clearer understanding of donation logistics",
    ],
    lessons: [
      "Clear specs matter more than chasing maximum performance",
      "Donation logistics need as much planning as the build itself",
    ],
    media: "Photos and diagrams will be added as builds progress.",
    documentationUrl: "#",
    updates: [
      {
        date: "2026-09-05",
        title: "Started project planning",
        status: "completed",
      },
      {
        date: "2026-09-12",
        title: "Researching components",
        description:
          "Comparing possible hardware configurations and costs.",
        status: "current",
      },
      {
        date: "2026-10",
        title: "Build first prototype",
        status: "upcoming",
      },
    ],
    i18n: {
      zh: {
        title: "電腦捐贈專案",
        description:
          "這個專案專注於組裝電腦，並捐贈給有需要的社區或組織。",
        overview:
          "這個專案結合硬體組裝與社區支持。目標是取得或再利用零件、組出可靠的電腦，並送到真正需要的地方。",
        goals: [
          "定義一套可靠、價格合理、適合捐贈用途的電腦規格",
          "建立可重複執行的組裝與測試清單",
          "尋找合作組織並規劃捐贈流程",
          "記錄整個過程，方便其他人跟做或調整",
        ],
        process: [
          "研究零件選項並訂出最低規格",
          "估算成本並規劃捐贈協調方式",
          "在計畫成熟後組裝並測試",
          "送出電腦並記錄工作流程",
        ],
        technicalDetails: [
          "以適合捐贈用途的中階零件配置為目標",
          "優先選擇容易取得、維修與更換的零件",
          "用檢查清單維持組裝與測試步驟的一致性",
        ],
        results: [
          "仍在規劃階段",
          "已開始草擬組裝規格",
          "更清楚了解捐贈物流需求",
        ],
        lessons: [
          "清楚的規格比追求極致效能更重要",
          "捐贈物流需要和組裝本身一樣仔細規劃",
        ],
        media: "照片與圖解會在組裝過程中陸續補上。",
        updates: [
          { title: "開始專案規劃" },
          {
            title: "研究零件中",
            description: "比較可行的硬體配置與成本。",
          },
          { title: "組裝第一台原型" },
        ],
      },
    },
  },
  {
    slug: "game-project",
    title: "Game Project",
    description: "A collection of programming and interactive experiments.",
    category: "Programming",
    status: "In Progress",
    year: "2026",
    featured: true,
    tags: ["Programming", "Games", "Experiments", "Pygame"],
    overview:
      "A growing set of interactive experiments focused on gameplay ideas, small systems, and learning through building. Published pieces include Pop Cat and F1 Time Trial.",
    goals: [
      "Prototype small interactive mechanics",
      "Improve programming and design judgment through practice",
      "Document experiments so ideas are easy to revisit",
    ],
    process: [
      "Pick a mechanic or idea",
      "Implement a minimal version",
      "Playtest and note what worked",
      "Decide whether to expand or archive it",
    ],
    technicalDetails: [
      "Games are built with Python and pygame",
      "Browser builds packaged with pygbag (WebAssembly) for GitHub Pages",
      "Pop Cat: https://github.com/ivanlin0402/pop-cat",
      "F1 Time Trial (V18 choosable gear): https://github.com/ivanlin0402/f1-time-trial",
    ],
    results: [
      "Pop Cat and F1 Time Trial published on GitHub",
      "Both playable in the browser on this site",
      "Active prototyping phase for more experiments",
    ],
    lessons: [
      "Small scopes make experimentation sustainable",
      "Writing down outcomes helps more than keeping everything in memory",
    ],
    games: [
      {
        title: "Pop Cat",
        platform: "Pygame",
        description:
          "A simple clicker — click or press a key to pop the cat and raise your score.",
        href: "/play/pop-cat/",
        image: "/games/pop-cat/popcat.png",
        githubUrl: "https://github.com/ivanlin0402/pop-cat",
      },
      {
        title: "F1 Time Trial",
        platform: "Pygame",
        description:
          "Pick a year from '88 to '25, then a team and driver — ratings change speed. Keyboard: X gas, Z brake, arrows turn, Space for DRS, Tab for the top-50 list. Phones/tablets use on-screen pads (LB opens the list).",
        href: "/play/f1-time-trial/",
        image: "/games/f1-time-trial/cover.png",
        githubUrl: "https://github.com/ivanlin0402/f1-time-trial",
      },
    ],
    updates: [
      {
        date: "2026-09-05",
        title: "Published Pop Cat on GitHub",
        description: "Pushed the pygame clicker to ivanlin0402/pop-cat.",
        status: "completed",
      },
      {
        date: "2026-09-06",
        title: "Published F1 Time Trial",
        description:
          "Uploaded V18 (choosable gear) as ivanlin0402/f1-time-trial and added a browser build.",
        status: "completed",
      },
      {
        date: "2026-09",
        title: "More game experiments",
        status: "upcoming",
      },
    ],
    i18n: {
      zh: {
        title: "遊戲專案",
        description: "一系列程式與互動實驗的合集。",
        overview:
          "這是一組持續增加的互動實驗，聚焦玩法構想、小型系統，以及在實作中學習。目前已公開的作品包括 Pop Cat 與 F1 Time Trial。",
        goals: [
          "試作小型互動機制",
          "透過實作提升程式與設計判斷力",
          "把實驗記錄下來，方便之後回顧",
        ],
        process: [
          "選定一個機制或想法",
          "先做出最小可用版本",
          "實際遊玩並記下哪些地方有效",
          "決定要繼續擴充或封存",
        ],
        technicalDetails: [
          "遊戲以 Python 與 pygame 製作",
          "瀏覽器版本使用 pygbag（WebAssembly）打包，以便部署到 GitHub Pages",
          "Pop Cat：https://github.com/ivanlin0402/pop-cat",
          "F1 Time Trial（V18 可選檔位）：https://github.com/ivanlin0402/f1-time-trial",
        ],
        results: [
          "Pop Cat 與 F1 Time Trial 已發布到 GitHub",
          "兩者都能在本站瀏覽器中遊玩",
          "仍在積極試作更多實驗",
        ],
        lessons: [
          "小範圍的題目更容易長期持續實驗",
          "把結果寫下來，比只放在記憶裡更有幫助",
        ],
        gameDescriptions: {
          "Pop Cat":
            "簡單的點擊遊戲——用滑鼠點擊或按鍵盤讓貓咪 pop，並提高分數。",
          "F1 Time Trial":
            "先選年份（'88–'25），再選車隊與車手——評分會影響速度。鍵盤：X 加速、Z 煞車、方向鍵轉向、空白鍵 DRS、Tab 開啟前五十名榜。手機／平板用螢幕按鍵（LB 開啟榜單）。",
        },
        updates: [
          {
            title: "在 GitHub 發布 Pop Cat",
            description: "已將 pygame 點擊遊戲推送到 ivanlin0402/pop-cat。",
          },
          {
            title: "發布 F1 Time Trial",
            description:
              "已將 V18（可選檔位）上傳為 ivanlin0402/f1-time-trial，並加入瀏覽器版本。",
          },
          { title: "更多遊戲實驗" },
        ],
      },
    },
  },
];

export function getAllProjects(): ProjectWithI18n[] {
  return projects;
}

export function getFeaturedProjects(): ProjectWithI18n[] {
  return projects.filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): ProjectWithI18n | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectCategories(): string[] {
  const categories = new Set(projects.map((project) => project.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}
