import { z } from "zod"

const required = (message: string) => z.string({ required_error: message, invalid_type_error: message }).trim().min(1, message)

export const companySchema = z.object({
  name: required("Razón social es obligatoria"),
  identificationType: required("Tipo de identificación es obligatorio"),
  regimeType: required("Régimen fiscal es obligatorio"),
  fiscalResponsibility: z
    .array(z.string(), { invalid_type_error: "Seleccione al menos una responsabilidad fiscal" })
    .min(1, "Seleccione al menos una responsabilidad fiscal"),
  operationType: required("Tipo de operación es obligatorio"),
  companyType: required("Tipo de persona es obligatorio"),
  address: required("Dirección es obligatoria"),
  stateCode: required("Departamento es obligatorio"),
  cityCode: required("Ciudad es obligatoria"),
  postalZone: required("Código postal es obligatorio"),
  phoneNum: required("Teléfono es obligatorio"),
  email: z.string().trim().email("Correo electrónico inválido"),
  primaryInvoiceColor: z
    .string()
    .trim()
    .regex(/^(#[0-9a-fA-F]{6})?$/, "Use un color hexadecimal, por ejemplo #3a77c7")
    .optional(),
  logo: z.any().optional(),
})

export type TCompanyForm = z.infer<typeof companySchema>
