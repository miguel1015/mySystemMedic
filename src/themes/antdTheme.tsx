"use client"

import { ConfigProvider, theme } from "antd"
import { createContext, useEffect, useState, useContext, useMemo } from "react"
import { getPreferredThemeClient } from "./theme.client"
import {
  type ThemeColorPalette,
  COLOR_PALETTES,
  DEFAULT_THEME_COLOR,
  getPaletteByPrimary,
  hexToRgb,
} from "./colorPalettes"

type ThemeMode = "light" | "dark"

const ThemeContext = createContext<{
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  themeColor: string;
  setThemeColor: (c: string) => void;
  palette: ThemeColorPalette;
}>({
  theme: "light",
  setTheme: () => {},
  themeColor: COLOR_PALETTES[DEFAULT_THEME_COLOR].primary,
  setThemeColor: () => {},
  palette: COLOR_PALETTES[DEFAULT_THEME_COLOR],
})

export const useAppTheme = () => useContext(ThemeContext)
export const useThemeColor = () => {
  const ctx = useContext(ThemeContext)
  return { themeColor: ctx.themeColor, setThemeColor: ctx.setThemeColor, palette: ctx.palette }
}

export default function AntdThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("light")
  const [themeColor, setThemeColorState] = useState(
    COLOR_PALETTES[DEFAULT_THEME_COLOR].primary,
  )

  const palette = useMemo(() => getPaletteByPrimary(themeColor), [themeColor])

  useEffect(() => {
    const preferred = getPreferredThemeClient() as ThemeMode
    setCurrentTheme(preferred)
    document.documentElement.setAttribute("data-bs-theme", preferred)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("sidebarColor")
    if (stored) {
      setThemeColorState(stored)
    }
  }, [])

  const setThemeColor = (color: string) => {
    setThemeColorState(color)
    localStorage.setItem("sidebarColor", color)
  }

  const updateTheme = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme)
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`
    document.documentElement.setAttribute("data-bs-theme", newTheme)
  }

  // Inject CSS custom properties whenever palette or theme changes
  useEffect(() => {
    const root = document.documentElement
    const isDark = currentTheme === "dark"

    root.style.setProperty("--theme-primary", palette.primary)
    root.style.setProperty("--theme-primary-hover", palette.primaryHover)
    root.style.setProperty("--theme-primary-active", palette.primaryActive)
    root.style.setProperty("--theme-primary-rgb", hexToRgb(palette.primary))

    root.style.setProperty("--sidebar-background", isDark ? palette.sidebarBgDark : palette.sidebarBg)
    root.style.setProperty("--sidebar-border-color", isDark ? palette.sidebarBorderColorDark : palette.sidebarBorderColor)
    root.style.setProperty("--sidebar-brand-background", isDark ? palette.sidebarBrandBgDark : palette.sidebarBrandBg)
    root.style.setProperty("--sidebar-toggler-background", isDark ? palette.sidebarTogglerBgDark : palette.sidebarTogglerBg)
    root.style.setProperty("--sidebar-link-hover-bg", palette.sidebarLinkHoverBg)
    root.style.setProperty("--sidebar-toggler-hover-bg", palette.sidebarTogglerBgHover)
  }, [palette, currentTheme])

  const isDark = currentTheme === "dark"

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme: updateTheme,
        themeColor,
        setThemeColor,
        palette,
      }}
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
              colorPrimary: palette.primary,
              colorPrimaryHover: palette.primaryHover,
              colorPrimaryActive: palette.primaryActive,
              defaultBg: isDark ? "#1f2937" : "#ffffff",
              defaultColor: isDark ? "#ffffff" : "#374151",
              defaultBorderColor: isDark ? "#4b5563" : "#d1d5db",
              defaultHoverBg: isDark ? `rgba(${hexToRgb(palette.primary)}, 0.15)` : "#f3f4f6",
              defaultHoverColor: isDark ? palette.primaryHover : palette.primary,
              defaultHoverBorderColor: isDark ? palette.primaryHover : palette.primaryActive,
              defaultActiveBg: isDark ? palette.primaryActive : "#e5e7eb",
              defaultActiveColor: isDark ? "#ffffff" : palette.primaryActive,
              defaultActiveBorderColor: palette.primary,
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
              colorPrimary: palette.primary,
            },
            Pagination: {
              itemActiveBg: palette.primary,
              itemActiveColorDisabled: "#ffffff",
              colorPrimary: "#ffffff",
              colorPrimaryHover: "#ffffff",
              colorPrimaryBorder: palette.primary,
            },
            Typography: {
              colorText: isDark ? "#e5e7eb" : "#111827",
              colorTextHeading: isDark ? "#ffffff" : "#111827",
              colorTextSecondary: isDark ? "#9ca3af" : "#6b7280",
              colorTextDescription: isDark ? "#9ca3af" : "#6b7280",
              colorLink: palette.primary,
              colorLinkHover: palette.primaryHover,
              colorLinkActive: palette.primaryActive,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
