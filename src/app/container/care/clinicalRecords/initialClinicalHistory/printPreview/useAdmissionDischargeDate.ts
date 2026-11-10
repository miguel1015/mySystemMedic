"use client";

import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission";
import { useGetDiagnosticosEgresoByIds } from "@/core/hooks/care/dischargeNote/useGetDiagnosticosEgresoByIds";

/**
 * Fecha de egreso de la admisión para el encabezado de los PDF: sale del
 * diagnóstico de egreso de la nota de egreso activa (la más reciente si hay
 * varias). Sin nota de egreso guardada devuelve undefined.
 */
export const useAdmissionDischargeDate = (
  admissionId?: string | number,
): string | undefined => {
  const { data: datosEgreso } = useGetDatosClinicosEgresoByAdmission(admissionId);
  const activos = (datosEgreso ?? []).filter((d) => d.isActive !== false);
  const { data: diagnosticos } = useGetDiagnosticosEgresoByIds(
    activos.map((d) => d.diagnosticoEgresoId),
  );

  return diagnosticos
    .filter((d) => d.isActive !== false && !!d.fechaEgreso)
    .map((d) => d.fechaEgreso)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
};
