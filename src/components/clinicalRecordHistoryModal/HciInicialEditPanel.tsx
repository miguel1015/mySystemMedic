"use client"

import { HciInicialTabsForm } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/hci/HciInicialTabsForm"
import { useHciInicialForm } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/hci/useHciInicialForm"
import type { DiagnosisRow } from "@/app/container/care/clinicalRecords/initialClinicalHistory/types"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"

interface Props {
  admissionId: string | number
  patientId?: string | number
  patientName: string
  messageApi: MessageInstance
}

export const HciInicialEditPanel = ({ admissionId, patientId, patientName, messageApi }: Props) => {
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>([])
  const [admissionDate, setAdmissionDate] = useState("")
  const [admissionDateHydrated, setAdmissionDateHydrated] = useState(false)
  const [admissionTime, setAdmissionTime] = useState("")
  const [admissionTimeHydrated, setAdmissionTimeHydrated] = useState(false)

  const form = useHciInicialForm({
    admissionId,
    diagnoses,
    onDiagnosesChange: setDiagnoses,
    patientName,
    messageApi,
    admissionDate,
    admissionTime,
    onAdmissionDateChange: setAdmissionDate,
    onAdmissionTimeChange: setAdmissionTime,
    editMode: true,
  })

  useEffect(() => {
    if (!form.existingHCInicial || admissionDateHydrated) return
    setAdmissionDate(form.existingHCInicial.admissionDate?.slice(0, 10) || "")
    setAdmissionDateHydrated(true)
  }, [form.existingHCInicial, admissionDateHydrated])

  useEffect(() => {
    if (!form.existingHCInicial || admissionTimeHydrated) return
    setAdmissionTime(form.existingHCInicial.admissionTime || "")
    setAdmissionTimeHydrated(true)
  }, [form.existingHCInicial, admissionTimeHydrated])

  return (
    <div className="chrm-hci-edit">
      <HciInicialTabsForm
        {...form}
        editMode
        diagnoses={diagnoses}
        onDiagnosesChange={setDiagnoses}
        patientId={patientId}
        admissionId={admissionId}
        admissionDate={admissionDate}
        admissionTime={admissionTime}
        onAdmissionDateChange={setAdmissionDate}
        onAdmissionTimeChange={setAdmissionTime}
      />
    </div>
  )
}
