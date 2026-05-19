import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** GitHub Pages project site: https://bengueta.github.io/Core-Pages/ */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/Core-Pages" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
