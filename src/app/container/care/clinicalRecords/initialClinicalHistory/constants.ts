import type { CSSProperties } from "react"
import type { AntecedentesState, EvoVitalsState, PhysicalExamState } from "./types"

// Deben coincidir exactamente (mayúsculas/tildes) con UserProfiles.Name en la base de datos del backend.
export const QX_TEAM_PROFILES = {
  cirujano: "Especialista",
  anestesiologo: "Anestesiólogo",
  instrumentador: "Instrumentador Quirúrgico",
  ayudante: "Ayudante Quirúrgico",
} as const

export const physicalExamFields: Array<{ key: keyof PhysicalExamState; label: string }> = [
  { key: "cabezaCuello", label: "Cabeza y cuello" },
  { key: "torax", label: "Torax" },
  { key: "abdomen", label: "Abdomen" },
  { key: "extremidades", label: "Extremidades" },
  { key: "sistemaNervioso", label: "Sistema nervioso" },
  { key: "organosSentidos", label: "Organos de los sentidos" },
  { key: "genitourinario", label: "Genitourinario" },
]

export const antecedentesFields: Array<{ key: keyof AntecedentesState; label: string }> = [
  { key: "padres", label: "Padres" },
  { key: "personalesMedicos", label: "Personales - Médicos" },
  { key: "otrosFamiliares", label: "Otros Familiares" },
  { key: "alergicos", label: "Alérgicos" },
  { key: "quirurgicos", label: "Quirúrgicos" },
  { key: "toxicos", label: "Tóxicos" },
  { key: "transfusiones", label: "Transfusiones" },
  { key: "habitos", label: "Hábitos" },
  { key: "traumas", label: "Traumas" },
]

export const defaultPhysicalExam: PhysicalExamState = {
  cabezaCuello: "",
  torax: "",
  abdomen: "",
  extremidades: "",
  sistemaNervioso: "",
  organosSentidos: "",
  genitourinario: "",
}

export const defaultAntecedentes: AntecedentesState = {
  padres: "",
  personalesMedicos: "",
  otrosFamiliares: "",
  alergicos: "",
  quirurgicos: "",
  transfusiones: "",
  toxicos: "",
  habitos: "",
  traumas: "",
}

export const clinicalTabs = [
  { key: "subjective", label: "1. Subjetivo" },
  { key: "objective", label: "2. Objetivo" },
  { key: "analysis", label: "3. Análisis" },
  { key: "diagnoses", label: "4. Diagnósticos" },
  { key: "plan", label: "5. Plan" },
]

export const sidebarRecords = [
  { key: "hci", title: "Historia Clínica Inicial", date: "03/03/2026 20:47", count: 0, active: false },
  { key: "medicas", title: "Notas Médicas", date: "", count: 1, active: false },
  { key: "evoluciones", title: "Evoluciones", date: "", count: 3, active: false },
  { key: "especialista", title: "Evolución de Especialista", date: "", count: 0, active: false },
  { key: "quirurgica", title: "Descripción Quirúrgica", date: "", count: 0, active: false },
  { key: "menores", title: "Procedimientos Menores", date: "", count: 0, active: false },
  { key: "diagnosticos", title: "Procedimientos Diagnósticos", date: "", count: 0, active: false },
  { key: "noquirurgicos", title: "Procedimientos No Quirúrgicos", date: "", count: 0, active: false },
  { key: "enfermeria", title: "Notas de Enfermería", date: "", count: 2, active: false },
  { key: "egreso", title: "Nota de Egreso", date: "", count: 0, active: false },
]

export const defaultEvoVitals: EvoVitalsState = {
  ta: "120/80", fc: 80, fr: 18,
  temperature: 36.5, saturation: 98, glasgow: 15,
  weight: 80, height: 175,
}

export const labelStyle: CSSProperties = {
  display: "block",
  color: "var(--dash-text-secondary, #6b7280)",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
}

export const sectionCardStyle: CSSProperties = {
  border: "1px solid var(--dash-border, #e5e7eb)",
  borderRadius: 8,
  background: "var(--dash-surface, #ffffff)",
  padding: 16,
}
