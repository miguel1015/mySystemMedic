// Contrato de /api/electronic-invoicing/settings (MediNexus). Los parámetros DIAN se guardan
// en el servicio de Facturación Electrónica; MediNexus nunca devuelve los secretos (PIN del
// software, clave técnica, clave del certificado), solo si están configurados.

/** "1" pruebas, "2" habilitación (set de pruebas), "3" producción. */
export type TElectronicInvoiceEnvironment = "1" | "2" | "3"

export interface TElectronicInvoiceCompany {
  companyId: number
  companyNum: string
  name: string
  identificationType: string
  regimeType: string
  fiscalResponsibility: string
  operationType: string
  companyType: string
  address: string
  country: string
  stateCode: string
  cityCode: string
  postalZone: string
  phoneNum: string
  email: string
  companyLogo?: string | null
  primaryInvoiceColor?: string | null
  hasCertificatePin: boolean
}

export interface TElectronicInvoiceSoftware {
  dianSoftwareId: number
  dianCode: string
  name: string
  environment: TElectronicInvoiceEnvironment
  hasSoftwarePin: boolean
  hasTechnicalKey: boolean
}

export interface TElectronicInvoiceResolution {
  resolutionId: number
  resolutionNum: string
  prefix: string
  startRange: number
  endRange: number
  startDate: string
  endDate: string
  testSetId: string
  pdfType: string
  lastNumUsed?: string | null
  isActive: boolean
  isTestResolution: boolean
}

export interface TElectronicInvoiceCertificate {
  certificateId: number
  startDate: string
  endDate: string
  isActive: boolean
}

export interface TElectronicInvoiceCatalogItem {
  id: number
  code: string
  name: string
}

export interface TElectronicInvoiceNumbering {
  id: number
  prefix: string
  nextNumber: number
  updatedAt: string
}

export interface TElectronicInvoiceLocalSettings {
  activeResolutionId?: number | null
  activePrefix?: string | null
  paymentMeansCode: string
  paymentMeansDescription: string
  numberings: TElectronicInvoiceNumbering[]
}

export interface TElectronicInvoiceSettings {
  companyId: number
  company?: TElectronicInvoiceCompany | null
  software?: TElectronicInvoiceSoftware | null
  resolutions: TElectronicInvoiceResolution[]
  certificates: TElectronicInvoiceCertificate[]
  states: TElectronicInvoiceCatalogItem[]
  local: TElectronicInvoiceLocalSettings
}

export interface TUpdateElectronicInvoiceCompany {
  name: string
  identificationType: string
  regimeType: string
  fiscalResponsibility: string
  operationType: string
  companyType: string
  address: string
  stateCode: string
  cityCode: string
  postalZone: string
  phoneNum: string
  email: string
  /** undefined/null: conserva el logo actual. "": lo quita. */
  companyLogo?: string | null
  primaryInvoiceColor?: string | null
}

export interface TSaveElectronicInvoiceSoftware {
  dianCode: string
  name: string
  softwarePin?: string
  technicalKey?: string
}

export interface TChangeElectronicInvoiceEnvironment {
  environment: TElectronicInvoiceEnvironment
  resolutionId?: number
}

export interface TSaveElectronicInvoiceResolution {
  resolutionNum: string
  prefix: string
  startRange: number
  endRange: number
  startDate: string
  endDate: string
  testSetId?: string
  pdfType?: string
}

export interface TUploadElectronicInvoiceCertificate {
  fileBase64: string
  fileName: string
  password: string
}

export interface TUpdateElectronicInvoiceGeneral {
  paymentMeansCode: string
  paymentMeansDescription: string
}
