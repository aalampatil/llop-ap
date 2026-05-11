export type ThemeMode = "light" | "dark";

const THEME_KEY = "llop-theme";

export function getStoredTheme(): ThemeMode | null {
  const value = localStorage.getItem(THEME_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function getPreferredTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function getInitialTheme(): ThemeMode {
  return getStoredTheme() ?? getPreferredTheme();
}
