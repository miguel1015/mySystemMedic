import { ENDPOINTS } from "@/core/api/endpoints"
import { create, updatePut } from "@/core/api/baseService"
import {
  TChangeElectronicInvoiceEnvironment,
  TElectronicInvoiceCatalogItem,
  TElectronicInvoiceLocalSettings,
  TElectronicInvoiceSettings,
  TSaveElectronicInvoiceResolution,
  TSaveElectronicInvoiceSoftware,
  TUpdateElectronicInvoiceCompany,
  TUpdateElectronicInvoiceGeneral,
  TUploadElectronicInvoiceCertificate,
} from "@/core/interfaces/parameterization/electronicInvoicing"

const EP = ENDPOINTS.ELECTRONIC_INVOICING_SETTINGS

// getById/getAll de baseService descartan el mensaje del backend; aquí sí importa (por
// ejemplo, "el servicio de Facturación Electrónica no respondió").
async function getJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(endpoint, { method: "GET", credentials: "include" })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? `GET error: ${res.statusText}`)
  }

  return data as T
}

export const electronicInvoicingService = {
  get: () => getJson<TElectronicInvoiceSettings>(EP.GET),
  getCities: (stateId: number) =>
    getJson<TElectronicInvoiceCatalogItem[]>(EP.CITIES(stateId)),
  updateCompany: (data: TUpdateElectronicInvoiceCompany) =>
    updatePut<TElectronicInvoiceSettings, TUpdateElectronicInvoiceCompany>(EP.COMPANY, data),
  saveSoftware: (data: TSaveElectronicInvoiceSoftware) =>
    updatePut<TElectronicInvoiceSettings, TSaveElectronicInvoiceSoftware>(EP.SOFTWARE, data),
  changeEnvironment: (data: TChangeElectronicInvoiceEnvironment) =>
    updatePut<TElectronicInvoiceSettings, TChangeElectronicInvoiceEnvironment>(EP.ENVIRONMENT, data),
  createResolution: (data: TSaveElectronicInvoiceResolution) =>
    create<TElectronicInvoiceSettings, TSaveElectronicInvoiceResolution>(EP.RESOLUTIONS, data),
  updateResolution: (id: number, data: TSaveElectronicInvoiceResolution) =>
    updatePut<TElectronicInvoiceSettings, TSaveElectronicInvoiceResolution>(EP.RESOLUTION(id), data),
  activateResolution: (id: number) =>
    create<TElectronicInvoiceSettings, Record<string, never>>(EP.ACTIVATE_RESOLUTION(id), {}),
  uploadCertificate: (data: TUploadElectronicInvoiceCertificate) =>
    create<TElectronicInvoiceSettings, TUploadElectronicInvoiceCertificate>(EP.CERTIFICATE, data),
  updateGeneral: (data: TUpdateElectronicInvoiceGeneral) =>
    updatePut<TElectronicInvoiceLocalSettings, TUpdateElectronicInvoiceGeneral>(EP.GENERAL, data),
  updateNumbering: (id: number, nextNumber: number) =>
    updatePut<TElectronicInvoiceLocalSettings, { nextNumber: number }>(EP.NUMBERING(id), { nextNumber }),
}
