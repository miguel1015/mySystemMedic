import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  FuripsDatosSistema,
  FuripsRequest,
  FuripsResponse,
} from "@/core/interfaces/care/furips"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Como baseService, pero con el mensaje del backend en el error y null si la admisión
// no tiene FURIPS (404), que no es un error sino "aún no se ha registrado".
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  })
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

async function requestOrNull<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { credentials: "include" })
  if (res.status === 404) return null
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error((data as { error?: string })?.error ?? res.statusText)
  }
  return (await res.json()) as T
}

const byAdmissionKey = (admissionId?: number | string) => [
  "furips",
  "by-admission",
  String(admissionId),
]

// FURIPS de la admisión; null si todavía no se ha registrado.
export function useGetFuripsByAdmission(admissionId?: number | string | null) {
  return useQuery({
    queryKey: byAdmissionKey(admissionId ?? undefined),
    queryFn: () => requestOrNull<FuripsResponse>(ENDPOINTS.FURIPS.GET_BY_ADMISSION(admissionId!)),
    enabled: !!admissionId,
  })
}

// Búsqueda de Facturación por número de factura o de admisión.
export type FuripsSearchCriteria = { admissionId: number } | { factura: string }

export function useSearchFurips(criteria: FuripsSearchCriteria | null) {
  return useQuery({
    queryKey: ["furips", "search", criteria],
    queryFn: () =>
      request<FuripsResponse>(
        ENDPOINTS.FURIPS.SEARCH(
          new URLSearchParams(
            Object.entries(criteria!).map(([key, value]) => [key, String(value)]),
          ).toString(),
        ),
      ),
    enabled: !!criteria,
    retry: false,
  })
}

export function useGetFuripsDatosSistema(
  admissionId?: number | string | null,
  providerId?: number | string,
) {
  return useQuery({
    queryKey: ["furips", "datos-sistema", String(admissionId), String(providerId)],
    queryFn: () =>
      request<FuripsDatosSistema>(ENDPOINTS.FURIPS.DATOS_SISTEMA(admissionId!, providerId!)),
    enabled: !!admissionId && !!providerId,
  })
}

export function useSaveFurips() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: FuripsRequest }) =>
      request<FuripsResponse>(id ? ENDPOINTS.FURIPS.UPDATE(id) : ENDPOINTS.FURIPS.CREATE, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(byAdmissionKey(data.admissionId), data)
      queryClient.invalidateQueries({ queryKey: ["furips", "search"] })
    },
  })
}
