import type { NextConfig } from "next";

/**
 * GitHub Pages hosts static files only (no Node server).
 * When GITHUB_PAGES=true (set in the GitHub Action), we export a static
 * site under /personal-website so it works at:
 * https://ivanlin0402.github.io/personal-website/
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "personal-website";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  ...(isGithubPages
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
