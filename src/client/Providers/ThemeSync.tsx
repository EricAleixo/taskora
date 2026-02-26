"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export type Theme =
  | "light"
  | "dark"
  | "system"
  | "teal-light"
  | "teal-dark"
  | "cyan-light"
  | "cyan-dark";

const THEME_CLASSES = ["light", "dark", "theme-teal", "theme-cyan"] as const;

export function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove(...THEME_CLASSES);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  switch (theme) {
    case "system":
      root.classList.add(prefersDark ? "dark" : "light");
      break;
    case "light":
      root.classList.add("light");
      break;
    case "dark":
      root.classList.add("dark");
      break;
    case "teal-light":
      root.classList.add("theme-teal");
      break;
    case "teal-dark":
      root.classList.add("dark", "theme-teal");
      break;
    case "cyan-light":
      root.classList.add("theme-cyan");
      break;
    case "cyan-dark":
      root.classList.add("dark", "theme-cyan");
      break;
  }
}

export function ThemeSync() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const theme = ((session?.user as any)?.theme ?? "system") as Theme;
    applyThemeClass(theme);
  }, [pathname, session]);

  // Escuta mudanças no SO quando theme === "system"
  useEffect(() => {
    const theme = ((session?.user as any)?.theme ?? "system") as Theme;
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeClass("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [session]);

  return null;
}