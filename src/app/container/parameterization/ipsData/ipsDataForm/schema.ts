import { z } from "zod"

export const providerSchema = z.object({
  name: z.string().min(1, "Nombre es obligatorio"),
  identificationType: z
    .string()
    .min(1, "Tipo de identificación es obligatorio"),
  nit: z.string().min(1, "NIT es obligatorio"),
  verificationDigit: z
    .string()
    .min(1, "Dígito de verificación es obligatorio"),
  address: z.string().min(1, "Dirección es obligatoria"),
  phone: z.string().min(1, "Teléfono es obligatorio"),
  cityId: z
    .number({
      required_error: "Ciudad es obligatoria",
      invalid_type_error: "Ciudad es obligatoria",
    })
    .positive("Ciudad es obligatoria"),
  legalRepresentative: z
    .string()
    .min(1, "Representante legal es obligatorio"),
  documentType: z.string().min(1, "Tipo de documento es obligatorio"),
  documentNumber: z.string().min(1, "Número de documento es obligatorio"),
  legalRepresentativeSign: z.any().optional(),
  email: z.string().email("Correo electrónico inválido"),
  logo: z.any().optional(),
  enableCode: z.string().min(1, "Código de habilitación es obligatorio"),
  regimen: z.string().min(1, "Régimen es obligatorio"),
  invoiceIssuerName: z
    .string()
    .min(1, "Nombre emisor de factura es obligatorio"),
  invoiceIssuerSign: z.any().optional(),
  applyTax: z.boolean().optional(),
})

export type TProviderForm = z.infer<typeof providerSchema>

export const providerDefaultValues: Partial<TProviderForm> = {
  name: "",
  identificationType: "",
  nit: "",
  verificationDigit: "",
  address: "",
  phone: "",
  cityId: undefined,
  legalRepresentative: "",
  documentType: "",
  documentNumber: "",
  email: "",
  enableCode: "",
  regimen: "",
  invoiceIssuerName: "",
  applyTax: false,
}
