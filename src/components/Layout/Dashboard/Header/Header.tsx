import HeaderNotificationNav from "@/components/Layout/Dashboard/Header/HeaderNotificationNav";
import HeaderProfileNav from "@/components/Layout/Dashboard/Header/HeaderProfileNav";
import HeaderSidebarToggler from "@/components/Layout/Dashboard/Header/HeaderSidebarToggler";
import Link from "next/link";
import { Container } from "react-bootstrap";

export default function Header() {
  return (
    <header className="header sticky-top py-2 px-sm-2">
      <Container fluid className="header-navbar d-flex align-items-center px-0">
        <HeaderSidebarToggler />

        <Link
          href="/"
          className="header-brand d-md-none ms-1 d-flex align-items-center gap-2"
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: "linear-gradient(140deg, #10b981, #0f6f5c)",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            D
          </span>
          <span style={{ fontSize: 17 }}>DataMedic</span>
        </Link>

        <div className="header-nav ms-auto d-flex align-items-center">
          <HeaderNotificationNav />
        </div>
        <div className="header-nav ms-1 ms-sm-2">
          <HeaderProfileNav />
        </div>
      </Container>
    </header>
  );
}
