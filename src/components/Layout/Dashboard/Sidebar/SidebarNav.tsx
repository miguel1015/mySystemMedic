"use client";

import { useMenu } from "@/core/hooks/authentication/UseMenu";
import { BackendMenu } from "@/types/typeModules";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { getNavIcon } from "./navIcons";
import SidebarNavGroup from "./SidebarNavGroup";
import SidebarNavItem from "./SidebarNavItem";
import Loading from "@/components/loading";

interface SidebarNavProps {
  id: number;
}

export default function SidebarNav({ id }: SidebarNavProps) {
  const { data, isLoading } = useMenu(Number(id));
  const modules = data?.modules ?? [];

  if (isLoading || !data) {
    return <Loading />;
  }

  const normalizeRoute = (route: string) =>
    route.startsWith("/") ? route : `/${route}`;

  function renderMenus(menus: BackendMenu[]) {
    return menus
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menu) => {
        const icon = getNavIcon(menu.icon);

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
                  <SidebarNavItem
                    key={sub.id}
                    href={normalizeRoute(sub.route)}
                    icon={getNavIcon(sub.icon)}
                  >
                    {sub.name}
                  </SidebarNavItem>
                ))}
            </SidebarNavGroup>
          );
        }

        return (
          <SidebarNavItem
            key={menu.id}
            href={normalizeRoute(menu.route)}
            icon={icon}
          >
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
