import type { SelectOption } from "@/components/select"

// Catálogos DIAN (Anexo técnico de factura electrónica) usados por el servicio de
// Facturación Electrónica para armar el XML del emisor.

export const ENVIRONMENT_LABELS: Record<string, string> = {
  "1": "Pruebas",
  "2": "Habilitación (set de pruebas)",
  "3": "Producción",
}

export const ENVIRONMENT_OPTIONS: SelectOption[] = Object.entries(ENVIRONMENT_LABELS).map(
  ([value, label]) => ({ value, label }),
)

export const IDENTIFICATION_TYPE_OPTIONS: SelectOption[] = [
  { value: "11", label: "11 - Registro civil" },
  { value: "12", label: "12 - Tarjeta de identidad" },
  { value: "13", label: "13 - Cédula de ciudadanía" },
  { value: "21", label: "21 - Tarjeta de extranjería" },
  { value: "22", label: "22 - Cédula de extranjería" },
  { value: "31", label: "31 - NIT" },
  { value: "41", label: "41 - Pasaporte" },
  { value: "42", label: "42 - Documento de identificación extranjero" },
  { value: "47", label: "47 - PEP" },
  { value: "48", label: "48 - PPT" },
  { value: "50", label: "50 - NIT de otro país" },
  { value: "91", label: "91 - NUIP" },
]

export const REGIME_TYPE_OPTIONS: SelectOption[] = [
  { value: "04", label: "04 - Régimen simple" },
  { value: "05", label: "05 - Régimen ordinario" },
  { value: "48", label: "48 - Responsable de IVA" },
  { value: "49", label: "49 - No responsable de IVA" },
]

// Se guardan separadas por ";" (así las lee el servicio de Facturación Electrónica).
export const FISCAL_RESPONSIBILITY_OPTIONS: SelectOption[] = [
  { value: "O-13", label: "O-13 - Gran contribuyente" },
  { value: "O-15", label: "O-15 - Autorretenedor" },
  { value: "O-23", label: "O-23 - Agente de retención IVA" },
  { value: "O-47", label: "O-47 - Régimen simple de tributación" },
  { value: "R-99-PN", label: "R-99-PN - No aplica (otros)" },
]

// El servicio de Facturación Electrónica trata "1" como persona natural y cualquier otro
// valor como persona jurídica.
export const COMPANY_TYPE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 - Persona natural" },
  { value: "2", label: "2 - Persona jurídica" },
]

export const PAYMENT_MEANS_OPTIONS: SelectOption[] = [
  { value: "10", label: "10 - Efectivo" },
  { value: "20", label: "20 - Cheque" },
  { value: "42", label: "42 - Consignación bancaria" },
  { value: "47", label: "47 - Transferencia débito bancaria" },
  { value: "48", label: "48 - Tarjeta crédito" },
  { value: "49", label: "49 - Tarjeta débito" },
  { value: "ZZZ", label: "ZZZ - Acuerdo mutuo" },
]

export const PAYMENT_MEANS_DESCRIPTIONS: Record<string, string> = {
  "10": "EFECTIVO",
  "20": "CHEQUE",
  "42": "CONSIGNACION BANCARIA",
  "47": "TRANSFERENCIA DEBITO BANCARIA",
  "48": "TARJETA CREDITO",
  "49": "TARJETA DEBITO",
  ZZZ: "ACUERDO MUTUO",
}

// Si el valor guardado no está en el catálogo (por ejemplo, un código heredado), se agrega
// como opción para no perderlo al editar.
export function withCurrentOption(options: SelectOption[], current?: string | null): SelectOption[] {
  if (!current || options.some((o) => o.value === current)) return options
  return [...options, { value: current, label: `${current} (valor actual)` }]
}
