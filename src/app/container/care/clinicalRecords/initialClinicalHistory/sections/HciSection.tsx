"use client"

import { SaveOutlined } from "@ant-design/icons"
import { Button } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useRef, useState } from "react"
import { useCreateAnalisisDiagnosticosPlanHCInicial, useUpdateAnalisisDiagnosticosPlanHCInicial } from "@/core/hooks/care/hciInicial/useSaveAnalisisDiagnosticosPlan"
import { useCreateHCInicial, useUpdateHCInicial } from "@/core/hooks/care/hciInicial/useSaveHCInicial"
import { useCreateObjetivoHCInicial, useUpdateObjetivoHCInicial } from "@/core/hooks/care/hciInicial/useSaveObjetivo"
import { useCreateSignosVitalesHCInicial, useUpdateSignosVitalesHCInicial } from "@/core/hooks/care/hciInicial/useSaveSignosVitales"
import { useCreateSubjetivoHCInicial, useUpdateSubjetivoHCInicial } from "@/core/hooks/care/hciInicial/useSaveSubjetivo"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"
import ClinicalRecordHistoryModal from "@/components/clinicalRecordHistoryModal"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { antecedentesFields, defaultAntecedentes, defaultPhysicalExam, clinicalTabs, physicalExamFields } from "../constants"
import type {
  AntecedentesState,
  DiagnosisRow,
  PhysicalExamState,
  SubjectiveState,
  VitalsState,
} from "../types"
import { AnalysisTab } from "./hci/AnalysisTab"
import { DiagnosesTab } from "./hci/DiagnosesTab"
import { ObjectiveTab } from "./hci/ObjectiveTab"
import { PlanTab } from "./hci/PlanTab"
import { SubjectiveTab } from "./hci/SubjectiveTab"

interface Props {
  admissionId?: string | number
  patientId?: string | number
  diagnoses: DiagnosisRow[]
  onDiagnosesChange: (diagnoses: DiagnosisRow[]) => void
  patientName: string
  messageApi: MessageInstance
  admissionDate: string
}

const defaultVitals: VitalsState = {
  ta: "120/80", fc: 80, fr: 18,
  temperature: 36.5, saturation: 98,
  glasgow: 15, weight: 80, height: 175,
}

const defaultSubjective: SubjectiveState = {
  motivoConsulta: "",
  enfermedadActual: "",
}

interface HubIds {
  idSubjetivoHCInicial: number | null
  idObjetivoHCInicial: number | null
  idSignosVitalesHCInicial: number | null
  idAnalisisDiagnosticosPlanHCInicial: number | null
}

export const HciSection = ({ admissionId, patientId, diagnoses, onDiagnosesChange, patientName, messageApi, admissionDate }: Props) => {
  const [activeSection, setActiveSection] = useState("subjective")
  const [vitals, setVitals] = useState<VitalsState>(defaultVitals)
  const [subjective, setSubjective] = useState<SubjectiveState>(defaultSubjective)
  const [physicalExam, setPhysicalExam] = useState<PhysicalExamState>(defaultPhysicalExam)
  const [antecedentes, setAntecedentes] = useState<AntecedentesState>(defaultAntecedentes)
  const [analysis, setAnalysis] = useState("")
  const [plan, setPlan] = useState("")

  const [hcInicialId, setHcInicialId] = useState<number | null>(null)
  const [subjetivoId, setSubjetivoId] = useState<number | null>(null)
  const [objetivoId, setObjetivoId] = useState<number | null>(null)
  const [signosVitalesId, setSignosVitalesId] = useState<number | null>(null)
  const [analisisId, setAnalisisId] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const wasClosedRef = useRef(false)

  const [savingSubjetivo, setSavingSubjetivo] = useState(false)
  const [savingObjetivo, setSavingObjetivo] = useState(false)
  const [savingSignosVitales, setSavingSignosVitales] = useState(false)
  const [savingAnalisis, setSavingAnalisis] = useState(false)

  const { data: existingHCInicial, refetch: refetchHCInicial } = useGetHCInicialByAdmission(admissionId)

  const createSubjetivo = useCreateSubjetivoHCInicial()
  const updateSubjetivo = useUpdateSubjetivoHCInicial()
  const createObjetivo = useCreateObjetivoHCInicial()
  const updateObjetivo = useUpdateObjetivoHCInicial()
  const createSignosVitales = useCreateSignosVitalesHCInicial()
  const updateSignosVitales = useUpdateSignosVitalesHCInicial()
  const createAnalisis = useCreateAnalisisDiagnosticosPlanHCInicial()
  const updateAnalisis = useUpdateAnalisisDiagnosticosPlanHCInicial()
  const createHCInicial = useCreateHCInicial()
  const updateHCInicial = useUpdateHCInicial()

  const isClosed = existingHCInicial?.isClosed === true

  useEffect(() => {
    if (isClosed && !wasClosedRef.current) {
      setSubjective(defaultSubjective)
      setPhysicalExam(defaultPhysicalExam)
      setAntecedentes(defaultAntecedentes)
      setVitals(defaultVitals)
      setAnalysis("")
      setPlan("")
      onDiagnosesChange([])
    }
    wasClosedRef.current = isClosed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClosed])

  useEffect(() => {
    if (!existingHCInicial || hydrated) return

    setHcInicialId(existingHCInicial.id)
    setSubjetivoId(existingHCInicial.idSubjetivoHCInicial)
    setObjetivoId(existingHCInicial.idObjetivoHCInicial)
    setSignosVitalesId(existingHCInicial.idSignosVitalesHCInicial)
    setAnalisisId(existingHCInicial.idAnalisisDiagnosticosPlanHCInicial)

    if (existingHCInicial.isClosed === true) {
      setHydrated(true)
      return
    }

    if (existingHCInicial.subjetivo) {
      setSubjective({
        motivoConsulta: existingHCInicial.subjetivo.motivoConsulta,
        enfermedadActual: existingHCInicial.subjetivo.enfermedadActual,
      })
    }

    if (existingHCInicial.objetivo) {
      const o = existingHCInicial.objetivo
      setPhysicalExam({
        cabezaCuello: o.cabezaCuello ?? "",
        torax: o.torax ?? "",
        abdomen: o.abdomen ?? "",
        extremidades: o.extremidades ?? "",
        sistemaNervioso: o.sistemaNervioso ?? "",
        organosSentidos: o.organosSentidos ?? "",
        genitourinario: o.genitourinario ?? "",
      })
      setAntecedentes({
        padres: o.padres ?? "",
        personalesMedicos: o.personalesMedicos ?? "",
        otrosFamiliares: o.otrosFamiliares ?? "",
        alergicos: o.alergicos ?? "",
        quirurgicos: o.quirurgicos ?? "",
        toxicos: o.toxicos ?? "",
        transfusiones: o.transfusiones ?? "",
        habitos: o.habitos ?? "",
        traumas: o.traumas ?? "",
      })
    }

    if (existingHCInicial.signosVitales) {
      const s = existingHCInicial.signosVitales
      setVitals({
        ta: s.tensionArterial ?? "",
        fc: s.frecuenciaCardiaca ?? 0,
        fr: s.frecuenciaRespiratoria ?? 0,
        temperature: s.temperatura ?? 0,
        saturation: s.saturacionOxigeno ?? 0,
        glasgow: s.glasgow ?? 0,
        weight: s.peso ?? 0,
        height: s.talla ? s.talla * 100 : 0,
      })
    }

    if (existingHCInicial.analisisDiagnosticosPlan) {
      const a = existingHCInicial.analisisDiagnosticosPlan
      setAnalysis(a.analisis ?? "")
      setPlan(a.plan ?? "")
      onDiagnosesChange(
        a.diagnosticos.map((d) => ({
          id: d.id,
          cie10Id: d.id,
          code: d.codigo,
          diagnosis: d.descripcion,
          main: false,
        })),
      )
    }

    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingHCInicial, hydrated])

  const linkToHub = async (patch: HubIds) => {
    if (!admissionId) return
    if (!admissionDate) {
      messageApi.error("La fecha de atención es obligatoria.")
      return
    }

    if (hcInicialId) {
      await updateHCInicial.mutateAsync({ id: hcInicialId, data: { ...patch, admissionDate, isActive: true, isClosed: false } })
      return
    }

    try {
      const created = await createHCInicial.mutateAsync({ admissionId: Number(admissionId), admissionDate, ...patch })
      setHcInicialId(created.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      if (message.toLowerCase().includes("ya existe")) {
        const { data: refreshed } = await refetchHCInicial()
        if (refreshed) {
          setHcInicialId(refreshed.id)
          await updateHCInicial.mutateAsync({ id: refreshed.id, data: { ...patch, admissionDate, isActive: true, isClosed: false } })
        }
      } else {
        throw err
      }
    }
  }

  const saveSubjetivo = async () => {
    if (isClosed) {
      messageApi.error("Esta historia clínica ya fue clausurada y no admite más cambios.")
      return
    }
    if (!subjective.motivoConsulta.trim() || !subjective.enfermedadActual.trim()) {
      messageApi.error("El motivo de consulta y la enfermedad actual son obligatorios.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta historia clínica.")
      return
    }

    setSavingSubjetivo(true)
    try {
      const saved = subjetivoId
        ? await updateSubjetivo.mutateAsync({ id: subjetivoId, data: { ...subjective, isActive: true } })
        : await createSubjetivo.mutateAsync(subjective)
      setSubjetivoId(saved.id)
      await linkToHub({
        idSubjetivoHCInicial: saved.id,
        idObjetivoHCInicial: objetivoId,
        idSignosVitalesHCInicial: signosVitalesId,
        idAnalisisDiagnosticosPlanHCInicial: analisisId,
      })
      messageApi.success(`Subjetivo guardado para ${patientName}.`)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el subjetivo.")
    } finally {
      setSavingSubjetivo(false)
    }
  }

  const saveObjetivo = async () => {
    if (isClosed) {
      messageApi.error("Esta historia clínica ya fue clausurada y no admite más cambios.")
      return
    }
    const missingPhysicalExam = physicalExamFields.some(({ key }) => !physicalExam[key]?.trim())
    const missingAntecedentes = antecedentesFields.some(({ key }) => !antecedentes[key]?.trim())
    if (missingPhysicalExam || missingAntecedentes) {
      messageApi.error("Todos los campos del examen físico y los antecedentes son obligatorios.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta historia clínica.")
      return
    }

    setSavingObjetivo(true)
    try {
      const payload = { ...physicalExam, ...antecedentes }
      const saved = objetivoId
        ? await updateObjetivo.mutateAsync({ id: objetivoId, data: { ...payload, isActive: true } })
        : await createObjetivo.mutateAsync(payload)
      setObjetivoId(saved.id)
      await linkToHub({
        idSubjetivoHCInicial: subjetivoId,
        idObjetivoHCInicial: saved.id,
        idSignosVitalesHCInicial: signosVitalesId,
        idAnalisisDiagnosticosPlanHCInicial: analisisId,
      })
      messageApi.success(`Objetivo guardado para ${patientName}.`)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el objetivo.")
    } finally {
      setSavingObjetivo(false)
    }
  }

  const saveSignosVitales = async () => {
    if (isClosed) {
      messageApi.error("Esta historia clínica ya fue clausurada y no admite más cambios.")
      return
    }
    const vitalsMissing =
      !vitals.ta.trim() ||
      !vitals.fc ||
      !vitals.fr ||
      !vitals.temperature ||
      !vitals.saturation ||
      !vitals.glasgow ||
      !vitals.weight ||
      !vitals.height
    if (vitalsMissing) {
      messageApi.error("Todos los signos vitales son obligatorios.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta historia clínica.")
      return
    }

    setSavingSignosVitales(true)
    try {
      const payload = {
        tensionArterial: vitals.ta || null,
        frecuenciaCardiaca: vitals.fc || null,
        frecuenciaRespiratoria: vitals.fr || null,
        temperatura: vitals.temperature || null,
        saturacionOxigeno: vitals.saturation || null,
        glasgow: vitals.glasgow || null,
        peso: vitals.weight || null,
        talla: vitals.height ? vitals.height / 100 : null,
      }
      const saved = signosVitalesId
        ? await updateSignosVitales.mutateAsync({ id: signosVitalesId, data: { ...payload, isActive: true } })
        : await createSignosVitales.mutateAsync(payload)
      setSignosVitalesId(saved.id)
      await linkToHub({
        idSubjetivoHCInicial: subjetivoId,
        idObjetivoHCInicial: objetivoId,
        idSignosVitalesHCInicial: saved.id,
        idAnalisisDiagnosticosPlanHCInicial: analisisId,
      })
      messageApi.success(`Signos vitales guardados para ${patientName}.`)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudieron guardar los signos vitales.")
    } finally {
      setSavingSignosVitales(false)
    }
  }

  const saveAnalisisDiagnosticosPlan = async () => {
    if (isClosed) {
      messageApi.error("Esta historia clínica ya fue clausurada y no admite más cambios.")
      return
    }
    if (!analysis.trim()) { messageApi.error("El análisis es obligatorio."); return }
    if (!plan.trim()) { messageApi.error("El plan es obligatorio."); return }
    const hasMain = diagnoses.some((item) => item.main && item.cie10Id)
    const hasIncomplete = diagnoses.some((item) => !item.cie10Id || !item.diagnosis)
    if (!hasMain) { messageApi.error("Debe registrar un diagnóstico principal."); return }
    if (hasIncomplete) { messageApi.warning("Complete o elimine los diagnósticos incompletos."); return }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta historia clínica.")
      return
    }

    setSavingAnalisis(true)
    try {
      const payload = {
        analisis: analysis || null,
        plan: plan || null,
        idsCie10: diagnoses.map((d) => d.cie10Id).filter((id): id is number => id != null),
      }
      const saved = analisisId
        ? await updateAnalisis.mutateAsync({ id: analisisId, data: { ...payload, isActive: true } })
        : await createAnalisis.mutateAsync(payload)
      setAnalisisId(saved.id)
      await linkToHub({
        idSubjetivoHCInicial: subjetivoId,
        idObjetivoHCInicial: objetivoId,
        idSignosVitalesHCInicial: signosVitalesId,
        idAnalisisDiagnosticosPlanHCInicial: saved.id,
      })
      messageApi.success(`Análisis, diagnósticos y plan guardados para ${patientName}.`)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el análisis, diagnósticos y plan.")
    } finally {
      setSavingAnalisis(false)
    }
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
        {isClosed && (
          <div className="clinical-history-closed-banner">
            Esta historia clínica inicial fue clausurada para esta admisión y ya no admite cambios.
          </div>
        )}
        {activeSection === "subjective" && <SubjectiveTab value={subjective} onChange={setSubjective} disabled={isClosed} />}
        {activeSection === "objective" && (
          <ObjectiveTab
            vitals={vitals}
            onVitalsChange={setVitals}
            physicalExam={physicalExam}
            onPhysicalExamChange={setPhysicalExam}
            antecedentes={antecedentes}
            onAntecedentesChange={setAntecedentes}
            disabled={isClosed}
          />
        )}
        {activeSection === "analysis" && <AnalysisTab value={analysis} onChange={setAnalysis} disabled={isClosed} />}
        {activeSection === "diagnoses" && (
          <DiagnosesTab diagnoses={diagnoses} onDiagnosesChange={onDiagnosesChange} disabled={isClosed} />
        )}
        {activeSection === "plan" && <PlanTab value={plan} onChange={setPlan} disabled={isClosed} />}

        <div className="clinical-history-footer-actions">
          {activeSection === "subjective" && (
            <Button type="primary" icon={<SaveOutlined />} loading={savingSubjetivo} disabled={isClosed} onClick={saveSubjetivo}>
              Guardar subjetivo
            </Button>
          )}
          {activeSection === "objective" && (
            <>
              <Button icon={<SaveOutlined />} loading={savingSignosVitales} disabled={isClosed} onClick={saveSignosVitales}>
                Guardar signos vitales
              </Button>
              <Button type="primary" icon={<SaveOutlined />} loading={savingObjetivo} disabled={isClosed} onClick={saveObjetivo}>
                Guardar objetivo
              </Button>
            </>
          )}
          {(activeSection === "analysis" || activeSection === "diagnoses" || activeSection === "plan") && (
            <Button type="primary" icon={<SaveOutlined />} loading={savingAnalisis} disabled={isClosed} onClick={saveAnalisisDiagnosticosPlan}>
              Guardar análisis, diagnósticos y plan
            </Button>
          )}
        </div>
      </div>

      <ClinicalRecordHistoryTrigger
        moduleType="initial-clinical-history"
        onClick={() => setHistoryOpen(true)}
      />
      <ClinicalRecordHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        moduleType="initial-clinical-history"
        admissionId={admissionId}
        patientId={patientId}
      />
    </>
  )
}
