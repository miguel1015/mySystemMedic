import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  SignatureTemplate,
  SignatureTemplateCreate,
  SignatureTemplateUpdate,
} from "@/core/interfaces/parameterization/signatures"

const QUERY_KEY = ["signatures"]

export const signaturesService = {
  getAll: () => getAll<SignatureTemplate[]>(ENDPOINTS.SIGNATURES.GET_ALL),
  create: (data: SignatureTemplateCreate) =>
    create<SignatureTemplate, SignatureTemplateCreate>(ENDPOINTS.SIGNATURES.GET_ALL, data),
  update: (id: number, data: SignatureTemplateUpdate) =>
    updatePut<SignatureTemplate, SignatureTemplateUpdate>(ENDPOINTS.SIGNATURES.ITEM(id), data),
  remove: (id: number) => remove<unknown>(ENDPOINTS.SIGNATURES.ITEM(id)),
}

export function useSignatures(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: signaturesService.getAll,
    staleTime: 60 * 1000,
    enabled,
  })
}

export function useCreateSignature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signaturesService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateSignature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SignatureTemplateUpdate }) =>
      signaturesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteSignature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signaturesService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
