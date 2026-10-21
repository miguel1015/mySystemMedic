export interface MedicamentoPosItemRequest {
  medicineId: number
  cantidad: number
  dosis?: string | null
  viaAdministracionCodigo: string
  frecuenciaHoras?: number | null
  duracionDias?: number | null
  indicacion?: string | null
}

export interface MedicamentoPosRequest {
  admissionId: number
  asistencialId: number
  fechaFormula: string
  observaciones?: string
  items: MedicamentoPosItemRequest[]
}

export interface MedicamentoPosItem {
  id: number
  medicineId: number
  codigoCum?: string | null
  nombre: string
  formaFarmaceutica?: string | null
  concentracion?: string | null
  cantidad: number
  dosis?: string | null
  viaAdministracionCodigo: string
  viaAdministracion: string
  frecuenciaHoras?: number | null
  duracionDias?: number | null
  indicacion?: string | null
}

export interface MedicamentoPos {
  id: number
  admissionId: number
  patientId: number
  fechaFormula: string
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
  items: MedicamentoPosItem[]
}
