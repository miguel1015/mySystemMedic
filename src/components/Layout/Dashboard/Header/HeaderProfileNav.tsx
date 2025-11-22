import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/option";
import { getDictionary } from "@/locales/dictionary";
import HeaderLogout from "@/components/Layout/Dashboard/Header/HeaderLogout";

export default async function HeaderProfileNav() {
  const session = await getServerSession(authOptions);
  const dict = await getDictionary();

  const avatarSrc = "assets/img/avatars/doctorLogo.png";

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
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              className="text-primary"
              style={{ fontSize: "32px" }}
            />
          </div>
        </DropdownToggle>

        <DropdownMenu className="p-0 mt-2 shadow rounded-3 overflow-hidden">
          {/* Encabezado */}
          <div className="text-center bg-primary text-white py-3 px-3">
            <div
              className="rounded-circle mx-auto mb-2 overflow-hidden"
              style={{
                width: 70,
                height: 70,
                background: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 3px 8px rgba(255,255,255,0.3)",
              }}
            >
              <img
                src={avatarSrc}
                alt="profile avatar"
                width={70}
                height={70}
                className="object-cover"
              />
            </div>
            <h6 className="mb-0 fw-bold">{session?.user?.name ?? "Usuario"}</h6>
            <small className="opacity-75">{session?.user?.email ?? ""}</small>
          </div>

          {/* Información del usuario */}
          <div className="px-3 py-3">
            <p className="mb-1">
              <strong>Usuario:</strong> {session?.user?.username ?? "--"}
            </p>
            <p className="mb-1">
              <strong>Nombres:</strong> {session?.user?.name ?? "--"}
            </p>
            <p className="mb-0">
              <strong>Perfil:</strong> {session?.user?.rol ?? "--"}
            </p>
          </div>

          <DropdownDivider />

          {/* Botón de salir */}
          <HeaderLogout>
            <DropdownItem className="d-flex align-items-center text-danger py-3 fw-semibold">
              <FontAwesomeIcon icon={faPowerOff} className="me-2" />
              {dict.general.profile.logout}
            </DropdownItem>
          </HeaderLogout>
        </DropdownMenu>
      </Dropdown>
    </Nav>
  );
}
