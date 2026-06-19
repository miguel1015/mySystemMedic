"use client"

import { DeleteOutlined, MedicineBoxOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, DatePicker, Input, Select, Tag, Tooltip, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import type { Dayjs } from "dayjs"
import { useState } from "react"
import { anesthesiaTypeOptions, cie10Options, cupsOptions, labelStyle } from "../constants"
import type { QxSearchItem } from "../types"

interface Props {
  doctorOptions: { value: number; label: string }[]
  patientName: string
  messageApi: MessageInstance
}

const { TextArea } = Input

export const SurgicalDescriptionSection = ({ doctorOptions, patientName, messageApi }: Props) => {
  const [qxStartDate, setQxStartDate] = useState<Dayjs | null>(null)
  const [qxEndDate, setQxEndDate] = useState<Dayjs | null>(null)
  const [qxSurgeon, setQxSurgeon] = useState<number | undefined>()
  const [qxAnesthesiologist, setQxAnesthesiologist] = useState<number | undefined>()
  const [qxInstrumenter, setQxInstrumenter] = useState<number | undefined>()
  const [qxAssistant, setQxAssistant] = useState<number | undefined>()
  const [qxAnesthesiaType, setQxAnesthesiaType] = useState<string | undefined>()
  const [qxProcedures, setQxProcedures] = useState<QxSearchItem[]>([{ code: "", description: "" }])
  const [qxDiagnoses, setQxDiagnoses] = useState<QxSearchItem[]>([{ code: "", description: "" }])
  const [qxProcedureDescription, setQxProcedureDescription] = useState("")

  const addProcedure = () => {
    if (qxProcedures.length >= 4) return
    setQxProcedures((prev) => [...prev, { code: "", description: "" }])
  }

  const removeProcedure = (idx: number) => {
    setQxProcedures((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateProcedure = (idx: number, patch: Partial<QxSearchItem>) => {
    setQxProcedures((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  const addDiagnosis = () => {
    if (qxDiagnoses.length >= 4) return
    setQxDiagnoses((prev) => [...prev, { code: "", description: "" }])
  }

  const removeDiagnosis = (idx: number) => {
    setQxDiagnoses((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateDiagnosis = (idx: number, patch: Partial<QxSearchItem>) => {
    setQxDiagnoses((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  const reset = () => {
    setQxStartDate(null)
    setQxEndDate(null)
    setQxSurgeon(undefined)
    setQxAnesthesiologist(undefined)
    setQxInstrumenter(undefined)
    setQxAssistant(undefined)
    setQxAnesthesiaType(undefined)
    setQxProcedures([{ code: "", description: "" }])
    setQxDiagnoses([{ code: "", description: "" }])
    setQxProcedureDescription("")
  }

  const validateAndSave = () => {
    if (!qxStartDate) { messageApi.error("La fecha inicial de ejecución es obligatoria."); return }
    if (!qxEndDate) { messageApi.error("La fecha final de ejecución es obligatoria."); return }
    if (qxEndDate.isBefore(qxStartDate)) { messageApi.error("La fecha final no puede ser menor que la fecha inicial."); return }
    if (!qxSurgeon) { messageApi.error("El cirujano es obligatorio."); return }
    if (!qxAnesthesiologist) { messageApi.error("El anestesiólogo es obligatorio."); return }
    if (!qxInstrumenter) { messageApi.error("El instrumentador es obligatorio."); return }
    if (!qxAssistant) { messageApi.error("El ayudante quirúrgico es obligatorio."); return }
    if (!qxAnesthesiaType) { messageApi.error("El tipo de anestesia es obligatorio."); return }
    if (!qxProcedures[0]?.code) { messageApi.error("El procedimiento principal (CUPS/SOAT) es obligatorio."); return }
    if (!qxDiagnoses[0]?.code) { messageApi.error("El diagnóstico de ingreso principal (CIE-10) es obligatorio."); return }
    if (!qxProcedureDescription.trim()) { messageApi.error("La descripción del procedimiento es obligatoria."); return }
    messageApi.success(`Descripción quirúrgica guardada para ${patientName}.`)
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-description-form">
        <div className="qx-form-header">
          <MedicineBoxOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
          <Typography.Title level={5} style={{ margin: 0 }}>Descripción Quirúrgica</Typography.Title>
        </div>

        <div className="qx-section">
          <div className="qx-section-header">
            <span className="section-number">1</span>
            <span className="section-title">Fechas de ejecución</span>
          </div>
          <div className="qx-grid-2">
            <div>
              <label style={labelStyle}>
                Fecha inicial de ejecución <span className="field-required">*</span>
              </label>
              <DatePicker showTime format="DD/MM/YYYY HH:mm" value={qxStartDate} onChange={setQxStartDate}
                style={{ width: "100%" }} placeholder="Seleccione fecha y hora" />
            </div>
            <div>
              <label style={labelStyle}>
                Fecha final de ejecución <span className="field-required">*</span>
              </label>
              <DatePicker showTime format="DD/MM/YYYY HH:mm" value={qxEndDate} onChange={setQxEndDate}
                style={{ width: "100%" }} placeholder="Seleccione fecha y hora"
                disabledDate={(current) =>
                  qxStartDate ? current && current.isBefore(qxStartDate.startOf("day")) : false
                }
              />
              {qxStartDate && qxEndDate && qxEndDate.isBefore(qxStartDate) && (
                <span className="qx-field-error">La fecha final no puede ser menor que la fecha inicial.</span>
              )}
            </div>
          </div>
        </div>

        <div className="qx-section">
          <div className="qx-section-header">
            <span className="section-number">2</span>
            <span className="section-title">Equipo quirúrgico</span>
          </div>
          <div className="qx-grid-2">
            <div>
              <label style={labelStyle}>Cirujano <span className="field-required">*</span></label>
              <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione cirujano"
                value={qxSurgeon} options={doctorOptions} onChange={setQxSurgeon} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>Anestesiólogo <span className="field-required">*</span></label>
              <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione anestesiólogo"
                value={qxAnesthesiologist} options={doctorOptions} onChange={setQxAnesthesiologist} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>Instrumentador <span className="field-required">*</span></label>
              <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione instrumentador"
                value={qxInstrumenter} options={doctorOptions} onChange={setQxInstrumenter} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>Ayudante Qx <span className="field-required">*</span></label>
              <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione ayudante quirúrgico"
                value={qxAssistant} options={doctorOptions} onChange={setQxAssistant} style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        <div className="qx-section">
          <div className="qx-section-header">
            <span className="section-number">3</span>
            <span className="section-title">Tipo de anestesia</span>
          </div>
          <div className="qx-field-narrow">
            <label style={labelStyle}>Tipo de anestesia <span className="field-required">*</span></label>
            <Select placeholder="Seleccione tipo de anestesia" value={qxAnesthesiaType}
              options={anesthesiaTypeOptions} onChange={setQxAnesthesiaType} style={{ width: "100%" }} />
          </div>
        </div>

        <div className="qx-section">
          <div className="qx-section-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="section-number">4</span>
              <span className="section-title">Procedimientos (CUPS/SOAT)</span>
            </div>
            {qxProcedures.length < 4 && (
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addProcedure}>
                Agregar procedimiento
              </Button>
            )}
          </div>
          <div className="qx-items-list">
            {qxProcedures.map((proc, idx) => (
              <div key={idx} className="qx-item-row">
                <div className="qx-item-tag-wrap">
                  <Tag color={idx === 0 ? "blue" : "default"}>
                    {idx === 0 ? "Principal *" : `Procedimiento ${idx + 1}`}
                    {idx > 0 && <span className="qx-optional-text"> – Opcional</span>}
                  </Tag>
                </div>
                <div className="qx-item-fields">
                  <Select showSearch={{ optionFilterProp: "label" }}
                    placeholder="Buscar por código CUPS/SOAT o descripción"
                    value={proc.code || undefined} options={cupsOptions}
                    style={{ flex: "1 1 220px", minWidth: 0 }}
                    onChange={(value) => {
                      const found = cupsOptions.find((o) => o.value === value)
                      updateProcedure(idx, { code: value, description: found?.description || "" })
                    }}
                  />
                  <Input placeholder="Descripción del procedimiento" value={proc.description}
                    onChange={(e) => updateProcedure(idx, { description: e.target.value })}
                    style={{ flex: "1 1 200px", minWidth: 0 }} />
                  {idx > 0 && (
                    <Tooltip title="Eliminar procedimiento">
                      <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeProcedure(idx)} />
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="qx-section">
          <div className="qx-section-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="section-number">5</span>
              <span className="section-title">Diagnósticos de ingreso (CIE-10)</span>
            </div>
            {qxDiagnoses.length < 4 && (
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addDiagnosis}>
                Agregar diagnóstico
              </Button>
            )}
          </div>
          <div className="qx-items-list">
            {qxDiagnoses.map((diag, idx) => (
              <div key={idx} className="qx-item-row">
                <div className="qx-item-tag-wrap">
                  <Tag color={idx === 0 ? "blue" : "default"}>
                    {idx === 0 ? "Principal *" : `Diagnóstico ${idx + 1}`}
                    {idx > 0 && <span className="qx-optional-text"> – Opcional</span>}
                  </Tag>
                </div>
                <div className="qx-item-fields">
                  <Select showSearch={{ optionFilterProp: "label" }}
                    placeholder="Buscar por código CIE-10 o descripción"
                    value={diag.code || undefined} options={cie10Options}
                    style={{ flex: "1 1 220px", minWidth: 0 }}
                    onChange={(value) => {
                      const found = cie10Options.find((o) => o.value === value)
                      updateDiagnosis(idx, { code: value, description: found?.diagnosis || "" })
                    }}
                  />
                  <Input placeholder="Descripción del diagnóstico" value={diag.description}
                    onChange={(e) => updateDiagnosis(idx, { description: e.target.value })}
                    style={{ flex: "1 1 200px", minWidth: 0 }} />
                  {idx > 0 && (
                    <Tooltip title="Eliminar diagnóstico">
                      <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeDiagnosis(idx)} />
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="qx-section">
          <div className="qx-section-header">
            <span className="section-number">6</span>
            <span className="section-title">Descripción del procedimiento</span>
          </div>
          <label className="field-label">
            Descripción del procedimiento <span className="field-required">*</span>
          </label>
          <TextArea rows={8} value={qxProcedureDescription}
            onChange={(e) => setQxProcedureDescription(e.target.value)}
            placeholder="Describa de forma detallada el acto quirúrgico realizado, hallazgos intraoperatorios, técnica empleada y demás consideraciones clínicas relevantes..."
            maxLength={10000}
          />
          <div className="char-count-row">{qxProcedureDescription.length} / 10000</div>
        </div>
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={reset}>Limpiar formulario</Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>
          Guardar descripción quirúrgica
        </Button>
      </div>
    </div>
  )
}
