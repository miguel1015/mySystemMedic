import type {
  ActoAnestesico,
  EstadoRecordAnestesia,
  RecordAnestesiaDiagnostico,
} from "@/core/interfaces/care/recordAnestesia"

// Perfiles de usuario que pueden figurar como cirujano y como anestesiólogo
// responsable (los mismos de la descripción quirúrgica).
export { QX_TEAM_PROFILES } from "../clinicalRecords/initialClinicalHistory/constants"

export const ACTO_ANESTESICO_LABELS: Record<ActoAnestesico, string> = {
  INDUCCION: "INDUCCIÓN",
  MANTENIMIENTO: "MANTENIMIENTO",
  DESPERTAR: "DESPERTAR",
}

export const ESTADO_COLORS: Record<EstadoRecordAnestesia, string> = {
  ABIERTA: "blue",
  CERRADA: "default",
}

export const formatDiagnostico = (diagnostico?: RecordAnestesiaDiagnostico | null) =>
  diagnostico
    ? [diagnostico.codigo, diagnostico.descripcion].filter(Boolean).join(" - ")
    : ""

// Un diagnóstico por línea; los vacíos no se imprimen.
export const joinDiagnosticos = (diagnosticos: (RecordAnestesiaDiagnostico | null)[]) =>
  diagnosticos.map(formatDiagnostico).filter(Boolean).join("\n")
