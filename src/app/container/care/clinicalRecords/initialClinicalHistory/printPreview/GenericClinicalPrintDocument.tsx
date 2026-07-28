"use client";

import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import { ClinicalDocumentHeader } from "./ClinicalDocumentHeader";
import { DoctorSignatureBox, FieldRow, type PrintPatient } from "./printDocument.utils";
import "./hciPrintPreview.css";

export interface ClinicalPrintSection {
  title: string;
  rows: { label: string; value?: string | number | null }[];
}

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionId?: string | number;
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
  admissionId,
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
  return (
  <div className="hci-print-page">
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionId={admissionId}
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
        <DoctorSignatureBox doctorName={doctorName} doctorUser={doctorUser} />
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
