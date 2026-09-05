import type { Project } from "@/lib/types";

export const projects: Project[] = [
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
      "A growing set of interactive experiments focused on gameplay ideas, small systems, and learning through building. The first published piece is Pop Cat, a simple pygame clicker.",
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
      "Pop Cat is built with Python and pygame",
      "Browser build packaged with pygbag (WebAssembly) for GitHub Pages",
      "Score is saved in the browser via localStorage (desktop uses poptimes.txt)",
      "Source: https://github.com/ivanlin0402/pop-cat",
    ],
    results: [
      "Pop Cat published on GitHub",
      "Playable in the browser on this site",
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
    ],
    updates: [
      {
        date: "2026-09-05",
        title: "Published Pop Cat on GitHub",
        description: "Pushed the pygame clicker to ivanlin0402/pop-cat.",
        status: "completed",
      },
      {
        date: "2026-09",
        title: "More game experiments",
        status: "upcoming",
      },
    ],
  },
];

export function getAllProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectCategories(): string[] {
  const categories = new Set(projects.map((project) => project.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}
