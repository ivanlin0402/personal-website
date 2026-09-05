export type ProjectStatus =
  | "Idea"
  | "Planning"
  | "In Progress"
  | "Testing"
  | "Completed";

export type UpdateStatus = "completed" | "current" | "upcoming";

export type ProjectUpdate = {
  date: string;
  title: string;
  description?: string;
  status?: UpdateStatus;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  category: string;
  status?: ProjectStatus;
  year?: string;
  featured?: boolean;
  tags?: string[];

  overview?: string;
  goals?: string[];
  process?: string[];
  technicalDetails?: string[];
  results?: string[];
  lessons?: string[];
  media?: string;

  githubUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;

  updates?: ProjectUpdate[];
};

export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
  email: string;
  about: {
    introduction: string;
    interests: string[];
    skills: string[];
    learning: string[];
    background: string;
  };
};
