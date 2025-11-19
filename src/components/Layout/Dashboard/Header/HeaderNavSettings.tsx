"use client";

import HeaderLocale from "@/components/Layout/Dashboard/Header/HeaderLocale";
import HeaderTheme from "@/components/Layout/Dashboard/Header/HeaderTheme";
import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { Theme } from "@/themes/enum";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  NavItem,
  NavLink,
} from "react-bootstrap";

const colorOptions = [
  "#d63384",
  "#212529",
  "#0d6efd",
  "#198754",
  "#fd7e14",
  "#dc3545",
];

export default function HeaderNavSettings({
  locale,
  theme,
}: {
  locale: string;
  theme: Theme;
}) {
  const { sidebarColor, setSidebarColor } = useSidebar();

  return (
    <NavItem>
      <Dropdown align="end">
        <DropdownToggle
          as={NavLink}
          bsPrefix="hide-caret"
          className="px-2 mx-1 px-sm-3 mx-sm-0 position-relative"
          id="dropdown-settings"
        >
          <FontAwesomeIcon icon={faGear} size="lg" spin={false} />
        </DropdownToggle>

        <DropdownMenu
          className="p-3 shadow-lg rounded-3"
          style={{ minWidth: 260 }}
        >
          <h6 className="text-center mb-3 fw-bold text-primary">
            Configuración
          </h6>

          <div className="d-flex flex-column gap-3">
            {/* Idioma */}
            <div className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold text-muted small">Idioma</span>
              <HeaderLocale currentLocale={locale} />
            </div>

            {/* Tema */}
            <div className="d-flex align-items-center justify-content-between">
              <span className="fw-semibold text-muted small">Tema</span>
              <HeaderTheme currentPreferredTheme={theme} />
            </div>

            <hr className="my-2" />

            {/* Sidenav Colors */}
            <div>
              <h6 className="fw-bold text-secondary small mb-2">
                Sidenav Colors
              </h6>
              <div className="d-flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <div
                    key={color}
                    onClick={() => setSidebarColor(color)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      cursor: "pointer",
                      backgroundColor: color,
                      border:
                        color === sidebarColor
                          ? "2px solid #000"
                          : "1px solid #ccc",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </NavItem>
  );
}
