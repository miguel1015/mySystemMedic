import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { CondicionSalidaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetCondicionesSalida() {
  return useQuery({
    queryKey: ["condiciones-salida"],
    queryFn: () => getAll<CondicionSalidaResponse[]>(ENDPOINTS.CONDICIONES_SALIDA.GET_ALL),
    staleTime: 5 * 60 * 1000,
  })
}
