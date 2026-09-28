import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  TChangeElectronicInvoiceEnvironment,
  TElectronicInvoiceLocalSettings,
  TElectronicInvoiceSettings,
  TSaveElectronicInvoiceResolution,
  TSaveElectronicInvoiceSoftware,
  TUpdateElectronicInvoiceCompany,
  TUpdateElectronicInvoiceGeneral,
  TUploadElectronicInvoiceCertificate,
} from "@/core/interfaces/parameterization/electronicInvoicing"
import { electronicInvoicingService } from "./service"
import { ELECTRONIC_INVOICING_SETTINGS_KEY } from "./useGetElectronicInvoicingSettings"

// Cada mutación devuelve la configuración completa (o la parte local) ya actualizada,
// así que se escribe directo en la caché en vez de volver a consultar Facturación Electrónica.
function useSettingsMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<TElectronicInvoiceSettings>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (settings) => {
      queryClient.setQueryData(ELECTRONIC_INVOICING_SETTINGS_KEY, settings)
    },
  })
}

function useLocalSettingsMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<TElectronicInvoiceLocalSettings>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (local) => {
      queryClient.setQueryData<TElectronicInvoiceSettings>(
        ELECTRONIC_INVOICING_SETTINGS_KEY,
        (current) => (current ? { ...current, local } : current),
      )
    },
  })
}

export const useUpdateElectronicInvoiceCompany = () =>
  useSettingsMutation((data: TUpdateElectronicInvoiceCompany) =>
    electronicInvoicingService.updateCompany(data),
  )

export const useSaveElectronicInvoiceSoftware = () =>
  useSettingsMutation((data: TSaveElectronicInvoiceSoftware) =>
    electronicInvoicingService.saveSoftware(data),
  )

export const useChangeElectronicInvoiceEnvironment = () =>
  useSettingsMutation((data: TChangeElectronicInvoiceEnvironment) =>
    electronicInvoicingService.changeEnvironment(data),
  )

export const useSaveElectronicInvoiceResolution = () =>
  useSettingsMutation(
    ({ id, data }: { id?: number; data: TSaveElectronicInvoiceResolution }) =>
      id
        ? electronicInvoicingService.updateResolution(id, data)
        : electronicInvoicingService.createResolution(data),
  )

export const useActivateElectronicInvoiceResolution = () =>
  useSettingsMutation((id: number) => electronicInvoicingService.activateResolution(id))

export const useUploadElectronicInvoiceCertificate = () =>
  useSettingsMutation((data: TUploadElectronicInvoiceCertificate) =>
    electronicInvoicingService.uploadCertificate(data),
  )

export const useUpdateElectronicInvoiceGeneral = () =>
  useLocalSettingsMutation((data: TUpdateElectronicInvoiceGeneral) =>
    electronicInvoicingService.updateGeneral(data),
  )

export const useUpdateElectronicInvoiceNumbering = () =>
  useLocalSettingsMutation(({ id, nextNumber }: { id: number; nextNumber: number }) =>
    electronicInvoicingService.updateNumbering(id, nextNumber),
  )
