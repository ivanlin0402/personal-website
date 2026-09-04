import type { SiteConfig } from "@/lib/types";

export const siteConfig: SiteConfig = {
  name: "Ivan Lin",
  tagline: "I build things, explore ideas, and document projects I'm working on.",
  description:
    "A personal hub for projects, activities, and things worth documenting.",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  socialLinks: [
    { label: "GitHub", href: "https://github.com/ivanlin0402" },
    { label: "Instagram", href: "https://www.instagram.com/yenchenglin042/" },
  ],
  email: "ivan0402.lin@gmail.com",
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
};
