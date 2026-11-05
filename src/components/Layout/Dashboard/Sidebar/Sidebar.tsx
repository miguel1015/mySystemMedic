"use client";

import HeaderSidebarToggler from "@/components/Layout/Dashboard/Header/HeaderSidebarToggler";
import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution";
import { providerService } from "@/core/hooks/parameterization/providers/useGetProvider";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { HeartPulse } from "lucide-react";
import React from "react";
import { displayName } from "./navModel";

// "IPS FAMILIA SAN JOSE S.A.S." -> "IPS Familia San Jose S.A.S." (nombre propio: cada
// palabra con mayúscula inicial; siglas en mayúsculas).
const toTitle = (text: string) =>
  displayName(text)
    .split(" ")
    .map((w, i) =>
      i > 0 && ["de", "del", "la", "las", "los", "y"].includes(w)
        ? w
        : w.charAt(0).toLocaleUpperCase("es-CO") + w.slice(1),
    )
    .join(" ");

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const {
    showSidebarState: [isShowSidebar],
  } = useSidebar();

  // Nombre de la IPS (Datos de la IPS). Si el rol no puede leerlo, queda el lema.
  const { data: provider } = useQuery({
    queryKey: ["provider", INSTITUTION_PROVIDER_ID],
    queryFn: () => providerService.getById(INSTITUTION_PROVIDER_ID),
    retry: false,
    staleTime: 30 * 60 * 1000,
  });
  const ipsName = provider?.name?.trim();

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
          <span className={classNames("tag", { "is-ips": !!ipsName })} title={ipsName}>
            {ipsName ? toTitle(ipsName) : "Sistema clínico"}
          </span>
        </div>
        <div className="ms-auto sidebar-brand-toggler">
          <HeaderSidebarToggler />
        </div>
      </div>

      {children}
    </div>
  );
}
