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

/** Day / album tile that opens a gallery of project photos. */
export type MediaAlbum = {
  slug: string;
  title: string;
  description?: string;
  /** Cover image path under /public */
  cover?: string;
  /** Image paths under /public shown on the album page */
  images: string[];
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
  /** Optional caption for the Media section. */
  media?: string;
  /** Image paths under /public shown in the Media section. */
  mediaImages?: string[];
  /** Media day tiles; each opens its own gallery page. */
  mediaAlbums?: MediaAlbum[];

  /** When present, page uses a retrogames-style catalog layout. */
  games?: GameItem[];

  githubUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;

  updates?: ProjectUpdate[];
};
