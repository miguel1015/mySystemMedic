import { useQuery } from "@tanstack/react-query"
import { getById } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicine } from "../../../interfaces/parameterization/types"

export const medicineByIdService = {
  getById: (id: string | number) =>
    getById<TMedicine>(ENDPOINTS.MEDICINES.GET_BY_ID(id)),
}

export function useGetMedicineById(id: string | number) {
  return useQuery({
    queryKey: ["medicines", id],
    queryFn: () => medicineByIdService.getById(id),
    enabled: !!id,
  })
}
