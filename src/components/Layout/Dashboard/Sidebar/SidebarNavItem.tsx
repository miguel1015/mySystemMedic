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

  return (
    <NavItem>
      <Link href={href} passHref legacyBehavior>
        <NavLink
          onClick={() => setIsShowSidebar(false)}
          className={classNames(
            "px-3 py-2 d-flex align-items-center rounded-2 fw-semibold transition-all",
            {
              "shadow-sm": isActive,
              "text-white": isActive,
              "text-secondary": !isActive, // color tenue cuando no está activo
            }
          )}
          style={{
            backgroundColor: isActive ? sidebarColor : "transparent",
            transition: "all 0.3s ease",
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
