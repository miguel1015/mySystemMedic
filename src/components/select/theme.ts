"use client";

import { useState, useEffect } from "react";
import { Theme } from "@/themes/enum";

export function useTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const cookieTheme = document.cookie
        .split("; ")
        .find((row) => row.startsWith("theme="))
        ?.split("=")[1] as Theme;

      if (cookieTheme === Theme.Dark) setTheme("dark");
      else setTheme("light");
    } catch {
      setTheme("light");
    }
  }, []);

  return theme;
}
