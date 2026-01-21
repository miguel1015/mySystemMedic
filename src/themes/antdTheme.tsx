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
              colorPrimary: "#0F6F5C",
              colorPrimaryHover: "#0d5f4f",
              colorPrimaryActive: "#0a4f42",
              defaultBg: "#0F6F5C",
              defaultColor: "#ffffff",
              defaultBorderColor: "#0F6F5C",
              defaultHoverBg: "#0d5f4f",
              defaultHoverColor: "#ffffff",
              defaultHoverBorderColor: "#0d5f4f",
              defaultActiveBg: "#0a4f42",
              defaultActiveColor: "#ffffff",
              defaultActiveBorderColor: "#0a4f42",
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
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
