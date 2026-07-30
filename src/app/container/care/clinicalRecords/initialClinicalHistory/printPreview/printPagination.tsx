"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { FieldRow } from "./printDocument.utils";

export type FieldUnit = {
  kind: "field";
  id: string;
  sectionKey: string;
  sectionTitle: string;
  isFirst: boolean;
  label: string;
  value?: string | number | null;
};
export type BlockUnit = {
  kind: "block";
  id: string;
  node: ReactNode;
};
export type Unit = FieldUnit | BlockUnit;

const measureNodeFor = (unit: Unit): ReactNode => {
  if (unit.kind === "block") return unit.node;
  return (
    <div className="hci-print-section">
      {unit.isFirst && (
        <div className="hci-print-section-title">{unit.sectionTitle}</div>
      )}
      <div className="hci-print-fieldtable">
        <FieldRow label={unit.label} value={unit.value} />
      </div>
    </div>
  );
};

const renderPageUnits = (pageUnits: Unit[]): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let i = 0;
  while (i < pageUnits.length) {
    const unit = pageUnits[i];
    if (unit.kind === "block") {
      nodes.push(<div key={unit.id}>{unit.node}</div>);
      i++;
      continue;
    }
    const run: FieldUnit[] = [unit];
    let j = i + 1;
    while (
      j < pageUnits.length &&
      pageUnits[j].kind === "field" &&
      (pageUnits[j] as FieldUnit).sectionKey === unit.sectionKey
    ) {
      run.push(pageUnits[j] as FieldUnit);
      j++;
    }
    nodes.push(
      <div className="hci-print-section" key={unit.id}>
        {unit.isFirst && (
          <div className="hci-print-section-title">{unit.sectionTitle}</div>
        )}
        <div className="hci-print-fieldtable">
          {run.map((r) => (
            <FieldRow key={r.id} label={r.label} value={r.value} />
          ))}
        </div>
      </div>,
    );
    i = j;
  }
  return nodes;
};

const MM_TO_PX = 96 / 25.4;
const PAGE_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 14;
const CONTENT_WIDTH_MM = 210 - PAGE_MARGIN_MM * 2;
const PAGE_BUDGET_BUFFER_PX = 24;

/*
 * Shared pagination engine used by every multi-section print document:
 * content is broken into small "units" that get packed onto pages by their
 * MEASURED rendered height (see the layout effect below), instead of
 * forcing one section per page or trusting the browser to repeat a header
 * across natural page breaks (every native trick for that — position:fixed,
 * <thead>/<tfoot> — turned out not to repeat reliably in testing).
 * Whichever units land on a page, that page gets a real, literal copy of
 * the header.
 */
export const usePaginatedUnits = (units: Unit[], headerBlock: ReactNode) => {
  const [pages, setPages] = useState<Unit[][] | null>(null);
  const headerMeasureRef = useRef<HTMLDivElement>(null);
  const unitMeasureRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useLayoutEffect(() => {
    const headerH =
      headerMeasureRef.current?.getBoundingClientRect().height ?? 0;
    const pageHeightPx = PAGE_HEIGHT_MM * MM_TO_PX;
    const marginPx = PAGE_MARGIN_MM * MM_TO_PX;
    const budget =
      pageHeightPx - marginPx * 2 - headerH - PAGE_BUDGET_BUFFER_PX;

    const result: Unit[][] = [];
    let current: Unit[] = [];
    let currentH = 0;
    for (const unit of units) {
      const el = unitMeasureRefs.current.get(unit.id);
      const h = el ? el.getBoundingClientRect().height : 0;
      if (current.length > 0 && currentH + h > budget) {
        result.push(current);
        current = [];
        currentH = 0;
      }
      current.push(unit);
      currentH += h;
    }
    if (current.length > 0) result.push(current);
    setPages(result.length > 0 ? result : [[]]);
  }, [units]);

  // Hidden measuring pass, rendered at the same width the real content
  // column will use (page width minus left/right margins), so wrapped text
  // measures the same as it will on the page. `overflow:hidden` on each
  // wrapper stops margin collapsing, so getBoundingClientRect reports the
  // element's true footprint including its own margins.
  const measuringPass = (
    <div
      aria-hidden
      className="hci-print-page"
      style={{
        position: "absolute",
        visibility: "hidden",
        pointerEvents: "none",
        top: 0,
        left: "-9999px",
        width: `${CONTENT_WIDTH_MM}mm`,
        minHeight: 0,
        padding: 0,
        boxShadow: "none",
      }}
    >
      <div ref={headerMeasureRef} style={{ overflow: "hidden" }}>
        {headerBlock}
      </div>
      {units.map((unit) => (
        <div
          key={unit.id}
          style={{ overflow: "hidden" }}
          ref={(el) => {
            if (el) unitMeasureRefs.current.set(unit.id, el);
          }}
        >
          {measureNodeFor(unit)}
        </div>
      ))}
    </div>
  );

  return { pages, measuringPass };
};

export const PaginatedPages = ({
  pages,
  headerBlock,
}: {
  pages: Unit[][] | null;
  headerBlock: ReactNode;
}) => (
  <>
    {pages?.map((pageUnits, index) => (
      <div className="hci-print-page" key={index}>
        {headerBlock}
        <div className="hci-print-body">{renderPageUnits(pageUnits)}</div>
      </div>
    ))}
  </>
);
