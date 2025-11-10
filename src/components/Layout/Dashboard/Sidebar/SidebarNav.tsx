import SidebarNavGroup from "@/components/Layout/Dashboard/Sidebar/SidebarNavGroup";
import SidebarNavItem from "@/components/Layout/Dashboard/Sidebar/SidebarNavItem";
import { getDictionary } from "@/locales/dictionary";
import {
  faAddressCard,
  faBell,
  faFileLines,
  faStar,
  faUser,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBug,
  faCalculator,
  faChartPie,
  faDroplet,
  faFileArrowUp,
  faFileContract,
  faFileInvoice,
  faFlask,
  faGear,
  faHome,
  faLayerGroup,
  faLocationArrow,
  faPencil,
  faPuzzlePiece,
  faRightToBracket,
  faUserNurse,
  faUsers,
  faWallet,
  faXRay,
} from "@fortawesome/free-solid-svg-icons";
import { PropsWithChildren } from "react";
import { Badge } from "react-bootstrap";

const SidebarNavTitle = (props: PropsWithChildren) => {
  const { children } = props;

  return (
    <li className="nav-title px-3 py-2 mt-3 text-uppercase fw-bold">
      {children}
    </li>
  );
};

export default async function SidebarNav() {
  const dict = await getDictionary();
  return (
    <ul className="list-unstyled">
      <SidebarNavItem icon={faHome} href="/">
        {dict.sidebar.items.dashboard}
        {/* <small className="ms-auto">
          <Badge bg="info" className="ms-auto">
            NEW
          </Badge>
        </small> */}
      </SidebarNavItem>
      {/* <SidebarNavItem icon={faCode} href="/pokemons">
        {dict.sidebar.items.sample}
        <small className="ms-auto"><Badge bg="danger" className="ms-auto">DEMO</Badge></small>
      </SidebarNavItem> */}
      {/* <SidebarNavTitle>{dict.sidebar.items.theme}</SidebarNavTitle> */}
      {/* <SidebarNavItem icon={faDroplet} href="#">
        {dict.sidebar.items.colors}
      </SidebarNavItem>
      <SidebarNavItem icon={faPencil} href="#">
        {dict.sidebar.items.typography}
      </SidebarNavItem>
      <SidebarNavTitle>{dict.sidebar.items.components}</SidebarNavTitle> */}

      <SidebarNavGroup
        toggleIcon={faGear}
        toggleText={dict.sidebar.items.configuration}
      >
        <SidebarNavItem href="#" icon={faFileContract}>
          {dict.sidebar.items.contracts}
        </SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.breadcrumb}
        </SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.cards}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.carousel}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.collapse}</SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.list_group}
        </SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.navs}</SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.pagination}
        </SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.popovers}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.progress}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.scrollspy}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.spinners}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.tables}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.tabs}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.tooltips}</SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faWallet}
        toggleText={dict.sidebar.items.wallet}
      >
        <SidebarNavItem href="#">{dict.sidebar.items.wallet}</SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.buttons_group}
        </SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.dropdowns}</SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFileInvoice}
        toggleText={dict.sidebar.items.billing}
      >
        <SidebarNavItem href="#">
          {dict.sidebar.items.form_control}
        </SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.select}</SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.checks_and_radios}
        </SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.range}</SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.input_group}
        </SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.floating_labels}
        </SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.layout}</SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.validation}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faUserNurse}
        toggleText={dict.sidebar.items.careManagement}
      >
        <SidebarNavItem href="#">
          {dict.sidebar.items.core_ui_icons}
        </SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.core_ui_icons_brand}
        </SidebarNavItem>
        <SidebarNavItem href="#">
          {dict.sidebar.items.core_ui_icons_flag}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFlask}
        toggleText={dict.sidebar.items.clinicalLaboratory}
      >
        <SidebarNavItem href="#">{dict.sidebar.items.alerts}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.badge}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.modals}</SidebarNavItem>
        <SidebarNavItem href="#">{dict.sidebar.items.toasts}</SidebarNavItem>
      </SidebarNavGroup>
      {/*
      <SidebarNavItem icon={faCalculator} href="#">
        {dict.sidebar.items.widgets}
        <small className="ms-auto">
          <Badge bg="info">NEW</Badge>
        </small>
      </SidebarNavItem> */}

      {/* <SidebarNavTitle>{dict.sidebar.items.extras}</SidebarNavTitle> */}

      <SidebarNavGroup
        toggleIcon={faUser}
        toggleText={dict.sidebar.items.patients}
      >
        <SidebarNavItem icon={faRightToBracket} href="login">
          {dict.sidebar.items.login}
        </SidebarNavItem>
        <SidebarNavItem icon={faAddressCard} href="register">
          {dict.sidebar.items.register}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error404}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error500}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFileArrowUp}
        toggleText={dict.sidebar.items.filing}
      >
        <SidebarNavItem icon={faRightToBracket} href="login">
          {dict.sidebar.items.login}
        </SidebarNavItem>
        <SidebarNavItem icon={faAddressCard} href="register">
          {dict.sidebar.items.register}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error404}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error500}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faXRay}
        toggleText={dict.sidebar.items.radiology}
      >
        <SidebarNavItem icon={faRightToBracket} href="login">
          {dict.sidebar.items.login}
        </SidebarNavItem>
        <SidebarNavItem icon={faAddressCard} href="register">
          {dict.sidebar.items.register}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error404}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error500}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFileLines}
        toggleText={dict.sidebar.items.institutionalReports}
      >
        <SidebarNavItem icon={faRightToBracket} href="login">
          {dict.sidebar.items.login}
        </SidebarNavItem>
        <SidebarNavItem icon={faAddressCard} href="register">
          {dict.sidebar.items.register}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error404}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.items.error500}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup toggleIcon={faUser} toggleText={dict.sidebar.items.user}>
        <SidebarNavItem icon={faUsers} href="login">
          {dict.sidebar.items.login}
        </SidebarNavItem>
      </SidebarNavGroup>
      {/*
      <SidebarNavItem icon={faFileLines} href="#">
        {dict.sidebar.items.docs}
      </SidebarNavItem>
      <SidebarNavItem icon={faLayerGroup} href="https://coreui.io/pro/">
        {dict.sidebar.items.try_core_ui_pro}
      </SidebarNavItem> */}
    </ul>
  );
}
