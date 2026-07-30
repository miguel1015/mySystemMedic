"use client";

import { useMemo } from "react";
import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import type { HCInicialResponse } from "@/core/interfaces/care/hciInicial";
import { antecedentesFields, physicalExamFields } from "../constants";
import type { DiagnosisRow } from "../types";
import { ClinicalDocumentHeader } from "./ClinicalDocumentHeader";
import { DoctorSignatureBox, FieldRow, type PrintPatient } from "./printDocument.utils";
import { PaginatedPages, usePaginatedUnits, type Unit } from "./printPagination";
import "./hciPrintPreview.css";

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionId?: string | number;
  admissionDate: string;
  attentionDate: string;
  attentionTime: string;
  contractName: string;
  doctorName: string;
  doctorUser?: GetUser;
  hcInicial?: HCInicialResponse | null;
  diagnoses: DiagnosisRow[];
}

export const HciPrintDocument = ({
  provider,
  patient,
  admissionId,
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
      admissionId={admissionId}
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
          <DoctorSignatureBox doctorName={doctorName} doctorUser={doctorUser} />
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

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock);

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} />
    </>
  );
};
