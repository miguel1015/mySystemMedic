export type OrigenResultadoLaboratorio = "MANUAL" | "EXCEL"

export interface AnalitoCatalogo {
  clave: string
  nombre: string
  seccion: string
  tipo: "numero" | "opcion"
  unidad: string | null
  decimales: number
  minimoPosible: number | null
  maximoPosible: number | null
  // Rango del sexo del paciente; nulo si depende del sexo y este no se conoce.
  referenciaMin: number | null
  referenciaMax: number | null
  referencia: string
  criticoBajo: number | null
  criticoAlto: number | null
  // Índice derivado de otros analitos (HCM, CHCM, VCM).
  calculado: boolean
  opciones: string[]
}

export interface EstudioCatalogo {
  codigo: string
  nombre: string
  sexo: "Hombre" | "Mujer" | null
  secciones: string[]
  analitos: AnalitoCatalogo[]
}

export interface ResultadoAnalitoRequest {
  clave: string
  valor?: number | null
  texto?: string | null
}

export interface ResultadoLaboratorioCreateRequest {
  admissionId: number
  codigoEstudio: string
  // Profesional responsable que firma el resultado.
  profesionalId: number
  fechaToma: string
  resultados: ResultadoAnalitoRequest[]
  observaciones: string
  origen?: OrigenResultadoLaboratorio
  archivoOrigen?: string | null
}

export type ResultadoLaboratorioUpdateRequest = Omit<
  ResultadoLaboratorioCreateRequest,
  "admissionId" | "codigoEstudio"
>

export interface ResultadoAnalitoResponse {
  clave: string
  nombre: string
  valor: number | null
  texto: string | null
  unidad: string | null
  referenciaMin: number | null
  referenciaMax: number | null
  referencia: string | null
}

export interface ResultadoLaboratorioResponse {
  id: number
  admissionId: number
  codigoEstudio: string
  nombreEstudio: string
  fechaToma: string
  resultados: ResultadoAnalitoResponse[]
  observaciones: string
  origen: OrigenResultadoLaboratorio
  archivoOrigen: string | null
  userId: number
  nombreProfesional: string
  tarjetaProfesional?: string | null
  firmaProfesional?: string | null
  perfilProfesional?: string | null
  // Usuario que guardó el registro por última vez.
  registradoPorId: number
  nombreRegistradoPor: string
  createdAt: string
  updatedAt: string
}

export interface ImportacionLaboratorioResponse {
  codigoEstudio: string
  archivo: string
  esPlantilla: boolean
  // Hora local, sin zona.
  fechaToma: string | null
  observaciones: string | null
  resultados: ResultadoAnalitoRequest[]
  advertencias: string[]
}
