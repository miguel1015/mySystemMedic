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

/** Profesional que firma el documento, para el bloque de la epicrisis. */
export interface HeaderProfessional {
  name?: string;
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
  /** @deprecated La epicrisis rotula siempre "Fecha historia"; se conserva por compatibilidad. */
  attentionLabel?: string;
  attentionDate: string;
  attentionTime: string;
  showSex?: boolean;
  /**
   * Epicrisis: los datos del paciente van en la tabla "Datos del Paciente —
   * Epicrisis" (ingreso/egreso, servicios, entidad...) y debajo la fecha de la
   * historia con el profesional que la firma.
   */
  showProcessDates?: boolean;
  professional?: HeaderProfessional;
}

const value = (text?: string | null) => (text && text.trim() ? text : emptyDash);

export const ClinicalDocumentHeader = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  documentTitle,
  attentionDate,
  attentionTime,
  showSex = false,
  showProcessDates = false,
  professional,
}: Props) => {
  const discharge = useAdmissionDischarge(admissionId);
  const dischargeLabel = formatDateTime(discharge.date ?? "") || emptyDash;

  const institution = (
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
  );

  if (showProcessDates) {
    // Pares [etiqueta, valor] de cada fila: columna izquierda | columna derecha.
    const rows: Array<[string, string, string, string]> = [
      ["Ingreso", value(formatDateTime(admissionDate)), "Egreso", dischargeLabel],
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
        {institution}

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
              <strong>Fecha historia:</strong>{" "}
              {historyDate || emptyDash}
            </span>
          </div>
          <div className="epicrisis-history-row epicrisis-history-row--split">
            <span>
              <strong>Profesional:</strong> {value(professional?.name?.toUpperCase())}
            </span>
            <span>
              <strong>Especialidad:</strong> {value(professional?.specialty?.toUpperCase())}
            </span>
          </div>
          <div className="epicrisis-history-row">
            <span>
              <strong>Rethus:</strong> {value(professional?.licenseCard)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hci-print-header-block">
      {institution}

      <div className="hci-print-title">{documentTitle}</div>

      <div className="hci-print-patient-grid">
        <div className="hci-print-row">
          <span className="hci-print-label">Documento:</span>
          <span className="hci-print-value">
            {patient.documentType} {patient.documentNumber}
          </span>
        </div>
        <div className="hci-print-row">
          <span className="hci-print-label">Paciente:</span>
          <span className="hci-print-value">{patient.name?.toUpperCase()}</span>
        </div>
        <div className="hci-print-row">
          <span className="hci-print-label">Ciudad:</span>
          <span className="hci-print-value">{patient.city || emptyDash}</span>
        </div>
        <div className="hci-print-row">
          <span className="hci-print-label">Fecha de nacimiento:</span>
          <span className="hci-print-value">{patient.birthDate}</span>
        </div>
        <div className="hci-print-row">
          <span className="hci-print-label">Edad:</span>
          <span className="hci-print-value">
            {calculateAge(patient.birthDate)}
          </span>
        </div>
        {showSex && (
          <div className="hci-print-row">
            <span className="hci-print-label">Sexo:</span>
            <span className="hci-print-value">{patient.sex || emptyDash}</span>
          </div>
        )}
        <div className="hci-print-row">
          <span className="hci-print-label">Convenio:</span>
          <span className="hci-print-value">{contractName || emptyDash}</span>
        </div>
        <div className="hci-print-row">
          <span className="hci-print-label">Teléfono/Celular:</span>
          <span className="hci-print-value">{patient.phone || emptyDash}</span>
        </div>
        <div className="hci-print-row">
          <span className="hci-print-label">Servicio:</span>
          <span className="hci-print-value">{patient.careScope}</span>
        </div>
        {/* Las fechas van juntas en su propia fila, se muestre o no "Sexo". */}
        <div className="hci-print-row hci-print-row--new-line">
          <span className="hci-print-label">Fecha de admisión:</span>
          <span className="hci-print-value">
            {formatDateTime(admissionDate) || emptyDash}
          </span>
        </div>
        <div className="hci-print-row">
          <span className="hci-print-label">Fecha de egreso:</span>
          <span className="hci-print-value">{dischargeLabel}</span>
        </div>
      </div>
    </div>
  );
};
