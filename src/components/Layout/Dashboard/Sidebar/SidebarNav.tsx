"use client";

import { useMenu } from "@/core/hooks/authentication/UseMenu";
import { BackendMenu } from "@/types/typeModules";
import { faHospital } from "@fortawesome/free-regular-svg-icons";
import {
  faCalculator,
  faFileInvoiceDollar,
  faHome,
  faStethoscope,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import SidebarNavGroup from "./SidebarNavGroup";
import SidebarNavItem from "./SidebarNavItem";

interface SidebarNavProps {
  idRole: number;
}

export default function SidebarNav({ idRole }: SidebarNavProps) {
  const iconMap: Record<string, IconDefinition> = {
    assignment_ind: faHospital,
    local_hospital: faStethoscope,
    receipt_long: faFileInvoiceDollar,
    account_balance: faCalculator,
  };

  const getIcon = (icon?: string): IconDefinition | undefined =>
    icon ? iconMap[icon] : undefined;

  const { data } = useMenu(Number(idRole));
  const modules = data?.modules ?? [];

  function renderMenus(menus: BackendMenu[]) {
    return menus
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menu) => {
        const icon = getIcon(menu.icon);

        if (menu.subMenus?.length) {
          return (
            <SidebarNavGroup
              key={menu.id}
              toggleIcon={icon}
              toggleText={menu.name}
            >
              {menu.subMenus
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((sub) => (
                  <SidebarNavItem key={sub.id} href={sub.route}>
                    {sub.name}
                  </SidebarNavItem>
                ))}
            </SidebarNavGroup>
          );
        }

        return (
          <SidebarNavItem key={menu.id} href={menu.route} icon={icon}>
            {menu.name}
          </SidebarNavItem>
        );
      });
  }

  return (
    <ul className="list-unstyled">
      <SidebarNavItem icon={faHome} href="/">
        Inicio
      </SidebarNavItem>

      {modules
        ?.sort((a, b) => a.sortOrder - b.sortOrder)
        .map((module) => (
          <SidebarNavGroup key={module.id} toggleText={module.name}>
            {renderMenus(module.menus)}
          </SidebarNavGroup>
        ))}
    </ul>
  );
}
