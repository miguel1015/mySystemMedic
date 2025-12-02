"use client";

import React, { ReactNode } from "react";
import classNames from "classnames";

interface GridContainerProps {
  children: ReactNode | ReactNode[];
  gap?: string; // Ej: g-3, g-4
  columns?: string; // Ej: "col-12 col-md-6 col-lg-4"
  cols?: number; // Ej: 2, 3, 4 -> genera automáticamente col clases
  className?: string;
  container?: boolean; // si envuelve en .container
  as?: keyof JSX.IntrinsicElements; // Tag personalizado: div, section, article...
}

export default function GridContainer({
  children,
  gap = "g-4",
  columns,
  cols,
  className,
  container = true,
  as = "div",
}: GridContainerProps) {
  // Etiqueta custom
  const Wrapper = as;

  // Generamos columnas automáticamente si se pasa cols={3} por ejemplo
  const autoColumns = cols
    ? `col-12 col-md-${12 / cols} col-lg-${12 / cols}`
    : null;

  const colClasses = columns || autoColumns || "col-12 col-md-6 col-lg-4";

  // Normalizamos children
  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <Wrapper className={classNames(container && "container", className)}>
      <div className={classNames("row", gap)}>
        {childArray.map((child, index) => (
          <div key={index} className={colClasses}>
            {child}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}
