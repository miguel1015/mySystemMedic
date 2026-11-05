"use client";

import React, { ReactNode } from "react";
import classNames from "classnames";

// Escala responsive según cuántos campos por fila se quieren en escritorio. En celular
// los campos siempre van a ancho completo (o de a dos si son muy angostos) y la cantidad
// de columnas sube con el ancho; así un formulario de 4 por fila no queda con selects de
// 100px en un teléfono.
const RESPONSIVE_COLUMNS: Record<number, string> = {
  1: "col-12",
  2: "col-12 col-md-6",
  3: "col-12 col-md-6 col-lg-4",
  4: "col-12 col-sm-6 col-lg-4 col-xl-3",
  6: "col-6 col-md-4 col-lg-3 col-xl-2",
};

function responsiveColumns(perRow: number): string {
  return RESPONSIVE_COLUMNS[perRow] ?? `col-12 col-md-${12 / perRow}`;
}

// Una sola clase "col-N" sin breakpoint (p. ej. "col-4") deja el mismo ancho en todas las
// pantallas; se traduce a la escala responsive equivalente. Las clases que ya traen
// breakpoints ("col-12 col-md-6") se respetan tal cual.
function normalizeColumns(columns?: string): string | null {
  if (!columns) return null;
  const match = columns.trim().match(/^col-(\d{1,2})$/);
  if (!match) return columns;
  const span = Number(match[1]);
  if (span <= 0 || span > 12 || 12 % span !== 0) return columns;
  return responsiveColumns(12 / span);
}

interface GridContainerProps {
  children: ReactNode | ReactNode[];
  gap?: string; // Ej: g-3, g-4
  columns?: string; // Ej: "col-4" (se vuelve responsive) o clases explícitas "col-12 col-md-6"
  cols?: number; // Campos por fila en escritorio: 2, 3, 4, 6
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

  const colClasses =
    normalizeColumns(columns) ||
    (cols ? responsiveColumns(cols) : null) ||
    responsiveColumns(3);

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
