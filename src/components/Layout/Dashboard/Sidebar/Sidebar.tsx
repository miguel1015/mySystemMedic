"use client";

import HeaderSidebarToggler from "@/components/Layout/Dashboard/Header/HeaderSidebarToggler";
import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import classNames from "classnames";
import { HeartPulse } from "lucide-react";
import React from "react";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const {
    showSidebarState: [isShowSidebar],
  } = useSidebar();

  return (
    <div
      className={classNames("sidebar d-flex flex-column position-fixed h-100", {
        show: isShowSidebar,
      })}
      id="sidebar"
    >
      <div className="sidebar-brand">
        <div className="sidebar-logo-mark">
          <HeartPulse size={24} strokeWidth={2.2} />
        </div>
        <div className="sidebar-logo-text">
          <span className="word">
            Data<span>Medic</span>
          </span>
          <span className="tag">Sistema Clínico</span>
        </div>
        <div className="ms-auto sidebar-brand-toggler">
          <HeaderSidebarToggler />
        </div>
      </div>

      {children}
    </div>
  );
}
