"use client";

import type { TProvider } from "@/core/interfaces/parameterization/types";
import {
  calculateAge,
  emptyDash,
  formatDateTime,
  type PrintPatient,
} from "./printDocument.utils";

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionDate: string;
  contractName: string;
  documentTitle: string;
  attentionLabel: string;
  attentionDate: string;
  attentionTime: string;
}

export const ClinicalDocumentHeader = ({
  provider,
  patient,
  admissionDate,
  contractName,
  documentTitle,
  attentionLabel,
  attentionDate,
  attentionTime,
}: Props) => (
  <div className="hci-print-header-block">
    <div className="hci-print-header">
      <div className="hci-print-logo">
        <img src="/assets/img/avatars/logoPdf.png" alt="Logo" />
      </div>
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
        <div>N° {patient.documentNumber || emptyDash}</div>
      </div>
    </div>

    <div className="hci-print-title">{documentTitle}</div>

    <div className="hci-print-patient-grid">
      <div className="hci-print-row">
        <span className="hci-print-label">Fecha de admisión:</span>
        <span className="hci-print-value">
          {formatDateTime(admissionDate) || emptyDash}
        </span>
      </div>
      <div className="hci-print-row">
        <span className="hci-print-label">Paciente:</span>
        <span className="hci-print-value">{patient.name?.toUpperCase()}</span>
      </div>
      <div className="hci-print-row">
        <span className="hci-print-label">Documento:</span>
        <span className="hci-print-value">
          {patient.documentType} {patient.documentNumber}
        </span>
      </div>
      <div className="hci-print-row">
        <span className="hci-print-label">Aseguradora:</span>
        <span className="hci-print-value">{patient.insurer}</span>
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
    </div>

    <div className="hci-print-row">
      <span className="hci-print-label">{attentionLabel}</span>
      <span className="hci-print-value">
        {attentionDate || emptyDash} {attentionTime || emptyDash}
      </span>
    </div>
  </div>
);
