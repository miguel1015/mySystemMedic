import { ENDPOINTS } from "@/core/api/endpoints"
import type { ElectronicInvoiceResponse } from "@/core/interfaces/care/billing"
import { useQuery } from "@tanstack/react-query"

export async function fetchElectronicInvoiceByAdmission(
  admissionId: number | string,
): Promise<ElectronicInvoiceResponse | null> {
  const url = new URL(
    ENDPOINTS.ELECTRONIC_INVOICE.GET_BY_ADMISSION(admissionId),
    window.location.origin,
  )
  const res = await fetch(url.toString(), { credentials: "include" })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET error: ${res.statusText}`)

  return (await res.json()) as ElectronicInvoiceResponse
}

export function useGetElectronicInvoiceByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["electronic-invoice", "by-admission", admissionId ? String(admissionId) : admissionId],
    queryFn: () => fetchElectronicInvoiceByAdmission(admissionId!),
    enabled: !!admissionId,
  })
}
