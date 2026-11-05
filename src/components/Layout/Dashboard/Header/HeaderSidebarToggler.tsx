"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { Button } from "react-bootstrap";
import { MenuFoldOutlined } from "@ant-design/icons";
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
      aria-label="Cerrar menú (Ctrl + B)"
      title="Cerrar menú (Ctrl + B)"
      onClick={toggleSidebar}
    >
      <MenuFoldOutlined
        className={classNames("toggler-icon", {
          open: isShowSidebar,
          closed: !isShowSidebar,
        })}
        aria-hidden="true"
      />
    </Button>
  );
}
