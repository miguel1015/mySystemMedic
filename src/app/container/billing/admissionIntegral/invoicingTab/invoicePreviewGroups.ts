import { BillingMovementResponse, parseConceptDetails } from "@/core/interfaces/care/billing"

export type InvoiceGroupKey =
  | "consultas"
  | "estancias"
  | "procedimientosDiagnosticos"
  | "procedimientosQuirurgicos"
  | "procedimientosNoQuirurgicos"
  | "materiales"
  | "medicamentos"

export const INVOICE_GROUP_ORDER: InvoiceGroupKey[] = [
  "consultas",
  "estancias",
  "procedimientosDiagnosticos",
  "procedimientosQuirurgicos",
  "procedimientosNoQuirurgicos",
  "materiales",
  "medicamentos",
]

export const INVOICE_GROUP_LABELS: Record<InvoiceGroupKey, string> = {
  consultas: "Consultas",
  estancias: "Estancias",
  procedimientosDiagnosticos: "Procedimientos diagnósticos",
  procedimientosQuirurgicos: "Procedimientos quirúrgicos",
  procedimientosNoQuirurgicos: "Procedimientos no quirúrgicos",
  materiales: "Materiales e insumos",
  medicamentos: "Medicamentos",
}

export interface InvoicePreviewRow {
  key: string
  itemNumber: number | null
  code: string | null
  description: string
  quantity: number | null
  unitValue: number | null
  totalValue: number | null
  isHeader?: boolean
  isSubItem?: boolean
}

export interface InvoiceGroup {
  key: InvoiceGroupKey
  label: string
  rows: InvoicePreviewRow[]
  subtotal: number
}

function classifyMovement(movement: BillingMovementResponse): InvoiceGroupKey {
  if (movement.movementType === "medicine") return "medicamentos"
  if (movement.movementType === "supply") return "materiales"
  if (movement.movementType === "surgery") return "procedimientosQuirurgicos"

  switch (movement.serviceCategory) {
    case "Consulta":
      return "consultas"
    case "Laboratorio":
    case "Imagen diagnóstica / RX":
      return "procedimientosDiagnosticos"
    case "Estancia":
      return "estancias"
    case "Procedimiento quirúrgico":
      return "procedimientosQuirurgicos"
    case "Procedimiento":
    default:
      // "Otro" ya no es una opción seleccionable en el formulario, pero movimientos
      // antiguos guardados con esa categoría (u otro valor inesperado) caen aquí en
      // vez de perderse de la prefactura.
      return "procedimientosNoQuirurgicos"
  }
}

function buildMovementRows(movement: BillingMovementResponse): Omit<InvoicePreviewRow, "itemNumber">[] {
  const total = movement.totalValue ?? movement.quantity * movement.unitValue

  if (movement.movementType === "surgery") {
    const concepts = parseConceptDetails(movement.conceptDetails)

    if (concepts.length > 0) {
      return [
        {
          key: `mov-${movement.id}-header`,
          code: movement.itemCode,
          description: movement.name,
          quantity: null,
          unitValue: null,
          totalValue: null,
          isHeader: true,
        },
        ...concepts.map((concept, index) => ({
          key: `mov-${movement.id}-concept-${index}`,
          code: String(concept.code),
          description: concept.qxGroup ? `${concept.label} - ${concept.qxGroup}` : concept.label,
          quantity: 1,
          unitValue: concept.unitValue,
          totalValue: concept.unitValue,
          isSubItem: true,
        })),
      ]
    }
  }

  return [
    {
      key: `mov-${movement.id}`,
      code: movement.itemCode,
      description: movement.name,
      quantity: movement.quantity,
      unitValue: movement.unitValue,
      totalValue: total,
    },
  ]
}

export function buildInvoiceGroups(movements: BillingMovementResponse[]): InvoiceGroup[] {
  const rowsByGroup = new Map<InvoiceGroupKey, Omit<InvoicePreviewRow, "itemNumber">[]>()
  const subtotalByGroup = new Map<InvoiceGroupKey, number>()

  INVOICE_GROUP_ORDER.forEach((key) => {
    rowsByGroup.set(key, [])
    subtotalByGroup.set(key, 0)
  })

  movements.forEach((movement) => {
    const groupKey = classifyMovement(movement)
    const rows = buildMovementRows(movement)
    const total = movement.totalValue ?? movement.quantity * movement.unitValue

    rowsByGroup.get(groupKey)!.push(...rows)
    subtotalByGroup.set(groupKey, (subtotalByGroup.get(groupKey) ?? 0) + total)
  })

  let itemCounter = 0

  return INVOICE_GROUP_ORDER.map((key) => {
    const rows: InvoicePreviewRow[] = (rowsByGroup.get(key) ?? []).map((row) => {
      if (row.isSubItem) return { ...row, itemNumber: null }
      itemCounter += 1
      return { ...row, itemNumber: itemCounter }
    })

    return {
      key,
      label: INVOICE_GROUP_LABELS[key],
      rows,
      subtotal: subtotalByGroup.get(key) ?? 0,
    }
  })
}
