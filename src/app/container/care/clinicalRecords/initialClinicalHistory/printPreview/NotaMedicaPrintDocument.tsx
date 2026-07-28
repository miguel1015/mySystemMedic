"use client";

import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import { ClinicalDocumentHeader } from "./ClinicalDocumentHeader";
import { DoctorSignatureBox, FieldRow, type PrintPatient } from "./printDocument.utils";
import "./hciPrintPreview.css";

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionId?: string | number;
  admissionDate: string;
  contractName: string;
  fechaNota: string;
  horaNota: string;
  doctorName: string;
  doctorUser?: GetUser;
  nota: string;
}

export const NotaMedicaPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  fechaNota,
  horaNota,
  doctorName,
  doctorUser,
  nota,
}: Props) => {
  return (
  <div className="hci-print-page">
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionId={admissionId}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle="Nota Médica"
      attentionLabel="Fecha y hora de la nota:"
      attentionDate={fechaNota}
      attentionTime={horaNota?.slice(0, 5)}
    />

    <div className="hci-print-body">
      <div className="hci-print-section">
        <div className="hci-print-section-title">Nota Médica</div>
        <div className="hci-print-fieldtable">
          <FieldRow label="Nota médica" value={nota} />
        </div>
      </div>

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
