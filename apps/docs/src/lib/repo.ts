/**
 * Public repository URL from `VITE_REPO_URL`. There is no public repository yet;
 * when the variable is unset (or not an https URL) the site shows a notice instead
 * of a link. Never hard-code or guess a URL here.
 */
function readRepoUrl(): string | null {
  const raw = import.meta.env.VITE_REPO_URL;
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href.replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}

export const REPO_URL: string | null = readRepoUrl();
