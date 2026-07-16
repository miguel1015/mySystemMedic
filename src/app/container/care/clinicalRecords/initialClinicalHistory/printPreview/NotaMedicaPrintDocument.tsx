"use client";

import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import { ClinicalDocumentHeader } from "./ClinicalDocumentHeader";
import { FieldRow, formatDoctorSignatureName, type PrintPatient } from "./printDocument.utils";
import "./hciPrintPreview.css";

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
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
  admissionDate,
  contractName,
  fechaNota,
  horaNota,
  doctorName,
  doctorUser,
  nota,
}: Props) => (
  <div className="hci-print-page">
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
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
