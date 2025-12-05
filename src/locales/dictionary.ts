import "server-only";
import { cookies } from "next/headers";
import { defaultLocale } from "@/locales/config";

const dictionaries = {
  es: () => import("./es"),
  en: () => import("./en"),
  ja: () => import("./ja"),
  zh: () => import("./zh"),
  it: () => import("./it"),
  port: () => import("./port"),
  ger: () => import("./ger"),
  fre: () => import("./fre"),
};

type Locale = keyof typeof dictionaries;

export const getLocales = () => Object.keys(dictionaries) as Array<Locale>;

export const getLocale = (): Locale => {
  const localeCookie = cookies().get("locale")?.value ?? defaultLocale;
  return getLocales().includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale;
};

export const getDictionary = async () => {
  const locale = getLocale();
  const mod = await dictionaries[locale]();
  return mod.default;
};
