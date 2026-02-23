"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark" | "system";

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

export function ThemeSync() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const theme = ((session?.user as any)?.theme ?? "system") as Theme;
    applyThemeClass(theme);
  }, [pathname, session]); // re-executa em toda troca de rota

  return null;
}