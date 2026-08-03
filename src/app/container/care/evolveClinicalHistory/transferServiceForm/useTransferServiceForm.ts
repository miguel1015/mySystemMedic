import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { AdmissionUpdateRequest } from "@/core/interfaces/care/types"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useAdmissionCatalogs } from "@/core/hooks/care/admissions/useAdmissionCatalogs"
import { useUpdateAdmission } from "@/core/hooks/care/admissions/useUpdateAdmission"

const transferSchema = z.object({
  careScopeId: z
    .number({ required_error: "El ámbito de atención es obligatorio" })
    .min(1, "Seleccione un ámbito de atención"),
})

export type TransferServiceFormValues = z.infer<typeof transferSchema>

interface UseTransferServiceFormArgs {
  admissionId: number | null
  onDone?: () => void
}

function toDateTimeLocal(value: string): string {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  return match ? `${match[1]}T${match[2]}` : value
}

const toOptions = (data: { id: number; name: string }[] | undefined) =>
  (data ?? []).map((x) => ({ value: x.id, label: x.name }))

export function useTransferServiceForm({
  admissionId,
  onDone,
}: UseTransferServiceFormArgs) {
  const {
    data: admission,
    isLoading: isLoadingAdmission,
    isError: isErrorAdmission,
    error: admissionError,
    refetch: refetchAdmission,
  } = useGetAdmissionById(admissionId)
  const { data: catalogs, isLoading: isLoadingCatalogs } = useAdmissionCatalogs()
  const updateAdmission = useUpdateAdmission()

  const { control, handleSubmit } = useForm<TransferServiceFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { careScopeId: undefined as unknown as number },
  })

  // El ámbito actual no se ofrece como destino: trasladar a donde ya está no es un traslado.
  const careScopeOptions = toOptions(catalogs?.careScopes).filter(
    (option) => Number(option.value) !== admission?.careScopeId,
  )

  const onSubmit = (data: TransferServiceFormValues) => {
    if (!admission || !admissionId) return

    const payload: AdmissionUpdateRequest = {
      admissionDate: toDateTimeLocal(admission.admissionDate),
      careModalityId: admission.careModalityId,
      careReasonId: admission.careReasonId,
      serviceClassificationId: admission.serviceClassificationId,
      serviceGroupId: admission.serviceGroupId,
      admissionTypeId: admission.admissionTypeId,
      careScopeId: data.careScopeId,
      carePurposeId: admission.carePurposeId,
      epsId: admission.epsId,
      convenioId: admission.convenioId,
    }

    updateAdmission.mutate(
      { id: admissionId, data: payload },
      {
        onSuccess: () => {
          toast.success("Traslado de servicio realizado correctamente.")
          onDone?.()
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo trasladar el servicio")
        },
      },
    )
  }

  return {
    control,
    handleSubmit,
    onSubmit,
    admission,
    isLoadingAdmission,
    isErrorAdmission,
    admissionError,
    refetchAdmission,
    isLoadingCatalogs,
    careScopeOptions,
    isSubmitting: updateAdmission.isPending,
  }
}
