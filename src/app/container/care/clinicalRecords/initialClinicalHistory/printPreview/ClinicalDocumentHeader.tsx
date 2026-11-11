"use client";

import type { TProvider } from "@/core/interfaces/parameterization/types";
import { InstitutionLogo } from "@/components/print/InstitutionLogo";
import {
  calculateAge,
  emptyDash,
  formatDateTime,
  type PrintPatient,
} from "./printDocument.utils";
import { useAdmissionDischarge } from "./useAdmissionDischargeDate";
import { formatDate, formatTime } from "@/core/utils/date";

/** Profesional que firma el documento (bloque Profesional / Especialidad / Rethus). */
export interface HeaderProfessional {
  name?: string | null;
  specialty?: string | null;
  /** Tarjeta profesional (Rethus). */
  licenseCard?: string | null;
}

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionId?: string | number;
  admissionDate: string;
  contractName: string;
  documentTitle: string;
  /** Sin uso: todos los documentos rotulan "Fecha historia". */
  attentionLabel?: string;
  attentionDate: string;
  attentionTime: string;
  /** Sin uso: el formato de epicrisis no muestra el sexo. */
  showSex?: boolean;
  /** Sin uso: el formato de epicrisis es el de todos los documentos. */
  showProcessDates?: boolean;
  /** Firmante del documento; sin él (varios firmantes o ninguno) no va ese bloque. */
  professional?: HeaderProfessional;
}

const value = (text?: string | null) => (text && text.trim() ? text : emptyDash);

/**
 * Encabezado común de los documentos clínicos, con el formato de la epicrisis:
 * datos de la institución, título, tabla "Datos del Paciente — Epicrisis" y la
 * fecha de la historia con el profesional que firma.
 */
export const ClinicalDocumentHeader = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  documentTitle,
  attentionDate,
  attentionTime,
  professional,
}: Props) => {
  const discharge = useAdmissionDischarge(admissionId);
  const dischargeLabel = formatDateTime(discharge.date ?? "") || emptyDash;

  // Pares de cada fila: columna izquierda | columna derecha.
  const rows: Array<[string, string, string, string]> = [
    ["Ingreso", value(formatDateTime(admissionDate)), "Egreso", dischargeLabel],
    // Ingreso: ámbito de la admisión. Egreso: ámbito de egreso de la nota de
    // egreso ("—" mientras no se registre el egreso).
    ["Servicio ingreso", value(patient.careScope?.toUpperCase()), "Servicio egreso", value(discharge.service?.toUpperCase())],
    ["Paciente", value(patient.name?.toUpperCase()), "Documento", value([patient.documentType, patient.documentNumber].filter(Boolean).join(" "))],
    ["Fecha nac.", value(patient.birthDate?.slice(0, 10)), "Edad", value(calculateAge(patient.birthDate))],
    ["Entidad", value(patient.insurer?.toUpperCase()), "Contrato", value(contractName?.toUpperCase())],
    ["Dirección", value(patient.address?.toUpperCase()), "Ciudad", value(patient.city?.toUpperCase())],
  ];

  const historyDate = [
    formatDate(attentionDate, ""),
    attentionTime ? formatTime(attentionTime, "") : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="hci-print-header-block">
      <div className="hci-print-header">
        <InstitutionLogo provider={provider} className="hci-print-logo" />
        <div className="hci-print-entity">
          <div className="hci-print-entity-name">
            {provider?.name || "Institución Prestadora de Salud"}
          </div>
          {provider?.nit && <div>NIT: {provider.nit}</div>}
          {provider?.address && <div>Dirección: {provider.address}</div>}
          {provider?.phone && <div>Tel: {provider.phone}</div>}
          {provider?.enableCode && (
            <div>Código de habilitación: {provider.enableCode}</div>
          )}
        </div>
        <div className="hci-print-hc-number">
          <div className="hci-print-hc-number-title">Historia Clínica</div>
          <div>N° {admissionId ?? emptyDash}</div>
        </div>
      </div>

      <div className="hci-print-title">{documentTitle}</div>

      <table className="epicrisis-patient-table">
        <thead>
          <tr>
            <th colSpan={4}>Datos del Paciente — Epicrisis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([leftLabel, leftValue, rightLabel, rightValue]) => (
            <tr key={leftLabel}>
              <th scope="row">{leftLabel}</th>
              <td className={leftLabel === "Paciente" ? "epicrisis-patient-name" : undefined}>
                {leftValue}
              </td>
              <th scope="row">{rightLabel}</th>
              <td>{rightValue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="epicrisis-history-info">
        <div className="epicrisis-history-row">
          <span>
            <strong>Fecha historia:</strong> {historyDate || emptyDash}
          </span>
        </div>
        {/* Documentos sin un único firmante (ingreso, hoja de gastos...) no llevan este bloque. */}
        {professional?.name?.trim() && (
          <>
            <div className="epicrisis-history-row epicrisis-history-row--split">
              <span>
                <strong>Profesional:</strong> {value(professional.name.toUpperCase())}
              </span>
              <span>
                <strong>Especialidad:</strong> {value(professional.specialty?.toUpperCase())}
              </span>
            </div>
            <div className="epicrisis-history-row">
              <span>
                <strong>Rethus:</strong> {value(professional.licenseCard)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
