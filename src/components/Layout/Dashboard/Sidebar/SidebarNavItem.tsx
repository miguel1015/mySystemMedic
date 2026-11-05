"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

type Props = {
  href: string;
  icon?: IconDefinition;
  level?: number;
  variant?: "recent";
} & PropsWithChildren;

export default function SidebarNavItem(props: Props) {
  const { icon, children, href, variant } = props;
  const pathname = usePathname();
  const {
    showSidebarState: [, setIsShowSidebar],
  } = useSidebar();

  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li className="sidebar-item-wrapper">
      <Link
        href={href}
        onClick={() => setIsShowSidebar(false)}
        aria-current={isActive ? "page" : undefined}
        className={classNames("sidebar-nav-item", { active: isActive, "is-recent": variant === "recent" })}
      >
        {icon ? (
          <span className="nav-icon">
            <FontAwesomeIcon icon={icon} />
          </span>
        ) : (
          <span className="nav-icon" />
        )}
        <span className="nav-label">{children}</span>
      </Link>
    </li>
  );
}
