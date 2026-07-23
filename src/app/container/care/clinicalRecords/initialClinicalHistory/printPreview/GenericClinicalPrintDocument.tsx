"use client";

import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import { ClinicalDocumentHeader } from "./ClinicalDocumentHeader";
import { FieldRow, formatDoctorSignatureName, type PrintPatient } from "./printDocument.utils";
import "./hciPrintPreview.css";

export interface ClinicalPrintSection {
  title: string;
  rows: { label: string; value?: string | number | null }[];
}

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionDate: string;
  contractName: string;
  documentTitle: string;
  attentionLabel: string;
  attentionDate: string;
  attentionTime: string;
  sections: ClinicalPrintSection[];
  doctorName: string;
  doctorUser?: GetUser;
}

export const GenericClinicalPrintDocument = ({
  provider,
  patient,
  admissionDate,
  contractName,
  documentTitle,
  attentionLabel,
  attentionDate,
  attentionTime,
  sections,
  doctorName,
  doctorUser,
}: Props) => {
  console.log("[GenericClinicalPrintDocument] doctorUser:", {
    doctorName,
    id: doctorUser?.id,
    hasSignature: !!doctorUser?.signature,
    signatureLength: doctorUser?.signature?.length,
    doctorUser,
  });
  return (
  <div className="hci-print-page">
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle={documentTitle}
      attentionLabel={attentionLabel}
      attentionDate={attentionDate}
      attentionTime={attentionTime}
    />

    <div className="hci-print-body">
      {sections.map((section) => (
        <div className="hci-print-section" key={section.title}>
          <div className="hci-print-section-title">{section.title}</div>
          <div className="hci-print-fieldtable">
            {section.rows.map((row) => (
              <FieldRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>
      ))}

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
    </div>
  </div>
  );
};
