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
  {
    slug: "cnmc-website",
    title: "CNMC Website",
    description:
      "A website for my high school club CNMC, which focuses on network management and server skills.",
    category: "Programming",
    status: "In Progress",
    year: "2026",
    featured: true,
    tags: ["Website", "Networking", "Servers", "School Club"],
    overview:
      "CNMC is my high school club for learning network management and server work. This project is the club website — a place to introduce who we are, what we learn, and how people can join or follow club activity.",
    goals: [
      "Give CNMC a clear public website for students and visitors",
      "Explain the club’s focus on networking and servers",
      "Share club info, activities, and learning topics in one place",
      "Keep the site simple enough for the club to maintain",
    ],
    process: [
      "List what the club needs on the site (intro, focus, activities, contact)",
      "Design a simple page structure and navigation",
      "Build pages and write club-facing content",
      "Review with club members and publish updates",
    ],
    technicalDetails: [
      "Website for a high school club (CNMC)",
      "Club topics: network management, servers, and related hands-on practice",
      "Content structured for intro, learning focus, and club updates",
      "Hosting and stack details will be added as the site takes shape",
    ],
    results: [
      "Currently an active CNMC member",
      "Website project started and tracked on this hub",
      "Site content and structure still being built",
    ],
    lessons: [
      "A club site should explain the craft first, then the schedule",
      "Networking and server topics need plain-language pages for new members",
    ],
    updates: [
      {
        date: "2026-09",
        title: "Joined CNMC and started the club website",
        description:
          "Began planning a site that introduces CNMC and its networking / server focus.",
        status: "current",
      },
      {
        date: "2026",
        title: "Publish a first public club site version",
        status: "upcoming",
      },
    ],
    i18n: {
      zh: {
        title: "CNMC 網站",
        description:
          "為高中社團 CNMC 製作的網站；社團目標是學習網路管理與伺服器相關技能。",
        overview:
          "CNMC 是我目前就讀高中的社團，專注於網路管理與伺服器實作。這個專案是社團網站，用來介紹我們是誰、學什麼，以及如何認識／加入社團活動。",
        goals: [
          "為 CNMC 建立清楚的公開網站，方便同學與訪客了解",
          "說明社團以網路管理與伺服器為主的學習方向",
          "把社團資訊、活動與學習主題集中在同一處",
          "維持簡單、好維護的網站，方便社團持續更新",
        ],
        process: [
          "整理網站需要的內容（介紹、學習方向、活動、聯絡）",
          "規劃簡單的頁面結構與導覽",
          "製作頁面並撰寫社團相關文案",
          "與社員確認後再發布更新",
        ],
        technicalDetails: [
          "高中社團（CNMC）網站",
          "社團主題：網路管理、伺服器，以及相關動手實作",
          "內容結構包含介紹、學習方向與社團動態",
          "託管與技術細節會在網站成形後補上",
        ],
        results: [
          "目前為 CNMC 社員",
          "已在本站開始追蹤網站專案",
          "網站內容與結構仍在建置中",
        ],
        lessons: [
          "社團網站應先講清楚「學什麼」，再放行程",
          "網路與伺服器主題需要用白話說明，方便新生理解",
        ],
        updates: [
          {
            title: "加入 CNMC 並開始社團網站",
            description: "開始規劃介紹 CNMC 及其網路／伺服器方向的網站。",
          },
          { title: "發布第一個公開社團網站版本" },
        ],
      },
    },
  },
  {
    slug: "taipei-drone-summer-camp-2026",
    title: "2026 Taipei Drone Summer Camp",
    description:
      "Learning and documenting the 2026 Taipei Drone Education Center summer camp — flight, programming, and hands-on drone practice.",
    category: "Learning",
    status: "Planning",
    year: "2026",
    featured: true,
    tags: ["Drone", "Learning", "Summer Camp", "Taipei"],
    overview:
      "This project tracks participation in Taipei’s 2026 drone summer camp (115 school year), run by the Taipei Drone Education Center. The camp covers hands-on topics such as FPV flight, drone soccer, programmed flight, DIY assembly, and aerial photo/editing.",
    goals: [
      "Join a 2026 Taipei drone summer camp session",
      "Practice safe flight and basic drone operation",
      "Learn programming or assembly skills from the chosen track",
      "Document what was learned on this site",
    ],
    process: [
      "Review camp tracks and pick a session",
      "Register through Taipei CoolClass / CoolCloud when enrollment opens",
      "Attend the camp and take notes",
      "Summarize skills, photos, and takeaways here",
    ],
    technicalDetails: [
      "Hosted by Taipei Drone Education Center (木柵高工活動中心 B1)",
      "Camp window: around July 2 – August 6, 2026",
      "Tracks may include FPV, drone soccer, programmed drones, DIY build, and aerial editing",
      "Registration typically via 酷課雲 (cooc.tp.edu.tw)",
    ],
    results: [
      "Project page created to track the camp",
      "Waiting for / preparing for the 2026 summer sessions",
    ],
    lessons: [
      "Hands-on camps work best when you pick one clear skill track",
      "Writing notes soon after each day helps more than waiting until the end",
    ],
    media: "Photos from camp days — open a day tile to view the gallery.",
    mediaAlbums: [
      {
        slug: "9-19-day2",
        title: "9/19 day2",
        description:
          "Day 2 photos: Drone 2.0 / micro:bit kit, controller, and camp setup.",
        cover: "/projects/taipei-drone-summer-camp-2026/9-19-day2/photo-1.jpg",
        images: [
          "/projects/taipei-drone-summer-camp-2026/9-19-day2/photo-1.jpg",
          "/projects/taipei-drone-summer-camp-2026/9-19-day2/photo-2.jpg",
          "/projects/taipei-drone-summer-camp-2026/9-19-day2/photo-3.jpg",
          "/projects/taipei-drone-summer-camp-2026/9-19-day2/photo-4.jpg",
        ],
      },
    ],
    updates: [
      {
        date: "2026-09-19",
        title: "Added 9/19 day2 photo album",
        description:
          "Grouped today’s drone camp photos into a Media tile named 9/19 day2.",
        status: "completed",
      },
      {
        date: "2026-09",
        title: "Added camp kit photos",
        description:
          "Added Media photos of the Drone 2.0 / micro:bit programming kit and remote controller.",
        status: "completed",
      },
      {
        date: "2026-09",
        title: "Added the camp as a tracked project",
        description: "Created this page to plan and document the 2026 Taipei drone summer camp.",
        status: "completed",
      },
      {
        date: "2026-05",
        title: "Camp registration window",
        description: "Registration is expected through CoolClass / CoolCloud around May–June 2026.",
        status: "upcoming",
      },
      {
        date: "2026-07",
        title: "Attend summer camp sessions",
        status: "upcoming",
      },
    ],
    i18n: {
      zh: {
        title: "2026 臺北無人機暑假營隊",
        description:
          "參與並記錄 2026 臺北市無人機教育中心暑假營隊——飛行、程式與動手實作。",
        overview:
          "這個專案用來追蹤 2026（115 學年度）臺北市無人機教育中心暑假營隊。營隊內容包含 FPV 飛行、無人機足球、程控飛行、DIY 組裝，以及空拍與剪輯等實作課程。",
        goals: [
          "報名並參加 2026 臺北無人機暑假營隊",
          "練習安全飛行與基本操控",
          "從所選梯次學習程式或組裝技能",
          "把學到的內容整理到本站",
        ],
        process: [
          "查看營隊梯次並選定課程",
          "在報名開放時透過酷課 APP／酷課雲登記",
          "參加營隊並做筆記",
          "把技能、照片與心得整理到這裡",
        ],
        technicalDetails: [
          "主辦：臺北市無人機教育中心（木柵高工活動中心 B1）",
          "營隊期間約為 2026/7/2–8/6",
          "可能梯次包含 FPV、無人機足球、程控無人機、DIY 組裝、空拍應用與剪輯",
          "報名通常透過酷課雲（cooc.tp.edu.tw）",
        ],
        results: [
          "已建立專案頁面方便追蹤",
          "等待／準備 2026 暑假梯次",
        ],
        lessons: [
          "動手營隊最好先選定一條清楚的技能路線",
          "當天就寫筆記，比全部結束後再回想更有效",
        ],
        media: "營隊每日照片——點開日別圖塊查看相簿。",
        albumDescriptions: {
          "9-19-day2":
            "第二天照片：Drone 2.0／micro:bit 套件、遙控器與營隊現場。",
        },
        updates: [
          {
            title: "加入 9/19 day2 相簿",
            description: "把今天的無人機營隊照片整理成名為 9/19 day2 的媒體圖塊。",
          },
          {
            title: "加入營隊套件照片",
            description:
              "在媒體區加入 Drone 2.0／micro:bit 編程套件與遙控器照片。",
          },
          {
            title: "把營隊加入追蹤專案",
            description: "建立本頁，用來規劃與記錄 2026 臺北無人機暑假營隊。",
          },
          {
            title: "營隊報名期間",
            description: "預計約在 2026 年 5–6 月透過酷課 APP／酷課雲報名。",
          },
          { title: "參加暑假營隊" },
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
