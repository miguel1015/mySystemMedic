"use client";

import { useMenu } from "@/core/hooks/authentication/UseMenu";
import { BackendMenu } from "@/types/typeModules";
import {
  faArrowsTurnRight,
  faBoxesStacked,
  faCalculator,
  faCapsules,
  faCashRegister,
  faChartBar,
  faChartPie,
  faClipboardList,
  faDoorClosed,
  faDoorOpen,
  faFileContract,
  faFileInvoice,
  faFileInvoiceDollar,
  faFileMedical,
  faFlag,
  faHandHoldingMedical,
  faHeartPulse,
  faHome,
  faHospital,
  faHospitalUser,
  faInbox,
  faClipboardUser,
  faKitMedical,
  faMoneyBillWave,
  faNotesMedical,
  faPaperclip,
  faScrewdriverWrench,
  faShieldHeart,
  faStethoscope,
  faSyringe,
  faTags,
  faTruckMedical,
  faUserDoctor,
  faUserInjured,
  faUsersGear,
  faVials,
  faWallet,
  faWarehouse,
  faXRay,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import SidebarNavGroup from "./SidebarNavGroup";
import SidebarNavItem from "./SidebarNavItem";
import Loading from "@/components/loading";

interface SidebarNavProps {
  id: number;
}

export default function SidebarNav({ id }: SidebarNavProps) {
  const iconMap: Record<string, IconDefinition> = {
    faClipboardUser: faClipboardUser,
    faStethoscope: faStethoscope,
    faXRay: faXRay,
    faVials: faVials,
    faUserDoctor: faUserDoctor,
    faArrowsTurnRight: faArrowsTurnRight,
    faTruckMedical: faTruckMedical,
    faBoxesStacked: faBoxesStacked,
    faCashRegister: faCashRegister,
    faInbox: faInbox,
    faBuildingHospital: faHospital,
    faHandshakeMedical: faHandHoldingMedical,
    faFileContract: faFileContract,
    faTags: faTags,
    faShieldHeart: faShieldHeart,
    faCapsules: faCapsules,
    faUsersGear: faUsersGear,
    faSyringe: faSyringe,
    faWarehouse: faWarehouse,
    faScrewdriverWrench: faScrewdriverWrench,
    faWallet: faWallet,
    faClipboardList: faClipboardList,
    faDoorOpen: faDoorOpen,
    faUserInjured: faUserInjured,
    faHeartPulse: faHeartPulse,
    faHospitalUser: faHospitalUser,
    faFileMedical: faFileMedical,
    faNotesMedical: faNotesMedical,
    faKitMedical: faKitMedical,
    faDoorClosed: faDoorClosed,
    faFileInvoice: faFileInvoice,
    faPaperclip: faPaperclip,
    faFileInvoiceDollar: faFileInvoiceDollar,
    faChartBar: faChartBar,
    faChartPie: faChartPie,
    faMoneyBillWave: faMoneyBillWave,
    faFlag: faFlag,
    faCalculator: faCalculator,
  };

  const getIcon = (icon?: string): IconDefinition | undefined =>
    icon ? iconMap[icon] : undefined;

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
                  <SidebarNavItem
                    key={sub.id}
                    href={normalizeRoute(sub.route)}
                    icon={getIcon(sub.icon)}
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
