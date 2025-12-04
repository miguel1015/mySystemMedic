import { z } from "zod";

export const insuranceCompaniesSchema = z.object({
  insuranceName: z
    .string()
    .min(1, "El nombre de la aseguradora es obligatorio"),

  nit: z
    .string()
    .min(1, "El NIT es obligatorio")
    .regex(/^[0-9]+$/, "El NIT debe ser numérico"),

  insuranceCode: z
    .string()
    .min(1, "El código de la aseguradora es obligatorio"),

  verificationDigit: z
    .string()
    .length(1, "Debe ser un solo dígito")
    .regex(/^[0-9]$/, "Debe ser un número entre 0 y 9"),

  address: z.string().min(1, "La dirección es obligatoria"),

  cityId: z.string().min(1, "Debe seleccionar una ciudad"),

  phone: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .regex(/^[0-9]+$/, "El teléfono debe ser numérico"),

  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),

  adminTypeId: z.string().min(1, "Debe seleccionar un tipo de administradora"),
});

export type TInsuranceCompaniesSchema = z.infer<
  typeof insuranceCompaniesSchema
>;

// Default values limpios
export const TDefaultValues: TInsuranceCompaniesSchema = {
  insuranceName: "",
  nit: "",
  insuranceCode: "",
  verificationDigit: "",
  address: "",
  cityId: "",
  phone: "",
  email: "",
  adminTypeId: "",
};
