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
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";

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
      <span className="nav-chevron">
        <FontAwesomeIcon size="xs" icon={faChevronDown} />
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
} & PropsWithChildren;

export default function SidebarNavGroup(props: SidebarNavGroupProps) {
  const { toggleIcon, toggleText, children, level = 0 } = props;
  const pathname = usePathname();

  const childHrefs = extractHrefs(children);
  const hasActiveChild = childHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );

  const [isShow, setIsShow] = useState(false);

  return (
    <Accordion
      as="li"
      bsPrefix="nav-group"
      className={classNames({ show: isShow })}
      defaultActiveKey={hasActiveChild ? "0" : undefined}
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
