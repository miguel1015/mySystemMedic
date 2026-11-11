"use client";

import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission";
import { useGetDiagnosticosEgresoByIds } from "@/core/hooks/care/dischargeNote/useGetDiagnosticosEgresoByIds";

export interface AdmissionDischarge {
  /** Fecha y hora de egreso. */
  date?: string;
  /** Ámbito por el que egresa el paciente (p. ej. HOSPITALIZACION). */
  service?: string;
}

/**
 * Egreso de la admisión para el encabezado de los PDF: sale del diagnóstico de
 * egreso de la nota de egreso activa (la más reciente si hay varias). Sin nota
 * de egreso guardada no hay fecha ni servicio.
 */
export const useAdmissionDischarge = (
  admissionId?: string | number,
): AdmissionDischarge => {
  const { data: datosEgreso } = useGetDatosClinicosEgresoByAdmission(admissionId);
  const activos = (datosEgreso ?? []).filter((d) => d.isActive !== false);
  const { data: diagnosticos } = useGetDiagnosticosEgresoByIds(
    activos.map((d) => d.diagnosticoEgresoId),
  );

  const latest = diagnosticos
    .filter((d) => d.isActive !== false && !!d.fechaEgreso)
    .sort((a, b) => new Date(b.fechaEgreso).getTime() - new Date(a.fechaEgreso).getTime())[0];

  return { date: latest?.fechaEgreso, service: latest?.nombreAmbitoEgreso || undefined };
};

/** Solo la fecha de egreso (ver {@link useAdmissionDischarge}). */
export const useAdmissionDischargeDate = (
  admissionId?: string | number,
): string | undefined => useAdmissionDischarge(admissionId).date;
