/**
 * Forum (GitHub Discussions) configuration — derived entirely from public env.
 *
 * 100% GitHub-native and isolated: the static site never stores users or posts
 * itself. Login, posting and moderation all happen on GitHub. The browser bundle
 * holds only the public repo URL (and public Giscus IDs) — never a write token
 * or a secret.
 *
 * Set at build time (Core-Pages Actions), e.g.
 *   PUBLIC_GITHUB_REPO_URL=https://github.com/bengueta/Core-Pages
 */

const rawRepoUrl = (import.meta.env.PUBLIC_GITHUB_REPO_URL ?? "").trim();
const repoUrl = rawRepoUrl.replace(/\/+$/, "");

/** True when a GitHub repo URL is configured — gates all forum UI. */
export const forumEnabled = repoUrl.length > 0;

export const repoHref = forumEnabled ? repoUrl : null;
export const discussionsUrl = forumEnabled ? `${repoUrl}/discussions` : null;
export const newDiscussionUrl = forumEnabled
  ? `${repoUrl}/discussions/new/choose`
  : null;

export type ForumCategory = {
  /** GitHub category slug — must match a real category in the repo. */
  slug: string;
  label: string;
  description: string;
  emoji: string;
};

/**
 * Categories shown as cards on /forum/. Slugs must match the repo's Discussions
 * categories (repo Settings → Discussions). These are GitHub's defaults — edit
 * to match the categories you actually create.
 */
export const forumCategories: ForumCategory[] = [
  { slug: "announcements", label: "הכרזות", description: "עדכונים רשמיים מהצוות", emoji: "📣" },
  { slug: "q-a", label: "שאלות ותשובות", description: "שאלו, וענו לאחרים", emoji: "❓" },
  { slug: "ideas", label: "רעיונות", description: "הצעות ובקשות לפיצ׳רים", emoji: "💡" },
  { slug: "show-and-tell", label: "הצגת עבודות", description: "שתפו מה יצרתם", emoji: "🚀" },
  { slug: "general", label: "כללי", description: "כל השאר", emoji: "💬" },
];

export function categoryUrl(slug: string): string | null {
  return forumEnabled ? `${repoUrl}/discussions/categories/${slug}` : null;
}
