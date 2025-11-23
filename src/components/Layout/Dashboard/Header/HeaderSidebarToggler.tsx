"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import React from "react";

export default function HeaderSidebarToggler() {
  const {
    showSidebarState: [isShowSidebar, setIsShowSidebar],
  } = useSidebar();

  const toggleSidebar = () => {
    setIsShowSidebar(!isShowSidebar);
  };

  return (
    <Button
      variant="link"
      className="header-toggler rounded-0 shadow-none"
      type="button"
      aria-controls="sidebar"
      aria-expanded={isShowSidebar}
      onClick={toggleSidebar}
    >
      <FontAwesomeIcon
        icon={faBars}
        className={classNames("toggler-icon", {
          open: isShowSidebar,
          closed: !isShowSidebar,
        })}
        aria-hidden="true"
      />
    </Button>
  );
}
