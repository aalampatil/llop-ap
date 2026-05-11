import type { BuilderQuestion } from "../types/poll";

export function newQuestion(): BuilderQuestion {
  return {
    id: crypto.randomUUID(),
    question: "",
    isMandatory: true,
    options: [
      { id: crypto.randomUUID(), label: "" },
      { id: crypto.randomUUID(), label: "" },
    ],
  };
}

export function formatDate(value: string | null) {
  if (!value) return "No expiry";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function publicPollUrl(slug: string) {
  return `${window.location.origin}/p/${slug}`;
}
