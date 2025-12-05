"use client";

import Cookies from "js-cookie";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  NavLink,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage } from "@fortawesome/free-solid-svg-icons";

import { ES, GB, JP, IT, DE, FR, PT, CN } from "country-flag-icons/react/3x2";

const FLAGS: Record<string, any> = {
  es: ES,
  en: GB,
  ja: JP,
  it: IT,
  ger: DE,
  fre: FR,
  port: PT,
  zh: CN,
};

const LABELS: Record<string, string> = {
  es: "Español",
  en: "English",
  ja: "日本語",
  it: "Italiano",
  ger: "Alemán",
  fre: "Francés",
  port: "Portugués",
  zh: "简体中文",
};

const FlagWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: "30px",
      height: "25px",
      overflow: "hidden",
      borderRadius: "2px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{ width: "100%", height: "100%" }}>{children}</div>
  </div>
);

export default function HeaderLocale({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const [locale, setLocale] = useState(currentLocale);
  const router = useRouter();

  const changeLocale = (loc: string) => {
    Cookies.set("locale", loc);
    setLocale(loc);
    router.refresh();
  };

  const CurrentFlag = FLAGS[locale];

  return (
    <Dropdown>
      <DropdownToggle
        className="px-2 mx-1 px-sm-3 mx-sm-0 d-flex align-items-center gap-2"
        as={NavLink}
        bsPrefix="hide-caret"
        id="dropdown-locale"
      >
        <FlagWrapper>
          <CurrentFlag />
        </FlagWrapper>

        <FontAwesomeIcon icon={faLanguage} size="lg" />
      </DropdownToggle>

      <DropdownMenu className="pt-0" align="end">
        {Object.entries(FLAGS).map(([key, FlagComponent]) => (
          <DropdownItem
            key={key}
            active={locale === key}
            onClick={() => changeLocale(key)}
            className="d-flex align-items-center gap-2"
          >
            {/* Bandera del item NORMALIZADA */}
            <FlagWrapper>
              <FlagComponent />
            </FlagWrapper>

            {LABELS[key]}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
