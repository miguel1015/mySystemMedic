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
  // Medicamentos: dosis administrada en unidadMedida. Estudios/procedimientos: cantidad realizada.
  cantidad: number
  // Unidades gastadas (ampollas, viales...): descuentan de la orden.
  unidadesConsumidas: number
  unidadMedida?: string | null
  viaAdministracionCodigo?: string | null
  viaAdministracion?: string | null
  ambito: AmbitoOrden
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
  // Obligatorio solo para medicamentos.
  unidadesConsumidas?: number | null
  viaAdministracionCodigo?: string | null
  ambito: AmbitoOrden
  profesionalId: number
  observaciones?: string
}
