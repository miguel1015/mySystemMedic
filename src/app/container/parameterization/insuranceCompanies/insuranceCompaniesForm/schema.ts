import { z } from "zod";

export const insuranceCompaniesSchema = z.object({
  name: z.string().min(1, "El nombre de la aseguradora es obligatorio"),
  nit: z.string().min(1, "El NIT es obligatorio"),
  code: z.string().min(1, "El código de la aseguradora es obligatorio"),
  verificationDigit: z
    .number({
      required_error: "El Dígito verificación es obligatorio",
      invalid_type_error: "El Dígito verificación es obligatorio",
    })
    .positive("El Dígito verificación es obligatorio"),
  address: z.string().min(1, "La dirección es obligatoria"),
  cityId: z.coerce.number().min(1, "Debe seleccionar una ciudad"),
  phone1: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .regex(/^[0-9]+$/, "El teléfono debe ser numérico"),

  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),

  administratorTypeId: z
    .number({
      required_error: "Tipo de administradora es obligatorio",
      invalid_type_error: "Tipo de administradora es obligatorio",
    })
    .positive("Tipo de administradora es obligatorio"),
});

export type TInsuranceCompaniesSchema = z.infer<
  typeof insuranceCompaniesSchema
>;

// Default values limpios
export const TDefaultValues: TInsuranceCompaniesSchema = {
  name: "",
  nit: "",
  code: "",
  verificationDigit: undefined as unknown as number,
  address: "",
  cityId: null as unknown as number,
  phone1: "",
  email: "",
  administratorTypeId: undefined as unknown as number,
};
