import HeaderNotificationNav from "@/components/Layout/Dashboard/Header/HeaderNotificationNav";
import HeaderProfileNav from "@/components/Layout/Dashboard/Header/HeaderProfileNav";
import HeaderSidebarToggler from "@/components/Layout/Dashboard/Header/HeaderSidebarToggler";
import Link from "next/link";
import { Container } from "react-bootstrap";

export default function Header() {
  return (
    <header
      className="header sticky-top py-2 px-sm-2"
      style={{
        background: "var(--dash-surface, #ffffff)",
        borderBottom: "1px solid var(--dash-border, #e5e7eb)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Container fluid className="header-navbar d-flex align-items-center px-0">
        <HeaderSidebarToggler />
        <Link href="/" className="header-brand d-md-none">
          <svg width="80" height="46">
            <title>CoreUI Logo</title>
            <use xlinkHref="/assets/brand/coreui.svg#full" />
          </svg>
        </Link>
        <div className="header-nav ms-auto">
          <HeaderNotificationNav />
        </div>
        <div className="header-nav ms-2">
          <HeaderProfileNav />
        </div>
      </Container>
    </header>
  );
}
