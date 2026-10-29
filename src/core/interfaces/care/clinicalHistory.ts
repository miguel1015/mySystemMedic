export interface Especialidad {
  id: number;
  nombre: string;
}

// Admisión que se puede consultar en Consultar HC.
export interface ClinicalHistoryAdmission {
  id: number;
  admissionDate: string;
  careScopeName: string;
  admissionTypeName: string;
  careModalityName: string;
  epsNombre: string;
  convenioNombre: string;
  // Cerrada = facturada: sus evoluciones ya no se modifican ni eliminan.
  cerrada: boolean;
  numeroFactura?: string | null;
}

export interface ClinicalHistorySearchResult {
  patientId: number;
  documentTypeCode: string;
  documentoPaciente: string;
  nombrePaciente: string;
  admisiones: ClinicalHistoryAdmission[];
}

export type ClinicalHistorySearchBy = "documento" | "numero";

export type ClinicalRecordType = "Evolucion" | "EvolucionEspecialista";

export interface ClinicalRecordAudit {
  id: number;
  tipoRegistro: ClinicalRecordType;
  registroId: number;
  accion: "Modificar" | "Eliminar";
  userId: number;
  nombreUsuario: string;
  fechaAccion: string;
  // Copias del registro en JSON.
  datosAnteriores: string;
  datosNuevos?: string | null;
}
