"use client";

import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import React, { PropsWithChildren } from "react";
import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { NavItem, NavLink } from "react-bootstrap";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import classNames from "classnames";

type Props = {
  href: string;
  icon?: IconDefinition;
} & PropsWithChildren;

export default function SidebarNavItem(props: Props) {
  const { icon, children, href } = props;
  const pathname = usePathname();
  const {
    showSidebarState: [, setIsShowSidebar],
    sidebarColor,
  } = useSidebar();

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  // Colores personalizados
  const activeTextColor = "#fff"; // blanco para activo
  const inactiveTextColor = "#adb5bd"; // gris más vivo para inactivo
  const hoverBackgroundColor = "rgba(255,255,255,0.1)"; // hover suave

  return (
    <NavItem>
      <Link href={href} passHref legacyBehavior>
        <NavLink
          onClick={() => setIsShowSidebar(false)}
          className={classNames(
            "rounded-1 nav-link px-3 py-2 d-flex align-items-center flex-fill w-100",
            "transition-all",
            "sidebar-nav-item",
            { "shadow-sm": isActive }
          )}
          style={{
            marginLeft: "12px",
            borderRadius: "10px",
            color: isActive ? activeTextColor : inactiveTextColor,
            backgroundColor: isActive ? sidebarColor : "transparent",
            transition: "all 0.25s ease-in-out",
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                hoverBackgroundColor;
              (e.currentTarget as HTMLElement).style.color = activeTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLElement).style.color = inactiveTextColor;
            }
          }}
        >
          {icon ? (
            <FontAwesomeIcon className="nav-icon ms-n3" icon={icon} />
          ) : (
            <span className="nav-icon ms-n3" />
          )}
          {children}
        </NavLink>
      </Link>
    </NavItem>
  );
}
