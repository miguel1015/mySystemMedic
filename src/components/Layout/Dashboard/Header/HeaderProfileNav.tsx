import { authOptions } from "@/app/api/auth/option";
import HeaderLogout from "@/components/Layout/Dashboard/Header/HeaderLogout";
import { getDictionary } from "@/locales/dictionary";
import { faPowerOff, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getServerSession } from "next-auth";
import {
  Dropdown,
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
          id="dropdown-profile"
          style={{
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: '0.5rem',
            paddingRight: '0.5rem',
            borderRadius: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              overflow: "hidden",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              background: '#f8f9fa',
            }}
          >
            <FontAwesomeIcon
              icon={faUserCircle}
              style={{
                fontSize: "30px",
                color: '#0F6F5C',
              }}
            />
          </div>
        </DropdownToggle>

        <DropdownMenu
          style={{
            minWidth: 280,
            padding: 0,
            marginTop: '1rem',
            boxShadow: '0 1rem 3rem rgba(0,0,0,.175)',
            borderRadius: '0.375rem',
            overflow: 'hidden',
          }}
        >
          {/* Encabezado */}
          <div
            style={{
              textAlign: 'center',
              background: '#0F6F5C',
              color: '#fff',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }}
          >
            <div
              style={{
                width: 85,
                height: 85,
                background: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 4px 10px rgba(255,255,255,0.25)",
                borderRadius: '50%',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '0.5rem',
                overflow: 'hidden',
              }}
            >
              <img
                src="assets/img/avatars/doctorLogo.png"
                alt="profile avatar"
                width={85}
                height={85}
                style={{ objectFit: 'cover' }}
              />
            </div>

            <h6
              style={{
                marginBottom: 0,
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              {session?.user?.name ?? "Usuario"}
            </h6>
            <small
              style={{
                opacity: 0.75,
                fontSize: '1rem',
              }}
            >
              {session?.user?.email ?? ""}
            </small>
          </div>

          {/* Info */}
          <div
            style={{
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              fontSize: '1rem',
            }}
          >
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Usuario:</strong> {session?.user?.username ?? "--"}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Nombres:</strong>{" "}
              {session?.user?.firstName || session?.user?.lastName
                ? `${session.user.firstName} ${session.user.lastName}`
                : "--"}
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>Perfil:</strong> {session?.user?.userProfileName ?? "--"}
            </p>
          </div>

          <div
            style={{
              height: 0,
              margin: '0.5rem 0',
              overflow: 'hidden',
              borderTop: '1px solid #dee2e6',
            }}
          />

          <HeaderLogout>
            <DropdownItem
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#dc3545',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              <FontAwesomeIcon
                icon={faPowerOff}
                style={{ marginRight: '0.5rem' }}
              />
              {dict.general.profile.logout}
            </DropdownItem>
          </HeaderLogout>
        </DropdownMenu>
      </Dropdown>
    </Nav>
  );
}
