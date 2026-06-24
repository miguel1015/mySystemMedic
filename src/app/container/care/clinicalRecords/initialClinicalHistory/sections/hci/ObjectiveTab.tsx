"use client"

import { Input, InputNumber, Typography } from "antd"
import { useMemo, useState } from "react"
import { labelStyle, physicalExamSections, sectionCardStyle } from "../../constants"
import type { VitalsState } from "../../types"

const antecedentesFields = [
  "Padres",
  "Personales - Médicos",
  "Otros Familiares",
  "Alérgicos",
  "Quirúrgicos",
  "Tóxicos",
  "Transfusiones",
  "Hábitos",
  "Traumas",
] as const

type AntecedentesKey = typeof antecedentesFields[number]
type AntecedentesState = Record<AntecedentesKey, string>

interface Props {
  vitals: VitalsState
  onVitalsChange: (vitals: VitalsState) => void
}

const vitalsConfig: Array<{ label: string; key: keyof VitalsState; isString?: boolean }> = [
  { label: "TA", key: "ta", isString: true },
  { label: "FC", key: "fc" },
  { label: "FR", key: "fr" },
  { label: "Temp.", key: "temperature" },
  { label: "Sat. O₂", key: "saturation" },
  { label: "Glasgow", key: "glasgow" },
  { label: "Peso kg", key: "weight" },
  { label: "Talla cm", key: "height" },
]

const defaultAntecedentes = Object.fromEntries(
  antecedentesFields.map((f) => [f, ""])
) as AntecedentesState

export const ObjectiveTab = ({ vitals, onVitalsChange }: Props) => {
  const [antecedentes, setAntecedentes] = useState<AntecedentesState>(defaultAntecedentes)

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
            {physicalExamSections.map((section) => (
              <div className="physical-exam-row" key={section}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text-secondary, #344054)" }}>
                  {section}
                </span>
                <Input
                  size="small"
                  defaultValue={section === "Abdomen" ? "Blando, depresible, dolor a la palpación" : "Sin alteraciones aparentes"}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={sectionCardStyle}>
          <Typography.Text strong>Signos vitales</Typography.Text>
          <div className="vital-signs-grid">
            {vitalsConfig.map(({ label, key, isString }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                {isString ? (
                  <Input
                    value={vitals[key] as string}
                    onChange={(e) => onVitalsChange({ ...vitals, [key]: e.target.value })}
                  />
                ) : (
                  <InputNumber
                    style={{ width: "100%" }}
                    value={vitals[key] as number}
                    onChange={(v) => onVitalsChange({ ...vitals, [key]: Number(v) || 0 })}
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
          <Typography.Text strong>Antecedentes Personales y Familiares</Typography.Text>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 12, marginTop: 12 }}>
            {antecedentesFields.map((field) => (
              <div key={field}>
                <label style={labelStyle}>{field}</label>
                <Input
                  value={antecedentes[field]}
                  onChange={(e) => setAntecedentes((prev) => ({ ...prev, [field]: e.target.value }))}
                  placeholder={`Ingrese ${field.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
