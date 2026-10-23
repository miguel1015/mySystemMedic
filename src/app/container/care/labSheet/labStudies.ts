// Catálogo de estudios de laboratorio de demostración. Mientras no exista el
// backend, los estudios y sus campos se definen aquí; cuando exista, este
// catálogo debe venir del servidor con la misma forma.

export type LabFieldType = "number" | "text" | "textarea" | "select"

export interface LabField {
  key: string
  label: string
  type: LabFieldType
  required?: boolean
  unit?: string
  min?: number
  max?: number
  // Rango de referencia que se muestra junto al resultado.
  reference?: { min: number; max: number }
  options?: string[]
  placeholder?: string
}

export interface LabStudy {
  id: number
  code: string
  name: string
  fields: LabField[]
}

const QUALITATIVE = ["Negativo", "Trazas", "+", "++", "+++"]

export const LAB_STUDIES: LabStudy[] = [
  {
    id: 1,
    code: "902210",
    name: "Hemograma completo",
    fields: [
      { key: "hemoglobina", label: "Hemoglobina", type: "number", required: true, unit: "g/dL", min: 0, max: 30, reference: { min: 12, max: 16 } },
      { key: "hematocrito", label: "Hematocrito", type: "number", required: true, unit: "%", min: 0, max: 100, reference: { min: 36, max: 48 } },
      { key: "leucocitos", label: "Leucocitos", type: "number", required: true, unit: "x10³/µL", min: 0, max: 200, reference: { min: 4.5, max: 11 } },
      { key: "neutrofilos", label: "Neutrófilos", type: "number", unit: "%", min: 0, max: 100, reference: { min: 40, max: 70 } },
      { key: "linfocitos", label: "Linfocitos", type: "number", unit: "%", min: 0, max: 100, reference: { min: 20, max: 40 } },
      { key: "plaquetas", label: "Plaquetas", type: "number", required: true, unit: "x10³/µL", min: 0, max: 2000, reference: { min: 150, max: 450 } },
      { key: "observaciones", label: "Observaciones", type: "textarea" },
    ],
  },
  {
    id: 2,
    code: "903841",
    name: "Glicemia",
    fields: [
      { key: "condicion", label: "Condición de la muestra", type: "select", required: true, options: ["Ayunas", "Postprandial", "Aleatoria"] },
      { key: "glucosa", label: "Glucosa", type: "number", required: true, unit: "mg/dL", min: 0, max: 1500, reference: { min: 70, max: 100 } },
      { key: "observaciones", label: "Observaciones", type: "textarea" },
    ],
  },
  {
    id: 3,
    code: "903818",
    name: "Perfil lipídico",
    fields: [
      { key: "colesterolTotal", label: "Colesterol total", type: "number", required: true, unit: "mg/dL", min: 0, max: 1000, reference: { min: 0, max: 200 } },
      { key: "hdl", label: "Colesterol HDL", type: "number", required: true, unit: "mg/dL", min: 0, max: 300, reference: { min: 40, max: 60 } },
      { key: "ldl", label: "Colesterol LDL", type: "number", required: true, unit: "mg/dL", min: 0, max: 600, reference: { min: 0, max: 130 } },
      { key: "trigliceridos", label: "Triglicéridos", type: "number", required: true, unit: "mg/dL", min: 0, max: 5000, reference: { min: 0, max: 150 } },
      { key: "observaciones", label: "Observaciones", type: "textarea" },
    ],
  },
  {
    id: 4,
    code: "907106",
    name: "Uroanálisis",
    fields: [
      { key: "color", label: "Color", type: "select", required: true, options: ["Amarillo claro", "Amarillo", "Ámbar", "Rojizo", "Otro"] },
      { key: "aspecto", label: "Aspecto", type: "select", required: true, options: ["Claro", "Ligeramente turbio", "Turbio"] },
      { key: "ph", label: "pH", type: "number", required: true, min: 0, max: 14, reference: { min: 5, max: 8 } },
      { key: "densidad", label: "Densidad", type: "number", min: 1, max: 1.1, reference: { min: 1.005, max: 1.03 } },
      { key: "proteinas", label: "Proteínas", type: "select", options: QUALITATIVE },
      { key: "glucosa", label: "Glucosa", type: "select", options: QUALITATIVE },
      { key: "sedimento", label: "Sedimento urinario", type: "textarea", placeholder: "Leucocitos, hematíes, bacterias, cilindros, cristales..." },
    ],
  },
  {
    id: 5,
    code: "903895",
    name: "Creatinina y BUN",
    fields: [
      { key: "creatinina", label: "Creatinina", type: "number", required: true, unit: "mg/dL", min: 0, max: 30, reference: { min: 0.6, max: 1.2 } },
      { key: "bun", label: "Nitrógeno ureico (BUN)", type: "number", unit: "mg/dL", min: 0, max: 300, reference: { min: 7, max: 20 } },
      { key: "observaciones", label: "Observaciones", type: "textarea" },
    ],
  },
  {
    id: 6,
    code: "904508",
    name: "Prueba de embarazo (BHCG cualitativa)",
    fields: [
      { key: "muestra", label: "Tipo de muestra", type: "select", required: true, options: ["Sangre", "Orina"] },
      { key: "resultado", label: "Resultado", type: "select", required: true, options: ["Positivo", "Negativo"] },
      { key: "lote", label: "Lote del reactivo", type: "text" },
      { key: "observaciones", label: "Observaciones", type: "textarea" },
    ],
  },
]

export const findLabStudy = (id?: number) => LAB_STUDIES.find((s) => s.id === id)

export const formatReference = (field: LabField) =>
  field.reference
    ? `${field.reference.min} – ${field.reference.max}${field.unit ? ` ${field.unit}` : ""}`
    : ""

// Valor tal como se imprime: con unidad y marcado si sale del rango de referencia.
export const formatResultValue = (field: LabField, value: unknown) => {
  if (value === undefined || value === null || value === "") return ""
  if (field.type !== "number") return String(value)

  const numeric = Number(value)
  const unit = field.unit ? ` ${field.unit}` : ""
  let flag = ""
  if (field.reference && !Number.isNaN(numeric)) {
    if (numeric < field.reference.min) flag = " (bajo)"
    else if (numeric > field.reference.max) flag = " (alto)"
  }
  return `${value}${unit}${flag}`
}
