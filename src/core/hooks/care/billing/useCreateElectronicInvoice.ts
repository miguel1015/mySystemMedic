import { ENDPOINTS } from "@/core/api/endpoints"
import type { ElectronicInvoiceResponse } from "@/core/interfaces/care/billing"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export class ElectronicInvoiceAlreadyIssuedError extends Error {
  constructor() {
    super("Esta admisión ya fue facturada electrónicamente.")
    this.name = "ElectronicInvoiceAlreadyIssuedError"
  }
}

async function postElectronicInvoice(
  admissionId: number | string,
): Promise<ElectronicInvoiceResponse> {
  const res = await fetch(ENDPOINTS.ELECTRONIC_INVOICE.CREATE(admissionId), {
    method: "POST",
    credentials: "include",
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
    mutationFn: (admissionId: number | string) => postElectronicInvoice(admissionId),
    onSuccess: (_data, admissionId) => {
      queryClient.invalidateQueries({
        queryKey: ["electronic-invoice", "by-admission", String(admissionId)],
      })
    },
  })
}
