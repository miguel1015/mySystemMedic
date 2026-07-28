"use client"

import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import { EyeOutlined, FileDoneOutlined, SaveOutlined, WarningOutlined } from "@ant-design/icons"
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { CSSProperties, useMemo, useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import "../initialClinicalHistory/initialClinicalHistory.css"
import { DischargeNoteRecentModal } from "./DischargeNoteRecentModal"
import { Cie10DiagnosisSelect } from "./Cie10DiagnosisSelect"
import { useAdmissionCatalogs } from "@/core/hooks/care/admissions/useAdmissionCatalogs"
import { useGetCondicionesSalida } from "@/core/hooks/care/dischargeNote/useGetCondicionesSalida"
import {
  useCreateDatosClinicosEgreso,
  useUpdateDatosClinicosEgreso,
  useDeleteDatosClinicosEgreso,
} from "@/core/hooks/care/dischargeNote/useSaveDatosClinicosEgreso"
import {
  useCreateDiagnosticoEgreso,
  useUpdateDiagnosticoEgreso,
  useDeleteDiagnosticoEgreso,
} from "@/core/hooks/care/dischargeNote/useSaveDiagnosticoEgreso"
import type { DatosClinicosEgresoResponse, DiagnosticoEgresoResponse } from "@/core/interfaces/care/hciInicial"
import type { GetUser } from "@/core/interfaces/user/users"
import ClinicalPrintPreviewModal from "../initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import { GenericClinicalPrintDocument, type ClinicalPrintSection } from "../initialClinicalHistory/printPreview/GenericClinicalPrintDocument"
import type { PrintPatient } from "../initialClinicalHistory/printPreview/printDocument.utils"

const { TextArea } = Input

const labelStyle: CSSProperties = {
  display: "block",
  color: "var(--dash-text-secondary, #6b7280)",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
}

const dischargeTabs = [
  { key: "clinical", label: "1. Datos Clínicos de Egreso" },
  { key: "diagnoses", label: "2. Diagnósticos de Egreso" },
]

interface TextField {
  label: string
  value: string
  setter: (v: string) => void
  required?: boolean
  rows: number
  placeholder: string
  showCount?: boolean
  maxLength?: number
}

interface DischargeNoteContentProps {
  messageApi: MessageInstance
  currentDoctor?: string
  admissionId?: string | number
  patient?: PrintPatient
  admissionDate?: string
  contractName?: string
  doctorUser?: GetUser
}

export function DischargeNoteContent({
  messageApi,
  currentDoctor = "",
  admissionId,
  patient,
  admissionDate = "",
  contractName = "",
  doctorUser,
}: DischargeNoteContentProps) {
  const resolvedPatient: PrintPatient = patient ?? {
    name: "",
    documentType: "",
    documentNumber: "",
    careScope: "",
    birthDate: "",
    sex: "",
    insurer: "",
  }
  const [activeTab, setActiveTab] = useState<"clinical" | "diagnoses">("clinical")
  const [recentOpen, setRecentOpen] = useState(false)

  const { data: admissionCatalogs, isLoading: catalogsLoading } = useAdmissionCatalogs()
  const { data: condicionesSalida = [], isLoading: condicionesSalidaLoading } = useGetCondicionesSalida()

  const ambitoEgresoOptions = (admissionCatalogs?.careScopes ?? []).map((c) => ({ value: c.id, label: c.name }))
  const finalidadConsultaOptions = (admissionCatalogs?.carePurposes ?? []).map((c) => ({ value: c.id, label: c.name }))
  const causaExternaOptions = (admissionCatalogs?.careReasons ?? []).map((c) => ({ value: c.id, label: c.name }))
  const condicionSalidaOptions = condicionesSalida.map((c) => ({ value: c.id, label: c.descripcion }))

  const createDatosClinicos = useCreateDatosClinicosEgreso()
  const updateDatosClinicos = useUpdateDatosClinicosEgreso()
  const deleteDatosClinicos = useDeleteDatosClinicosEgreso()
  const createDiagnostico = useCreateDiagnosticoEgreso()
  const updateDiagnostico = useUpdateDiagnosticoEgreso()
  const deleteDiagnostico = useDeleteDiagnosticoEgreso()

  const isSaving =
    createDatosClinicos.isPending ||
    updateDatosClinicos.isPending ||
    createDiagnostico.isPending ||
    updateDiagnostico.isPending
  const isDeleting = deleteDatosClinicos.isPending || deleteDiagnostico.isPending

  // Ids de los registros ya guardados (permiten pasar de Crear a Actualizar/Eliminar)
  const [datosClinicosId, setDatosClinicosId] = useState<number | null>(null)
  const [diagnosticoId, setDiagnosticoId] = useState<number | null>(null)

  // Tab 1: Datos Clínicos
  const [vitals, setVitals] = useState({
    ta: "120/80", fc: 80, fr: 18,
    temperature: 36.5, saturation: 98,
    weight: 80, height: 175,
  })
  const [condicionesGenerales, setCondicionesGenerales] = useState("")
  const [cabezaCuello, setCabezaCuello] = useState("")
  const [torax, setTorax] = useState("")
  const [abdomen, setAbdomen] = useState("")
  const [extremidades, setExtremidades] = useState("")
  const [sistemaNervioso, setSistemaNervioso] = useState("")
  const [genitourinario, setGenitourinario] = useState("")
  const [evolucionesTxt, setEvolucionesTxt] = useState("")
  const [justificacion, setJustificacion] = useState("")
  const [ordenes, setOrdenes] = useState("")

  // Tab 2: Diagnósticos
  const [ambitoEgreso, setAmbitoEgreso] = useState<number | undefined>()
  const [fechaEgreso, setFechaEgreso] = useState<Dayjs | null>(null)
  const [diag1Id, setDiag1Id] = useState<number | undefined>()
  const [diag1Label, setDiag1Label] = useState("")
  const [diag2Id, setDiag2Id] = useState<number | undefined>()
  const [diag2Label, setDiag2Label] = useState("")
  const [diag3Id, setDiag3Id] = useState<number | undefined>()
  const [diag3Label, setDiag3Label] = useState("")
  const [diagnosticoMuerte, setDiagnosticoMuerte] = useState("")
  const [fechaMuerte, setFechaMuerte] = useState<Dayjs | null>(null)
  const [finalidadConsulta, setFinalidadConsulta] = useState<number | undefined>()
  const [causaExterna, setCausaExterna] = useState<number | undefined>()
  const [condicionSalida, setCondicionSalida] = useState<number | undefined>()
  const [previewOpen, setPreviewOpen] = useState(false)

  const isDeceased = useMemo(
    () => condicionesSalida.find((c) => c.id === condicionSalida)?.descripcion?.toLowerCase().includes("fallec") ?? false,
    [condicionesSalida, condicionSalida],
  )

  const bmi = useMemo(() => {
    const h = vitals.height / 100
    if (!h || !vitals.weight) return ""
    return (vitals.weight / (h * h)).toFixed(1)
  }, [vitals.height, vitals.weight])

  const resetForm = () => {
    setDatosClinicosId(null)
    setDiagnosticoId(null)
    setVitals({ ta: "120/80", fc: 80, fr: 18, temperature: 36.5, saturation: 98, weight: 80, height: 175 })
    setCondicionesGenerales("")
    setCabezaCuello("")
    setTorax("")
    setAbdomen("")
    setExtremidades("")
    setSistemaNervioso("")
    setGenitourinario("")
    setEvolucionesTxt("")
    setJustificacion("")
    setOrdenes("")
    setAmbitoEgreso(undefined)
    setFechaEgreso(null)
    setDiag1Id(undefined)
    setDiag1Label("")
    setDiag2Id(undefined)
    setDiag2Label("")
    setDiag3Id(undefined)
    setDiag3Label("")
    setDiagnosticoMuerte("")
    setFechaMuerte(null)
    setFinalidadConsulta(undefined)
    setCausaExterna(undefined)
    setCondicionSalida(undefined)
  }

  const previewSections: ClinicalPrintSection[] = useMemo(() => {
    const sections: ClinicalPrintSection[] = [
      {
        title: "Signos vitales",
        rows: [
          { label: "TA (mmHg)", value: vitals.ta },
          { label: "FC (lpm)", value: vitals.fc },
          { label: "FR (rpm)", value: vitals.fr },
          { label: "Temperatura (°C)", value: vitals.temperature },
          { label: "Sat. O₂ (%)", value: vitals.saturation },
          { label: "Peso (kg)", value: vitals.weight },
          { label: "Talla (cm)", value: vitals.height },
          { label: "IMC", value: bmi ? `${bmi} kg/m²` : "" },
        ],
      },
      {
        title: "Datos Clínicos de Egreso",
        rows: [
          { label: "Condiciones generales de salida", value: condicionesGenerales },
          { label: "Cabeza y cuello", value: cabezaCuello },
          { label: "Tórax", value: torax },
          { label: "Abdomen", value: abdomen },
          { label: "Extremidades", value: extremidades },
          { label: "Sistema nervioso", value: sistemaNervioso },
          { label: "Genitourinario", value: genitourinario },
          { label: "Evoluciones", value: evolucionesTxt },
          { label: "Justificación de hospitalización", value: justificacion },
          { label: "Órdenes", value: ordenes },
        ],
      },
      {
        title: "Diagnósticos de Egreso",
        rows: [
          { label: "Ámbito de egreso", value: ambitoEgresoOptions.find((o) => o.value === ambitoEgreso)?.label },
          { label: "Fecha de egreso", value: fechaEgreso ? fechaEgreso.format("DD/MM/YYYY HH:mm") : "" },
          { label: "Diagnóstico 1", value: diag1Label },
          { label: "Diagnóstico 2", value: diag2Label },
          { label: "Diagnóstico 3", value: diag3Label },
          { label: "Finalidad de consulta", value: finalidadConsultaOptions.find((o) => o.value === finalidadConsulta)?.label },
          { label: "Causa externa", value: causaExternaOptions.find((o) => o.value === causaExterna)?.label },
          { label: "Condición de salida", value: condicionSalidaOptions.find((o) => o.value === condicionSalida)?.label },
        ],
      },
    ]

    if (isDeceased) {
      sections.push({
        title: "Datos de fallecimiento",
        rows: [
          { label: "Diagnóstico de muerte", value: diagnosticoMuerte },
          { label: "Fecha de muerte", value: fechaMuerte ? fechaMuerte.format("DD/MM/YYYY HH:mm") : "" },
        ],
      })
    }

    return sections
  }, [
    vitals,
    bmi,
    condicionesGenerales,
    cabezaCuello,
    torax,
    abdomen,
    extremidades,
    sistemaNervioso,
    genitourinario,
    evolucionesTxt,
    justificacion,
    ordenes,
    ambitoEgresoOptions,
    ambitoEgreso,
    fechaEgreso,
    diag1Label,
    diag2Label,
    diag3Label,
    finalidadConsultaOptions,
    finalidadConsulta,
    causaExternaOptions,
    causaExterna,
    condicionSalidaOptions,
    condicionSalida,
    isDeceased,
    diagnosticoMuerte,
    fechaMuerte,
  ])

  const validateAndSave = async () => {
    if (!condicionesGenerales.trim()) {
      messageApi.error("Las condiciones generales de salida son obligatorias.")
      setActiveTab("clinical")
      return
    }
    if (!ambitoEgreso) {
      messageApi.error("El ámbito de egreso es obligatorio.")
      setActiveTab("diagnoses")
      return
    }
    if (!fechaEgreso) {
      messageApi.error("La fecha de egreso es obligatoria.")
      setActiveTab("diagnoses")
      return
    }
    if (!diag1Id) {
      messageApi.error("Debe registrar el diagnóstico de egreso principal.")
      setActiveTab("diagnoses")
      return
    }
    if (!finalidadConsulta) {
      messageApi.error("La finalidad de consulta es obligatoria.")
      setActiveTab("diagnoses")
      return
    }
    if (!causaExterna) {
      messageApi.error("La causa externa es obligatoria.")
      setActiveTab("diagnoses")
      return
    }
    if (!condicionSalida) {
      messageApi.error("La condición de salida del paciente es obligatoria.")
      setActiveTab("diagnoses")
      return
    }
    if (isDeceased && !diagnosticoMuerte.trim()) {
      messageApi.error("El diagnóstico de muerte es obligatorio cuando la condición es fallecimiento.")
      setActiveTab("diagnoses")
      return
    }
    if (isDeceased && !fechaMuerte) {
      messageApi.error("La fecha de muerte es obligatoria cuando la condición es fallecimiento.")
      setActiveTab("diagnoses")
      return
    }
    if (!datosClinicosId && !admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta nota.")
      return
    }

    try {
      const datosClinicosFields = {
        tensionArterial: vitals.ta.trim() || null,
        frecuenciaCardiaca: vitals.fc || null,
        frecuenciaRespiratoria: vitals.fr || null,
        temperatura: vitals.temperature || null,
        saturacionOxigeno: vitals.saturation || null,
        peso: vitals.weight || null,
        talla: vitals.height ? vitals.height / 100 : null,
        condicionesGeneralesSalida: condicionesGenerales.trim(),
        cabezaCuello: cabezaCuello.trim() || null,
        torax: torax.trim() || null,
        abdomen: abdomen.trim() || null,
        extremidades: extremidades.trim() || null,
        sistemaNervioso: sistemaNervioso.trim() || null,
        genitourinario: genitourinario.trim() || null,
        evoluciones: evolucionesTxt.trim() || null,
        justificacionHospitalizacion: justificacion.trim() || null,
        ordenes: ordenes.trim() || null,
      }

      const savedDatosClinicos = datosClinicosId
        ? await updateDatosClinicos.mutateAsync({
            id: datosClinicosId,
            data: { ...datosClinicosFields, isActive: true },
          })
        : await createDatosClinicos.mutateAsync({
            ...datosClinicosFields,
            admissionId: Number(admissionId),
          })

      setDatosClinicosId(savedDatosClinicos.id)

      const diagnosticoPayload = {
        datosClinicosEgresoId: savedDatosClinicos.id,
        ambitoEgresoId: ambitoEgreso,
        fechaEgreso: fechaEgreso.toISOString(),
        diagnosticoEgreso1Id: diag1Id,
        diagnosticoEgreso2Id: diag2Id ?? null,
        diagnosticoEgreso3Id: diag3Id ?? null,
        finalidadConsultaId: finalidadConsulta,
        causaExternaId: causaExterna,
        condicionSalidaId: condicionSalida,
      }

      // El backend informa en diagnosticoEgresoId si el tab 2 ya existe para este
      // registro (evita un 409 Conflict al reintentar guardar en la misma sesión).
      const targetDiagnosticoId = diagnosticoId ?? savedDatosClinicos.diagnosticoEgresoId ?? undefined

      const savedDiagnostico = targetDiagnosticoId
        ? await updateDiagnostico.mutateAsync({
            id: targetDiagnosticoId,
            data: {
              ambitoEgresoId: diagnosticoPayload.ambitoEgresoId,
              fechaEgreso: diagnosticoPayload.fechaEgreso,
              diagnosticoEgreso1Id: diagnosticoPayload.diagnosticoEgreso1Id,
              diagnosticoEgreso2Id: diagnosticoPayload.diagnosticoEgreso2Id,
              diagnosticoEgreso3Id: diagnosticoPayload.diagnosticoEgreso3Id,
              finalidadConsultaId: diagnosticoPayload.finalidadConsultaId,
              causaExternaId: diagnosticoPayload.causaExternaId,
              condicionSalidaId: diagnosticoPayload.condicionSalidaId,
              isActive: true,
            },
          })
        : await createDiagnostico.mutateAsync(diagnosticoPayload)

      setDiagnosticoId(savedDiagnostico.id)

      messageApi.success(
        datosClinicosId && diagnosticoId
          ? "Nota de egreso actualizada correctamente."
          : "Nota de egreso guardada correctamente.",
      )
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la nota de egreso.")
    }
  }

  const loadForEdit = (
    datosClinicos: DatosClinicosEgresoResponse,
    diagnostico: DiagnosticoEgresoResponse | null,
  ) => {
    setDatosClinicosId(datosClinicos.id)
    setDiagnosticoId(diagnostico?.id ?? null)
    setVitals({
      ta: datosClinicos.tensionArterial ?? "",
      fc: datosClinicos.frecuenciaCardiaca ?? 0,
      fr: datosClinicos.frecuenciaRespiratoria ?? 0,
      temperature: datosClinicos.temperatura ?? 0,
      saturation: datosClinicos.saturacionOxigeno ?? 0,
      weight: datosClinicos.peso ?? 0,
      height: datosClinicos.talla ? datosClinicos.talla * 100 : 0,
    })
    setCondicionesGenerales(datosClinicos.condicionesGeneralesSalida)
    setCabezaCuello(datosClinicos.cabezaCuello ?? "")
    setTorax(datosClinicos.torax ?? "")
    setAbdomen(datosClinicos.abdomen ?? "")
    setExtremidades(datosClinicos.extremidades ?? "")
    setSistemaNervioso(datosClinicos.sistemaNervioso ?? "")
    setGenitourinario(datosClinicos.genitourinario ?? "")
    setEvolucionesTxt(datosClinicos.evoluciones ?? "")
    setJustificacion(datosClinicos.justificacionHospitalizacion ?? "")
    setOrdenes(datosClinicos.ordenes ?? "")

    if (diagnostico) {
      setAmbitoEgreso(diagnostico.ambitoEgresoId)
      setFechaEgreso(dayjs(diagnostico.fechaEgreso))
      setDiag1Id(diagnostico.diagnosticoEgreso1Id)
      setDiag1Label(`${diagnostico.codigoDiagnosticoEgreso1} - ${diagnostico.descripcionDiagnosticoEgreso1}`)
      setDiag2Id(diagnostico.diagnosticoEgreso2Id ?? undefined)
      setDiag2Label(
        diagnostico.codigoDiagnosticoEgreso2 && diagnostico.descripcionDiagnosticoEgreso2
          ? `${diagnostico.codigoDiagnosticoEgreso2} - ${diagnostico.descripcionDiagnosticoEgreso2}`
          : "",
      )
      setDiag3Id(diagnostico.diagnosticoEgreso3Id ?? undefined)
      setDiag3Label(
        diagnostico.codigoDiagnosticoEgreso3 && diagnostico.descripcionDiagnosticoEgreso3
          ? `${diagnostico.codigoDiagnosticoEgreso3} - ${diagnostico.descripcionDiagnosticoEgreso3}`
          : "",
      )
      setFinalidadConsulta(diagnostico.finalidadConsultaId)
      setCausaExterna(diagnostico.causaExternaId)
      setCondicionSalida(diagnostico.condicionSalidaId)
    } else {
      setAmbitoEgreso(undefined)
      setFechaEgreso(null)
      setDiag1Id(undefined)
      setDiag1Label("")
      setDiag2Id(undefined)
      setDiag2Label("")
      setDiag3Id(undefined)
      setDiag3Label("")
      setFinalidadConsulta(undefined)
      setCausaExterna(undefined)
      setCondicionSalida(undefined)
    }
    setDiagnosticoMuerte("")
    setFechaMuerte(null)
    setRecentOpen(false)
    setActiveTab("clinical")
  }

  const clinicalTextFields: TextField[] = [
    {
      label: "Condiciones generales de salida",
      value: condicionesGenerales,
      setter: setCondicionesGenerales,
      required: true,
      rows: 3,
      placeholder: "Describa las condiciones generales del paciente al momento del egreso...",
      showCount: true,
      maxLength: 2000,
    },
    {
      label: "Cabeza y cuello",
      value: cabezaCuello,
      setter: setCabezaCuello,
      rows: 2,
      placeholder: "Hallazgos en cabeza y cuello...",
      maxLength: 2000,
    },
    {
      label: "Tórax",
      value: torax,
      setter: setTorax,
      rows: 2,
      placeholder: "Hallazgos en tórax...",
      maxLength: 2000,
    },
    {
      label: "Abdomen",
      value: abdomen,
      setter: setAbdomen,
      rows: 2,
      placeholder: "Hallazgos en abdomen...",
      maxLength: 2000,
    },
    {
      label: "Extremidades",
      value: extremidades,
      setter: setExtremidades,
      rows: 2,
      placeholder: "Hallazgos en extremidades...",
      maxLength: 2000,
    },
    {
      label: "Sistema nervioso",
      value: sistemaNervioso,
      setter: setSistemaNervioso,
      rows: 2,
      placeholder: "Hallazgos en sistema nervioso...",
      maxLength: 2000,
    },
    {
      label: "Genitourinario",
      value: genitourinario,
      setter: setGenitourinario,
      rows: 2,
      placeholder: "Hallazgos en genitourinario...",
      maxLength: 2000,
    },
    {
      label: "Evoluciones",
      value: evolucionesTxt,
      setter: setEvolucionesTxt,
      rows: 3,
      placeholder: "Resumen de evolución clínica durante la hospitalización...",
      showCount: true,
      maxLength: 4000,
    },
    {
      label: "Justificación de hospitalización",
      value: justificacion,
      setter: setJustificacion,
      rows: 3,
      placeholder: "Justificación clínica del ingreso y hospitalización del paciente...",
      showCount: true,
      maxLength: 4000,
    },
    {
      label: "Órdenes",
      value: ordenes,
      setter: setOrdenes,
      rows: 3,
      placeholder: "Indicaciones, medicamentos y órdenes al egreso...",
      showCount: true,
      maxLength: 4000,
    },
  ]

  return (
    <>
      <div className="tabs-card">
      <div className="qx-form-header">
        <FileDoneOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {datosClinicosId ? `Editar Nota de Egreso #${datosClinicosId}` : "Nota de Egreso"}
        </Typography.Title>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
            Vista previa
          </Button>
        </div>
      </div>

      <nav className="clinical-section-tabs" aria-label="Secciones nota de egreso">
        {dischargeTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key as "clinical" | "diagnoses")}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="evolution-tab-content">

        {/* ─── Tab 1: Datos Clínicos de Egreso ─── */}
        {activeTab === "clinical" && (
          <div className="tab-section-inner">

            {/* Signos vitales */}
            <div className="qx-section" style={{ padding: "0 0 20px", marginBottom: 20, borderBottom: "1px solid var(--dash-border-subtle, #eef2f1)" }}>
              <div className="qx-section-header">
                <span className="section-number">1</span>
                <span className="section-title">Signos vitales</span>
              </div>
              <div className="evo-vitals-grid">
                {([
                  { label: "TA (mmHg)", key: "ta", isString: true },
                  { label: "FC (lpm)", key: "fc" },
                  { label: "FR (rpm)", key: "fr" },
                  { label: "Temperatura (°C)", key: "temperature" },
                  { label: "Sat. O₂ (%)", key: "saturation" },
                  { label: "Peso (kg)", key: "weight" },
                  { label: "Talla (cm)", key: "height" },
                ] as Array<{ label: string; key: string; isString?: boolean }>).map(({ label, key, isString }) => (
                  <div key={key} className="evo-vital-item">
                    <label style={labelStyle}>{label}</label>
                    {isString ? (
                      <Input
                        value={(vitals as Record<string, number | string>)[key] as string}
                        onChange={(e) => setVitals({ ...vitals, [key]: e.target.value })}
                      />
                    ) : (
                      <InputNumber
                        style={{ width: "100%" }}
                        value={(vitals as Record<string, number | string>)[key] as number}
                        onChange={(v) => setVitals({ ...vitals, [key]: Number(v) || 0 })}
                      />
                    )}
                  </div>
                ))}
                <div className="evo-vital-item">
                  <label style={labelStyle}>IMC</label>
                  <Input value={bmi ? `${bmi} kg/m²` : ""} readOnly placeholder="—" />
                </div>
              </div>
            </div>

            {/* Campos de texto clínicos */}
            <div style={{ display: "grid", gap: 16 }}>
              {clinicalTextFields.map(({ label, value, setter, required, rows, placeholder, showCount, maxLength }) => (
                <div key={label}>
                  <label style={labelStyle}>
                    {label}
                    {required && <span className="field-required"> *</span>}
                  </label>
                  <TextArea
                    rows={rows}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    showCount={showCount}
                    maxLength={maxLength}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Tab 2: Diagnósticos de Egreso ─── */}
        {activeTab === "diagnoses" && (
          <div className="tab-section-inner">
            <div style={{ display: "grid", gap: 16 }}>

              <div className="qx-grid-2">
                <div>
                  <label style={labelStyle}>Ámbito de egreso <span className="field-required">*</span></label>
                  <Select
                    placeholder="Seleccione ámbito"
                    value={ambitoEgreso}
                    options={ambitoEgresoOptions}
                    onChange={setAmbitoEgreso}
                    style={{ width: "100%" }}
                    loading={catalogsLoading}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fecha de egreso <span className="field-required">*</span></label>
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    value={fechaEgreso}
                    onChange={setFechaEgreso}
                    style={{ width: "100%" }}
                    placeholder="Seleccione fecha y hora"
                    disabledDate={(current) => current && current.isAfter(dayjs())}
                  />
                </div>
              </div>

              <div className="qx-grid-2">
                <div>
                  <label style={labelStyle}>Diagnóstico de egreso 1 <span className="field-required">*</span></label>
                  <Cie10DiagnosisSelect
                    value={diag1Id}
                    onSelect={(id, codigo, descripcion) => {
                      setDiag1Id(id)
                      setDiag1Label(id ? `${codigo} - ${descripcion}` : "")
                    }}
                    placeholder="Buscar código CIE-10"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Diagnóstico de egreso 2</label>
                  <Cie10DiagnosisSelect
                    value={diag2Id}
                    onSelect={(id, codigo, descripcion) => {
                      setDiag2Id(id)
                      setDiag2Label(id ? `${codigo} - ${descripcion}` : "")
                    }}
                    placeholder="Buscar código CIE-10"
                    allowClear
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Diagnóstico de egreso 3</label>
                <Cie10DiagnosisSelect
                  value={diag3Id}
                  onSelect={(id, codigo, descripcion) => {
                    setDiag3Id(id)
                    setDiag3Label(id ? `${codigo} - ${descripcion}` : "")
                  }}
                  placeholder="Buscar código CIE-10"
                  allowClear
                  style={{ maxWidth: 480 }}
                />
              </div>

              <div className="qx-grid-2">
                <div>
                  <label style={labelStyle}>Finalidad de consulta <span className="field-required">*</span></label>
                  <Select
                    placeholder="Seleccione finalidad"
                    value={finalidadConsulta}
                    options={finalidadConsultaOptions}
                    onChange={setFinalidadConsulta}
                    style={{ width: "100%" }}
                    loading={catalogsLoading}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Causa externa <span className="field-required">*</span></label>
                  <Select
                    placeholder="Seleccione causa externa"
                    value={causaExterna}
                    options={causaExternaOptions}
                    onChange={setCausaExterna}
                    style={{ width: "100%" }}
                    loading={catalogsLoading}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Condición salida paciente <span className="field-required">*</span></label>
                <Select
                  placeholder="Seleccione condición de salida"
                  value={condicionSalida}
                  options={condicionSalidaOptions}
                  onChange={(v) => {
                    setCondicionSalida(v)
                    const selected = condicionesSalida.find((c) => c.id === v)
                    if (!selected?.descripcion?.toLowerCase().includes("fallec")) {
                      setDiagnosticoMuerte("")
                      setFechaMuerte(null)
                    }
                  }}
                  style={{ width: "100%", maxWidth: 380 }}
                  loading={condicionesSalidaLoading}
                />
              </div>

              {isDeceased && (
                <div
                  style={{
                    background: "#fff1f0",
                    border: "1px solid #ffa39e",
                    borderRadius: 8,
                    padding: 16,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <WarningOutlined style={{ color: "#cf1322", fontSize: 16 }} />
                    <Typography.Text style={{ color: "#cf1322", fontWeight: 700 }}>
                      Datos de fallecimiento
                    </Typography.Text>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Diagnóstico de muerte <span className="field-required">*</span>
                    </label>
                    <TextArea
                      rows={3}
                      value={diagnosticoMuerte}
                      onChange={(e) => setDiagnosticoMuerte(e.target.value)}
                      placeholder="Describa la causa directa o indirecta de muerte del paciente..."
                      showCount
                      maxLength={2000}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Fecha de muerte <span className="field-required">*</span>
                    </label>
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      value={fechaMuerte}
                      onChange={setFechaMuerte}
                      style={{ width: "100%", maxWidth: 380 }}
                      placeholder="Seleccione fecha y hora"
                      disabledDate={(current) => current && current.isAfter(dayjs())}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        <div className="clinical-history-footer-actions">
          <Button onClick={resetForm} disabled={isSaving || isDeleting}>Limpiar formulario</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={validateAndSave}
            loading={isSaving}
            disabled={isSaving || isDeleting}
          >
            {datosClinicosId ? "Actualizar nota de egreso" : "Guardar nota de egreso"}
          </Button>
        </div>
      </div>
      </div>

      <ClinicalPrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Vista previa de la nota de egreso"
        renderDocument={(provider) => (
          <GenericClinicalPrintDocument
            provider={provider}
            patient={resolvedPatient}
            admissionId={admissionId}
            admissionDate={admissionDate}
            contractName={contractName}
            documentTitle="Nota de Egreso"
            attentionLabel="Fecha y hora de egreso:"
            attentionDate={fechaEgreso ? fechaEgreso.format("DD/MM/YYYY") : ""}
            attentionTime={fechaEgreso ? fechaEgreso.format("HH:mm") : ""}
            doctorName={currentDoctor}
            doctorUser={doctorUser}
            sections={previewSections}
          />
        )}
      />

      <DischargeNoteRecentModal
        open={recentOpen}
        onClose={() => setRecentOpen(false)}
        admissionId={admissionId}
        onEdit={loadForEdit}
        messageApi={messageApi}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="discharge-note"
        onClick={() => setRecentOpen(true)}
      />
    </>
  )
}
