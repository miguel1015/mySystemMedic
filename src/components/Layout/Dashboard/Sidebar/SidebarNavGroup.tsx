"use client";

import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Accordion,
  AccordionContext,
  Button,
  useAccordionButton,
} from "react-bootstrap";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DownOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";

// Cada vez que cambia este número, los grupos no controlados (submenús) se cierran.
// Lo usa el botón "Contraer" del menú.
export const CollapseAllContext = createContext(0);

type SidebarNavGroupToggleProps = {
  eventKey: string;
  icon?: IconDefinition;
  setIsShow: (isShow: boolean) => void;
} & PropsWithChildren;

const SidebarNavGroupToggle = (props: SidebarNavGroupToggleProps) => {
  const { activeEventKey } = useContext(AccordionContext);
  const { eventKey, icon, children, setIsShow } = props;

  const decoratedOnClick = useAccordionButton(eventKey);

  useEffect(() => {
    setIsShow(activeEventKey === eventKey);
  }, [activeEventKey, eventKey, setIsShow]);

  return (
    <Button
      variant="link"
      type="button"
      className="nav-link shadow-none"
      onClick={decoratedOnClick}
    >
      {icon && (
        <span className="nav-icon">
          <FontAwesomeIcon icon={icon} />
        </span>
      )}
      <span className="nav-text text-truncate">{children}</span>
      <span className="nav-chevron" aria-hidden>
        <DownOutlined />
      </span>
    </Button>
  );
};

function extractHrefs(children: React.ReactNode): string[] {
  const hrefs: string[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if ((child.props as any).href) hrefs.push((child.props as any).href);
      if ((child.props as any).children)
        hrefs.push(...extractHrefs((child.props as any).children));
    }
  });
  return hrefs;
}

type SidebarNavGroupProps = {
  toggleIcon?: IconDefinition;
  toggleText: string;
  level?: number;
  // Modo controlado (módulos): el padre decide cuál está abierto, así abrir uno cierra
  // el anterior. Sin estas props el grupo se maneja solo, como antes.
  open?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
} & PropsWithChildren;

export default function SidebarNavGroup(props: SidebarNavGroupProps) {
  const { toggleIcon, toggleText, children, level = 0, open, onToggle, className } = props;
  const controlled = open !== undefined;
  const pathname = usePathname();

  const childHrefs = extractHrefs(children);
  const hasActiveChild = childHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );

  const [isShow, setIsShow] = useState(false);

  // Sin modo controlado, el grupo guarda su propio estado (abierto si contiene la
  // vista actual) y se cierra cuando se pide contraer todo.
  const [localOpen, setLocalOpen] = useState(hasActiveChild);
  const collapseVersion = useContext(CollapseAllContext);
  const lastCollapseVersion = useRef(collapseVersion);
  useEffect(() => {
    if (lastCollapseVersion.current === collapseVersion) return;
    lastCollapseVersion.current = collapseVersion;
    setLocalOpen(false);
  }, [collapseVersion]);

  const isOpen = controlled ? open : localOpen;

  return (
    <Accordion
      as="li"
      bsPrefix="nav-group"
      className={classNames(className, { show: isShow })}
      activeKey={isOpen ? "0" : null}
      onSelect={(key: unknown) =>
        controlled ? onToggle?.(key === "0") : setLocalOpen(key === "0")
      }
      style={{ marginLeft: `${level * 8}px` }}
    >
      <SidebarNavGroupToggle
        icon={toggleIcon}
        eventKey="0"
        setIsShow={setIsShow}
      >
        {toggleText}
      </SidebarNavGroupToggle>
      <Accordion.Collapse eventKey="0">
        <ul className="nav-group-items list-unstyled">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as any, { level: level + 1 })
              : child
          )}
        </ul>
      </Accordion.Collapse>
    </Accordion>
  );
}
