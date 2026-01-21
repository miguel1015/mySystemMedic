"use client";

import Cookies from "js-cookie";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  NavLink,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleHalfStroke,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { Theme } from "@/themes/enum";
import useDictionary from "@/locales/dictionary-hook";
import { useMediaQuery } from "react-responsive";
import { useAppTheme } from "../../../../themes/antdTheme";

/* ----------------------------------------
 * Constants
 * ------------------------------------- */
const BRAND_COLOR = "#0F6F5C";

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
  {
    key: Theme.Auto,
    labelKey: "auto",
    icon: faCircleHalfStroke,
  },
] as const;

/* ----------------------------------------
 * Helpers
 * ------------------------------------- */
const getItemStyle = (active: boolean): React.CSSProperties => ({
  backgroundColor: active ? BRAND_COLOR : "transparent",
  color: active ? "#ffffff" : "inherit",
});

/* ----------------------------------------
 * Components
 * ------------------------------------- */
const CurrentTheme = ({ theme }: { theme: Theme }) => {
  if (theme === Theme.Light) return <FontAwesomeIcon icon={faSun} size="lg" />;
  if (theme === Theme.Dark) return <FontAwesomeIcon icon={faMoon} size="lg" />;
  return <FontAwesomeIcon icon={faCircleHalfStroke} size="lg" />;
};

export default function HeaderTheme({
  currentPreferredTheme,
}: {
  currentPreferredTheme: Theme;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const { setTheme } = useAppTheme();

  const [preferredTheme, setPreferredTheme] = useState<Theme>(
    currentPreferredTheme,
  );

  const isDarkMode = useMediaQuery({
    query: "(prefers-color-scheme: dark)",
  });

  const changePreferredTheme = useCallback(
    (theme: Theme) => {
      setPreferredTheme(theme);
      Cookies.set("preferred_theme", theme);

      let resolvedTheme = theme;

      if (theme === Theme.Auto) {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? Theme.Dark
          : Theme.Light;
      }

      Cookies.set("theme", resolvedTheme);
      setTheme(resolvedTheme as "light" | "dark");
    },
    [setTheme],
  );

  /* ----------------------------------------
   * Auto theme sync
   * ------------------------------------- */
  useEffect(() => {
    if (preferredTheme !== Theme.Auto) return;

    Cookies.set("theme", isDarkMode ? Theme.Dark : Theme.Light);
    router.refresh();
  }, [isDarkMode, preferredTheme, router]);

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
              style={getItemStyle(active)}
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
