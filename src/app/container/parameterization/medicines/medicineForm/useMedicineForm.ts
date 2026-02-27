import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { useCreateMedicine } from "@/core/hooks/parameterization/medicines/useCreateMedicine"
import { useUpdateMedicine } from "@/core/hooks/parameterization/medicines/useUpdateMedicine"
import { useGetMedicineById } from "@/core/hooks/parameterization/medicines/useGetByIdMedicine"
import { TUtils } from "../../../../../types/utils"

const schema = z.object({
  name: z.string().min(1, "Nombre del medicamento es obligatorio"),
  cum: z.string().min(1, "CUM es obligatorio"),
  concentration: z.string().min(1, "Concentración es obligatoria"),
  measurementUnitSidamId: z.string().min(1, "Unidad de medida es obligatoria"),
  administrationRouteCode: z
    .string()
    .min(1, "Vía de administración es obligatoria"),
  pharmaceuticalFormCode: z
    .string()
    .min(1, "Forma farmacéutica es obligatoria"),
  presentationCode: z.string().min(1, "Presentación es obligatoria"),
  medicineGroupCode: z
    .string()
    .min(1, "Grupo de medicamento es obligatorio"),
  atc: z.string().min(1, "ATC es obligatorio"),
  invima: z.string().min(1, "Código INVIMA es obligatorio"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
})

export type TMedicineForm = z.infer<typeof schema>

const defaultValues: TMedicineForm = {
  name: "",
  cum: "",
  concentration: "",
  measurementUnitSidamId: "",
  administrationRouteCode: "",
  pharmaceuticalFormCode: "",
  presentationCode: "",
  medicineGroupCode: "",
  atc: "",
  invima: "",
  price: 0,
}

export function useMedicineForm({
  setOpen,
  editUserId,
  setEditUserId,
}: Pick<TUtils, "setOpen" | "editUserId" | "setEditUserId">) {
  const createMedicine = useCreateMedicine()
  const updateMedicine = useUpdateMedicine()
  const { data: medicineData, isLoading: loadingMedicine } =
    useGetMedicineById(Number(editUserId))

  const { control, handleSubmit, reset } = useForm<TMedicineForm>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (editUserId && medicineData) {
      reset({
        name: medicineData.name ?? "",
        cum: medicineData.cum ?? "",
        concentration: medicineData.concentration ?? "",
        measurementUnitSidamId: medicineData.measurementUnitSidamId ?? "",
        administrationRouteCode: medicineData.administrationRouteCode ?? "",
        pharmaceuticalFormCode: medicineData.pharmaceuticalFormCode ?? "",
        presentationCode: medicineData.presentationCode ?? "",
        medicineGroupCode: medicineData.medicineGroupCode ?? "",
        atc: medicineData.atc ?? "",
        invima: medicineData.invima ?? "",
        price: medicineData.price ?? 0,
      })
    }
  }, [editUserId, medicineData, reset])

  const onSubmit = (data: TMedicineForm) => {
    if (editUserId) {
      updateMedicine.mutate(
        { id: editUserId, data },
        {
          onSuccess: () => {
            setOpen(false)
            setEditUserId(null)
            toast.success("Medicamento actualizado correctamente")
          },
          onError: (err: Error) => {
            toast.error(err.message)
          },
        },
      )
      return
    }

    createMedicine.mutate(data, {
      onSuccess: () => {
        reset()
        setOpen(false)
        toast.success("Medicamento creado correctamente")
      },
      onError: (err: Error) => {
        toast.error(err.message)
      },
    })
  }

  return {
    control,
    handleSubmit,
    onSubmit,
    loadingMedicine,
    isSubmitting: createMedicine.isPending || updateMedicine.isPending,
  }
}
