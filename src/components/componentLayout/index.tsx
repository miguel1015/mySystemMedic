"use client";

import React, { ReactNode } from "react";
import classNames from "classnames";

interface GridContainerProps {
  children: ReactNode[];
  gap?: string; // Clase Bootstrap para gap, ej: "g-3", "g-4"
  columns?: string; // Clases para controlar cols, ej: "col-12 col-md-6 col-lg-4"
  className?: string;
  container?: boolean; // si quieres el container o no
}

export default function GridContainer({
  children,
  gap = "g-4",
  columns = "col-12 col-md-6 col-lg-4",
  className,
  container = true,
}: GridContainerProps) {
  const Wrapper = container ? "div" : React.Fragment;

  return (
    <Wrapper
      {...(container ? { className: classNames("container", className) } : {})}
    >
      <div className={classNames("row justify-content-center", gap)}>
        {React.Children.map(children, (child) => (
          <div className={columns}>{child}</div>
        ))}
      </div>
    </Wrapper>
  );
}
