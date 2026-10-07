import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  CupsHomologationPage,
  CupsHomologationStatus,
  CupsHomologationUpdateResponse,
  CupsProcedure,
  CupsRipsType,
  CupsSuggestion,
} from "@/core/interfaces/parameterization/cups"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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

// Búsqueda en la tabla CUPS por código o palabras del nombre (mínimo 2 caracteres).
export function useCupsSearch(search: string, type?: CupsRipsType) {
  const term = search.trim()
  return useQuery({
    queryKey: ["cups", "search", term, type ?? null],
    queryFn: () => request<CupsProcedure[]>(ENDPOINTS.CUPS.SEARCH(term, type)),
    enabled: term.length >= 2,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

// Con `referenceCode` el backend devuelve primero los CUPS que homologa el manual tarifario.
export function useCupsSuggestions(
  description: string | null | undefined,
  type?: CupsRipsType,
  referenceCode?: number,
) {
  return useQuery({
    queryKey: ["cups", "suggestions", description ?? null, type ?? null, referenceCode ?? null],
    queryFn: () =>
      request<CupsSuggestion[]>(ENDPOINTS.CUPS.SUGGESTIONS(description!, type, referenceCode)),
    enabled: !!description?.trim(),
    staleTime: Infinity,
  })
}

export function useCupsHomologation(
  status: CupsHomologationStatus,
  search: string,
  page: number,
  pageSize: number,
) {
  return useQuery({
    queryKey: ["cups-homologation", status, search, page, pageSize],
    queryFn: () =>
      request<CupsHomologationPage>(ENDPOINTS.CUPS.HOMOLOGATION(status, search, page, pageSize)),
    placeholderData: keepPreviousData,
  })
}

// Asigna (o quita, con null) el CUPS a todos los detalles de tarifa con ese código del manual.
export function useUpdateCupsHomologation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ referenceCode, cupsCode }: { referenceCode: number; cupsCode: string | null }) =>
      request<CupsHomologationUpdateResponse>(ENDPOINTS.CUPS.UPDATE_HOMOLOGATION(referenceCode), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cupsCode }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cups-homologation"] })
      // Los detalles de tarifa y los cargos exponen el CUPS: se recargan.
      queryClient.invalidateQueries({ queryKey: ["tariffdetails"] })
      queryClient.invalidateQueries({ queryKey: ["billing-movements"] })
    },
  })
}

// Tipo de CUPS esperado según la categoría del cargo.
export function ripsTypeForServiceCategory(category: string | null | undefined): CupsRipsType {
  if (category === "Consulta") return "AC"
  if (category === "Estancia") return "AT"
  return "AP"
}
