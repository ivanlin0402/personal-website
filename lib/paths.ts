/** Public site base path (empty locally, /personal-website on GitHub Pages). */
export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

/** Join a site path with the base path for static GitHub Pages hosting. */
export function withBasePath(path: string): string {
  const base = getBasePath();
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
