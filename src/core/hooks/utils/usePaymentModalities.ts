import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useQuery } from "@tanstack/react-query"

interface TPaymentModality {
  id: number;
  name: string;
}

export function usePaymentModalities() {
  return useQuery({
    queryKey: ["payment-modalities"],
    queryFn: () => getAll<TPaymentModality[]>(ENDPOINTS.PAYMENT_MODALITIES.GET_ALL),
  })
}
