// Tipos de operación de la factura electrónica en salud (Res. 058:2020 de la Contaduría
// General de la Nación, /Invoice/cbc:CustomizationID). Deben coincidir con
// MediNexus.Domain.Admissions.InvoiceOperationTypes del backend; el valor viaja en la
// ExtensionSalud como TIPO_FACTURACION.
export const INVOICE_OPERATION_TYPES = {
  CUFE: "SS-CUFE",
  RECAUDO: "SS-Recaudo",
  SIN_APORTE: "SS-SinAporte",
  REPORTE: "SS-Reporte",
} as const

export type InvoiceOperationType =
  (typeof INVOICE_OPERATION_TYPES)[keyof typeof INVOICE_OPERATION_TYPES]

export const INVOICE_OPERATION_TYPE_OPTIONS: { value: InvoiceOperationType; label: string }[] = [
  { value: INVOICE_OPERATION_TYPES.CUFE, label: "SS-CUFE" },
  { value: INVOICE_OPERATION_TYPES.RECAUDO, label: "SS-Recaudo" },
  { value: INVOICE_OPERATION_TYPES.SIN_APORTE, label: "SS-Sin aporte" },
  { value: INVOICE_OPERATION_TYPES.REPORTE, label: "SS-Reporte" },
]

export const getInvoiceOperationTypeLabel = (value?: string | null) =>
  INVOICE_OPERATION_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? null

// SS-SinAporte: el usuario no hace aportes, así que póliza, recaudo y pagos no aplican.
export const isWithoutContribution = (value?: string | null) =>
  value === INVOICE_OPERATION_TYPES.SIN_APORTE
