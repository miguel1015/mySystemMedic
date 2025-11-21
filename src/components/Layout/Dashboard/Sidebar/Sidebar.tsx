"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import classNames from "classnames";
import React from "react";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const {
    showSidebarState: [isShowSidebar],
  } = useSidebar();

  return (
    <div
      className={classNames(
        "sidebar d-flex flex-column position-fixed h-100 transition-all",
        { show: isShowSidebar }
      )}
      id="sidebar"
      style={{
        borderRight: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        transition:
          "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Brand */}
      <div className="sidebar-brand d-none d-md-flex align-items-center justify-content-center py-3">
        <div className="mySystemMedic-logo">
          <span className="mySystemMedic-text fw-bold fs-5">
            <span className="mySystemMedic-part1">my</span>
            <span className="mySystemMedic-part2">System</span>
            <span className="mySystemMedic-part3">Medic</span>
          </span>
        </div>
      </div>

      {/* Navegación */}
      <div className="sidebar-nav flex-fill border-top border-light-subtle">
        {children}
      </div>
    </div>
  );
}
