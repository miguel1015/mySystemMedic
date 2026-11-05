"use client";

import { useMenu } from "@/core/hooks/authentication/UseMenu";
import { BackendMenu } from "@/types/typeModules";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { SearchOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSidebar, isEditable } from "@/components/Layout/Dashboard/SidebarProvider";
import { getNavIcon } from "./navIcons";
import SidebarNavGroup from "./SidebarNavGroup";
import SidebarNavItem from "./SidebarNavItem";
import CommandPalette from "./CommandPalette";
import {
  displayName,
  flattenViews,
  moduleIcon,
  moduleLabel,
  normalizeRoute,
  pushRecent,
  readRecents,
  viewForPath,
} from "./navModel";
import Loading from "@/components/loading";

interface SidebarNavProps {
  id: number;
}

const RECENTS_SHOWN = 3;

export default function SidebarNav({ id }: SidebarNavProps) {
  const { data, isLoading } = useMenu(Number(id));
  const pathname = usePathname();
  const {
    showSidebarState: [, setIsShowSidebar],
  } = useSidebar();

  const modules = useMemo(
    () => [...(data?.modules ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [data],
  );
  const views = useMemo(() => flattenViews(modules), [modules]);
  const current = useMemo(() => viewForPath(views, pathname), [views, pathname]);

  // Solo un módulo abierto a la vez; el de la vista actual se abre solo.
  const [openModule, setOpenModule] = useState<number | null>(null);
  useEffect(() => {
    if (current) setOpenModule(current.moduleId);
  }, [current]);

  // Recientes: se registran al abrir cualquier vista del menú.
  const [recentRoutes, setRecentRoutes] = useState<string[]>([]);
  useEffect(() => {
    setRecentRoutes(readRecents(id));
  }, [id]);
  useEffect(() => {
    if (current) setRecentRoutes(pushRecent(id, current.route));
  }, [current, id]);

  const recents = useMemo(
    () =>
      recentRoutes
        .map((r) => views.find((v) => v.route === r))
        // Solo vistas que el rol todavía puede abrir.
        .filter((v): v is NonNullable<typeof v> => !!v),
    [recentRoutes, views],
  );
  const recentsShown = recents.filter((v) => v.route !== current?.route).slice(0, RECENTS_SHOWN);

  // Buscador: Ctrl + K (⌘ + K en Mac) desde cualquier pantalla.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k" || e.shiftKey || e.altKey) return;
      // En un campo de texto Ctrl + K se respeta solo si el campo no es nuestro buscador.
      if (isEditable(e.target) && !(e.target as HTMLElement).closest(".command-palette")) return;
      e.preventDefault();
      setPaletteOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // En celular el menú es un panel encima del contenido: se cierra al navegar. En
  // escritorio `false` significa "visible", así que no se toca.
  const closeOnMobile = () => {
    if (!window.matchMedia("(min-width: 768px)").matches) setIsShowSidebar(false);
  };

  if (isLoading || !data) {
    return <Loading />;
  }

  function renderMenus(menus: BackendMenu[]) {
    return [...menus]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menu) => {
        const icon = getNavIcon(menu.icon);

        if (menu.subMenus?.length) {
          return (
            <SidebarNavGroup key={menu.id} toggleIcon={icon} toggleText={displayName(menu.name)}>
              {[...menu.subMenus]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((sub) => (
                  <SidebarNavItem
                    key={sub.id}
                    href={normalizeRoute(sub.route)}
                    icon={getNavIcon(sub.icon)}
                  >
                    {displayName(sub.name)}
                  </SidebarNavItem>
                ))}
            </SidebarNavGroup>
          );
        }

        return (
          <SidebarNavItem key={menu.id} href={normalizeRoute(menu.route)} icon={icon}>
            {displayName(menu.name)}
          </SidebarNavItem>
        );
      });
  }

  return (
    <>
      <button type="button" className="sidebar-search" onClick={() => setPaletteOpen(true)}>
        <SearchOutlined aria-hidden />
        <span className="sidebar-search-text">Buscar vista…</span>
        <kbd>{isMac ? "⌘ K" : "Ctrl K"}</kbd>
      </button>

      <ul className="list-unstyled">
        <SidebarNavItem icon={faHome} href="/">
          Inicio
        </SidebarNavItem>
      </ul>

      {recentsShown.length > 0 && (
        <nav className="sidebar-recents" aria-label="Vistas recientes">
          <div className="sidebar-section-title">Recientes</div>
          <ul className="list-unstyled">
            {recentsShown.map((v) => (
              <SidebarNavItem key={v.route} href={v.route} icon={v.icon} variant="recent">
                {v.name}
              </SidebarNavItem>
            ))}
          </ul>
        </nav>
      )}

      <div className="sidebar-section-title">Módulos</div>
      <ul className="list-unstyled">
        {modules.map((module) => (
          <SidebarNavGroup
            key={module.id}
            className="is-module"
            toggleIcon={moduleIcon(module)}
            toggleText={moduleLabel(module.name)}
            open={openModule === module.id}
            onToggle={(o) => setOpenModule(o ? module.id : null)}
          >
            {renderMenus(module.menus)}
          </SidebarNavGroup>
        ))}
      </ul>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        views={views}
        recents={recents}
        onNavigate={closeOnMobile}
      />
    </>
  );
}
