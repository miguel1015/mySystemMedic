import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMeasurementUnit } from "@/core/interfaces/parameterization/types"
import { useQuery } from "@tanstack/react-query"

export const measurementUnitsServices = {
  getAll: () => getAll<TMeasurementUnit[]>(ENDPOINTS.MEASUREMENT_UNITS.GET_ALL),
}

export function useMeasurementUnits() {
  return useQuery({
    queryKey: ["measurement-units"],
    queryFn: measurementUnitsServices.getAll,
  })
}
