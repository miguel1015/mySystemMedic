import "@/styles/globals.scss";
import "antd/dist/reset.css";
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
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import Script from "next/script";

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});
import ReactQueryProvider from "./api/queryClientProvider";
import ToasterProvider from "../components/toast/toast";
import AntdThemeProvider from "../themes/antdTheme";

config.autoAddCss = false;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary();
  const currentTheme = getTheme();

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
  const vercelAnalytics = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true";
  const googleAdsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID ?? "";

  return (
    <html
      lang="en"
      data-bs-theme={currentTheme}
      className={`${fontDisplay.variable} ${fontBody.variable}`}
    >
      <body>
        <ProgressBar />
        <ToasterProvider />
        <ReactQueryProvider>
          <AntdThemeProvider initialTheme={currentTheme}>
            <DictionaryProvider dictionary={dictionary}>
              {children}
            </DictionaryProvider>
          </AntdThemeProvider>
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
