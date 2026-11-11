export const RESULTADOS_RAYOS_X = ["Normal", "Anormal", "Limitado", "Concluyente"] as const

export type ResultadoRayosX = (typeof RESULTADOS_RAYOS_X)[number]

export interface EstudioRayosXCreateRequest {
  admissionId: number
  // Orden de rayos X que se realiza con este estudio (opcional).
  ordenMedicaItemId?: number | null
  nombreEstudio: string
  fechaEstudio: string
  tecnicaUtilizada: string
  datoClinico: string
  resultado: ResultadoRayosX
  descripcion: string
  conclusion: string
}

export type EstudioRayosXUpdateRequest = Omit<
  EstudioRayosXCreateRequest,
  "admissionId" | "ordenMedicaItemId"
>

// Concepto de rayos X ordenado que aún no se ha realizado.
export interface OrdenRayosXPendiente {
  ordenMedicaItemId: number
  ordenMedicaId: number
  fechaOrden: string
  ambito: string
  asistencialNombre: string
  asistencialPerfil?: string | null
  codigo: string
  descripcion: string
  indicaciones?: string | null
  estado: string
}

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
  // Orden médica que originó el estudio (null si se registró sin orden).
  ordenMedicaItemId?: number | null
  ordenMedicaId?: number | null
  userId: number
  nombreProfesional: string
  tarjetaProfesional?: string | null
  firmaProfesional?: string | null
  perfilProfesional?: string | null
  createdAt: string
  updatedAt: string
}
