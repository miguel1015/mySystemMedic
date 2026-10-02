export const RESULTADOS_RAYOS_X = ["Normal", "Anormal", "Limitado", "Concluyente"] as const

export type ResultadoRayosX = (typeof RESULTADOS_RAYOS_X)[number]

export interface EstudioRadiologicoDisponible {
  tariffDetailId: number
  codigo: string
  nombre: string
}

export interface EstudioRayosXCreateRequest {
  admissionId: number
  tariffDetailId: number
  fechaEstudio: string
  resultado: ResultadoRayosX
  descripcion: string
  conclusion: string
}

export type EstudioRayosXUpdateRequest = Omit<EstudioRayosXCreateRequest, "admissionId">

export interface EstudioRayosXResponse {
  id: number
  admissionId: number
  tariffDetailId: number | null
  codigoEstudio: string
  nombreEstudio: string
  fechaEstudio: string
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
