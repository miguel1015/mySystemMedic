export const ESTADOS_RECORD_ANESTESIA = ["ABIERTA", "CERRADA"] as const
export const ASA_OPCIONES = ["I", "II", "III", "IV"] as const
export const ACTOS_ANESTESICOS = ["INDUCCION", "MANTENIMIENTO", "DESPERTAR"] as const
export const TIPOS_CIRUGIA_SUGERIDOS = ["CRUENTA", "INCRUENTA"] as const

export type EstadoRecordAnestesia = (typeof ESTADOS_RECORD_ANESTESIA)[number]
export type AsaOpcion = (typeof ASA_OPCIONES)[number]
export type ActoAnestesico = (typeof ACTOS_ANESTESICOS)[number]

export interface RecordAnestesiaUpdateRequest {
  estado: EstadoRecordAnestesia
  fechaInicio: string
  fechaTerminacion: string | null
  fechaRealizacion: string | null
  cirujanoId: number
  responsableId: number
  idx1Ingreso: string | null
  idx2Ingreso: string | null
  idx3Ingreso: string | null
  idx1Egreso: string | null
  idx2Egreso: string | null
  idx3Egreso: string | null
  dxLibre: string
  tipoAnestesiaId: number
  asa: AsaOpcion | null
  tipoCirugia: string
  procedimientoARealizar: string
  procedimientoRealizado: string
  posicionPaciente: string
  monitoreoEcg: string
  observaciones: string
  condicionesIngreso: string
  observacion: string
  actoAnestesico: ActoAnestesico | null
  drogasAnestesicas: string
  liquidos: string
}

export interface RecordAnestesiaCreateRequest extends RecordAnestesiaUpdateRequest {
  admissionId: number
}

export interface RecordAnestesiaDiagnostico {
  codigo: string
  descripcion: string
}

export interface RecordAnestesiaResponse {
  id: number
  admissionId: number
  estado: EstadoRecordAnestesia
  fechaInicio: string
  fechaTerminacion: string | null
  fechaRealizacion: string | null
  cirujanoId: number
  nombreCirujano: string
  // Anestesiólogo responsable que firma el record.
  responsableId: number
  nombreResponsable: string
  tarjetaResponsable?: string | null
  firmaResponsable?: string | null
  perfilResponsable?: string | null
  idx1Ingreso: RecordAnestesiaDiagnostico | null
  idx2Ingreso: RecordAnestesiaDiagnostico | null
  idx3Ingreso: RecordAnestesiaDiagnostico | null
  idx1Egreso: RecordAnestesiaDiagnostico | null
  idx2Egreso: RecordAnestesiaDiagnostico | null
  idx3Egreso: RecordAnestesiaDiagnostico | null
  dxLibre: string
  tipoAnestesiaId: number
  nombreTipoAnestesia: string
  asa: AsaOpcion | null
  tipoCirugia: string
  procedimientoARealizar: string
  procedimientoRealizado: string
  posicionPaciente: string
  monitoreoEcg: string
  observaciones: string
  condicionesIngreso: string
  observacion: string
  actoAnestesico: ActoAnestesico | null
  drogasAnestesicas: string
  liquidos: string
  userId: number
  createdAt: string
  updatedAt: string
}
