import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useGetTriageById } from "@/core/hooks/care/triage/useGetTriageById"
import { useGetAdmissionCompanion } from "@/core/hooks/care/admissions/useAdmissionCompanion"
import { useGetAdmissionReferral } from "@/core/hooks/care/admissions/useAdmissionReferral"
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
import type { AdmissionRecordSummary } from "@/core/interfaces/care/types"
import type { RecordStageKey } from "@/app/container/care/admissionHistory/detail/admissionRecord.stages"
import type { AdmissionRecord } from "@/app/container/care/admissionHistory/detail/useAdmissionRecord"
import type { ClinicalDocumentKind } from "./ClinicalHistoryDocuments"

// Unidad de carga de Consultar HC: cada módulo se pide por separado y solo si el
// resumen de la admisión dice que tiene registros.
export type ClinicalModule =
  | "ingreso"
  | "hcInicial"
  | "evoluciones"
  | "especialistas"
  | "procedimientos"
  | "notasEnfermeria"
  | "egreso"
  | "notasMedicas"
  | "cirugia"
  | "ordenes"
  | "formulasPos"
  | "aplicaciones"
  | "laboratorio"
  | "imagenes"
  | "gastos"

export const moduleCount = (summary: AdmissionRecordSummary, module: ClinicalModule): number => {
  switch (module) {
    case "ingreso": return 1
    case "hcInicial": return summary.hcInicial
    case "evoluciones": return summary.evoluciones
    case "especialistas": return summary.evolucionesEspecialista
    case "procedimientos":
      return summary.procedimientosMenores + summary.procedimientosDiagnosticos + summary.procedimientosNoQx
    case "notasEnfermeria": return summary.notasEnfermeria
    case "egreso": return summary.datosClinicosEgreso
    case "notasMedicas": return summary.notasMedicas
    case "cirugia": return summary.descripcionesQuirurgicas + summary.recordsAnestesia
    case "ordenes": return summary.ordenesMedicas
    case "formulasPos": return summary.medicamentosPos
    case "aplicaciones": return summary.aplicacionesMedicamentos
    case "laboratorio": return summary.resultadosLaboratorio
    case "imagenes": return summary.estudiosRayosX
    case "gastos": return summary.registrosHojaGastos
  }
}

// Lo que se ve al abrir la admisión: la tabla de especialidades y las hojas de gastos
// (sus conteos por tipo de hoja solo se conocen con los registros).
export const INITIAL_MODULES: ClinicalModule[] = ["hcInicial", "evoluciones", "especialistas", "egreso", "gastos"]

const HISTORIA_MODULES: ClinicalModule[] = [
  "hcInicial", "evoluciones", "especialistas", "procedimientos", "notasEnfermeria", "egreso",
]

export const STAGE_MODULES: Record<RecordStageKey, ClinicalModule[]> = {
  ingreso: ["ingreso"],
  historia: HISTORIA_MODULES,
  notas: ["notasMedicas"],
  cirugia: ["cirugia"],
  ordenes: ["ordenes", "formulasPos", "aplicaciones"],
  apoyo: ["laboratorio", "imagenes"],
  gastos: ["gastos"],
  facturacion: [],
}

export const DOCUMENT_MODULES = (kind: ClinicalDocumentKind): ClinicalModule[] => {
  if (kind.startsWith("gastos-")) return ["gastos"]
  if (kind === "epicrisis") return HISTORIA_MODULES
  return [kind as ClinicalModule]
}

interface QueryState {
  isLoading: boolean
  isError: boolean
}

// Registros clínicos de una admisión cargados por módulo. Devuelve la misma forma que
// el expediente del historial para reutilizar sus documentos de impresión.
export function useClinicalHistoryRecord(admissionId: number, modules: ClinicalModule[]) {
  const idFor = (module: ClinicalModule) => (modules.includes(module) ? admissionId : undefined)

  const admission = useGetAdmissionById(admissionId)
  const patient = useGetPatientById(admission.data?.patientId ?? null)
  const triage = useGetTriageById(idFor("ingreso") ? admission.data?.triageId ?? null : null)
  const companion = useGetAdmissionCompanion(idFor("ingreso"))
  const referral = useGetAdmissionReferral(idFor("ingreso"))

  const hcInicial = useGetHCInicialByAdmission(idFor("hcInicial"))
  const evoluciones = useGetEvolucionesByAdmission(idFor("evoluciones"))
  const evolucionEspecialistas = useGetEvolucionEspecialistasByAdmission(idFor("especialistas"))
  const procedimientosMenores = useGetProcedimientosMenoresByAdmission(idFor("procedimientos"))
  const procedimientosDiagnosticos = useGetProcedimientosDiagnosticosByAdmission(idFor("procedimientos"))
  const procedimientosNoQx = useGetProcedimientosNoQxByAdmission(idFor("procedimientos"))
  const notasEnfermeria = useGetNotasEnfermeriaByAdmission(idFor("notasEnfermeria"))
  const datosClinicosEgreso = useGetDatosClinicosEgresoByAdmission(idFor("egreso"))
  const diagnosticosEgreso = useGetDiagnosticosEgresoByIds(
    (datosClinicosEgreso.data ?? []).map((d) => d.diagnosticoEgresoId),
  )
  const notasMedicas = useGetNotasMedicasByAdmission(idFor("notasMedicas"))
  const descripcionesQuirurgicas = useGetDescripcionQuirurgicaByAdmission(idFor("cirugia"))
  const recordsAnestesia = useGetRecordsAnestesiaByAdmission(idFor("cirugia"))
  const ordenesMedicas = useGetOrdenesMedicasByAdmission(idFor("ordenes"))
  const medicamentosPos = useGetMedicamentosPosByAdmission(idFor("formulasPos"))
  const aplicaciones = useGetOrdenesParaAplicar(idFor("aplicaciones"))
  const laboratorio = useGetResultadosLaboratorioByAdmission(idFor("laboratorio"))
  const catalogoLaboratorio = useGetCatalogoLaboratorio(idFor("laboratorio"))
  const rayosX = useGetEstudiosRayosXByAdmission(idFor("imagenes"))
  const hojaGastos = useGetHojaGastosRegistros(idFor("gastos"))

  const moduleQueries: Record<ClinicalModule, QueryState[]> = {
    ingreso: [triage, companion, referral],
    hcInicial: [hcInicial],
    evoluciones: [evoluciones],
    especialistas: [evolucionEspecialistas],
    procedimientos: [procedimientosMenores, procedimientosDiagnosticos, procedimientosNoQx],
    notasEnfermeria: [notasEnfermeria],
    egreso: [datosClinicosEgreso, { isLoading: diagnosticosEgreso.isLoading, isError: false }],
    notasMedicas: [notasMedicas],
    cirugia: [descripcionesQuirurgicas, recordsAnestesia],
    ordenes: [ordenesMedicas],
    formulasPos: [medicamentosPos],
    aplicaciones: [aplicaciones],
    laboratorio: [laboratorio, catalogoLaboratorio],
    imagenes: [rayosX],
    gastos: [hojaGastos],
  }
  const moduleStatus = (module: ClinicalModule): QueryState => ({
    isLoading: moduleQueries[module].some((q) => q.isLoading),
    isError: moduleQueries[module].some((q) => q.isError),
  })
  const stageStatus = Object.fromEntries(
    (Object.keys(STAGE_MODULES) as RecordStageKey[]).map((stage) => {
      const states = STAGE_MODULES[stage].map(moduleStatus)
      return [stage, { isLoading: states.some((s) => s.isLoading), isError: states.some((s) => s.isError) }]
    }),
  ) as AdmissionRecord["stageStatus"]

  const record: AdmissionRecord = {
    stageStatus,
    admissionError: admission.error,
    isLoadingAdmission: admission.isLoading || patient.isLoading,
    admission: admission.data,
    patient: patient.data,
    triage: triage.data,
    companion: companion.data ?? null,
    referral: referral.data ?? null,
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
    // La facturación no hace parte de la historia clínica.
    movimientos: [],
    factura: null,
    furips: null,
    furipsDatos: undefined,
  }

  return { record, moduleStatus }
}
