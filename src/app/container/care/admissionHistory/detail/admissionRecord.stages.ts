import type { AdmissionRecordSummary } from "@/core/interfaces/care/types"

export type RecordStageKey =
  | "ingreso"
  | "historia"
  | "notas"
  | "cirugia"
  | "ordenes"
  | "apoyo"
  | "gastos"
  | "facturacion"

interface RecordStage {
  key: RecordStageKey
  title: string
  description: string
  // Se calcula con el resumen del backend, sin cargar los documentos.
  count: (summary: AdmissionRecordSummary) => number
}

// Etapas del proceso de una admisión, en el orden en que ocurren.
export const RECORD_STAGES: RecordStage[] = [
  {
    key: "ingreso",
    title: "Ingreso",
    description: "Triage y admisión",
    count: () => 1,
  },
  {
    key: "historia",
    title: "Historia clínica",
    description: "HC inicial, evoluciones, procedimientos, enfermería y egreso",
    count: (s) =>
      s.hcInicial +
      s.evoluciones +
      s.evolucionesEspecialista +
      s.procedimientosMenores +
      s.procedimientosDiagnosticos +
      s.procedimientosNoQx +
      s.notasEnfermeria +
      s.datosClinicosEgreso,
  },
  {
    key: "notas",
    title: "Notas médicas",
    description: "Notas médicas de la atención",
    count: (s) => s.notasMedicas,
  },
  {
    key: "cirugia",
    title: "Cirugía",
    description: "Descripciones quirúrgicas y records de anestesia",
    count: (s) => s.descripcionesQuirurgicas + s.recordsAnestesia,
  },
  {
    key: "ordenes",
    title: "Órdenes y medicamentos",
    description: "Órdenes médicas, medicamentos POS y aplicación de medicamentos",
    count: (s) => s.ordenesMedicas + s.medicamentosPos + s.aplicacionesMedicamentos,
  },
  {
    key: "apoyo",
    title: "Apoyo diagnóstico",
    description: "Resultados de laboratorio y estudios de rayos X",
    count: (s) => s.resultadosLaboratorio + s.estudiosRayosX,
  },
  {
    key: "gastos",
    title: "Hoja de gastos",
    description: "Servicios e insumos registrados",
    count: (s) => s.registrosHojaGastos,
  },
  {
    key: "facturacion",
    title: "Facturación",
    description: "Servicios facturados, factura electrónica y FURIPS",
    count: (s) => s.movimientosFacturacion + (s.numeroFactura ? 1 : 0) + s.furips,
  },
]
