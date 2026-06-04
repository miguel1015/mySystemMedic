import { z } from "zod"

const requiredSelect = (label: string) =>
  z.preprocess(
    (value) => {
      if (value === null || value === "") return undefined
      if (typeof value === "string") return Number(value)
      return value
    },
    z
      .number({
        required_error: `${label} es obligatorio`,
        invalid_type_error: `${label} es obligatorio`,
      })
      .min(1, `${label} es obligatorio`),
  )

export const patientSchema = z.object({
  insurerId: requiredSelect("EPS"),
  documentTypeId: requiredSelect("Tipo de documento"),
  documentNumber: z.string().min(1, "Número de documento es obligatorio"),
  firstName: z.string().min(1, "Primer nombre es obligatorio"),
  middleName: z.string().optional().default(""),
  lastName: z.string().min(1, "Primer apellido es obligatorio"),
  secondLastName: z.string().optional().default(""),
  birthDate: z.string().min(1, "Fecha de nacimiento es obligatoria"),
  sexId: requiredSelect("Sexo"),
  birthCountryId: requiredSelect("País de nacimiento"),
  residenceCountryId: requiredSelect("País de residencia"),
  stateId: requiredSelect("Departamento"),
  cityId: requiredSelect("Ciudad"),
  zoneId: requiredSelect("Zona"),
  address: z.string().min(1, "Dirección es obligatoria"),
  phone: z.string().min(1, "Teléfono es obligatorio"),
  email: z.string().min(1, "Correo es obligatorio").email("Correo no válido"),
  maritalStatusId: requiredSelect("Estado civil"),
  disabilityId: requiredSelect("Discapacidad"),
  bloodGroupId: requiredSelect("Grupo sanguíneo"),
  rhFactorId: requiredSelect("RH"),
})

export type TPatientForm = z.infer<typeof patientSchema>

export const patientDefaultValues: Partial<TPatientForm> = {
  insurerId: undefined,
  documentTypeId: undefined,
  documentNumber: "",
  firstName: "",
  middleName: "",
  lastName: "",
  secondLastName: "",
  birthDate: "",
  sexId: undefined,
  birthCountryId: undefined,
  residenceCountryId: undefined,
  stateId: undefined,
  cityId: undefined,
  zoneId: undefined,
  address: "",
  phone: "",
  email: "",
  maritalStatusId: undefined,
  disabilityId: undefined,
  bloodGroupId: undefined,
  rhFactorId: undefined,
}
