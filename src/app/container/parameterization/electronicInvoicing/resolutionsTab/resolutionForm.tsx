"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Button } from "antd"
import Input from "@/components/input"
import GridContainer from "@/components/componentLayout"
import { useSaveElectronicInvoiceResolution } from "@/core/hooks/parameterization/electronicInvoicing/useElectronicInvoicingMutations"
import { TElectronicInvoiceResolution } from "@/core/interfaces/parameterization/electronicInvoicing"
import { toDateInput } from "../utils"

const numberField = (message: string) =>
  z.number({ required_error: message, invalid_type_error: message }).int(message).min(0, message)

const resolutionSchema = z
  .object({
    resolutionNum: z.string().trim().min(1, "El número de resolución es obligatorio"),
    prefix: z
      .string()
      .trim()
      .min(1, "El prefijo es obligatorio")
      .regex(/^[A-Za-z0-9]+$/, "El prefijo solo admite letras y números"),
    startRange: numberField("Rango inicial inválido"),
    endRange: numberField("Rango final inválido"),
    startDate: z.string().min(1, "La fecha inicial es obligatoria"),
    endDate: z.string().min(1, "La fecha final es obligatoria"),
    testSetId: z.string().optional(),
    pdfType: z.string().optional(),
  })
  .refine((d) => d.endRange >= d.startRange, {
    path: ["endRange"],
    message: "Debe ser mayor o igual al rango inicial",
  })
  .refine((d) => d.endDate >= d.startDate, {
    path: ["endDate"],
    message: "Debe ser posterior a la fecha inicial",
  })

type TResolutionForm = z.infer<typeof resolutionSchema>

const emptyValues: Partial<TResolutionForm> = {
  resolutionNum: "",
  prefix: "",
  startRange: undefined,
  endRange: undefined,
  startDate: "",
  endDate: "",
  testSetId: "",
  pdfType: "FEC",
}

interface ResolutionFormProps {
  resolution?: TElectronicInvoiceResolution | null
  onDone: () => void
}

export default function ResolutionForm({ resolution, onDone }: ResolutionFormProps) {
  const saveResolution = useSaveElectronicInvoiceResolution()

  const { control, handleSubmit, reset } = useForm<TResolutionForm>({
    resolver: zodResolver(resolutionSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    reset(
      resolution
        ? {
            resolutionNum: resolution.resolutionNum,
            prefix: resolution.prefix,
            startRange: resolution.startRange,
            endRange: resolution.endRange,
            startDate: toDateInput(resolution.startDate),
            endDate: toDateInput(resolution.endDate),
            testSetId: resolution.testSetId === "N/A" ? "" : resolution.testSetId,
            pdfType: resolution.pdfType || "FEC",
          }
        : emptyValues,
    )
  }, [resolution, reset])

  const onSubmit = (data: TResolutionForm) => {
    saveResolution.mutate(
      {
        id: resolution?.resolutionId,
        data: {
          ...data,
          prefix: data.prefix.toUpperCase(),
          testSetId: data.testSetId?.trim() || undefined,
          pdfType: data.pdfType?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(resolution ? "Resolución actualizada" : "Resolución creada")
          onDone()
        },
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => toast.error("Revise los campos obligatorios del formulario"))}
    >
      <GridContainer columns="col-12 col-md-6" gap="g-3">
        <Input name="resolutionNum" label="Número de resolución" placeholder="Ej: 18764000001234" control={control} />
        <Input name="prefix" label="Prefijo" placeholder="Ej: FE" control={control} />
        <Input name="startRange" type="number" label="Rango desde" placeholder="Ej: 1" control={control} />
        <Input name="endRange" type="number" label="Rango hasta" placeholder="Ej: 5000" control={control} />
        <Input name="startDate" type="date" label="Vigencia desde" control={control} />
        <Input name="endDate" type="date" label="Vigencia hasta" control={control} />
        <Input
          name="testSetId"
          label="TestSetId (set de pruebas)"
          placeholder="Solo para habilitación"
          helperText="Identificador del set de pruebas que entrega la DIAN; en producción puede quedar vacío."
          control={control}
        />
        <Input name="pdfType" label="Tipo de documento PDF" placeholder="FEC" control={control} />
      </GridContainer>

      <div className="d-flex justify-content-end gap-2">
        <Button onClick={onDone} disabled={saveResolution.isPending}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={saveResolution.isPending}>
          {resolution ? "Guardar cambios" : "Crear resolución"}
        </Button>
      </div>
    </form>
  )
}
