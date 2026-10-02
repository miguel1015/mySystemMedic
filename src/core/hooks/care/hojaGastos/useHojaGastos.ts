import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  AsistencialOption,
  ConceptoGasto,
  HojaGastoRegistro,
  HojaGastosBatchRequest,
  HojaGastosBatchResponse,
  TipoHojaGastos,
  TipoServicioGastos,
} from "@/core/interfaces/care/hojaGastos"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const registrosKey = (admissionId?: number | string, tipoHoja?: TipoHojaGastos) => [
  "hojas-gastos",
  "by-admission",
  String(admissionId),
  tipoHoja ?? "all",
]

export function useGetAsistenciales() {
  return useQuery({
    queryKey: ["hojas-gastos", "asistenciales"],
    queryFn: () => getAll<AsistencialOption[]>(ENDPOINTS.HOJAS_GASTOS.ASISTENCIALES),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBuscarConceptosGasto(tipoServicio: TipoServicioGastos, search: string) {
  const term = search.trim()

  return useQuery({
    queryKey: ["hojas-gastos", "conceptos", tipoServicio, term],
    queryFn: () =>
      getAll<ConceptoGasto[]>(ENDPOINTS.HOJAS_GASTOS.CONCEPTOS, {
        params: term ? { tipoServicio, search: term } : { tipoServicio },
      }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}

export function useGetHojaGastosRegistros(
  admissionId?: number | string,
  tipoHoja?: TipoHojaGastos,
) {
  return useQuery({
    queryKey: registrosKey(admissionId, tipoHoja),
    queryFn: () =>
      getAll<HojaGastoRegistro[]>(ENDPOINTS.HOJAS_GASTOS.GET_BY_ADMISSION(admissionId!), {
        params: tipoHoja ? { tipoHoja } : undefined,
      }),
    enabled: !!admissionId,
  })
}

const invalidateRegistros = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: ["hojas-gastos", "by-admission"] })

export function useGuardarHojaGastos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HojaGastosBatchRequest) =>
      create<HojaGastosBatchResponse, HojaGastosBatchRequest>(
        ENDPOINTS.HOJAS_GASTOS.SAVE_BATCH,
        data,
      ),
    onSuccess: () => invalidateRegistros(queryClient),
  })
}

export function useActualizarCantidadGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, cantidad }: { id: number; cantidad: number }) =>
      updatePut<HojaGastoRegistro, { cantidad: number }>(
        ENDPOINTS.HOJAS_GASTOS.UPDATE_CANTIDAD(id),
        { cantidad },
      ),
    onSuccess: () => invalidateRegistros(queryClient),
  })
}

export function useEliminarRegistroGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      remove<{ ok: boolean }>(ENDPOINTS.HOJAS_GASTOS.DELETE(id)),
    onSuccess: () => invalidateRegistros(queryClient),
  })
}
