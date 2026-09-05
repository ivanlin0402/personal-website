import type { NextConfig } from "next";

/**
 * GitHub Pages hosts static files only (no Node server).
 * When GITHUB_PAGES=true (set in the GitHub Action), we export a static
 * site under /personal-website so it works at:
 * https://ivanlin0402.github.io/personal-website/
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "personal-website";
const basePath = isGithubPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Hide the Next.js "N" badge in the bottom-left during local development
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isGithubPages
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
};

export default nextConfig;
