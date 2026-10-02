export type TipoHojaGastos = "Hospitalizacion" | "Urgencias" | "Cirugia"

export const TIPOS_SERVICIO_GASTOS = [
  "Medicamentos",
  "Insumos quirúrgicos",
  "Material estéril",
] as const

export type TipoServicioGastos = (typeof TIPOS_SERVICIO_GASTOS)[number]

export type ConceptoTipo = "medicine" | "device"

export interface AsistencialOption {
  id: number
  nombreCompleto: string
  especialidad?: string | null
}

export interface ConceptoGasto {
  conceptoTipo: ConceptoTipo
  conceptoId: number
  codigo: string
  descripcion: string
  detalle?: string | null
}

export interface HojaGastosItemRequest {
  tipoServicio: TipoServicioGastos
  conceptoTipo: ConceptoTipo
  conceptoId: number
  cantidad: number
}

export interface HojaGastosBatchRequest {
  admissionId: number
  tipoHoja: TipoHojaGastos
  fechaHoraRegistro: string
  asistencialId: number
  items: HojaGastosItemRequest[]
}

export interface HojaGastoRegistro {
  id: number
  admissionId: number
  patientId: number
  tipoHoja: TipoHojaGastos
  fechaHoraRegistro: string
  asistencialId: number
  asistencialNombre: string
  asistencialEspecialidad?: string | null
  tipoServicio: TipoServicioGastos
  conceptoTipo: ConceptoTipo
  conceptoId: number
  codigo: string
  descripcion: string
  cantidad: number
  userId: number
  usuarioNombre: string
  createdAt: string
  updatedAt: string
}

export interface HojaGastosBatchResponse {
  creados: number
  actualizados: number
  registros: HojaGastoRegistro[]
}
