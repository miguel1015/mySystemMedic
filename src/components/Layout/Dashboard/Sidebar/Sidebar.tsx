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
      <div className="sidebar-brand d-flex d-md-flex align-items-center justify-content-center py-3">
        <div
          style={{
            width: "120px",
            height: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="assets/img/avatars/Logo.png"
            alt="Logo"
            style={{
              width: "120%",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
          />
        </div>
      </div>

      {/* Navegación */}
      <div className="sidebar-nav flex-fill border-top border-light-subtle">
        {children}
      </div>
    </div>
  );
}
