"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import classNames from "classnames";
import { Button } from "react-bootstrap";
import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const {
    showSidebarState: [isShowSidebar],
    sidebarType,
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

      {/* Botón Toggler */}
      <Button
        variant="link"
        className="sidebar-toggler d-none d-md-inline-block rounded-0 text-end pe-4 fw-bold shadow-none border-top border-light-subtle"
        type="button"
        aria-label="sidebar toggler"
        style={{
          backgroundColor:
            sidebarType === "transparent" ? "transparent" : "inherit",
          color: sidebarType === "transparent" ? "#f8f9fa" : "inherit",
          borderTop:
            sidebarType === "transparent"
              ? "none"
              : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <FontAwesomeIcon icon={faAngleLeft} fontSize={24} />
      </Button>
    </div>
  );
}
