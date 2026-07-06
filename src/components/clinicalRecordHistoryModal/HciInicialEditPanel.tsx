"use client"

import { HciInicialTabsForm } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/hci/HciInicialTabsForm"
import { useHciInicialForm } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/hci/useHciInicialForm"
import type { DiagnosisRow } from "@/app/container/care/clinicalRecords/initialClinicalHistory/types"
import { Input } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"

interface Props {
  admissionId: string | number
  patientName: string
  messageApi: MessageInstance
}

export const HciInicialEditPanel = ({ admissionId, patientName, messageApi }: Props) => {
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>([])
  const [admissionDate, setAdmissionDate] = useState("")
  const [admissionDateHydrated, setAdmissionDateHydrated] = useState(false)

  const form = useHciInicialForm({
    admissionId,
    diagnoses,
    onDiagnosesChange: setDiagnoses,
    patientName,
    messageApi,
    admissionDate,
    editMode: true,
  })

  useEffect(() => {
    if (!form.existingHCInicial || admissionDateHydrated) return
    setAdmissionDate(form.existingHCInicial.admissionDate?.slice(0, 10) || "")
    setAdmissionDateHydrated(true)
  }, [form.existingHCInicial, admissionDateHydrated])

  return (
    <div className="chrm-hci-edit">
      <div className="chrm-hci-edit-date">
        <span className="chrm-detail-field-label">Fecha de atención</span>
        <Input
          type="date"
          size="small"
          value={admissionDate}
          onChange={(e) => setAdmissionDate(e.target.value)}
          style={{ maxWidth: 200, marginTop: 4 }}
        />
      </div>
      <HciInicialTabsForm
        {...form}
        editMode
        diagnoses={diagnoses}
        onDiagnosesChange={setDiagnoses}
      />
    </div>
  )
}
