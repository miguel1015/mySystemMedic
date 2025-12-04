import { z } from "zod";

export const ContractSchema = z.object({
  // ======================
  // BLOQUE SUPERIOR
  // ======================
  isLegal: z
    .number({
      required_error: "Debe seleccionar si el contrato es legal",
    })
    .nullable(),

  valueMethod: z
    .number({
      required_error: "Debe seleccionar un método de valores",
    })
    .nullable(),

  epsId: z
    .number({
      required_error: "Debe seleccionar una EPS",
    })
    .nullable(),

  contractNumber: z.string().min(1, "El número del contrato es obligatorio"),

  contractName: z.string().min(1, "El nombre del contrato es obligatorio"),

  // ======================
  // PORTAFOLIOS / CÓDIGOS
  // ======================
  portfolioGeneralId: z
    .number({ required_error: "Debe seleccionar un portafolio general" })
    .nullable(),

  portfolioMedicationId: z
    .number({
      required_error: "Debe seleccionar un portafolio de medicamento",
    })
    .nullable(),

  portfolioSuppliesId: z
    .number({
      required_error: "Debe seleccionar un portafolio de insumos",
    })
    .nullable(),

  contractTypeId: z
    .number({ required_error: "Debe seleccionar un tipo de contrato" })
    .nullable(),

  epsRegimeId: z
    .number({ required_error: "Debe seleccionar un régimen EPS" })
    .nullable(),

  epsCode: z.string().min(1, "El código EPS es obligatorio"),

  // ======================
  // OTROS BLOQUES
  // ======================
  coverageId: z
    .number({ required_error: "Debe seleccionar la cobertura" })
    .nullable(),

  userTypeId: z
    .number({
      required_error: "Debe seleccionar un tipo de usuario",
    })
    .nullable(),

  paymentMethodId: z
    .number({
      required_error: "Debe seleccionar una modalidad de pago",
    })
    .nullable(),

  // ======================
  // OBJETO DEL CONTRATO
  // ======================
  contractObject: z.string().min(1, "El objeto del contrato es obligatorio"),

  // ======================
  // FECHAS Y VALORES
  // ======================
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),

  endDate: z.string().min(1, "La fecha de finalización es obligatoria"),

  contractAmount: z
    .number({
      required_error: "Debe ingresar el monto del contrato",
    })
    .nullable(),

  individualAmount: z
    .number({
      required_error: "Debe ingresar el monto individual del contrato",
    })
    .nullable(),

  // ======================
  // ESTADO Y SERVICIOS
  // ======================
  contractStatusId: z
    .number({ required_error: "Debe seleccionar un estado del contrato" })
    .nullable(),

  ripsServiceCode: z
    .number({
      required_error: "Debe seleccionar un código de servicios para RIPS",
    })
    .nullable(),

  surgicalServiceCode: z
    .number({
      required_error: "Debe seleccionar un código de servicios quirúrgicos",
    })
    .nullable(),

  capitationIndicatorId: z
    .number({
      required_error: "Debe seleccionar un indicador de capitación",
    })
    .nullable(),

  // ======================
  // AUTORIZACIONES
  // ======================
  authorizationCode: z
    .number({
      required_error: "Debe seleccionar un código de autorización",
    })
    .nullable(),

  authorizationSupport: z
    .number({
      required_error: "Debe seleccionar un soporte de autorización",
    })
    .nullable(),
});

export type TContractSchema = z.infer<typeof ContractSchema>;

export const TDefaultValues = {
  contractNumber: "",
  contractObject: "",
  endDate: "",
  startDate: "",
};
