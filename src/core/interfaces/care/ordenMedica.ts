export const AMBITOS_ORDEN = ["Urgencias", "Hospitalización", "Cirugía"] as const

export type AmbitoOrden = (typeof AMBITOS_ORDEN)[number]

export const TIPOS_ORDEN = [
  "Medicamento",
  "Laboratorio",
  "Rayos X",
  "Procedimiento diagnóstico",
  "Procedimiento",
  "Otro servicio",
] as const

export type TipoOrden = (typeof TIPOS_ORDEN)[number]

export type ConceptoOrdenTipo = "medicine" | "tariff"

export interface AsistencialOrden {
  id: number
  nombreCompleto: string
  especialidad?: string | null
  tarjetaProfesional?: string | null
}

export const ESTADOS_ORDEN_ITEM = [
  "Pendiente",
  "En proceso",
  "Aplicada",
  "Vencida",
  "Cancelada",
] as const

export type EstadoOrdenItem = (typeof ESTADOS_ORDEN_ITEM)[number]

export interface ConceptoOrden {
  conceptoTipo: ConceptoOrdenTipo
  conceptoId: number
  codigo: string
  descripcion: string
  tipoOrden: TipoOrden
  detalle?: string | null
  // Valores sugeridos del catálogo de medicamentos.
  unidadMedida?: string | null
  viaAdministracionCodigo?: string | null
}

export interface ViaAdministracion {
  codigo: string
  descripcion: string
}

export interface UnidadMedida {
  codigo: string
  descripcion: string
}

export interface OrdenMedicaItemRequest {
  conceptoTipo: ConceptoOrdenTipo
  conceptoId: number
  cantidad: number
  indicaciones?: string
  unidadMedida?: string | null
  viaAdministracionCodigo?: string | null
  frecuenciaHoras?: number | null
  duracionDias?: number | null
}

export interface OrdenMedicaRequest {
  admissionId: number
  asistencialId: number
  fechaOrden: string
  ambito: AmbitoOrden
  observaciones?: string
  items: OrdenMedicaItemRequest[]
}

export interface OrdenMedicaItem {
  id: number
  tipoOrden: TipoOrden
  conceptoTipo: ConceptoOrdenTipo
  conceptoId: number
  codigo: string
  descripcion: string
  cantidad: number
  indicaciones?: string | null
  unidadMedida?: string | null
  viaAdministracionCodigo?: string | null
  viaAdministracion?: string | null
  frecuenciaHoras?: number | null
  duracionDias?: number | null
  fechaVencimiento?: string | null
  cantidadAplicada: number
  estado: EstadoOrdenItem
}

export interface OrdenMedica {
  id: number
  admissionId: number
  patientId: number
  fechaOrden: string
  ambito: AmbitoOrden
  observaciones?: string | null
  asistencialId: number
  asistencialNombre: string
  asistencialEspecialidad?: string | null
  asistencialTarjetaProfesional?: string | null
  asistencialFirma?: string | null
  userId: number
  usuarioNombre: string
  createdAt: string
  updatedAt: string
  items: OrdenMedicaItem[]
}
