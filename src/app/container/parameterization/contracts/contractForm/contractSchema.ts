import { z } from "zod";

export const ContractSchema = z.object({
  contractNumber: z.string().min(1, "El número del contrato es obligatorio"),
  insurerId: z
    .number({
      required_error: "Debe seleccionar una aseguradora",
      invalid_type_error: "Debe seleccionar una aseguradora",
    })
    .positive("Debe seleccionar una aseguradora"),
  contractType: z.string().min(1, "El tipo de contrato es obligatorio"),
  populationNumber: z
    .number({
      required_error: "La población es obligatoria",
      invalid_type_error: "La población es obligatoria",
    })
    .min(0, "La población debe ser mayor o igual a 0"),
  cityId: z
    .number({
      required_error: "Debe seleccionar una ciudad",
      invalid_type_error: "Debe seleccionar una ciudad",
    })
    .positive("Debe seleccionar una ciudad"),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().nullable(),
  medicineAdjustmentFactor: z.number().nullable(),
  isActive: z
    .number({
      required_error: "Campo requerido",
      invalid_type_error: "Campo requerido",
    })
    .positive("Campo requerido"),
  tariffScheduleId: z
    .number({
      required_error: "Debe seleccionar un tarifario",
      invalid_type_error: "Debe seleccionar un tarifario",
    })
    .positive("Debe seleccionar un tarifario"),
  medicineTariffScheduleId: z.number().nullable(),
  factor: z
    .number({
      required_error: "El factor es obligatorio",
      invalid_type_error: "El factor es obligatorio",
    })
    .min(0, "El factor debe ser mayor o igual a 0"),
  providerId: z
    .number({
      required_error: "Debe seleccionar un prestador",
      invalid_type_error: "Debe seleccionar un prestador",
    })
    .positive("Debe seleccionar un prestador"),
  policy: z.string().min(1, "La póliza es obligatoria"),
  chargeCopay: z
    .number({
      required_error: "campo requerido",
      invalid_type_error: "campo requerido",
    })
    .positive("campo requerido"),
  chargeModeratingFee: z
    .number({
      required_error: "campo requerido",
      invalid_type_error: "campo requerido",
    })
    .positive("campo requerido"),
  billingDestinationId: z
    .number({
      required_error: "Debe seleccionar un destino de facturación",
      invalid_type_error: "Debe seleccionar un destino de facturación",
    })
    .positive("Debe seleccionar un destino de facturación"),
  benefitPlanId: z
    .number({
      required_error: "Debe seleccionar un plan de beneficios",
      invalid_type_error: "Debe seleccionar un plan de beneficios",
    })
    .positive("Debe seleccionar un plan de beneficios"),
  referenceCode: z.string().min(1, "El código de referencia es obligatorio"),
});

export type TContractSchema = z.infer<typeof ContractSchema>;

export const TDefaultValues: Partial<TContractSchema> = {
  contractNumber: "",
  contractType: undefined,
  populationNumber: undefined,
  startDate: "",
  endDate: null,
  isActive: undefined,
  factor: 1.0,
  policy: "",
  chargeCopay: undefined,
  chargeModeratingFee: undefined,
  referenceCode: "",
  insurerId: undefined,
  cityId: undefined,
  tariffScheduleId: undefined,
  medicineTariffScheduleId: null,
  providerId: undefined,
  billingDestinationId: undefined,
  benefitPlanId: undefined,
};

export const ContractDetailSchema = z.object({
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().nullable(),
  serviceId: z
    .number({
      required_error: "Debe seleccionar un servicio",
      invalid_type_error: "Debe seleccionar un servicio",
    })
    .positive("Debe seleccionar un servicio"),
  externalTariffScheduleId: z
    .number({
      required_error: "Debe seleccionar un tarifario externo",
      invalid_type_error: "Debe seleccionar un tarifario externo",
    })
    .positive("Debe seleccionar un tarifario externo"),
  factor: z
    .number({
      required_error: "El factor es obligatorio",
      invalid_type_error: "El factor es obligatorio",
    })
    .min(0, "El factor debe ser mayor o igual a 0"),
});

export type TContractDetailSchema = z.infer<typeof ContractDetailSchema>;

export const TDetailDefaultValues: Partial<TContractDetailSchema> = {
  startDate: "",
  endDate: null,
  serviceId: undefined,
  externalTariffScheduleId: undefined,
  factor: 1.0,
};
