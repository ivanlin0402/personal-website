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
    motivation:
      "Access to a working computer still unlocks learning, communication, and opportunity for many people. I wanted a project that combines hands-on technical work with a clear real-world outcome.",
    goals: [
      "Define a reliable, affordable PC build for donation use cases",
      "Establish a repeatable assembly and testing checklist",
      "Identify partner organizations and donation workflows",
      "Document the process so others can follow or adapt it",
    ],
    process:
      "The current phase focuses on planning: researching component options, defining minimum specs, estimating costs, and outlining how donations will be coordinated. Assembly and delivery will follow once the plan is solid.",
    timeline: [
      { stage: "Idea", note: "Initial concept for community PC builds", date: "2025" },
      { stage: "Planning", note: "Specs, partners, and workflow design", date: "2026" },
    ],
    lessons: [
      "Clear specs matter more than chasing maximum performance",
      "Donation logistics need as much planning as the build itself",
    ],
    results:
      "Still in planning. Early outcomes include a draft build profile and a clearer understanding of donation logistics.",
    links: [
      { label: "Documentation", href: "#" },
    ],
    mediaNote: "Photos and diagrams will be added as builds progress.",
  },
  {
    slug: "game-project",
    title: "Game Project",
    description: "A collection of programming and interactive experiments.",
    category: "Programming",
    status: "In Progress",
    year: "2026",
    featured: true,
    tags: ["Programming", "Games", "Experiments"],
    overview:
      "A growing set of interactive experiments focused on gameplay ideas, small systems, and learning through building. Some pieces may grow into larger projects; others are intentional prototypes.",
    motivation:
      "Games are a useful way to practice programming, design thinking, and iteration. I wanted a space to try ideas quickly without needing every experiment to become a finished product.",
    goals: [
      "Prototype small interactive mechanics",
      "Improve programming and design judgment through practice",
      "Document experiments so ideas are easy to revisit",
    ],
    process:
      "Work happens in short cycles: pick a mechanic or idea, implement a minimal version, playtest, note what worked, and decide whether to expand or archive it.",
    timeline: [
      { stage: "Idea", note: "Started collecting experiment ideas", date: "2025" },
      { stage: "In Progress", note: "Building and iterating on prototypes", date: "2026" },
    ],
    lessons: [
      "Small scopes make experimentation sustainable",
      "Writing down outcomes helps more than keeping everything in memory",
    ],
    results:
      "Active prototyping phase. Early experiments are helping clarify which ideas are worth developing further.",
    links: [
      { label: "GitHub", href: "https://github.com/ivanlin0402" },
      { label: "Demo", href: "#" },
    ],
    mediaNote: "Screenshots and clips will be added as prototypes mature.",
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
