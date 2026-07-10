"use client"

import { HistoryOutlined } from "@ant-design/icons"
import { Button, Input, InputNumber, Typography } from "antd"
import { useMemo, useState } from "react"
import { antecedentesFields, labelStyle, physicalExamFields, sectionCardStyle } from "../../constants"
import type { AntecedentesState, PhysicalExamState, VitalsState } from "../../types"
import { AntecedentesHistoryModal } from "./AntecedentesHistoryModal"

interface Props {
  vitals: VitalsState
  onVitalsChange: (vitals: VitalsState) => void
  physicalExam: PhysicalExamState
  onPhysicalExamChange: (physicalExam: PhysicalExamState) => void
  antecedentes: AntecedentesState
  onAntecedentesChange: (antecedentes: AntecedentesState) => void
  disabled?: boolean
  patientId?: string | number
  admissionId?: string | number
}

const vitalsConfig: Array<{
  label: string
  key: keyof VitalsState
  isString?: boolean
  min?: number
  max?: number
  step?: number
}> = [
  { label: "TA", key: "ta", isString: true },
  { label: "FC", key: "fc", min: 0, max: 300 },
  { label: "FR", key: "fr", min: 0, max: 100 },
  { label: "Temp.", key: "temperature", min: 0, max: 50, step: 0.1 },
  { label: "Sat. O₂", key: "saturation", min: 0, max: 100 },
  { label: "Glasgow", key: "glasgow", min: 0, max: 15 },
  { label: "Peso kg", key: "weight", min: 0, max: 500, step: 0.1 },
  { label: "Talla cm", key: "height", min: 0, max: 300 },
]

export const ObjectiveTab = ({
  vitals,
  onVitalsChange,
  physicalExam,
  onPhysicalExamChange,
  antecedentes,
  onAntecedentesChange,
  disabled,
  patientId,
  admissionId,
}: Props) => {
  const [antecedentesHistoryOpen, setAntecedentesHistoryOpen] = useState(false)

  const bmi = useMemo(() => {
    const h = vitals.height / 100
    if (!h || !vitals.weight) return ""
    return (vitals.weight / (h * h)).toFixed(1)
  }, [vitals.height, vitals.weight])

  return (
    <div className="tab-section-inner">
      <Typography.Title level={5} style={{ marginTop: 0 }}>2. Objetivo</Typography.Title>
      <div className="evolution-objective-grid">
        <div style={sectionCardStyle}>
          <Typography.Text strong>Examen físico</Typography.Text>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {physicalExamFields.map(({ key, label }) => (
              <div className="physical-exam-row" key={key}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text-secondary, #344054)" }}>
                  {label} <span className="field-required">*</span>
                </span>
                <Input
                  size="small"
                  value={physicalExam[key]}
                  onChange={(e) => onPhysicalExamChange({ ...physicalExam, [key]: e.target.value })}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={sectionCardStyle}>
          <Typography.Text strong>Signos vitales</Typography.Text>
          <div className="vital-signs-grid">
            {vitalsConfig.map(({ label, key, isString, min, max, step }) => (
              <div key={key}>
                <label style={labelStyle}>{label} <span className="field-required">*</span></label>
                {isString ? (
                  <Input
                    value={vitals[key] as string}
                    onChange={(e) => onVitalsChange({ ...vitals, [key]: e.target.value })}
                    disabled={disabled}
                  />
                ) : (
                  <InputNumber
                    style={{ width: "100%" }}
                    value={vitals[key] as number}
                    min={min}
                    max={max}
                    step={step ?? 1}
                    onChange={(v) => onVitalsChange({ ...vitals, [key]: Number(v) || 0 })}
                    disabled={disabled}
                  />
                )}
              </div>
            ))}
            <div>
              <label style={labelStyle}>IMC</label>
              <Input value={bmi ? `${bmi} kg/m²` : ""} readOnly />
            </div>
          </div>
        </div>

        <div style={{ ...sectionCardStyle, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <Typography.Text strong>Antecedentes Personales y Familiares</Typography.Text>
            <Button
              size="small"
              icon={<HistoryOutlined />}
              disabled={!patientId}
              onClick={() => setAntecedentesHistoryOpen(true)}
            >
              Histórico de antecedentes
            </Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 12, marginTop: 12 }}>
            {antecedentesFields.map(({ key, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label} <span className="field-required">*</span></label>
                <Input
                  value={antecedentes[key]}
                  onChange={(e) => onAntecedentesChange({ ...antecedentes, [key]: e.target.value })}
                  placeholder={`Ingrese ${label.toLowerCase()}`}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <AntecedentesHistoryModal
        open={antecedentesHistoryOpen}
        onClose={() => setAntecedentesHistoryOpen(false)}
        patientId={patientId}
        admissionId={admissionId}
      />
    </div>
  )
}
