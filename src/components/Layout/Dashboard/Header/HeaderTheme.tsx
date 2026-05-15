"use client";

import Cookies from "js-cookie";
import React, { useCallback, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  NavLink,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { Theme } from "@/themes/enum";
import useDictionary from "@/locales/dictionary-hook";
import { useAppTheme, useThemeColor } from "../../../../themes/antdTheme";

const themeOptions = [
  {
    key: Theme.Light,
    labelKey: "light",
    icon: faSun,
  },
  {
    key: Theme.Dark,
    labelKey: "dark",
    icon: faMoon,
  },
] as const;

/* ----------------------------------------
 * Helpers
 * ------------------------------------- */
const getItemStyle = (active: boolean, brandColor: string): React.CSSProperties => ({
  backgroundColor: active ? brandColor : "transparent",
  color: active ? "#ffffff" : "inherit",
});

/* ----------------------------------------
 * Components
 * ------------------------------------- */
const CurrentTheme = ({ theme }: { theme: Theme }) => {
  if (theme === Theme.Light) return <FontAwesomeIcon icon={faSun} size="lg" />;
  return <FontAwesomeIcon icon={faMoon} size="lg" />;
};

export default function HeaderTheme({
  currentPreferredTheme,
}: {
  currentPreferredTheme: Theme;
}) {
  const dict = useDictionary();
  const { setTheme } = useAppTheme();
  const { palette } = useThemeColor();

  const [preferredTheme, setPreferredTheme] = useState<Theme>(
    currentPreferredTheme === Theme.Dark ? Theme.Dark : Theme.Light,
  );

  const changePreferredTheme = useCallback(
    (theme: Theme.Light | Theme.Dark) => {
      setPreferredTheme(theme);
      localStorage.setItem("theme", theme);
      Cookies.set("theme", theme, { expires: 365, path: "/" });
      Cookies.remove("preferred_theme", { path: "/" });
      setTheme(theme);
    },
    [setTheme],
  );

  /* ----------------------------------------
   * Render
   * ------------------------------------- */
  return (
    <Dropdown>
      <DropdownToggle
        as={NavLink}
        id="dropdown-theme"
        style={{
          padding: "0.5rem 0.75rem",
          margin: "0 0.25rem",
        }}
      >
        <CurrentTheme theme={preferredTheme} />
      </DropdownToggle>

      <DropdownMenu className="pt-0" align="end">
        {themeOptions.map(({ key, labelKey, icon }) => {
          const active = preferredTheme === key;

          return (
            <DropdownItem
              key={key}
              active={active}
              onClick={() => changePreferredTheme(key)}
              style={getItemStyle(active, palette.primary)}
            >
              <FontAwesomeIcon className="me-2" icon={icon} fixedWidth />
              {dict.general.theme[labelKey]}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}
