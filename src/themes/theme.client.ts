"use client";

import { Theme } from "@/themes/enum";

const isThemeMode = (value: string | undefined): value is Theme.Light | Theme.Dark =>
  value === Theme.Light || value === Theme.Dark;

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];

export const getThemeClient = (): Theme.Light | Theme.Dark => {
  if (typeof document === "undefined") return Theme.Light;

  const storedTheme = localStorage.getItem("theme") ?? undefined;
  if (isThemeMode(storedTheme)) return storedTheme;

  const themeCookie = getCookie("theme");
  if (isThemeMode(themeCookie)) return themeCookie;

  const legacyPreferredThemeCookie = getCookie("preferred_theme");
  if (isThemeMode(legacyPreferredThemeCookie)) return legacyPreferredThemeCookie;

  return Theme.Light;
};
