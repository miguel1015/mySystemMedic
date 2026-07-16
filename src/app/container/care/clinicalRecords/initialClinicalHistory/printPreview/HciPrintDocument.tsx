"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import type { HCInicialResponse } from "@/core/interfaces/care/hciInicial";
import { antecedentesFields, physicalExamFields } from "../constants";
import type { DiagnosisRow } from "../types";
import { ClinicalDocumentHeader } from "./ClinicalDocumentHeader";
import { emptyDash, FieldRow, formatDoctorSignatureName, type PrintPatient } from "./printDocument.utils";
import "./hciPrintPreview.css";

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionDate: string;
  attentionDate: string;
  attentionTime: string;
  contractName: string;
  doctorName: string;
  doctorUser?: GetUser;
  hcInicial?: HCInicialResponse | null;
  diagnoses: DiagnosisRow[];
}

/*
 * Pagination model: content is broken into small "units" that get packed
 * onto pages by their MEASURED rendered height (see the layout effect
 * below), instead of forcing one section per page or trusting the browser
 * to repeat a header across natural page breaks (every native trick for
 * that — position:fixed, <thead>/<tfoot> — turned out not to repeat
 * reliably in testing). Whichever units land on a page, that page gets a
 * real, literal copy of the header/footer.
 */
type FieldUnit = {
  kind: "field";
  id: string;
  sectionKey: string;
  sectionTitle: string;
  isFirst: boolean;
  label: string;
  value?: string | number | null;
};
type BlockUnit = {
  kind: "block";
  id: string;
  node: ReactNode;
};
type Unit = FieldUnit | BlockUnit;

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

export const HciPrintDocument = ({
  provider,
  patient,
  admissionDate,
  attentionDate,
  attentionTime,
  contractName,
  doctorName,
  doctorUser,
  hcInicial,
  diagnoses,
}: Props) => {
  const subjetivo = hcInicial?.subjetivo;
  const objetivo = hcInicial?.objetivo;
  const vitales = hcInicial?.signosVitales;
  const analisisPlan = hcInicial?.analisisDiagnosticosPlan;
  const mainDiagnosis = diagnoses.find((d) => d.main && d.code);

  const headerBlock = (
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle="Historia Clínica Inicial"
      attentionLabel="Fecha y hora de atención:"
      attentionDate={attentionDate}
      attentionTime={attentionTime}
    />
  );

  const units = useMemo<Unit[]>(() => {
    const list: Unit[] = [];

    list.push({
      kind: "block",
      id: "datos-generales",
      node: (
        <div className="hci-print-section">
          <div className="hci-print-section-title">Datos Generales</div>
          <div className="hci-print-fieldtable">
            <FieldRow
              label="Motivo de Consulta"
              value={subjetivo?.motivoConsulta}
            />
            <FieldRow
              label="Enfermedad Actual"
              value={subjetivo?.enfermedadActual}
            />
          </div>
        </div>
      ),
    });

    const antecedentesRows = antecedentesFields.filter(
      ({ key }) => objetivo?.[key],
    );
    if (antecedentesRows.length === 0) {
      list.push({
        kind: "block",
        id: "antecedentes-empty",
        node: (
          <div className="hci-print-section">
            <div className="hci-print-section-title">
              Antecedentes Familiares y Personales
            </div>
            <div className="hci-print-empty-note">
              Sin antecedentes registrados.
            </div>
          </div>
        ),
      });
    } else {
      antecedentesRows.forEach(({ key, label }, idx) => {
        list.push({
          kind: "field",
          id: `antecedentes-${key}`,
          sectionKey: "antecedentes",
          sectionTitle: "Antecedentes Familiares y Personales",
          isFirst: idx === 0,
          label,
          value: objetivo?.[key],
        });
      });
    }

    const examRows: {
      key: string;
      label: string;
      value?: string | number | null;
    }[] = [
      ...physicalExamFields
        .filter(({ key }) => objetivo?.[key])
        .map(({ key, label }) => ({
          key: `pe-${key}`,
          label,
          value: objetivo?.[key],
        })),
      {
        key: "vit-ta",
        label: "Presión Arterial",
        value: vitales?.tensionArterial,
      },
      {
        key: "vit-fc",
        label: "Frecuencia Cardiaca",
        value: vitales?.frecuenciaCardiaca,
      },
      {
        key: "vit-fr",
        label: "Frecuencia Respiratoria",
        value: vitales?.frecuenciaRespiratoria,
      },
      { key: "vit-temp", label: "Temperatura", value: vitales?.temperatura },
      {
        key: "vit-sat",
        label: "Saturación de Oxígeno",
        value: vitales?.saturacionOxigeno,
      },
      { key: "vit-glasgow", label: "Glasgow", value: vitales?.glasgow },
      { key: "vit-peso", label: "Peso", value: vitales?.peso },
      { key: "vit-talla", label: "Talla", value: vitales?.talla },
      { key: "vit-imc", label: "IMC", value: vitales?.imc },
    ];
    examRows.forEach((row, idx) => {
      list.push({
        kind: "field",
        id: `examen-${row.key}`,
        sectionKey: "examen",
        sectionTitle: "Examen Físico",
        isFirst: idx === 0,
        label: row.label,
        value: row.value,
      });
    });

    if (!analisisPlan?.diagnosticos?.length) {
      list.push({
        kind: "block",
        id: "diagnosticos-empty",
        node: (
          <div className="hci-print-section">
            <div className="hci-print-section-title">Diagnóstico(s)</div>
            <div className="hci-print-empty-note">
              Sin diagnósticos registrados.
            </div>
          </div>
        ),
      });
    } else {
      analisisPlan.diagnosticos.forEach((d, idx) => {
        list.push({
          kind: "field",
          id: `diag-${d.id}`,
          sectionKey: "diagnosticos",
          sectionTitle: "Diagnóstico(s)",
          isFirst: idx === 0,
          label:
            mainDiagnosis?.code === d.codigo
              ? "Diagnóstico Principal"
              : `Diagnóstico ${idx + 1}`,
          value: `${d.codigo} – ${d.descripcion}`,
        });
      });
    }

    list.push({
      kind: "block",
      id: "analisis-plan",
      node: (
        <div className="hci-print-section">
          <div className="hci-print-section-title">
            Análisis y Plan de Manejo
          </div>
          <div className="hci-print-fieldtable">
            <FieldRow label="Análisis" value={analisisPlan?.analisis} />
            <FieldRow
              label="Plan de Manejo y Tratamiento"
              value={analisisPlan?.plan}
            />
          </div>
        </div>
      ),
    });

    list.push({
      kind: "block",
      id: "firmas",
      node: (
        <div className="hci-print-signatures">
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img">
              {doctorUser?.signature && (
                <img src={doctorUser.signature} alt="Firma" />
              )}
            </div>
            <div className="hci-print-signature-line">
              {formatDoctorSignatureName(doctorName)}
            </div>
          </div>
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img" />
            <div className="hci-print-signature-line">
              Paciente / Responsable
            </div>
          </div>
        </div>
      ),
    });

    return list;
  }, [
    subjetivo,
    objetivo,
    vitales,
    analisisPlan,
    mainDiagnosis,
    doctorName,
    doctorUser,
  ]);

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

  return (
    <>
      {/*
        Hidden measuring pass, rendered at the same width the real content
        column will use (page width minus left/right margins), so wrapped
        text measures the same as it will on the page. `overflow:hidden`
        on each wrapper stops margin collapsing, so getBoundingClientRect
        reports the element's true footprint including its own margins.
      */}
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

      {pages?.map((pageUnits, index) => (
        <div className="hci-print-page" key={index}>
          {headerBlock}
          <div className="hci-print-body">{renderPageUnits(pageUnits)}</div>
        </div>
      ))}
    </>
  );
};
