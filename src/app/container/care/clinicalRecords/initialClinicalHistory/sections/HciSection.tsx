"use client"

import { MedicineBoxOutlined } from "@ant-design/icons"
import { Button } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useState } from "react"
import { clinicalTabs } from "../constants"
import type { DiagnosisRow, VitalsState } from "../types"
import { AnalysisTab } from "./hci/AnalysisTab"
import { DiagnosesTab } from "./hci/DiagnosesTab"
import { ObjectiveTab } from "./hci/ObjectiveTab"
import { PlanTab } from "./hci/PlanTab"
import { SubjectiveTab } from "./hci/SubjectiveTab"

interface Props {
  diagnoses: DiagnosisRow[]
  onDiagnosesChange: (diagnoses: DiagnosisRow[]) => void
  patientName: string
  messageApi: MessageInstance
}

const defaultVitals: VitalsState = {
  ta: "120/80", fc: 80, fr: 18,
  temperature: 36.5, saturation: 98,
  glasgow: 15, weight: 80, height: 175,
}

export const HciSection = ({ diagnoses, onDiagnosesChange, patientName, messageApi }: Props) => {
  const [activeSection, setActiveSection] = useState("subjective")
  const [vitals, setVitals] = useState<VitalsState>(defaultVitals)

  const validateAndSave = () => {
    const hasMain = diagnoses.some((item) => item.main && item.code && item.diagnosis)
    const hasEmpty = diagnoses.some((item) => !item.code || !item.diagnosis)
    if (!hasMain) { messageApi.error("Debe registrar un diagnóstico principal."); return }
    if (hasEmpty) { messageApi.warning("Complete o elimine los diagnósticos incompletos."); return }
    messageApi.success(`Historia clínica guardada para ${patientName}.`)
  }

  return (
    <>
      <nav className="clinical-section-tabs" aria-label="Secciones de historia clínica">
        {clinicalTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeSection === tab.key ? "active" : ""}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="evolution-tab-content">
        {activeSection === "subjective" && <SubjectiveTab />}
        {activeSection === "objective" && (
          <ObjectiveTab vitals={vitals} onVitalsChange={setVitals} />
        )}
        {activeSection === "analysis" && <AnalysisTab />}
        {activeSection === "diagnoses" && (
          <DiagnosesTab diagnoses={diagnoses} onDiagnosesChange={onDiagnosesChange} />
        )}
        {activeSection === "plan" && <PlanTab />}

        <div className="clinical-history-footer-actions">
          <Button>Limpiar formulario</Button>
          <Button type="primary" icon={<MedicineBoxOutlined />} onClick={validateAndSave}>
            Guardar
          </Button>
        </div>
      </div>
    </>
  )
}
