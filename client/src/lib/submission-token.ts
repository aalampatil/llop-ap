const STORAGE_PREFIX = "llop:submission-token";

export function getSubmissionToken(pollId: string) {
  const key = `${STORAGE_PREFIX}:${pollId}`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const token = `${pollId}:${crypto.randomUUID()}`;
  window.localStorage.setItem(key, token);
  return token;
}
