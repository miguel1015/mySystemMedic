import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  DescripcionQuirurgicaCreateRequest,
  DescripcionQuirurgicaResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const descripcionQuirurgicaServices = {
  create: (data: DescripcionQuirurgicaCreateRequest) =>
    create<DescripcionQuirurgicaResponse, DescripcionQuirurgicaCreateRequest>(
      ENDPOINTS.DESCRIPCIONES_QUIRURGICAS.CREATE,
      data,
    ),
}

export function useCreateDescripcionQuirurgica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: descripcionQuirurgicaServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["descripciones-quirurgicas", "by-admission", String(data.admissionId)],
      })
    },
  })
}
