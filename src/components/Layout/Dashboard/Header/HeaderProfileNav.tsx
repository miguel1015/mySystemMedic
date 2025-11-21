import {
  Badge,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
} from "react-bootstrap";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCreditCard,
  faEnvelopeOpen,
  faFile,
  faMessage,
  faUser,
} from "@fortawesome/free-regular-svg-icons";
import { PropsWithChildren } from "react";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faGear,
  faListCheck,
  faLock,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import HeaderLogout from "@/components/Layout/Dashboard/Header/HeaderLogout";
import { authOptions } from "@/app/api/auth/option";
import { getServerSession } from "next-auth";
import { getDictionary } from "@/locales/dictionary";

type ItemWithIconProps = {
  icon: IconDefinition;
} & PropsWithChildren;

const ItemWithIcon = (props: ItemWithIconProps) => {
  const { icon, children } = props;

  return (
    <>
      <FontAwesomeIcon className="me-2" icon={icon} fixedWidth />
      {children}
    </>
  );
};

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
          <div className="avatar position-relative">
            {/* {session && (
              <Image
                fill
                sizes="32px"
                className="rounded-circle"
                src={session?.user?.avatar ?? "/images/default-avatar.png"}
                alt={session?.user?.email ?? "profile avatar"}
              />
            )} */}
            <div
              className="avatar position-relative d-flex justify-content-center align-items-center rounded-circle"
              style={{ width: 32, height: 32 }}
            >
              <i className="bi bi-person-badge-fill fs-4 text-primary"></i>
            </div>
          </div>
        </DropdownToggle>
        <DropdownMenu className="pt-0">
          <DropdownHeader className="fw-bold rounded-top">
            {dict.general.profile.account.title}
          </DropdownHeader>
          <HeaderLogout>
            <DropdownItem>
              <ItemWithIcon icon={faPowerOff}>
                {dict.general.profile.logout}
              </ItemWithIcon>
            </DropdownItem>
          </HeaderLogout>
        </DropdownMenu>
      </Dropdown>
    </Nav>
  );
}
