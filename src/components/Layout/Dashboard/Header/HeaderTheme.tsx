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

const CurrentTheme = ({ theme }: { theme: string }) => (
  <>
    {theme === Theme.Light && <FontAwesomeIcon icon={faSun} size="lg" />}
    {theme === Theme.Dark && <FontAwesomeIcon icon={faMoon} size="lg" />}
    {theme === Theme.Auto && (
      <FontAwesomeIcon icon={faCircleHalfStroke} size="lg" />
    )}
  </>
);

export default function HeaderTheme({
  currentPreferredTheme,
}: {
  currentPreferredTheme: Theme;
}) {
  const dict = useDictionary();
  const [preferredTheme, setPreferredTheme] = useState<Theme>(
    currentPreferredTheme
  );
  const router = useRouter();
  const { setTheme } = useAppTheme();

  const changePreferredTheme = useCallback(
    (t: Theme) => {
      setPreferredTheme(t);
      Cookies.set("preferred_theme", t);

      let resolvedTheme = t;

      if (t === Theme.Auto) {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? Theme.Dark
          : Theme.Light;
      }

      Cookies.set("theme", resolvedTheme);
      setTheme(resolvedTheme as "light" | "dark");
    },
    [setTheme]
  );

  const isDarkMode = useMediaQuery({
    query: "(prefers-color-scheme: dark)",
  });

  useEffect(() => {
    if (preferredTheme !== Theme.Auto) {
      return;
    }

    Cookies.set("theme", isDarkMode ? Theme.Dark : Theme.Light);
    router.refresh();
  }, [isDarkMode, preferredTheme, router]);

  return (
    <Dropdown>
      <DropdownToggle
        className="px-2 mx-1 px-sm-3 mx-sm-0"
        as={NavLink}
        bsPrefix="hide-caret"
        id="dropdown-theme"
      >
        <CurrentTheme theme={preferredTheme} />
      </DropdownToggle>
      <DropdownMenu className="pt-0" align="end">
        <DropdownItem
          active={preferredTheme === Theme.Light}
          onClick={() => changePreferredTheme(Theme.Light)}
        >
          <FontAwesomeIcon className="me-2" icon={faSun} fixedWidth />
          {dict.general.theme.light}
        </DropdownItem>
        <DropdownItem
          active={preferredTheme === Theme.Dark}
          onClick={() => changePreferredTheme(Theme.Dark)}
        >
          <FontAwesomeIcon className="me-2" icon={faMoon} fixedWidth />
          {dict.general.theme.dark}
        </DropdownItem>
        <DropdownItem
          active={preferredTheme === Theme.Auto}
          onClick={() => changePreferredTheme(Theme.Auto)}
        >
          <FontAwesomeIcon
            className="me-2"
            icon={faCircleHalfStroke}
            fixedWidth
          />
          {dict.general.theme.auto}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
