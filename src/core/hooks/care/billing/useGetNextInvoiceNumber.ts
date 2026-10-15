import { ENDPOINTS } from "@/core/api/endpoints"
import type { ElectronicInvoiceNextNumberResponse } from "@/core/interfaces/care/billing"
import { useQuery } from "@tanstack/react-query"

export const NEXT_INVOICE_NUMBER_KEY = ["electronic-invoice", "next-number"]

// 404 = no hay resolución activa o consecutivo configurado para su prefijo.
async function fetchNextInvoiceNumber(): Promise<ElectronicInvoiceNextNumberResponse | null> {
  const res = await fetch(ENDPOINTS.ELECTRONIC_INVOICE.NEXT_NUMBER, { credentials: "include" })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET error: ${res.statusText}`)

  return (await res.json()) as ElectronicInvoiceNextNumberResponse
}

export function useGetNextInvoiceNumber(enabled = true) {
  return useQuery({
    queryKey: NEXT_INVOICE_NUMBER_KEY,
    queryFn: fetchNextInvoiceNumber,
    enabled,
  })
}
