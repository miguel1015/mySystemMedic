import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TPharmaceuticalForm } from "@/core/interfaces/parameterization/types"
import { useQuery } from "@tanstack/react-query"

export const pharmaceuticalFormsServices = {
  getAll: () =>
    getAll<TPharmaceuticalForm[]>(ENDPOINTS.PHARMACEUTICAL_FORMS.GET_ALL),
}

export function usePharmaceuticalForms() {
  return useQuery({
    queryKey: ["pharmaceutical-forms"],
    queryFn: pharmaceuticalFormsServices.getAll,
  })
}
