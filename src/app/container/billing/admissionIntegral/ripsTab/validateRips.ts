import type { DiagnosticoEgresoResponse } from "@/core/interfaces/care/hciInicial"
import type { Cie10CodeResponse } from "@/core/interfaces/care/hciInicial"
import type { BillingMovementResponse } from "@/core/interfaces/care/billing"
import type { AdmissionResponse } from "@/core/interfaces/care/types"

export interface RipsValidationResult {
  isValid: boolean
  issues: string[]
}

interface ValidateRipsArgs {
  admission: AdmissionResponse | undefined
  diagnosticosIngreso: Cie10CodeResponse[]
  diagnosticoEgreso: DiagnosticoEgresoResponse | null
  movements: BillingMovementResponse[]
}

export function validateRips({
  admission,
  diagnosticosIngreso,
  diagnosticoEgreso,
  movements,
}: ValidateRipsArgs): RipsValidationResult {
  const issues: string[] = []

  if (!admission) {
    return { isValid: false, issues: ["No se pudo cargar la información de la admisión."] }
  }

  if (!admission.documentoPatiente) {
    issues.push("La admisión no tiene documento de paciente registrado.")
  }

  if (!admission.epsId) {
    issues.push("La admisión no tiene EPS asociada.")
  }

  if (!admission.convenioId) {
    issues.push("La admisión no tiene convenio/contrato asociado.")
  }

  if (diagnosticosIngreso.length === 0) {
    issues.push(
      "No hay diagnósticos de ingreso registrados en la historia clínica inicial.",
    )
  }

  if (!diagnosticoEgreso) {
    issues.push("No hay diagnóstico de egreso registrado para la admisión.")
  } else if (!diagnosticoEgreso.fechaEgreso) {
    issues.push("El registro de egreso no tiene fecha de egreso.")
  }

  if (movements.length === 0) {
    issues.push("No hay servicios, medicamentos o insumos cargados para la admisión.")
  } else {
    if (movements.some((movement) => !movement.contractId)) {
      issues.push("Hay movimientos cargados sin convenio asociado.")
    }
    if (movements.some((movement) => movement.quantity <= 0 || movement.unitValue < 0)) {
      issues.push("Hay movimientos con cantidad o valor unitario inválido.")
    }
  }

  return { isValid: issues.length === 0, issues }
}
