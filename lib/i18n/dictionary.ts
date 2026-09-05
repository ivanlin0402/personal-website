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
    tagline: string;
    viewProjects: string;
    popCatGithub: string;
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
    introductionText: string;
    interestsList: string[];
    skillsList: string[];
    learningList: string[];
    backgroundText: string;
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
    tagline:
      "I build things, explore technology, and document projects I'm working on.",
    viewProjects: "View Projects",
    popCatGithub: "Pop Cat on GitHub",
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
    introductionText:
      "I'm someone who likes building things, figuring out how they work, and writing down what I learn along the way. This site is a home for those projects and notes.",
    interestsList: [
      "Building and documenting side projects",
      "Hardware tinkering and repair",
      "Programming and interactive experiments",
      "Community and volunteer work",
    ],
    skillsList: [
      "Web development",
      "Problem solving",
      "Project planning",
      "Technical writing",
    ],
    learningList: [
      "Deeper systems and hardware knowledge",
      "Game and interactive design",
      "Better ways to organize and share work",
    ],
    backgroundText:
      "I explore ideas across programming, hardware, creative work, and community projects. The goal of this site is simple: keep a clear record of what I'm working on and how it evolves over time.",
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
    tagline: "我喜歡動手做東西、探索技術，並記錄正在進行的專案。",
    viewProjects: "查看專案",
    popCatGithub: "Pop Cat（GitHub）",
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
    introductionText:
      "我喜歡動手做東西、弄清楚它們怎麼運作，並把學到的東西寫下來。這個網站就是這些專案和筆記的家。",
    interestsList: [
      "建構並記錄個人專案",
      "硬體動手與維修",
      "程式與互動實驗",
      "社群與志願工作",
    ],
    skillsList: ["網頁開發", "問題解決", "專案規劃", "技術寫作"],
    learningList: [
      "更深入的系統與硬體知識",
      "遊戲與互動設計",
      "更好的整理與分享方式",
    ],
    backgroundText:
      "我在程式、硬體、創作和社群專案之間探索想法。這個網站的目標很簡單：清楚記錄我正在做什麼，以及它如何隨時間變化。",
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

const es: Dictionary = {
  nav: {
    home: "Inicio",
    projects: "Proyectos",
    about: "Acerca de",
    contact: "Contacto",
  },
  language: "Idioma",
  home: {
    eyebrow: "Centro de proyectos personales",
    greeting: "Hola, soy {name}.",
    tagline:
      "Construyo cosas, exploro tecnología y documento los proyectos en los que trabajo.",
    viewProjects: "Ver proyectos",
    popCatGithub: "Pop Cat en GitHub",
    featuredTitle: "Proyectos destacados",
    featuredDescription:
      "Una selección de lo que estoy construyendo, explorando o documentando.",
    ctaTitle: "Ver todos los proyectos",
    ctaDescription:
      "Filtra por categoría y abre cualquier proyecto para ver el detalle completo.",
    ctaButton: "Ver todos los proyectos",
  },
  projectsPage: {
    title: "Proyectos",
    description:
      "Todo en un solo lugar. Filtra por categoría o abre un proyecto para más detalle.",
    all: "Todos",
    empty: "Aún no hay proyectos en esta categoría.",
  },
  aboutPage: {
    title: "Acerca de",
    description:
      "Una mirada breve a quién soy, qué me importa y qué estoy explorando.",
    introduction: "Introducción",
    interests: "Intereses",
    skills: "Habilidades",
    learning: "Aprendiendo ahora",
    background: "Trasfondo",
    introductionText:
      "Me gusta construir cosas, entender cómo funcionan y anotar lo que aprendo en el camino. Este sitio es el hogar de esos proyectos y notas.",
    interestsList: [
      "Crear y documentar proyectos personales",
      "Experimentar y reparar hardware",
      "Programación y experimentos interactivos",
      "Trabajo comunitario y voluntario",
    ],
    skillsList: [
      "Desarrollo web",
      "Resolución de problemas",
      "Planificación de proyectos",
      "Escritura técnica",
    ],
    learningList: [
      "Conocimiento más profundo de sistemas y hardware",
      "Diseño de juegos e interacción",
      "Mejores formas de organizar y compartir el trabajo",
    ],
    backgroundText:
      "Exploro ideas entre programación, hardware, creación y proyectos comunitarios. El objetivo de este sitio es simple: llevar un registro claro de lo que hago y cómo evoluciona.",
  },
  contactPage: {
    title: "Contacto",
    description: "Formas simples de contactarme.",
    email: "Correo",
  },
  project: {
    back: "← Todos los proyectos",
    viewProject: "Ver proyecto →",
    overview: "Resumen",
    timeline: "Progreso / Cronología",
    games: "Juegos",
    goals: "Objetivos",
    process: "Proceso",
    technicalDetails: "Detalles técnicos",
    results: "Resultados",
    lessons: "Lo que aprendí",
    media: "Medios",
    links: "Enlaces",
    openGithub: "Abrir en GitHub →",
  },
  status: {
    Idea: "Idea",
    Planning: "Planificación",
    "In Progress": "En progreso",
    Testing: "Pruebas",
    Completed: "Completado",
  },
  updateStatus: {
    completed: "Completado",
    current: "Actual",
    upcoming: "Próximo",
  },
  categories: {
    Community: "Comunidad",
    Programming: "Programación",
    Hardware: "Hardware",
    Creative: "Creativo",
    Experiments: "Experimentos",
    Other: "Otro",
  },
};

const fr: Dictionary = {
  nav: {
    home: "Accueil",
    projects: "Projets",
    about: "À propos",
    contact: "Contact",
  },
  language: "Langue",
  home: {
    eyebrow: "Espace de projets personnels",
    greeting: "Bonjour, je suis {name}.",
    tagline:
      "Je construis des choses, j'explore la technologie et je documente les projets sur lesquels je travaille.",
    viewProjects: "Voir les projets",
    popCatGithub: "Pop Cat sur GitHub",
    featuredTitle: "Projets en vedette",
    featuredDescription:
      "Une sélection de ce que je construis, explore ou documente.",
    ctaTitle: "Parcourir tous les projets",
    ctaDescription:
      "Filtrez par catégorie et ouvrez n'importe quel projet pour le détail complet.",
    ctaButton: "Voir tous les projets",
  },
  projectsPage: {
    title: "Projets",
    description:
      "Tout au même endroit. Filtrez par catégorie ou ouvrez un projet pour plus de détails.",
    all: "Tous",
    empty: "Aucun projet dans cette catégorie pour le moment.",
  },
  aboutPage: {
    title: "À propos",
    description:
      "Un aperçu de qui je suis, de ce qui m'intéresse et de ce que j'explore.",
    introduction: "Introduction",
    interests: "Centres d'intérêt",
    skills: "Compétences",
    learning: "En cours d'apprentissage",
    background: "Parcours",
    introductionText:
      "J'aime construire des choses, comprendre comment elles fonctionnent et noter ce que j'apprends en chemin. Ce site est la maison de ces projets et notes.",
    interestsList: [
      "Créer et documenter des projets personnels",
      "Bricolage et réparation matériel",
      "Programmation et expériences interactives",
      "Travail communautaire et bénévole",
    ],
    skillsList: [
      "Développement web",
      "Résolution de problèmes",
      "Planification de projets",
      "Rédaction technique",
    ],
    learningList: [
      "Connaissances plus approfondies des systèmes et du matériel",
      "Conception de jeux et d'interactions",
      "Meilleures façons d'organiser et de partager le travail",
    ],
    backgroundText:
      "J'explore des idées entre programmation, matériel, création et projets communautaires. L'objectif de ce site est simple : garder une trace claire de ce que je fais et de son évolution.",
  },
  contactPage: {
    title: "Contact",
    description: "Des moyens simples de me joindre.",
    email: "E-mail",
  },
  project: {
    back: "← Tous les projets",
    viewProject: "Voir le projet →",
    overview: "Aperçu",
    timeline: "Progression / Chronologie",
    games: "Jeux",
    goals: "Objectifs",
    process: "Processus",
    technicalDetails: "Détails techniques",
    results: "Résultats",
    lessons: "Ce que j'ai appris",
    media: "Médias",
    links: "Liens",
    openGithub: "Ouvrir sur GitHub →",
  },
  status: {
    Idea: "Idée",
    Planning: "Planification",
    "In Progress": "En cours",
    Testing: "Tests",
    Completed: "Terminé",
  },
  updateStatus: {
    completed: "Terminé",
    current: "En cours",
    upcoming: "À venir",
  },
  categories: {
    Community: "Communauté",
    Programming: "Programmation",
    Hardware: "Matériel",
    Creative: "Créatif",
    Experiments: "Expériences",
    Other: "Autre",
  },
};

const de: Dictionary = {
  nav: {
    home: "Start",
    projects: "Projekte",
    about: "Über mich",
    contact: "Kontakt",
  },
  language: "Sprache",
  home: {
    eyebrow: "Persönlicher Projektraum",
    greeting: "Hallo, ich bin {name}.",
    tagline:
      "Ich baue Dinge, erkunde Technologie und dokumentiere Projekte, an denen ich arbeite.",
    viewProjects: "Projekte ansehen",
    popCatGithub: "Pop Cat auf GitHub",
    featuredTitle: "Ausgewählte Projekte",
    featuredDescription:
      "Eine Auswahl dessen, was ich baue, erkunde oder dokumentiere.",
    ctaTitle: "Alle Projekte durchsuchen",
    ctaDescription:
      "Nach Kategorie filtern und jedes Projekt für die vollständige Beschreibung öffnen.",
    ctaButton: "Alle Projekte ansehen",
  },
  projectsPage: {
    title: "Projekte",
    description:
      "Alles an einem Ort. Nach Kategorie filtern oder ein Projekt für mehr Details öffnen.",
    all: "Alle",
    empty: "In dieser Kategorie gibt es noch keine Projekte.",
  },
  aboutPage: {
    title: "Über mich",
    description:
      "Ein kurzer Blick darauf, wer ich bin, was mir wichtig ist und was ich erkunde.",
    introduction: "Einführung",
    interests: "Interessen",
    skills: "Fähigkeiten",
    learning: "Aktuell lerne ich",
    background: "Hintergrund",
    introductionText:
      "Ich baue gerne Dinge, finde heraus, wie sie funktionieren, und schreibe auf, was ich unterwegs lerne. Diese Website ist ein Zuhause für diese Projekte und Notizen.",
    interestsList: [
      "Nebenprojekte bauen und dokumentieren",
      "Hardware basteln und reparieren",
      "Programmieren und interaktive Experimente",
      "Gemeinschafts- und Freiwilligenarbeit",
    ],
    skillsList: [
      "Webentwicklung",
      "Problemlösung",
      "Projektplanung",
      "Technisches Schreiben",
    ],
    learningList: [
      "Tieferes Wissen über Systeme und Hardware",
      "Spiel- und Interaktionsdesign",
      "Bessere Wege, Arbeit zu organisieren und zu teilen",
    ],
    backgroundText:
      "Ich erkunde Ideen in Programmierung, Hardware, Kreativarbeit und Community-Projekten. Das Ziel dieser Website ist einfach: klar festzuhalten, woran ich arbeite und wie es sich entwickelt.",
  },
  contactPage: {
    title: "Kontakt",
    description: "Einfache Wege, mich zu erreichen.",
    email: "E-Mail",
  },
  project: {
    back: "← Alle Projekte",
    viewProject: "Projekt ansehen →",
    overview: "Überblick",
    timeline: "Fortschritt / Zeitlinie",
    games: "Spiele",
    goals: "Ziele",
    process: "Prozess",
    technicalDetails: "Technische Details",
    results: "Ergebnisse",
    lessons: "Was ich gelernt habe",
    media: "Medien",
    links: "Links",
    openGithub: "Auf GitHub öffnen →",
  },
  status: {
    Idea: "Idee",
    Planning: "Planung",
    "In Progress": "In Arbeit",
    Testing: "Test",
    Completed: "Abgeschlossen",
  },
  updateStatus: {
    completed: "Abgeschlossen",
    current: "Aktuell",
    upcoming: "Geplant",
  },
  categories: {
    Community: "Community",
    Programming: "Programmierung",
    Hardware: "Hardware",
    Creative: "Kreativ",
    Experiments: "Experimente",
    Other: "Sonstiges",
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  zh,
  es,
  fr,
  de,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function formatGreeting(template: string, name: string): string {
  return template.replace("{name}", name);
}
