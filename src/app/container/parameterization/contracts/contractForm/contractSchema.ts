import { z } from "zod"

const requiredSelect = (label: string) =>
  z
    .number({
      required_error: `Debe seleccionar ${label}`,
      invalid_type_error: `Debe seleccionar ${label}`,
    })
    .positive(`Debe seleccionar ${label}`)

export const ContractSchema = z.object({
  insurerId: requiredSelect("una aseguradora"),
  contractNumber: z.string().min(1, "El número del contrato es obligatorio"),
  contractName: z.string().min(1, "El nombre del contrato es obligatorio"),
  valueMethodId: requiredSelect("un método de valores"),
  contractTypeId: requiredSelect("un tipo de contrato"),
  epsRegimenId: requiredSelect("un régimen EPS"),
  userTypeId: requiredSelect("un tipo de usuario"),
  paymentModalityId: requiredSelect("una modalidad de pago"),
  coverageId: requiredSelect("una cobertura"),
  startDate: z.string().min(1, "La fecha inicial es obligatoria"),
  endDate: z.string().nullable(),
  status: z.string().min(1, "El estado es obligatorio"),
})

export type TContractSchema = z.infer<typeof ContractSchema>

export const TDefaultValues: Partial<TContractSchema> = {
  insurerId: undefined,
  contractNumber: "",
  contractName: "",
  valueMethodId: undefined,
  contractTypeId: undefined,
  epsRegimenId: undefined,
  userTypeId: undefined,
  paymentModalityId: undefined,
  coverageId: undefined,
  startDate: "",
  endDate: null,
  status: "",
}
