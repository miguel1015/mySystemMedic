import type { AmbitoOrden, EstadoOrdenItem, TipoOrden } from "./ordenMedica"

export interface ProfesionalAplicacion {
  id: number
  nombreCompleto: string
  identificacion?: string | null
  cargo?: string | null
  tarjetaProfesional?: string | null
}

export interface AplicacionOrden {
  id: number
  ordenMedicaItemId: number
  ordenMedicaId: number
  admissionId: number
  patientId: number
  tipoOrden: TipoOrden
  codigo: string
  descripcion: string
  fechaHoraAplicacion: string
  cantidad: number
  unidadMedida?: string | null
  viaAdministracionCodigo?: string | null
  viaAdministracion?: string | null
  profesionalId: number
  profesionalNombre: string
  profesionalDocumento?: string | null
  profesionalCargo?: string | null
  observaciones?: string | null
  userId: number
  usuarioNombre: string
  createdAt: string
}

export interface OrdenActiva {
  ordenMedicaItemId: number
  ordenMedicaId: number
  fechaOrden: string
  ambito: AmbitoOrden
  asistencialId: number
  asistencialNombre: string
  asistencialEspecialidad?: string | null
  ordenActiva: boolean
  tipoOrden: TipoOrden
  codigo: string
  descripcion: string
  cantidad: number
  unidadMedida?: string | null
  viaAdministracionCodigo?: string | null
  viaAdministracion?: string | null
  frecuenciaHoras?: number | null
  duracionDias?: number | null
  fechaVencimiento?: string | null
  indicaciones?: string | null
  cantidadAplicada: number
  cantidadPendiente: number
  estado: EstadoOrdenItem
  aplicaciones: AplicacionOrden[]
}

export interface AplicacionOrdenRequest {
  ordenMedicaItemId: number
  fechaHoraAplicacion: string
  cantidad: number
  viaAdministracionCodigo?: string | null
  profesionalId: number
  observaciones?: string
}
