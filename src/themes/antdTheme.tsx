"use client";

import { ConfigProvider, theme } from "antd";
import { createContext, useEffect, useState, useContext } from "react";
import { getPreferredThemeClient } from "./theme.client";

type ThemeMode = "light" | "dark";

const ThemeContext = createContext<{
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export default function AntdThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const preferred = getPreferredThemeClient() as ThemeMode;
    setCurrentTheme(preferred);
    document.documentElement.setAttribute("data-bs-theme", preferred);
  }, []);

  const updateTheme = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);

    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;
    document.documentElement.setAttribute("data-bs-theme", newTheme);
  };

  const isDark = currentTheme === "dark";

  return (
    <ThemeContext.Provider
      value={{ theme: currentTheme, setTheme: updateTheme }}
    >
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,

          token: {
            colorBgBase: isDark ? "#020617" : "#ffffff",
            colorBgContainer: isDark ? "#020617" : "#ffffff",
            colorTextBase: isDark ? "#e5e7eb" : "#111827",
            colorBorderSecondary: isDark ? "#1f2937" : "#e5e7eb",
          },

          components: {
            Button: {
              // Primary buttons
              colorPrimary: "#0F6F5C",
              colorPrimaryHover: "#0d5f4f",
              colorPrimaryActive: "#0a4f42",
              // Default buttons
              defaultBg: isDark ? "#1f2937" : "#ffffff",
              defaultColor: isDark ? "#ffffff" : "#374151",
              defaultBorderColor: isDark ? "#4b5563" : "#d1d5db",
              defaultHoverBg: isDark ? "#0F6F5C" : "#f3f4f6",
              defaultHoverColor: isDark ? "#ffffff" : "#0F6F5C",
              defaultHoverBorderColor: isDark ? "#c1e7e0" : "#3f6962",
              defaultActiveBg: isDark ? "#0a4f42" : "#e5e7eb",
              defaultActiveColor: isDark ? "#ffffff" : "#0a4f42",
              defaultActiveBorderColor: "#0F6F5C",
            },
            Table: {
              headerBg: isDark ? "#020617" : "#f9fafb",
              headerColor: isDark ? "#e5e7eb" : "#111827",
              rowHoverBg: isDark ? "#020617" : "#f3f4f6",
            },
            Modal: {
              contentBg: isDark ? "#020617" : "#ffffff",
              headerBg: isDark ? "#020617" : "#ffffff",
              titleColor: isDark ? "#e5e7eb" : "#111827",
            },
            Input: {
              colorBgContainer: isDark ? "#020617" : "#ffffff",
              colorText: isDark ? "#e5e7eb" : "#111827",
              activeBorderColor: isDark ? "#1f2937" : "#d1d5db",
              hoverBorderColor: isDark ? "#1f2937" : "#9ca3af",
              colorBorder: isDark ? "#1f2937" : "#d1d5db",
              boxShadow: "none",
            },
            Select: {
              colorBgContainer: isDark ? "#020617" : "#ffffff",
              colorText: isDark ? "#e5e7eb" : "#111827",

              activeBorderColor: isDark ? "#1f2937" : "#d1d5db",
              hoverBorderColor: isDark ? "#1f2937" : "#9ca3af",
              colorBorder: isDark ? "#1f2937" : "#d1d5db",

              boxShadow: "none",
            },
            Spin: {
              colorPrimary: "#0F6F5C",
            },
            Pagination: {
              itemActiveBg: "#0F6F5C",
              itemActiveColorDisabled: "#ffffff",
              colorPrimary: "#ffffff",
              colorPrimaryHover: "#ffffff",
              colorPrimaryBorder: "#0F6F5C",
            },
            Typography: {
              colorText: isDark ? "#e5e7eb" : "#111827",
              colorTextHeading: isDark ? "#ffffff" : "#111827",
              colorTextSecondary: isDark ? "#9ca3af" : "#6b7280",
              colorTextDescription: isDark ? "#9ca3af" : "#6b7280",
              colorLink: "#0F6F5C",
              colorLinkHover: "#0d5f4f",
              colorLinkActive: "#0a4f42",
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
