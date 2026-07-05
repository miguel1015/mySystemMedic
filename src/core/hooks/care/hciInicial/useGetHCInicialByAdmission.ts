import { ENDPOINTS } from "@/core/api/endpoints"
import type { HCInicialResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export async function fetchHCInicialByAdmission(
  admissionId: number | string,
): Promise<HCInicialResponse | null> {
  const url = new URL(
    ENDPOINTS.HCINICIAL.GET_BY_ADMISSION(admissionId),
    window.location.origin,
  )
  const res = await fetch(url.toString(), { credentials: "include" })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET error: ${res.statusText}`)

  return (await res.json()) as HCInicialResponse
}

export function useGetHCInicialByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["hci-inicial", "by-admission", admissionId],
    queryFn: () => fetchHCInicialByAdmission(admissionId!),
    enabled: !!admissionId,
  })
}
