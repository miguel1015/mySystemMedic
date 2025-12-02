import { authOptions } from "@/app/api/auth/option";
import HeaderLogout from "@/components/Layout/Dashboard/Header/HeaderLogout";
import { getDictionary } from "@/locales/dictionary";
import { faPowerOff, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getServerSession } from "next-auth";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
} from "react-bootstrap";

export default async function HeaderProfileNav() {
  const session = await getServerSession(authOptions);
  const dict = await getDictionary();
  return (
    <Nav>
      <Dropdown as={NavItem}>
        <DropdownToggle
          variant="link"
          bsPrefix="hide-caret"
          className="py-0 px-2 rounded-0"
          id="dropdown-profile"
        >
          <div
            className="d-flex justify-content-center align-items-center rounded-circle bg-light"
            style={{
              width: 38,
              height: 38,
              overflow: "hidden",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
            }}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              className="text-primary"
              style={{ fontSize: "30px" }}
            />
          </div>
        </DropdownToggle>

        <DropdownMenu
          className="profile-menu p-0 mt-3 shadow-lg rounded-4 overflow-hidden animate-dropdown"
          style={{ minWidth: 280 }}
        >
          {/* Flecha */}
          <div className="menu-arrow"></div>

          {/* Encabezado */}
          <div className="text-center bg-primary text-white py-4 px-3">
            <div
              className="rounded-circle mx-auto mb-2 overflow-hidden"
              style={{
                width: 85,
                height: 85,
                background: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 10px rgba(255,255,255,0.25)",
              }}
            >
              <img
                src="assets/img/avatars/doctorLogo.png"
                alt="profile avatar"
                width={85}
                height={85}
                className="object-cover"
              />
            </div>

            <h6 className="mb-0 fw-bold fs-5">
              {session?.user?.name ?? "Usuario"}
            </h6>
            <small className="opacity-75 fs-6">
              {session?.user?.email ?? ""}
            </small>
          </div>

          {/* Info */}
          <div className="px-4 py-3 fs-6">
            <p className="mb-2">
              <strong>Usuario:</strong> {session?.user?.username ?? "--"}
            </p>
            <p className="mb-2">
              <strong>Nombres:</strong>{" "}
              {session?.user?.firstName || session?.user?.lastName
                ? `${session.user.firstName} ${session.user.lastName}`
                : "--"}
            </p>
            <p className="mb-0">
              <strong>Perfil:</strong> {session?.user?.userProfileName ?? "--"}
            </p>
          </div>

          <DropdownDivider />

          <HeaderLogout>
            <DropdownItem className="d-flex align-items-center text-danger py-3 fw-semibold fs-6">
              <FontAwesomeIcon icon={faPowerOff} className="me-2" />
              {dict.general.profile.logout}
            </DropdownItem>
          </HeaderLogout>
        </DropdownMenu>
      </Dropdown>
    </Nav>
  );
}
