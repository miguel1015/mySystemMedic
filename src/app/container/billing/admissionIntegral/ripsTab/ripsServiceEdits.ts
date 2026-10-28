import { classifyMovement } from "@/app/container/billing/rips/buildRips"
import type {
  BillingMovementBatchUpdateRequest,
  BillingMovementResponse,
} from "@/core/interfaces/care/billing"

// Categorías de la ventana. Insumos y Otros se reportan juntos en otrosServicios del RIPS;
// aquí se separan para revisarlos por aparte.
export type RipsCategory = "consultas" | "procedimientos" | "medicamentos" | "insumos" | "otros"

export const RIPS_CATEGORY_LABELS: Record<RipsCategory, string> = {
  consultas: "Consultas",
  procedimientos: "Procedimientos",
  medicamentos: "Medicamentos",
  insumos: "Insumos",
  otros: "Otros",
}

export const RIPS_CATEGORY_ORDER: RipsCategory[] = [
  "consultas",
  "procedimientos",
  "medicamentos",
  "insumos",
  "otros",
]

export function categoryOf(movement: BillingMovementResponse): RipsCategory {
  if (movement.movementType === "supply") return "insumos"
  const group = classifyMovement(movement)
  if (group === "consultas" || group === "procedimientos" || group === "medicamentos") return group
  return "otros"
}

// Campos del cargo que se pueden corregir desde la validación RIPS. Los de CUPS y presentación
// no se guardan en el cargo: llegan con el ítem elegido y sirven para recalcular el RIPS.
export type MovementEdit = Partial<
  Pick<
    BillingMovementResponse,
    | "itemId"
    | "itemCode"
    | "name"
    | "quantity"
    | "unitValue"
    | "serviceCategory"
    | "tipoItem"
    | "cupsCode"
    | "cupsRipsType"
    | "cupsEnabled"
    | "medicinePresentationCode"
    | "professionalUserId"
    | "professionalName"
    | "professionalDocumentTypeCode"
    | "professionalDocumentNumber"
  >
>

export type MovementEdits = Record<number, MovementEdit>

export function applyEdits(
  movements: BillingMovementResponse[],
  edits: MovementEdits,
): BillingMovementResponse[] {
  return movements.map((movement) => {
    const edit = edits[movement.id]
    if (!edit) return movement
    const merged = { ...movement, ...edit }
    return { ...merged, totalValue: merged.quantity * merged.unitValue }
  })
}

// Errores de formulario de los cargos editados, por id de cargo.
export function validateEdits(
  movements: BillingMovementResponse[],
  edits: MovementEdits,
): Record<number, string[]> {
  const errors: Record<number, string[]> = {}
  for (const movement of applyEdits(movements, edits)) {
    if (!edits[movement.id]) continue
    const list: string[] = []
    if (!movement.name.trim()) list.push("La descripción es obligatoria")
    if (movement.name.length > 500) list.push("La descripción no puede superar 500 caracteres")
    if (!Number.isInteger(movement.quantity) || movement.quantity < 1) {
      list.push("La cantidad debe ser un entero mayor a 0")
    }
    if (movement.unitValue == null || movement.unitValue < 0) {
      list.push("El valor unitario no puede ser negativo")
    }
    if (list.length > 0) errors[movement.id] = list
  }
  return errors
}

export function buildBatchRequest(
  movements: BillingMovementResponse[],
  edits: MovementEdits,
): BillingMovementBatchUpdateRequest {
  return {
    items: applyEdits(movements, edits)
      .filter((movement) => edits[movement.id])
      .map((movement) => ({
        id: movement.id,
        movementType: movement.movementType,
        itemId: movement.itemId,
        itemCode: movement.itemCode,
        name: movement.name.trim(),
        quantity: movement.quantity,
        unitValue: movement.unitValue,
        contractId: movement.contractId,
        serviceCategory: movement.serviceCategory,
        conceptType: movement.conceptType,
        conceptDetails: movement.conceptDetails,
        tipoItem: movement.tipoItem,
        notes: movement.notes,
        professionalUserId: movement.professionalUserId ?? null,
      })),
  }
}
