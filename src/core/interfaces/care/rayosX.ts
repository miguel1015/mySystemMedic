export const RESULTADOS_RAYOS_X = ["Normal", "Anormal", "Limitado", "Concluyente"] as const

export type ResultadoRayosX = (typeof RESULTADOS_RAYOS_X)[number]

export interface EstudioRayosXCreateRequest {
  admissionId: number
  nombreEstudio: string
  fechaEstudio: string
  tecnicaUtilizada: string
  datoClinico: string
  resultado: ResultadoRayosX
  descripcion: string
  conclusion: string
}

export type EstudioRayosXUpdateRequest = Omit<EstudioRayosXCreateRequest, "admissionId">

export interface EstudioRayosXResponse {
  id: number
  admissionId: number
  // Solo los estudios registrados cuando se elegían del Manual Tarifario.
  tariffDetailId: number | null
  codigoEstudio: string | null
  nombreEstudio: string
  fechaEstudio: string
  tecnicaUtilizada: string
  datoClinico: string
  resultado: ResultadoRayosX
  descripcion: string
  conclusion: string
  userId: number
  nombreProfesional: string
  tarjetaProfesional?: string | null
  firmaProfesional?: string | null
  perfilProfesional?: string | null
  createdAt: string
  updatedAt: string
}
