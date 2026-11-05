"use client";

import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { useAdmissionNotificationsContext } from "@/components/notifications/AdmissionNotificationsProvider";
import { RightOutlined } from "@ant-design/icons";
import { HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";

// Pestaña para volver a abrir el menú cuando está cerrado. Muestra un punto si hay
// pacientes pendientes de admisión, para no perder avisos con el menú escondido.
export default function SidebarEdgeTab() {
  const {
    showSidebarState: [isShowSidebar, setIsShowSidebar],
  } = useSidebar();
  const { canReceive, pendingCount, urgentPendingCount } = useAdmissionNotificationsContext();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const shortcut = isMac ? "⌘ + B" : "Ctrl + B";
  const pending = canReceive && pendingCount > 0;
  const label = pending
    ? `Abrir menú (${shortcut}). ${pendingCount} ${pendingCount === 1 ? "paciente pendiente" : "pacientes pendientes"} de admisión`
    : `Abrir menú (${shortcut})`;

  return (
    <button
      className="sidebar-edge-tab"
      data-sidebar-open={isShowSidebar.toString()}
      onClick={() => setIsShowSidebar(!isShowSidebar)}
      aria-label={label}
      aria-controls="sidebar"
    >
      <span className="tab-inner">
        <HeartPulse size={18} strokeWidth={2.2} className="tab-logo" />
        <RightOutlined className="tab-chevron" />
        {pending && (
          <span className={`tab-dot${urgentPendingCount > 0 ? " is-urgent" : ""}`} aria-hidden />
        )}
      </span>
      <span className="tab-hint" aria-hidden>
        Abrir menú <kbd>{shortcut}</kbd>
      </span>
    </button>
  );
}
