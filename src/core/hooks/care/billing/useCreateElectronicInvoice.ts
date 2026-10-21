import { ENDPOINTS } from "@/core/api/endpoints"
import type { ElectronicInvoiceResponse } from "@/core/interfaces/care/billing"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { NEXT_INVOICE_NUMBER_KEY } from "./useGetNextInvoiceNumber"

export class ElectronicInvoiceAlreadyIssuedError extends Error {
  constructor() {
    super("Esta admisión ya fue facturada electrónicamente.")
    this.name = "ElectronicInvoiceAlreadyIssuedError"
  }
}

export interface CreateElectronicInvoiceInput {
  admissionId: number | string
  // Periodo de facturación de la FEV (InvoicePeriod) como YYYY-MM-DD.
  periodStart: string
  periodEnd: string
}

async function postElectronicInvoice({
  admissionId,
  periodStart,
  periodEnd,
}: CreateElectronicInvoiceInput): Promise<ElectronicInvoiceResponse> {
  const res = await fetch(ENDPOINTS.ELECTRONIC_INVOICE.CREATE(admissionId), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ periodStart, periodEnd }),
  })

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (res.ok) return data as ElectronicInvoiceResponse

  if (res.status === 409) throw new ElectronicInvoiceAlreadyIssuedError()

  const message =
    typeof data === "string"
      ? data
      : (data as { error?: string })?.error ?? res.statusText
  throw new Error(message)
}

export function useCreateElectronicInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postElectronicInvoice,
    onSuccess: (_data, { admissionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["electronic-invoice", "by-admission", String(admissionId)],
      })
      queryClient.invalidateQueries({ queryKey: NEXT_INVOICE_NUMBER_KEY })
    },
  })
}
