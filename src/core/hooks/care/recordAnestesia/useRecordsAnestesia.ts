import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  RecordAnestesiaCreateRequest,
  RecordAnestesiaResponse,
  RecordAnestesiaUpdateRequest,
} from "@/core/interfaces/care/recordAnestesia"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const byAdmissionKey = (admissionId?: number | string) => [
  "records-anestesia",
  "by-admission",
  String(admissionId),
]

export function useGetRecordsAnestesiaByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: byAdmissionKey(admissionId),
    queryFn: () =>
      getAll<RecordAnestesiaResponse[]>(
        ENDPOINTS.RECORDS_ANESTESIA.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}

export function useCreateRecordAnestesia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecordAnestesiaCreateRequest) =>
      create<RecordAnestesiaResponse, RecordAnestesiaCreateRequest>(
        ENDPOINTS.RECORDS_ANESTESIA.CREATE,
        data,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(data.admissionId) })
    },
  })
}

export function useUpdateRecordAnestesia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecordAnestesiaUpdateRequest }) =>
      updatePut<RecordAnestesiaResponse, RecordAnestesiaUpdateRequest>(
        ENDPOINTS.RECORDS_ANESTESIA.UPDATE(id),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records-anestesia", "by-admission"] })
    },
  })
}

export function useDeleteRecordAnestesia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.RECORDS_ANESTESIA.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(variables.admissionId) })
    },
  })
}
