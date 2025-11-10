import i18next from "i18next";
import jaTranslation from "zod-i18n-map/locales/ja/zod.json";
import enTranslation from "zod-i18n-map/locales/en/zod.json";
import zhTranslation from "zod-i18n-map/locales/zh-CN/zod.json";
import { makeZodI18nMap } from "zod-i18n-map";
import { z } from "zod";
import { getLocale } from "@/locales/dictionary";

const ja = i18next.createInstance();
ja.init({
  lng: "ja",
  resources: { ja: { zod: jaTranslation } },
});

const es = i18next.createInstance();
es.init({
  lng: "es",
  resources: { es: { zod: enTranslation } },
});

const en = i18next.createInstance();
en.init({
  lng: "en",
  resources: { en: { zod: enTranslation } },
});

const zh = i18next.createInstance();
zh.init({
  lng: "zh",
  resources: { zh: { zod: zhTranslation } },
});

const zodMap = {
  es: makeZodI18nMap({ t: es.t }),
  en: makeZodI18nMap({ t: en.t }),
  ja: makeZodI18nMap({ t: ja.t }),
  zh: makeZodI18nMap({ t: zh.t }),
};

// ✅ Compatible con versiones recientes de zod-i18n-map
z.setErrorMap((err, ctx) => {
  const locale = getLocale();
  const map = zodMap[locale as keyof typeof zodMap] ?? zodMap.en;

  // Forzamos la llamada con tipado flexible para soportar ambas firmas (1 o 2 args)
  const result = (map as unknown as (err: unknown, ctx?: unknown) => unknown)(
    err,
    ctx
  );

  if (typeof result === "string") {
    return { message: result };
  }

  if (result && typeof result === "object" && "message" in (result as any)) {
    return result as { message: string };
  }

  return { message: ctx.defaultError };
});

export { z };
