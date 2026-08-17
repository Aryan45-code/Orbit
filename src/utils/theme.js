import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "orbit_theme";
const MODES = ["system", "light", "dark"];

const THEME_COLOR = { light: "#ffffff", dark: "#09090b" };

function prefersDark() {
  return typeof window !== "undefined"
    && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function readStoredMode() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(mode) {
  if (mode === "light" || mode === "dark") return mode;
  return prefersDark() ? "dark" : "light";
}

// Called before mount too, so first paint is never the wrong theme.
export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[theme]);
}

export function useTheme() {
  const [mode, setMode] = useState(readStoredMode);
  const [theme, setTheme] = useState(() => resolveTheme(readStoredMode()));

  useEffect(() => {
    const next = resolveTheme(mode);
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private mode / storage disabled — theme just won't persist */
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = prefersDark() ? "dark" : "light";
      setTheme(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode(resolveTheme(readStoredMode()) === "dark" ? "light" : "dark");
  }, []);

  return { mode, theme, setMode, toggle, modes: MODES };
}
