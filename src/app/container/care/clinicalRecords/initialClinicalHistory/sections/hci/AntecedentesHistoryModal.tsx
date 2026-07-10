"use client"

import { AuditOutlined } from "@ant-design/icons"
import Modal from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { AntecedentesHistoryList } from "./AntecedentesHistoryList"

interface Props {
  open: boolean
  onClose: () => void
  patientId?: string | number
  admissionId?: string | number
}

export const AntecedentesHistoryModal = ({ open, onClose, patientId, admissionId }: Props) => (
  <Modal
    open={open}
    onClose={onClose}
    size="xl"
    title={
      <span className="chrm-title">
        <AuditOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
        Antecedentes · Histórico del paciente
      </span>
    }
  >
    <AntecedentesHistoryList patientId={patientId} admissionId={admissionId} />
  </Modal>
)
