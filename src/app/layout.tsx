import "@/styles/globals.scss";
// Next.js allows you to import CSS directly in .js files.
// It handles optimization and all the necessary Webpack configuration to make this work.
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import DictionaryProvider from "@/locales/DictionaryProvider";
import { getDictionary } from "@/locales/dictionary";
import getTheme from "@/themes/theme";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import ReactQueryProvider from "./api/queryClientProvider";

config.autoAddCss = false;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary();

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
  const vercelAnalytics = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true";
  const googleAdsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID ?? "";

  return (
    <html lang="en" data-bs-theme={getTheme()}>
      <body>
        <ProgressBar />
        <ReactQueryProvider>
          <DictionaryProvider dictionary={dictionary}>
            {children}
          </DictionaryProvider>
        </ReactQueryProvider>
        {vercelAnalytics && <Analytics />}
      </body>
      {gaMeasurementId !== "" && <GoogleAnalytics gaId={gaMeasurementId} />}
      {googleAdsenseId !== "" && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseId}`}
          crossOrigin="anonymous"
        />
      )}
    </html>
  );
}
