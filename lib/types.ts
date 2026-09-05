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

/** Individual game tile inside a game-collection project (catalog style). */
export type GameItem = {
  title: string;
  platform: string;
  description?: string;
  /** Playable URL on this site (e.g. /play/pop-cat/) or external link */
  href: string;
  /** Optional cover image path under /public (e.g. /games/pop-cat/popcat.png) */
  image?: string;
  /** Optional source repository */
  githubUrl?: string;
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

  /** When present, page uses a retrogames-style catalog layout. */
  games?: GameItem[];

  githubUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;

  updates?: ProjectUpdate[];
};
