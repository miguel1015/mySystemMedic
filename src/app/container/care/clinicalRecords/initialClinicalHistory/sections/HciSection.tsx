"use client";

import type { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";
import ClinicalRecordHistoryModal from "@/components/clinicalRecordHistoryModal";
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger";
import type { DiagnosisRow } from "../types";
import { HciInicialTabsForm } from "./hci/HciInicialTabsForm";
import { useHciInicialForm } from "./hci/useHciInicialForm";

interface Props {
  admissionId?: string | number;
  patientId?: string | number;
  diagnoses: DiagnosisRow[];
  onDiagnosesChange: (diagnoses: DiagnosisRow[]) => void;
  patientName: string;
  messageApi: MessageInstance;
  admissionDate: string;
  editMode?: boolean;
}

export const HciSection = ({
  admissionId,
  patientId,
  diagnoses,
  onDiagnosesChange,
  patientName,
  messageApi,
  admissionDate,
  editMode = false,
}: Props) => {
  const [historyOpen, setHistoryOpen] = useState(false);

  const form = useHciInicialForm({
    admissionId,
    diagnoses,
    onDiagnosesChange,
    patientName,
    messageApi,
    admissionDate,
    editMode,
  });

  return (
    <>
      <HciInicialTabsForm
        {...form}
        editMode={editMode}
        diagnoses={diagnoses}
        onDiagnosesChange={onDiagnosesChange}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="initial-clinical-history"
        onClick={() => setHistoryOpen(true)}
      />
      <ClinicalRecordHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        moduleType="initial-clinical-history"
        admissionId={admissionId}
        patientId={patientId}
      />
    </>
  );
};
