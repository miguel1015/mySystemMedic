import { BillingServiceCategory } from "@/core/interfaces/care/billing"

/**
 * Clasificación automática del "Tipo de servicio" a partir del código de tarifario
 * (Manual Tarifario SOAT de Salud - Consultorsalud), aplicada al elegir un ítem en
 * el picker de "Servicios" para que el usuario no tenga que recordar la categoría.
 *
 * Es una heurística por rangos de capítulo/artículo del manual: el catálogo real
 * (tabla TariffDetail en MediNexus) se sembró desde un Excel plano que solo trae
 * código, descripción, valor y un flag de "es procedimiento quirúrgico" — no trae
 * capítulo ni categoría — por lo que no hay forma de leerla directo de la base de
 * datos. El combo "Tipo de servicio" del formulario sigue siendo editable para
 * corregir cualquier código que el rango no clasifique bien (p. ej. códigos
 * internos que no vengan del manual SOAT).
 */

interface CodeRange {
  min: number
  max: number
  category: BillingServiceCategory
}

// Códigos puntuales que no siguen la categoría general del rango en el que caen.
// El caso principal es el rango 39000-39999 del manual, que es mayormente
// honorarios/derechos de sala de cirugía, pero incluye algunas consultas sueltas.
const CODE_OVERRIDES: Record<number, BillingServiceCategory> = {
  39141: "Consulta", // Consulta ambulatoria de medicina general
  39143: "Consulta", // Consulta ambulatoria de medicina especializada
  39145: "Consulta", // Consulta de urgencias
}

// Rangos ordenados por artículo del Manual Tarifario SOAT. Se evalúa en orden;
// el primero que contenga el código gana.
const CODE_RANGES: CodeRange[] = [
  // Capítulo III (Art. 3 a 18): intervenciones quirúrgicas por especialidad
  // (neurocirugía, oftalmología, otorrino, tiroides, cardiovascular, tórax,
  // abdominal, proctología, urología, mama, ginecología, obstetricia,
  // ortopedia, mano, plástica, oral y maxilofacial)
  { min: 1101, max: 16553, category: "Procedimiento quirúrgico" },

  // Art. 19 Toma de biopsias / Art. 20 Endoscopia diagnóstica y terapéutica
  { min: 17100, max: 18910, category: "Procedimiento" },

  // Art. 21 Laboratorio clínico
  { min: 19001, max: 19991, category: "Laboratorio" },

  // Art. 22 Anatomopatológicos (biopsias, citologías, necropsias)
  { min: 20101, max: 20405, category: "Laboratorio" },

  // Art. 23 Radiología (huesos, tórax, abdomen, tomografía computarizada)
  { min: 21101, max: 21723, category: "Imagen diagnóstica / RX" },

  // Art. 24 Medicina nuclear
  { min: 22101, max: 22902, category: "Imagen diagnóstica / RX" },

  // Art. 25 a 32: exámenes/procedimientos de nefro-urología, neumología,
  // cardiología y hemodinamia, neurología, otorrino, oftalmología, medicina
  // física y rehabilitación, banco de sangre — mezclan diagnóstico y
  // tratamiento no quirúrgico dentro del mismo artículo
  { min: 23101, max: 30207, category: "Procedimiento" },

  // Art. 33 Ecografías, vasculares no invasivos y resonancia magnética
  { min: 31100, max: 31307, category: "Imagen diagnóstica / RX" },

  // Art. 34 Genética
  { min: 32101, max: 32119, category: "Laboratorio" },

  // Art. 35 a 37: oncología, alergología, psiquiatría y psicología
  { min: 33101, max: 35116, category: "Procedimiento" },

  // Art. 38 Servicios ambulatorios de salud oral
  { min: 36100, max: 36908, category: "Procedimiento" },

  // Art. 39 Diagnóstico y terapéuticos (procedimientos menores no quirúrgicos:
  // artrocentesis, curaciones, yesos, tratamiento de esguinces, etc.)
  { min: 37100, max: 37805, category: "Procedimiento" },

  // Capítulo V: Estancias hospitalarias
  { min: 38111, max: 38935, category: "Estancia" },

  // Servicios profesionales, derechos de sala y materiales de sutura/curación
  // por grupo quirúrgico (honorarios de cirujano, anestesiólogo, ayudantía) —
  // predominantemente ligado a la liquidación de cirugía
  { min: 39000, max: 39999, category: "Procedimiento quirúrgico" },

  // Art. 64 Conjuntos integrales de atención (cirugías empaquetadas: hernias,
  // colecistectomía, histerectomía, osteosíntesis, etc.)
  { min: 40100, max: 40124, category: "Procedimiento" },
  { min: 502001, max: 518999, category: "Procedimiento quirúrgico" },
]

const DEFAULT_CATEGORY: BillingServiceCategory = "Procedimiento"

export function classifyServiceCategoryByCode(
  codeText: string | null | undefined,
): BillingServiceCategory {
  const code = Number(codeText)
  if (!codeText || Number.isNaN(code)) return DEFAULT_CATEGORY

  const override = CODE_OVERRIDES[code]
  if (override) return override

  const match = CODE_RANGES.find((range) => code >= range.min && code <= range.max)
  return match?.category ?? DEFAULT_CATEGORY
}
