"use client"

import { DeleteOutlined, EyeOutlined, MedicineBoxOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, DatePicker, Input, Select, Tag, Tooltip, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import dayjs, { type Dayjs } from "dayjs"
import { useEffect, useState } from "react"
import { useCreateDescripcionQuirurgica } from "@/core/hooks/care/descripcionesQuirurgicas/useCreateDescripcionQuirurgica"
import { useUpdateDescripcionQuirurgica } from "@/core/hooks/care/descripcionesQuirurgicas/useUpdateDescripcionQuirurgica"
import { useGetDescripcionQuirurgicaByAdmission } from "@/core/hooks/care/descripcionesQuirurgicas/useGetDescripcionQuirurgicaByAdmission"
import { useGetAnesthesiaTypes } from "@/core/hooks/care/anesthesiaTypes/useGetAnesthesiaTypes"
import { surgicalProcedureServices } from "@/core/hooks/care/surgicalProcedures/useSearchSurgicalProcedures"
import { cie10Services } from "@/core/hooks/care/cie10/useSearchCie10"
import { useGetUsersByProfile } from "@/core/hooks/users/useGetUsersByProfile"
import type { DescripcionQuirurgicaResponse } from "@/core/interfaces/care/hciInicial"
import { QX_TEAM_PROFILES, labelStyle } from "../constants"
import type { QxSearchItem } from "../types"
import { CodeSearchSelect } from "./CodeSearchSelect"
import { DescripcionQuirurgicaPreviewModal } from "./DescripcionQuirurgicaPreviewModal"
import type { DescripcionQuirurgicaViewData } from "./DescripcionQuirurgicaDetailView"

interface Props {
  admissionId?: string | number
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
}

const { TextArea } = Input

const emptyItem: QxSearchItem = { code: "", description: "" }

const resolveProcedureDescription = async (code: string): Promise<string> => {
  if (!code) return ""
  try {
    const results = await surgicalProcedureServices.search(code)
    const match = results.find((r) => r.code.toLowerCase() === code.toLowerCase())
    return match?.codeDescription || match?.cupsDescription || ""
  } catch {
    return ""
  }
}

const resolveDiagnosisDescription = async (code: string): Promise<string> => {
  if (!code) return ""
  try {
    const results = await cie10Services.search(code)
    const match = results.find((r) => r.codigo.toLowerCase() === code.toLowerCase())
    return match?.descripcion || ""
  } catch {
    return ""
  }
}

export const SurgicalDescriptionSection = ({ admissionId, patientName, messageApi, historyClosed }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [qxStartDate, setQxStartDate] = useState<Dayjs | null>(null)
  const [qxEndDate, setQxEndDate] = useState<Dayjs | null>(null)
  const [qxSurgeon, setQxSurgeon] = useState<number | undefined>()
  const [qxAnesthesiologist, setQxAnesthesiologist] = useState<number | undefined>()
  const [qxInstrumenter, setQxInstrumenter] = useState<number | undefined>()
  const [qxAssistant, setQxAssistant] = useState<number | undefined>()
  const [qxAnesthesiaType, setQxAnesthesiaType] = useState<number | undefined>()
  const [qxProcedures, setQxProcedures] = useState<QxSearchItem[]>([{ ...emptyItem }])
  const [qxDiagnoses, setQxDiagnoses] = useState<QxSearchItem[]>([{ ...emptyItem }])
  const [qxProcedureDescription, setQxProcedureDescription] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<DescripcionQuirurgicaViewData | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const { data: surgeons = [] } = useGetUsersByProfile(QX_TEAM_PROFILES.cirujano)
  const { data: anesthesiologists = [] } = useGetUsersByProfile(QX_TEAM_PROFILES.anestesiologo)
  const { data: instrumenters = [] } = useGetUsersByProfile(QX_TEAM_PROFILES.instrumentador)
  const { data: assistants = [] } = useGetUsersByProfile(QX_TEAM_PROFILES.ayudante)
  const { data: anesthesiaTypes = [] } = useGetAnesthesiaTypes()
  const { data: existingRecords, isLoading: isLoadingRecord } = useGetDescripcionQuirurgicaByAdmission(admissionId)

  const surgeonOptions = surgeons.map((u) => ({ value: u.id, label: u.fullName }))
  const anesthesiologistOptions = anesthesiologists.map((u) => ({ value: u.id, label: u.fullName }))
  const instrumenterOptions = instrumenters.map((u) => ({ value: u.id, label: u.fullName }))
  const assistantOptions = assistants.map((u) => ({ value: u.id, label: u.fullName }))
  const anesthesiaTypeOptions = anesthesiaTypes.map((a) => ({ value: a.id, label: a.name }))

  const createDescripcionQuirurgica = useCreateDescripcionQuirurgica()
  const updateDescripcionQuirurgica = useUpdateDescripcionQuirurgica()
  const isSaving = createDescripcionQuirurgica.isPending || updateDescripcionQuirurgica.isPending

  const loadFromRecord = async (record: DescripcionQuirurgicaResponse) => {
    setEditingId(record.id)
    setQxStartDate(dayjs(record.fechaHoraInicio))
    setQxEndDate(dayjs(record.fechaHoraFinalizacion))
    setQxSurgeon(record.cirujanoId)
    setQxAnesthesiologist(record.anestesiologoId)
    setQxInstrumenter(record.instrumentadorId)
    setQxAssistant(record.ayudanteQxId)
    setQxAnesthesiaType(record.tipoAnestesiaId)
    setQxProcedureDescription(record.descripcionProcedimiento || "")

    const procedureCodes = [record.procedimiento1, record.procedimiento2, record.procedimiento3, record.procedimiento4]
      .filter((c): c is string => !!c)
    const diagnosisCodes = [record.diagnostico1, record.diagnostico2, record.diagnostico3, record.diagnostico4]
      .filter((c): c is string => !!c)

    const [procedureDescriptions, diagnosisDescriptions] = await Promise.all([
      Promise.all(procedureCodes.map(resolveProcedureDescription)),
      Promise.all(diagnosisCodes.map(resolveDiagnosisDescription)),
    ])

    setQxProcedures(
      procedureCodes.length
        ? procedureCodes.map((code, idx) => ({ code, description: procedureDescriptions[idx] }))
        : [{ ...emptyItem }],
    )
    setQxDiagnoses(
      diagnosisCodes.length
        ? diagnosisCodes.map((code, idx) => ({ code, description: diagnosisDescriptions[idx] }))
        : [{ ...emptyItem }],
    )
  }

  const clearForm = () => {
    setEditingId(null)
    setQxStartDate(null)
    setQxEndDate(null)
    setQxSurgeon(undefined)
    setQxAnesthesiologist(undefined)
    setQxInstrumenter(undefined)
    setQxAssistant(undefined)
    setQxAnesthesiaType(undefined)
    setQxProcedures([{ ...emptyItem }])
    setQxDiagnoses([{ ...emptyItem }])
    setQxProcedureDescription("")
  }

  useEffect(() => {
    if (hydrated || isLoadingRecord) return
    if (existingRecords && existingRecords.length > 0) {
      loadFromRecord(existingRecords[0])
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingRecords, isLoadingRecord, hydrated])

  const reset = () => {
    if (existingRecords && existingRecords.length > 0) {
      loadFromRecord(existingRecords[0])
    } else {
      clearForm()
    }
  }

  const addProcedure = () => {
    if (qxProcedures.length >= 4) return
    setQxProcedures((prev) => [...prev, { ...emptyItem }])
  }

  const removeProcedure = (idx: number) => {
    setQxProcedures((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateProcedure = (idx: number, code: string, description: string) => {
    setQxProcedures((prev) => prev.map((item, i) => (i === idx ? { code, description } : item)))
  }

  const addDiagnosis = () => {
    if (qxDiagnoses.length >= 4) return
    setQxDiagnoses((prev) => [...prev, { ...emptyItem }])
  }

  const removeDiagnosis = (idx: number) => {
    setQxDiagnoses((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateDiagnosis = (idx: number, code: string, description: string) => {
    setQxDiagnoses((prev) => prev.map((item, i) => (i === idx ? { code, description } : item)))
  }

  const doctorLabel = (id: number | undefined, options: { value: number; label: string }[]) =>
    options.find((o) => o.value === id)?.label

  const openPreview = () => {
    setPreviewData({
      fechaInicio: qxStartDate ? qxStartDate.format("DD/MM/YYYY HH:mm") : "",
      fechaFin: qxEndDate ? qxEndDate.format("DD/MM/YYYY HH:mm") : "",
      cirujano: doctorLabel(qxSurgeon, surgeonOptions),
      anestesiologo: doctorLabel(qxAnesthesiologist, anesthesiologistOptions),
      instrumentador: doctorLabel(qxInstrumenter, instrumenterOptions),
      ayudante: doctorLabel(qxAssistant, assistantOptions),
      tipoAnestesia: anesthesiaTypeOptions.find((o) => o.value === qxAnesthesiaType)?.label,
      procedimientos: qxProcedures,
      diagnosticos: qxDiagnoses,
      descripcion: qxProcedureDescription,
    })
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar cambios en la descripción quirúrgica.")
      return
    }
    if (!admissionId) { messageApi.error("No se encontró la admisión asociada a esta descripción quirúrgica."); return }
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

    const payload = {
      fechaHoraInicio: qxStartDate.format("YYYY-MM-DDTHH:mm:ss"),
      fechaHoraFinalizacion: qxEndDate.format("YYYY-MM-DDTHH:mm:ss"),
      cirujanoId: qxSurgeon,
      anestesiologoId: qxAnesthesiologist,
      instrumentadorId: qxInstrumenter,
      ayudanteQxId: qxAssistant,
      tipoAnestesiaId: qxAnesthesiaType,
      procedimiento1: qxProcedures[0]?.code || null,
      procedimiento2: qxProcedures[1]?.code || null,
      procedimiento3: qxProcedures[2]?.code || null,
      procedimiento4: qxProcedures[3]?.code || null,
      diagnostico1: qxDiagnoses[0]?.code || null,
      diagnostico2: qxDiagnoses[1]?.code || null,
      diagnostico3: qxDiagnoses[2]?.code || null,
      diagnostico4: qxDiagnoses[3]?.code || null,
      descripcionProcedimiento: qxProcedureDescription.trim(),
    }

    try {
      const saved = editingId
        ? await updateDescripcionQuirurgica.mutateAsync({ id: editingId, data: { ...payload, isActive: true } })
        : await createDescripcionQuirurgica.mutateAsync({ admissionId: Number(admissionId), ...payload })

      setEditingId(saved.id)
      messageApi.success(
        editingId
          ? "Descripción quirúrgica actualizada correctamente."
          : `Descripción quirúrgica guardada para ${patientName}.`,
      )
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la descripción quirúrgica.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-description-form">
        <div className="qx-form-header">
          <MedicineBoxOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
          <Typography.Title level={5} style={{ margin: 0 }}>
            {editingId ? `Descripción Quirúrgica #${editingId}` : "Descripción Quirúrgica"}
          </Typography.Title>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Button icon={<EyeOutlined />} onClick={openPreview}>
              Vista previa
            </Button>
          </div>
        </div>

        {historyClosed && (
          <div className="qx-section-locked-banner">
            Esta historia clínica ya fue clausurada y no admite cambios en la descripción quirúrgica.
          </div>
        )}

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
                style={{ width: "100%" }} placeholder="Seleccione fecha y hora" disabled={historyClosed} />
            </div>
            <div>
              <label style={labelStyle}>
                Fecha final de ejecución <span className="field-required">*</span>
              </label>
              <DatePicker showTime format="DD/MM/YYYY HH:mm" value={qxEndDate} onChange={setQxEndDate}
                style={{ width: "100%" }} placeholder="Seleccione fecha y hora" disabled={historyClosed}
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
                value={qxSurgeon} options={surgeonOptions} onChange={setQxSurgeon} style={{ width: "100%" }}
                disabled={historyClosed} />
            </div>
            <div>
              <label style={labelStyle}>Anestesiólogo <span className="field-required">*</span></label>
              <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione anestesiólogo"
                value={qxAnesthesiologist} options={anesthesiologistOptions} onChange={setQxAnesthesiologist} style={{ width: "100%" }}
                disabled={historyClosed} />
            </div>
            <div>
              <label style={labelStyle}>Instrumentador <span className="field-required">*</span></label>
              <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione instrumentador"
                value={qxInstrumenter} options={instrumenterOptions} onChange={setQxInstrumenter} style={{ width: "100%" }}
                disabled={historyClosed} />
            </div>
            <div>
              <label style={labelStyle}>Ayudante Qx <span className="field-required">*</span></label>
              <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione ayudante quirúrgico"
                value={qxAssistant} options={assistantOptions} onChange={setQxAssistant} style={{ width: "100%" }}
                disabled={historyClosed} />
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
              options={anesthesiaTypeOptions} onChange={setQxAnesthesiaType} style={{ width: "100%" }}
              disabled={historyClosed} />
          </div>
        </div>

        <div className="qx-section">
          <div className="qx-section-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="section-number">4</span>
              <span className="section-title">Procedimientos (CUPS/SOAT)</span>
            </div>
            {qxProcedures.length < 4 && !historyClosed && (
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
                  <CodeSearchSelect
                    value={proc.code}
                    description={proc.description}
                    onValueChange={(code, description) => updateProcedure(idx, code, description)}
                    fetchOptions={(search) =>
                      surgicalProcedureServices.search(search).then((results) =>
                        results.map((r) => ({ code: r.code, description: r.codeDescription || r.cupsDescription })),
                      )
                    }
                    placeholder="Buscar por código CUPS/SOAT o descripción"
                    disabled={historyClosed}
                    maxLength={20}
                  />
                  {idx > 0 && (
                    <Tooltip title="Eliminar procedimiento">
                      <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeProcedure(idx)}
                        disabled={historyClosed} />
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
            {qxDiagnoses.length < 4 && !historyClosed && (
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
                  <CodeSearchSelect
                    value={diag.code}
                    description={diag.description}
                    onValueChange={(code, description) => updateDiagnosis(idx, code, description)}
                    fetchOptions={(search) =>
                      cie10Services.search(search).then((results) =>
                        results.map((r) => ({ code: r.codigo, description: r.descripcion })),
                      )
                    }
                    placeholder="Buscar por código CIE-10 o descripción"
                    disabled={historyClosed}
                    maxLength={10}
                  />
                  {idx > 0 && (
                    <Tooltip title="Eliminar diagnóstico">
                      <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeDiagnosis(idx)}
                        disabled={historyClosed} />
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
          <TextArea
            rows={8}
            value={qxProcedureDescription}
            onChange={(e) => setQxProcedureDescription(e.target.value)}
            placeholder="Describa de forma detallada el acto quirúrgico realizado, hallazgos intraoperatorios, técnica empleada y demás consideraciones clínicas relevantes..."
            maxLength={15000}
            disabled={historyClosed}
          />
          <div className="char-count-row">{qxProcedureDescription.length} / 15000</div>
        </div>
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={reset} disabled={historyClosed}>
          {editingId ? "Deshacer cambios" : "Limpiar formulario"}
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave} loading={isSaving} disabled={historyClosed}>
          {editingId ? "Actualizar descripción quirúrgica" : "Guardar descripción quirúrgica"}
        </Button>
      </div>

      <DescripcionQuirurgicaPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
        title="Vista previa de la descripción quirúrgica"
      />
    </div>
  )
}
