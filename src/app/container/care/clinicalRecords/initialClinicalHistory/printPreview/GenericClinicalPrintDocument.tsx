"use client";

import { useMemo } from "react";
import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import { ClinicalDocumentHeader } from "./ClinicalDocumentHeader";
import { DoctorSignatureBox, type PrintPatient } from "./printDocument.utils";
import { PaginatedPages, usePaginatedUnits, type Unit } from "./printPagination";
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
  const headerBlock = (
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
  );

  const units = useMemo<Unit[]>(() => {
    const list: Unit[] = [];

    sections.forEach((section, sectionIdx) => {
      section.rows.forEach((row, rowIdx) => {
        list.push({
          kind: "field",
          id: `section-${sectionIdx}-row-${rowIdx}`,
          sectionKey: `section-${sectionIdx}`,
          sectionTitle: section.title,
          isFirst: rowIdx === 0,
          label: row.label,
          value: row.value,
        });
      });
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
  }, [sections, doctorName, doctorUser]);

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock);

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} />
    </>
  );
};
