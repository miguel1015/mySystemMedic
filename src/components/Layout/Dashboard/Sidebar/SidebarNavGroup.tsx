"use client";

import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
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
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/Layout/Dashboard/SidebarProvider";

type SidebarNavGroupToggleProps = {
  eventKey: string;
  icon?: IconDefinition;
  setIsShow: (isShow: boolean) => void;
  hasActiveChild?: boolean;
  sidebarColor?: string;
} & PropsWithChildren;

const SidebarNavGroupToggle = (props: SidebarNavGroupToggleProps) => {
  // https://react-bootstrap.github.io/components/accordion/#custom-toggle-with-expansion-awareness
  const { activeEventKey } = useContext(AccordionContext);
  const {
    eventKey,
    icon,
    children,
    setIsShow,
    hasActiveChild = false,
    sidebarColor,
  } = props;

  const decoratedOnClick = useAccordionButton(eventKey);

  const isCurrentEventKey = activeEventKey === eventKey;
  useEffect(() => {
    setIsShow(activeEventKey === eventKey);
  }, [activeEventKey, eventKey, setIsShow]);

  return (
    <Button
      variant="link"
      type="button"
      className={classNames(
        "rounded-0 nav-link px-3 py-2 d-flex align-items-center flex-fill w-100 shadow-none",
        { collapsed: !isCurrentEventKey }
      )}
      style={{
        borderLeft: hasActiveChild
          ? `3px solid ${sidebarColor}`
          : "3px solid transparent",
        color: hasActiveChild ? "#fff" : undefined,
        transition: "all 0.25s ease",
      }}
      onClick={decoratedOnClick}
    >
      {icon && <FontAwesomeIcon className="nav-icon ms-n3" icon={icon} />}

      <span className="nav-text text-truncate">{children}</span>

      <div className="nav-chevron ms-auto text-end">
        <FontAwesomeIcon
          size="xs"
          icon={faChevronUp}
          style={{
            transition: "transform 0.25s ease",
            transform: !isCurrentEventKey ? "rotate(0deg)" : "rotate(180deg)",
          }}
        />
      </div>
    </Button>
  );
};

function extractHrefs(children: React.ReactNode): string[] {
  const hrefs: string[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if ((child.props as any).href) hrefs.push((child.props as any).href)
      if ((child.props as any).children)
        hrefs.push(...extractHrefs((child.props as any).children))
    }
  })
  return hrefs
}

type SidebarNavGroupProps = {
  toggleIcon?: IconDefinition;
  toggleText: string;
  level?: number;
} & PropsWithChildren;

export default function SidebarNavGroup(props: SidebarNavGroupProps) {
  const { toggleIcon, toggleText, children, level = 0 } = props;
  const pathname = usePathname();
  const { sidebarColor } = useSidebar();

  const childHrefs = extractHrefs(children)
  const hasActiveChild = childHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  )

  const [isShow, setIsShow] = useState(false);

  return (
    <Accordion
      as="li"
      bsPrefix="nav-group"
      className={classNames({ show: isShow })}
      defaultActiveKey={hasActiveChild ? "0" : undefined}
      style={{
        marginLeft: `${level * 10}px`,
      }}
    >
      <SidebarNavGroupToggle
        icon={toggleIcon}
        eventKey="0"
        setIsShow={setIsShow}
        hasActiveChild={hasActiveChild}
        sidebarColor={sidebarColor}
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
