import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  EstudioCatalogo,
  ImportacionLaboratorioResponse,
  ResultadoLaboratorioCreateRequest,
  ResultadoLaboratorioResponse,
  ResultadoLaboratorioUpdateRequest,
} from "@/core/interfaces/care/laboratorio"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const byAdmissionKey = (admissionId?: number | string) => [
  "resultados-laboratorio",
  "by-admission",
  String(admissionId),
]

// Estudios con los rangos de referencia ya resueltos para el sexo del paciente.
export function useGetCatalogoLaboratorio(admissionId?: number | string) {
  return useQuery({
    queryKey: ["resultados-laboratorio", "catalogo", String(admissionId)],
    queryFn: () =>
      getAll<EstudioCatalogo[]>(ENDPOINTS.RESULTADOS_LABORATORIO.CATALOGO(admissionId!)),
    enabled: !!admissionId,
    staleTime: 30 * 60 * 1000,
  })
}

export function useGetResultadosLaboratorioByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: byAdmissionKey(admissionId),
    queryFn: () =>
      getAll<ResultadoLaboratorioResponse[]>(
        ENDPOINTS.RESULTADOS_LABORATORIO.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}

export function useCreateResultadoLaboratorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ResultadoLaboratorioCreateRequest) =>
      create<ResultadoLaboratorioResponse, ResultadoLaboratorioCreateRequest>(
        ENDPOINTS.RESULTADOS_LABORATORIO.CREATE,
        data,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(data.admissionId) })
    },
  })
}

export function useUpdateResultadoLaboratorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResultadoLaboratorioUpdateRequest }) =>
      updatePut<ResultadoLaboratorioResponse, ResultadoLaboratorioUpdateRequest>(
        ENDPOINTS.RESULTADOS_LABORATORIO.UPDATE(id),
        data,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(data.admissionId) })
    },
  })
}

export function useDeleteResultadoLaboratorio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.RESULTADOS_LABORATORIO.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(variables.admissionId) })
    },
  })
}

/* ─────────────── Excel ─────────────── */

async function errorMessage(res: Response) {
  const data = await res.json().catch(() => null)
  return (data && typeof data.error === "string" && data.error) || res.statusText || "Error del servidor"
}

const fileNameFrom = (header: string | null, fallback: string) => {
  const utf8 = header?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (utf8) return decodeURIComponent(utf8)
  return header?.match(/filename="?([^";]+)"?/i)?.[1] ?? fallback
}

// Descarga el Excel (plantilla o resultado guardado) y lo entrega al navegador.
export async function descargarExcelLaboratorio(endpoint: string, fallbackName: string) {
  const res = await fetch(endpoint, { credentials: "include" })
  if (!res.ok) throw new Error(await errorMessage(res))

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileNameFrom(res.headers.get("content-disposition"), fallbackName)
  link.click()
  URL.revokeObjectURL(url)
}

// Envía el Excel al backend para leerlo; devuelve los resultados sin guardarlos.
export function useImportarExcelLaboratorio() {
  return useMutation({
    mutationFn: async ({ admissionId, archivo }: { admissionId: number | string; archivo: File }) => {
      const form = new FormData()
      form.append("archivo", archivo)
      const res = await fetch(ENDPOINTS.RESULTADOS_LABORATORIO.IMPORTAR(admissionId), {
        method: "POST",
        credentials: "include",
        body: form,
      })
      if (!res.ok) throw new Error(await errorMessage(res))
      return (await res.json()) as ImportacionLaboratorioResponse
    },
  })
}
