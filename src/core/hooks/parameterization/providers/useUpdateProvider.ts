import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TProvider } from "../../../interfaces/parameterization/types"
import { ENDPOINTS } from "../../../api/endpoints/endpoints"
import { updatePut } from "../../../api/baseService"

export const providerUpdateService = {
  update: (id: string | number, data: Partial<TProvider>) =>
    updatePut<TProvider, Partial<TProvider>>(ENDPOINTS.PROVIDERS.UPDATE(id), data),
}

export function useUpdateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<TProvider>;
    }) => providerUpdateService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider"] })
    },
  })
}
