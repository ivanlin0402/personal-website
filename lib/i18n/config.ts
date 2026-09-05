export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "繁體中文",
};

export const STORAGE_KEY = "site_locale";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
