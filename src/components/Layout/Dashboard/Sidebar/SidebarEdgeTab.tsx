"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { ChevronRight, HeartPulse } from "lucide-react";

export default function SidebarEdgeTab() {
  const {
    showSidebarState: [isShowSidebar, setIsShowSidebar],
  } = useSidebar();

  return (
    <button
      className="sidebar-edge-tab"
      data-sidebar-open={isShowSidebar.toString()}
      onClick={() => setIsShowSidebar(!isShowSidebar)}
      aria-label="Abrir panel de navegación"
    >
      <span className="tab-inner">
        <HeartPulse size={18} strokeWidth={2.2} className="tab-logo" />
        <ChevronRight size={13} className="tab-chevron" />
      </span>
    </button>
  );
}
