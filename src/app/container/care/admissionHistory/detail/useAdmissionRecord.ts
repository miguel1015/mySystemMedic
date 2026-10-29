import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useGetTriageById } from "@/core/hooks/care/triage/useGetTriageById"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"
import { useGetNotasMedicasByAdmission } from "@/core/hooks/care/notasMedicas/useGetNotasMedicasByAdmission"
import { useGetEvolucionesByAdmission } from "@/core/hooks/care/evoluciones/useGetEvolucionesByAdmission"
import { useGetEvolucionEspecialistasByAdmission } from "@/core/hooks/care/evolucionEspecialista/useGetEvolucionEspecialistasByAdmission"
import { useGetProcedimientosMenoresByAdmission } from "@/core/hooks/care/procedimientosMenores/useGetProcedimientosMenoresByAdmission"
import { useGetProcedimientosDiagnosticosByAdmission } from "@/core/hooks/care/procedimientosDiagnosticos/useGetProcedimientosDiagnosticosByAdmission"
import { useGetProcedimientosNoQxByAdmission } from "@/core/hooks/care/procedimientosNoQx/useGetProcedimientosNoQxByAdmission"
import { useGetNotasEnfermeriaByAdmission } from "@/core/hooks/care/notasEnfermeria/useGetNotasEnfermeriaByAdmission"
import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission"
import { useGetDiagnosticosEgresoByIds } from "@/core/hooks/care/dischargeNote/useGetDiagnosticosEgresoByIds"
import { useGetDescripcionQuirurgicaByAdmission } from "@/core/hooks/care/descripcionesQuirurgicas/useGetDescripcionQuirurgicaByAdmission"
import { useGetRecordsAnestesiaByAdmission } from "@/core/hooks/care/recordAnestesia/useRecordsAnestesia"
import { useGetOrdenesMedicasByAdmission } from "@/core/hooks/care/ordenesMedicas/useOrdenesMedicas"
import { useGetMedicamentosPosByAdmission } from "@/core/hooks/care/medicamentosPos/useMedicamentosPos"
import { useGetOrdenesParaAplicar } from "@/core/hooks/care/aplicacionesOrdenes/useAplicacionesOrdenes"
import {
  useGetCatalogoLaboratorio,
  useGetResultadosLaboratorioByAdmission,
} from "@/core/hooks/care/laboratorio/useResultadosLaboratorio"
import { useGetEstudiosRayosXByAdmission } from "@/core/hooks/care/rayosX/useEstudiosRayosX"
import { useGetHojaGastosRegistros } from "@/core/hooks/care/hojaGastos/useHojaGastos"
import { useGetBillingMovementsByAdmission } from "@/core/hooks/care/billing/useGetBillingMovementsByAdmission"
import { useGetElectronicInvoiceByAdmission } from "@/core/hooks/care/billing/useGetElectronicInvoiceByAdmission"
import {
  useGetFuripsByAdmission,
  useGetFuripsDatosSistema,
} from "@/core/hooks/care/furips/useFurips"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import type { RecordStageKey } from "./admissionRecord.stages"

interface QueryState {
  isLoading: boolean
  isError: boolean
}

export interface StageStatus {
  isLoading: boolean
  isError: boolean
}

const statusOf = (queries: QueryState[]): StageStatus => ({
  isLoading: queries.some((q) => q.isLoading),
  isError: queries.some((q) => q.isError),
})

// Todo lo registrado en una admisión, de triage a facturación. Cada módulo se
// consulta con su endpoint by-admission existente, pero solo cuando su etapa está
// en `enabledStages` (la pestaña visitada o la impresión del expediente).
export function useAdmissionRecord(admissionId: number, enabledStages: RecordStageKey[]) {
  const idFor = (stage: RecordStageKey) =>
    enabledStages.includes(stage) ? admissionId : undefined

  // La admisión y el paciente van en el encabezado de todos los documentos.
  const admission = useGetAdmissionById(admissionId)
  const patient = useGetPatientById(admission.data?.patientId ?? null)
  const triage = useGetTriageById(idFor("ingreso") ? admission.data?.triageId ?? null : null)

  const historiaId = idFor("historia")
  const hcInicial = useGetHCInicialByAdmission(historiaId)
  const evoluciones = useGetEvolucionesByAdmission(historiaId)
  const evolucionEspecialistas = useGetEvolucionEspecialistasByAdmission(historiaId)
  const procedimientosMenores = useGetProcedimientosMenoresByAdmission(historiaId)
  const procedimientosDiagnosticos = useGetProcedimientosDiagnosticosByAdmission(historiaId)
  const procedimientosNoQx = useGetProcedimientosNoQxByAdmission(historiaId)
  const notasEnfermeria = useGetNotasEnfermeriaByAdmission(historiaId)
  const datosClinicosEgreso = useGetDatosClinicosEgresoByAdmission(historiaId)
  const diagnosticosEgreso = useGetDiagnosticosEgresoByIds(
    (datosClinicosEgreso.data ?? []).map((d) => d.diagnosticoEgresoId),
  )

  const notasMedicas = useGetNotasMedicasByAdmission(idFor("notas"))

  const descripcionesQuirurgicas = useGetDescripcionQuirurgicaByAdmission(idFor("cirugia"))
  const recordsAnestesia = useGetRecordsAnestesiaByAdmission(idFor("cirugia"))

  const ordenesMedicas = useGetOrdenesMedicasByAdmission(idFor("ordenes"))
  const medicamentosPos = useGetMedicamentosPosByAdmission(idFor("ordenes"))
  const aplicaciones = useGetOrdenesParaAplicar(idFor("ordenes"))

  const laboratorio = useGetResultadosLaboratorioByAdmission(idFor("apoyo"))
  const catalogoLaboratorio = useGetCatalogoLaboratorio(idFor("apoyo"))
  const rayosX = useGetEstudiosRayosXByAdmission(idFor("apoyo"))

  const hojaGastos = useGetHojaGastosRegistros(idFor("gastos"))

  const movimientos = useGetBillingMovementsByAdmission(idFor("facturacion"))
  const factura = useGetElectronicInvoiceByAdmission(idFor("facturacion"))
  const furips = useGetFuripsByAdmission(idFor("facturacion"))
  const furipsDatos = useGetFuripsDatosSistema(
    furips.data ? admissionId : null,
    INSTITUTION_PROVIDER_ID,
  )

  const stageStatus: Record<RecordStageKey, StageStatus> = {
    ingreso: statusOf([admission, patient, triage]),
    historia: statusOf([
      hcInicial, evoluciones, evolucionEspecialistas, procedimientosMenores,
      procedimientosDiagnosticos, procedimientosNoQx, notasEnfermeria, datosClinicosEgreso,
      { isLoading: diagnosticosEgreso.isLoading, isError: false },
    ]),
    notas: statusOf([notasMedicas]),
    cirugia: statusOf([descripcionesQuirurgicas, recordsAnestesia]),
    ordenes: statusOf([ordenesMedicas, medicamentosPos, aplicaciones]),
    apoyo: statusOf([laboratorio, catalogoLaboratorio, rayosX]),
    gastos: statusOf([hojaGastos]),
    facturacion: statusOf([movimientos, factura, furips, furipsDatos]),
  }

  return {
    stageStatus,
    admissionError: admission.error,
    isLoadingAdmission: admission.isLoading || patient.isLoading,
    admission: admission.data,
    patient: patient.data,
    triage: triage.data,
    hcInicial: hcInicial.data ?? null,
    notasMedicas: notasMedicas.data ?? [],
    evoluciones: evoluciones.data ?? [],
    evolucionEspecialistas: evolucionEspecialistas.data ?? [],
    procedimientosMenores: procedimientosMenores.data ?? [],
    procedimientosDiagnosticos: procedimientosDiagnosticos.data ?? [],
    procedimientosNoQx: procedimientosNoQx.data ?? [],
    notasEnfermeria: notasEnfermeria.data ?? [],
    datosClinicosEgreso: datosClinicosEgreso.data ?? [],
    diagnosticosEgreso: diagnosticosEgreso.data ?? [],
    descripcionesQuirurgicas: descripcionesQuirurgicas.data ?? [],
    recordsAnestesia: recordsAnestesia.data ?? [],
    ordenesMedicas: ordenesMedicas.data ?? [],
    medicamentosPos: medicamentosPos.data ?? [],
    aplicaciones: aplicaciones.data ?? [],
    laboratorio: laboratorio.data ?? [],
    catalogoLaboratorio: catalogoLaboratorio.data ?? [],
    rayosX: rayosX.data ?? [],
    hojaGastos: hojaGastos.data ?? [],
    movimientos: movimientos.data ?? [],
    factura: factura.data?.success ? factura.data : null,
    furips: furips.data ?? null,
    furipsDatos: furipsDatos.data,
  }
}

export type AdmissionRecord = ReturnType<typeof useAdmissionRecord>
