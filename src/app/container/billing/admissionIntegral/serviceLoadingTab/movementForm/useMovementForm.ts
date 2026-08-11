import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { useContractsByInsurer } from "@/core/hooks/parameterization/contracts/useGetAllContracts"
import { useCreateBillingMovement } from "@/core/hooks/care/billing/useCreateBillingMovement"
import { useUpdateBillingMovement } from "@/core/hooks/care/billing/useUpdateBillingMovement"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { BillingMovementResponse, BillingMovementType } from "@/core/interfaces/care/billing"

export interface MovementDraft {
  id?: number
  movementType: BillingMovementType
  itemId: number | null
  itemCode: string | null
  name: string
  quantity: number
  unitValue: number
  contractId: number | null
  serviceCategory: string | null
  notes: string | null
}

const movementSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  quantity: z
    .number({ required_error: "La cantidad es obligatoria" })
    .min(1, "La cantidad debe ser mayor a 0"),
  unitValue: z
    .number({ required_error: "El valor unitario es obligatorio" })
    .min(0, "El valor unitario no puede ser negativo"),
  contractId: z
    .number({ required_error: "El convenio es obligatorio" })
    .min(1, "Seleccione un convenio"),
  serviceCategory: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type MovementFormValues = z.infer<typeof movementSchema>

interface UseMovementFormArgs {
  admissionId: number
  admission: AdmissionResponse | undefined
  draft: MovementDraft | null
  onDone: (movement?: BillingMovementResponse) => void
}

const toOptions = (data: { id: number; contractName: string }[] | undefined) =>
  (data ?? []).map((contract) => ({ value: contract.id, label: contract.contractName }))

export function useMovementForm({ admissionId, admission, draft, onDone }: UseMovementFormArgs) {
  const { data: contracts, isLoading: isLoadingContracts } = useContractsByInsurer(
    admission?.epsId,
  )
  const createMovement = useCreateBillingMovement()
  const updateMovement = useUpdateBillingMovement()

  const { control, handleSubmit, reset } = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unitValue: 0,
      contractId: undefined as unknown as number,
      serviceCategory: null,
      notes: null,
    },
  })

  useEffect(() => {
    if (!draft) return
    reset({
      name: draft.name,
      quantity: draft.quantity,
      unitValue: draft.unitValue,
      contractId: draft.contractId ?? (admission?.convenioId as number | undefined),
      serviceCategory: draft.serviceCategory,
      notes: draft.notes,
    } as MovementFormValues)
  }, [draft, admission?.convenioId, reset])

  const contractOptions = toOptions(contracts)

  const onSubmit = (values: MovementFormValues) => {
    if (!draft) return

    const payload = {
      movementType: draft.movementType,
      itemId: draft.itemId,
      itemCode: draft.itemCode,
      name: values.name,
      quantity: values.quantity,
      unitValue: values.unitValue,
      contractId: values.contractId,
      serviceCategory: values.serviceCategory ?? null,
      notes: values.notes ?? null,
    }

    if (draft.id) {
      updateMovement.mutate(
        { id: draft.id, admissionId, data: payload },
        {
          onSuccess: (movement) => {
            toast.success("Movimiento actualizado correctamente.")
            onDone(movement)
          },
          onError: (err: Error) => {
            toast.error(err.message || "No se pudo actualizar el movimiento")
          },
        },
      )
      return
    }

    createMovement.mutate(
      { admissionId, ...payload },
      {
        onSuccess: (movement) => {
          toast.success("Movimiento agregado correctamente.")
          onDone(movement)
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo agregar el movimiento")
        },
      },
    )
  }

  return {
    control,
    handleSubmit,
    onSubmit,
    contractOptions,
    isLoadingContracts,
    isSubmitting: createMovement.isPending || updateMovement.isPending,
  }
}
