import { useQuery } from "@tanstack/react-query"
import { electronicInvoicingService } from "./service"

export const ELECTRONIC_INVOICING_SETTINGS_KEY = ["electronic-invoicing-settings"]

export function useGetElectronicInvoicingSettings() {
  return useQuery({
    queryKey: ELECTRONIC_INVOICING_SETTINGS_KEY,
    queryFn: electronicInvoicingService.get,
    // El servicio de Facturación Electrónica puede tardar en despertar; no se reintenta
    // automáticamente para no encadenar esperas largas.
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export function useGetElectronicInvoicingCities(stateId?: number) {
  return useQuery({
    queryKey: ["electronic-invoicing-cities", stateId],
    queryFn: () => electronicInvoicingService.getCities(stateId!),
    enabled: !!stateId,
    staleTime: Infinity,
    retry: false,
  })
}
