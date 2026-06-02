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
} & PropsWithChildren;

export default function SidebarNavItem(props: Props) {
  const { icon, children, href } = props;
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
        className={classNames("sidebar-nav-item", { active: isActive })}
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
