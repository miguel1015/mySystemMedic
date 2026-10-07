export type BillingMovementType = "service" | "medicine" | "supply" | "surgery"

export const BILLING_SERVICE_CATEGORIES = [
  "Consulta",
  "Procedimiento",
  "Imagen diagnóstica / RX",
  "Laboratorio",
  "Procedimiento quirúrgico",
  "Estancia",
] as const

export type BillingServiceCategory = (typeof BILLING_SERVICE_CATEGORIES)[number]

export const SURGICAL_CONCEPT_TYPES = [
  { value: "HONORARIO_CIRUJANO", label: "Honorario cirujano" },
  { value: "HONORARIO_ANESTESIOLOGO", label: "Honorario anestesiólogo" },
  { value: "HONORARIO_AYUDANTIA", label: "Honorario ayudantía" },
  { value: "DERECHO_SALA", label: "Derechos de sala" },
  { value: "MATERIALES", label: "Materiales de cirugía" },
] as const

export type SurgicalConceptType = (typeof SURGICAL_CONCEPT_TYPES)[number]["value"]

export interface SurgicalConceptDetail {
  itemId: number
  conceptType: string
  code: number
  label: string
  qxGroup: string | null
  unitValue: number
  percentageApplied?: number
}

export function parseConceptDetails(json: string | null | undefined): SurgicalConceptDetail[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function serializeConceptDetails(details: SurgicalConceptDetail[]): string {
  return JSON.stringify(details)
}

export interface BillingMovementResponse {
  id: number
  admissionId: number
  movementType: BillingMovementType
  itemId: number | null
  itemCode: string | null
  name: string
  quantity: number
  unitValue: number
  totalValue: number
  contractId: number | null
  contractName: string | null
  serviceCategory: string | null
  conceptType: string | null
  conceptDetails: string | null
  tipoItem: string | null
  notes: string | null
  // CUPS del detalle de tarifa (servicios y cirugías) que se reporta en el RIPS.
  cupsCode?: string | null
  // Tipo RIPS del código en la tabla CUPSRips: AC = consulta, AP = procedimiento,
  // AT = estancia / otros servicios. null si el código no está en la tabla.
  cupsRipsType?: string | null
  // Si el código está habilitado en CUPSRips (el MUV rechaza los deshabilitados).
  cupsEnabled?: boolean | null
  // Código de la unidad mínima de dispensación del medicamento (tabla UPR), ej. 66 = tableta.
  medicinePresentationCode?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BillingMovementCreateRequest {
  admissionId: number
  movementType: BillingMovementType
  itemId: number | null
  itemCode: string | null
  name: string
  quantity: number
  unitValue: number
  contractId: number | null
  serviceCategory: string | null
  conceptType: string | null
  conceptDetails: string | null
  // Tipo de servicio (serviceCategory) que el backend reenvía como TipoItem en cada
  // línea de la factura electrónica.
  tipoItem: string | null
  notes: string | null
}

export type BillingMovementUpdateRequest = Omit<
  BillingMovementCreateRequest,
  "admissionId"
>

export interface ElectronicInvoiceResponse {
  id: number
  admissionId: number
  invoiceNum: string
  success: boolean
  cufe: string | null
  stateDian: string | null
  pdfUrl: string | null
  pdfBase64: string | null
  errorMessage: string | null
  createdAt: string
}

export interface ElectronicInvoiceListItem {
  id: number
  admissionId: number
  invoiceNum: string
  cufe: string | null
  stateDian: string | null
  pdfUrl: string | null
  pdfBase64: string | null
  createdAt: string
  patientName: string
  patientDocument: string | null
  insurerName: string | null
  patientEmail: string | null
  // Indica si MediNexus ya tiene guardado el XML (AttachedDocument). Si es false, el
  // backend lo pide a Facturación Electrónica la primera vez que se consulta.
  hasAttachedDocument: boolean
}

// AttachedDocument: XML de la factura firmada + respuesta de la DIAN, en Base64. Es el
// que se envía al adquiriente y el que exige el MUV (xmlFevFile) junto al RIPS.
export interface ElectronicInvoiceAttachedDocument {
  id: number
  invoiceNum: string
  fileName: string
  base64: string
}

export interface ElectronicInvoiceSendEmailResponse {
  email: string
  message: string
}
