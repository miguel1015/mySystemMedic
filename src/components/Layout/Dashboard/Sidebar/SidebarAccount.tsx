"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { COLOR_PALETTES } from "@/themes/colorPalettes";
import { Theme } from "@/themes/enum";
import { useAppTheme } from "@/themes/antdTheme";
import {
  faArrowRightFromBracket,
  faCheck,
  faGear,
  faMoon,
  faPalette,
  faSun,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Collapse } from "react-bootstrap";

type SidebarAccountProps = {
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

const colorOptions = Object.entries(COLOR_PALETTES);

export default function SidebarAccount({
  initialTheme,
  user,
}: SidebarAccountProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { setTheme } = useAppTheme();
  const { sidebarColor, setSidebarColor } = useSidebar();
  const [selectedTheme, setSelectedTheme] = useState<Theme.Light | Theme.Dark>(
    initialTheme === Theme.Dark ? Theme.Dark : Theme.Light,
  );

  const changeTheme = (theme: Theme.Light | Theme.Dark) => {
    setSelectedTheme(theme);
    localStorage.setItem("theme", theme);
    Cookies.set("theme", theme, { expires: 365, path: "/" });
    Cookies.remove("preferred_theme", { path: "/" });
    setTheme(theme);
  };

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.username ||
    "Usuario";
  const profileName = String(user.userProfileName || "Admin");

  return (
    <div className="sidebar-account">
      <div className="sidebar-account-mini">
        <span className="sidebar-account-mini-icon">
          <FontAwesomeIcon icon={faUser} />
        </span>
        <span className="sidebar-account-mini-text">
          <strong>{userName}</strong>
          <small>{profileName}</small>
        </span>
      </div>

      <button
        className="sidebar-settings-button"
        type="button"
        onClick={() => setSettingsOpen((open) => !open)}
        aria-expanded={settingsOpen}
      >
        <FontAwesomeIcon icon={faGear} />
        Configuraciones
      </button>

      <Collapse in={settingsOpen}>
        <div className="sidebar-settings-panel">
          <div className="sidebar-settings-title">
            <span>
              <FontAwesomeIcon icon={faGear} />
            </span>
            Configuraciones
          </div>

          <div className="sidebar-setting-block">
            <div className="sidebar-setting-label">
              <FontAwesomeIcon icon={faSun} />
              Modo de pantalla
            </div>
            <div className="sidebar-theme-toggle" role="group">
              <button
                type="button"
                className={selectedTheme === Theme.Light ? "active" : ""}
                onClick={() => changeTheme(Theme.Light)}
              >
                <FontAwesomeIcon icon={faSun} />
                Claro
              </button>
              <button
                type="button"
                className={selectedTheme === Theme.Dark ? "active" : ""}
                onClick={() => changeTheme(Theme.Dark)}
              >
                <FontAwesomeIcon icon={faMoon} />
                Oscuro
              </button>
            </div>
          </div>

          <div className="sidebar-setting-block">
            <div className="sidebar-setting-label">
              <FontAwesomeIcon icon={faPalette} />
              Color del sistema
            </div>
            <div className="sidebar-color-grid">
              {colorOptions.map(([name, palette]) => {
                const active = palette.primary === sidebarColor;
                return (
                  <button
                    key={palette.primary}
                    type="button"
                    className={active ? "active" : ""}
                    style={{ backgroundColor: palette.primary }}
                    onClick={() => setSidebarColor(palette.primary)}
                    aria-label={`Usar color ${name}`}
                    title={name}
                  >
                    {active && <FontAwesomeIcon icon={faCheck} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Collapse>

      <button
        className="sidebar-logout-button"
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
        Cerrar sesion
      </button>
    </div>
  );
}
