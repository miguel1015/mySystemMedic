import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { ElectronicInvoiceListItem } from "@/core/interfaces/care/billing"
import { useQuery } from "@tanstack/react-query"

export const electronicInvoicesService = {
  getAll: () => getAll<ElectronicInvoiceListItem[]>(ENDPOINTS.ELECTRONIC_INVOICE.GET_ALL),
}

export function useGetAllElectronicInvoices() {
  return useQuery({
    queryKey: ["electronic-invoices"],
    queryFn: electronicInvoicesService.getAll,
  })
}
