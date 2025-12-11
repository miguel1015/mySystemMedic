"use client";

import { ConfigProvider, theme } from "antd";
import { createContext, useEffect, useState, useContext } from "react";
import { getPreferredThemeClient } from "./theme.client";

const ThemeContext = createContext({
  theme: "light",
  setTheme: (t: "light" | "dark") => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export default function AntdThemeProvider({ children }: any) {
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    const preferred = getPreferredThemeClient();
    setCurrentTheme(preferred);
  }, []);

  const updateTheme = (newTheme: "light" | "dark") => {
    setCurrentTheme(newTheme); // <<-- ESTO FALTABA

    // cookie
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;

    // bootstrap
    document.documentElement.setAttribute("data-bs-theme", newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ theme: currentTheme, setTheme: updateTheme }}
    >
      <ConfigProvider
        theme={{
          algorithm:
            currentTheme === "dark"
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
