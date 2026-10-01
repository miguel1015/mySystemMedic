import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ElectronicInvoiceAttachedDocument,
  ElectronicInvoiceListItem,
  ElectronicInvoiceSendEmailResponse,
} from "@/core/interfaces/care/billing"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init })
  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (!res.ok) {
    const message =
      typeof data === "string" ? data : (data as { error?: string })?.error ?? res.statusText
    throw new Error(message)
  }

  return data as T
}

export function useGetElectronicInvoiceById(id?: number | null) {
  return useQuery({
    queryKey: ["electronic-invoices", "detail", id],
    queryFn: () => request<ElectronicInvoiceListItem>(ENDPOINTS.ELECTRONIC_INVOICE.GET_BY_ID(id!)),
    enabled: !!id,
  })
}

const attachedDocumentKey = (id: number | null | undefined) => [
  "electronic-invoices",
  "attached-document",
  id,
]

export function fetchAttachedDocument(id: number) {
  return request<ElectronicInvoiceAttachedDocument>(
    ENDPOINTS.ELECTRONIC_INVOICE.ATTACHED_DOCUMENT(id),
  )
}

// El XML puede pesar bastante: solo se pide cuando la vista lo necesita (enabled).
export function useGetElectronicInvoiceAttachedDocument(id?: number | null, enabled = true) {
  return useQuery({
    queryKey: attachedDocumentKey(id),
    queryFn: () => fetchAttachedDocument(id!),
    enabled: !!id && enabled,
    retry: false,
    staleTime: Infinity,
  })
}

// Descarga el AttachedDocument como archivo .xml (reutiliza la caché si ya se pidió).
export function useDownloadAttachedDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const doc = await queryClient.fetchQuery({
        queryKey: attachedDocumentKey(id),
        queryFn: () => fetchAttachedDocument(id),
        staleTime: Infinity,
      })
      downloadBase64File(doc.base64, doc.fileName, "application/xml")
      return doc
    },
    onSuccess: () => {
      // La primera consulta puede haber guardado el XML en MediNexus.
      queryClient.invalidateQueries({ queryKey: ["electronic-invoices"], exact: true })
      queryClient.invalidateQueries({ queryKey: ["electronic-invoices", "detail"] })
    },
  })
}

export function useSendElectronicInvoiceEmail() {
  return useMutation({
    mutationFn: ({ id, email }: { id: number; email?: string }) =>
      request<ElectronicInvoiceSendEmailResponse>(ENDPOINTS.ELECTRONIC_INVOICE.SEND_EMAIL(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email?.trim() || null }),
      }),
  })
}

export function downloadBase64File(base64: string, fileName: string, mimeType: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
