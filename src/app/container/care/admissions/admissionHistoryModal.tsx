"use client"

import Modal from "@/components/modal"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { useSearchAdmissions } from "@/core/hooks/care/admissions/useSearchAdmissions"
import AdmissionsTable from "./table"

interface AdmissionHistoryModalProps {
  admission: AdmissionResponse | null
  onClose: () => void
}

export default function AdmissionHistoryModal({
  admission,
  onClose,
}: AdmissionHistoryModalProps) {
  const { data, isLoading } = useSearchAdmissions(
    admission ? { patientId: admission.patientId } : null,
  )

  return (
    <Modal
      open={!!admission}
      onClose={onClose}
      title={
        admission
          ? `Historial de admisiones · ${admission.nombrePaciente} (${admission.documentTypeCode} ${admission.documentoPatiente})`
          : "Historial de admisiones"
      }
      size="xl"
    >
      <AdmissionsTable
        data={data ?? []}
        isLoading={isLoading}
        withActions={false}
        emptyText="El paciente no tiene admisiones registradas"
      />
    </Modal>
  )
}
