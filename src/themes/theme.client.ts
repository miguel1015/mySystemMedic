"use client";

import { Theme } from "@/themes/enum";

export const getPreferredThemeClient = (): Theme => {
  if (typeof document === "undefined") return Theme.Auto;

  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("preferred_theme="));

  if (!cookie) return Theme.Auto;

  const value = cookie.split("=")[1] as Theme;

  return Object.values(Theme).includes(value) ? value : Theme.Auto;
};
