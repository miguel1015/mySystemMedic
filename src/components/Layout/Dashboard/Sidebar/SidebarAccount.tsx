"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import NotificationBell from "@/components/notifications/NotificationBell";
import { COLOR_PALETTES, DEFAULT_THEME_COLOR } from "@/themes/colorPalettes";
import { Theme } from "@/themes/enum";
import { useAppTheme, type ThemeSetting } from "@/themes/antdTheme";
import { DEFAULT_FONT, FONT_OPTIONS } from "@/themes/fonts";
import {
  BgColorsOutlined,
  CheckOutlined,
  DesktopOutlined,
  DownOutlined,
  FontSizeOutlined,
  LogoutOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Collapse } from "react-bootstrap";

type SidebarAccountProps = {
  // Se conserva por compatibilidad con el layout; el tema real sale del contexto.
  initialTheme: Theme.Light | Theme.Dark;
  user: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    userProfileName?: string | number | null;
  };
};

const COLOR_NAMES: Record<string, string> = {
  green: "Esmeralda",
  blue: "Azul",
  indigo: "Índigo",
  pink: "Rosa",
  orange: "Naranja",
  red: "Rojo",
  teal: "Turquesa",
};

const colorOptions = Object.entries(COLOR_PALETTES);
const DEFAULT_COLOR = COLOR_PALETTES[DEFAULT_THEME_COLOR].primary;

const THEME_OPTIONS: { value: ThemeSetting; label: string; icon: React.ReactNode }[] = [
  { value: Theme.Light, label: "Claro", icon: <SunOutlined /> },
  { value: Theme.Dark, label: "Oscuro", icon: <MoonOutlined /> },
  { value: Theme.Auto, label: "Automático", icon: <DesktopOutlined /> },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toLocaleUpperCase("es-CO"))
    .join("");

export default function SidebarAccount({ user }: SidebarAccountProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { themeSetting, setThemeSetting, font, setFont } = useAppTheme();
  const { sidebarColor, setSidebarColor } = useSidebar();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const changeTheme = (setting: ThemeSetting) => {
    setThemeSetting(setting);
    Cookies.remove("preferred_theme", { path: "/" });
  };

  // Esc cierra el panel y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSettingsOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.username ||
    "Usuario";
  const profileName = String(user.userProfileName || "Usuario");
  const activeColorName =
    COLOR_NAMES[colorOptions.find(([, p]) => p.primary === sidebarColor)?.[0] ?? ""] ?? "Personalizado";
  const customized =
    sidebarColor !== DEFAULT_COLOR || themeSetting !== Theme.Light || font !== DEFAULT_FONT;
  const activeFont = FONT_OPTIONS.find((f) => f.key === font);

  return (
    <div className="sidebar-account">
      <div className="sidebar-account-mini">
        <span className="sidebar-account-avatar" aria-hidden>
          {initialsOf(userName) || "U"}
        </span>
        <span className="sidebar-account-mini-text">
          <strong title={userName}>{userName}</strong>
          <small title={profileName}>{profileName}</small>
        </span>
        <NotificationBell />
      </div>

      <button
        ref={buttonRef}
        className="sidebar-settings-button"
        type="button"
        onClick={() => setSettingsOpen((open) => !open)}
        aria-expanded={settingsOpen}
        aria-controls="sidebar-settings-panel"
      >
        <SettingOutlined aria-hidden />
        <span className="sidebar-settings-text">Configuraciones</span>
        <DownOutlined className="sidebar-settings-chevron" aria-hidden />
      </button>

      <Collapse in={settingsOpen}>
        <div id="sidebar-settings-panel">
          <div className="sidebar-settings-panel">
            <div className="sidebar-setting-block">
              <div className="sidebar-setting-label" id="setting-theme-label">
                <SunOutlined aria-hidden />
                Modo de pantalla
              </div>
              <div className="sidebar-theme-toggle" role="radiogroup" aria-labelledby="setting-theme-label">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={themeSetting === opt.value}
                    className={themeSetting === opt.value ? "active" : ""}
                    onClick={() => changeTheme(opt.value)}
                    title={opt.value === Theme.Auto ? "Sigue el modo claro u oscuro del equipo" : undefined}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-setting-block">
              <div className="sidebar-setting-label" id="setting-color-label">
                <BgColorsOutlined aria-hidden />
                Color del sistema
                <span className="sidebar-setting-value">{activeColorName}</span>
              </div>
              <div className="sidebar-color-grid" role="radiogroup" aria-labelledby="setting-color-label">
                {colorOptions.map(([key, palette]) => {
                  const active = palette.primary === sidebarColor;
                  const name = COLOR_NAMES[key] ?? key;
                  return (
                    <button
                      key={palette.primary}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={active ? "active" : ""}
                      style={{ backgroundColor: palette.primary }}
                      onClick={() => setSidebarColor(palette.primary)}
                      aria-label={`Color ${name}`}
                      title={name}
                    >
                      {active && <CheckOutlined aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sidebar-setting-block">
              <div className="sidebar-setting-label" id="setting-font-label">
                <FontSizeOutlined aria-hidden />
                Tipografía
                <span className="sidebar-setting-value">{activeFont?.hint}</span>
              </div>
              <div className="sidebar-font-grid" role="radiogroup" aria-labelledby="setting-font-label">
                {FONT_OPTIONS.map((option) => {
                  const active = option.key === font;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={active ? "active" : ""}
                      onClick={() => setFont(option.key)}
                      title={`${option.label}: ${option.hint}`}
                    >
                      {/* La muestra usa la fuente misma, así se ve antes de elegirla. */}
                      <span
                        className="sidebar-font-sample"
                        style={{ fontFamily: option.family ?? "var(--font-body-default, inherit)" }}
                        aria-hidden
                      >
                        Aa
                      </span>
                      <span className="sidebar-font-name">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {customized && (
              <button
                type="button"
                className="sidebar-settings-reset"
                onClick={() => {
                  setSidebarColor(DEFAULT_COLOR);
                  changeTheme(Theme.Light);
                  setFont(DEFAULT_FONT);
                }}
              >
                <UndoOutlined aria-hidden />
                Restablecer apariencia
              </button>
            )}
          </div>
        </div>
      </Collapse>

      <button
        className="sidebar-logout-button"
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogoutOutlined aria-hidden />
        Cerrar sesión
      </button>
    </div>
  );
}
