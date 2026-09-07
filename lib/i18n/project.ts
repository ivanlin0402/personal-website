import type { Locale } from "@/lib/i18n/config";
import type { GameItem, Project, ProjectUpdate } from "@/lib/types";

/** Translatable project fields for a single locale overlay. */
export type ProjectLocaleOverlay = {
  title?: string;
  description?: string;
  overview?: string;
  goals?: string[];
  process?: string[];
  technicalDetails?: string[];
  results?: string[];
  lessons?: string[];
  media?: string;
  tags?: string[];
  /** Parallel to project.updates (same order). */
  updates?: Array<{ title: string; description?: string }>;
  /** Descriptions keyed by English game title (titles stay English). */
  gameDescriptions?: Record<string, string>;
};

export type ProjectWithI18n = Project & {
  i18n?: Partial<Record<Exclude<Locale, "en">, ProjectLocaleOverlay>>;
};

/**
 * Resolve project copy for the active locale.
 * Keeps game titles in English; everything else can be overridden by i18n.zh.
 */
export function localizeProject(
  project: ProjectWithI18n,
  locale: Locale,
): Project {
  if (locale === "en") {
    return project;
  }

  const overlay = project.i18n?.[locale];
  if (!overlay) {
    return project;
  }

  const updates: ProjectUpdate[] | undefined = project.updates?.map(
    (update, index) => {
      const localized = overlay.updates?.[index];
      if (!localized) return update;
      return {
        ...update,
        title: localized.title,
        description: localized.description ?? update.description,
      };
    },
  );

  const games: GameItem[] | undefined = project.games?.map((game) => ({
    ...game,
    // Game names stay in English
    title: game.title,
    description:
      overlay.gameDescriptions?.[game.title] ?? game.description,
  }));

  return {
    ...project,
    title: overlay.title ?? project.title,
    description: overlay.description ?? project.description,
    overview: overlay.overview ?? project.overview,
    goals: overlay.goals ?? project.goals,
    process: overlay.process ?? project.process,
    technicalDetails: overlay.technicalDetails ?? project.technicalDetails,
    results: overlay.results ?? project.results,
    lessons: overlay.lessons ?? project.lessons,
    media: overlay.media ?? project.media,
    tags: overlay.tags ?? project.tags,
    updates,
    games,
  };
}
