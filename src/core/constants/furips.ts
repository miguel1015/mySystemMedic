// Catálogos del FURIPS. Los códigos son los que valida el backend (FuripsCodigos).

export const FURIPS_CONDICIONES_ACCIDENTADO = [
  { value: "1", label: "Conductor" },
  { value: "2", label: "Peatón" },
  { value: "3", label: "Ocupante" },
  { value: "4", label: "Ciclista" },
]

export const FURIPS_ESTADO = {
  ASEGURADO: "1",
  NO_ASEGURADO: "2",
  FANTASMA: "3",
  POLIZA_FALSA: "4",
  EN_FUGA: "5",
  ASEGURADO_D2497: "6",
  PROPIETARIO_INDETERMINADO: "7",
  SIN_PLACA: "8",
} as const

export const FURIPS_ESTADOS_ASEGURAMIENTO = [
  { value: FURIPS_ESTADO.ASEGURADO, label: "Asegurado" },
  { value: FURIPS_ESTADO.NO_ASEGURADO, label: "No asegurado" },
  { value: FURIPS_ESTADO.FANTASMA, label: "Vehículo fantasma" },
  { value: FURIPS_ESTADO.POLIZA_FALSA, label: "Póliza falsa" },
  { value: FURIPS_ESTADO.EN_FUGA, label: "Vehículo en fuga" },
  { value: FURIPS_ESTADO.ASEGURADO_D2497, label: "Asegurado D.2497" },
  {
    value: FURIPS_ESTADO.PROPIETARIO_INDETERMINADO,
    label: "No asegurado - propietario indeterminado",
  },
  { value: FURIPS_ESTADO.SIN_PLACA, label: "No asegurado - sin placa" },
]

// Estados en los que el vehículo debe tener placa.
export const furipsRequierePlaca = (estado?: string | null) =>
  estado === FURIPS_ESTADO.ASEGURADO ||
  estado === FURIPS_ESTADO.NO_ASEGURADO ||
  estado === FURIPS_ESTADO.POLIZA_FALSA ||
  estado === FURIPS_ESTADO.ASEGURADO_D2497 ||
  estado === FURIPS_ESTADO.PROPIETARIO_INDETERMINADO

// Estados con SOAT vigente: se exigen aseguradora, póliza y vigencia.
export const furipsRequierePoliza = (estado?: string | null) =>
  estado === FURIPS_ESTADO.ASEGURADO || estado === FURIPS_ESTADO.ASEGURADO_D2497

// Sin SOAT vigente la reclamación se presenta a la ADRES.
export const FURIPS_ADRES = {
  codigo: "90103",
  nombre: "ADRES SISTEMA DE SEGURIDAD SOCIAL EN SALUD",
}

export const FURIPS_TIPOS_SERVICIO = [
  { value: "1", label: "Particular" },
  { value: "2", label: "Público" },
  { value: "3", label: "Oficial" },
  { value: "4", label: "Vehículo de emergencia" },
  { value: "5", label: "Diplomático o consular" },
  { value: "6", label: "Transporte masivo" },
  { value: "7", label: "Escolar" },
]

export const FURIPS_ZONAS = [
  { value: "U", label: "U — Urbana" },
  { value: "R", label: "R — Rural" },
]

export const FURIPS_TIPOS_DOCUMENTO = [
  { value: "CC", label: "CC — Cédula de ciudadanía" },
  { value: "CE", label: "CE — Cédula de extranjería" },
  { value: "PA", label: "PA — Pasaporte" },
  { value: "TI", label: "TI — Tarjeta de identidad" },
  { value: "RC", label: "RC — Registro civil" },
  { value: "CD", label: "CD — Carné diplomático" },
  { value: "SC", label: "SC — Salvoconducto" },
  { value: "PE", label: "PE — Permiso especial de permanencia" },
  { value: "PT", label: "PT — Permiso por protección temporal" },
  { value: "AS", label: "AS — Adulto sin identificación" },
  { value: "MS", label: "MS — Menor sin identificación" },
  { value: "NI", label: "NI — NIT" },
]

export const FURIPS_TIPOS_ATENCION_INICIAL = [
  { value: "1", label: "1 — Atención médica inicial del evento" },
  { value: "2", label: "2 — Atención posterior a la inicial (paciente remitido)" },
]

export const FURIPS_SI_NO = [
  { value: true, label: "Sí" },
  { value: false, label: "No" },
]

export const FURIPS_DECLARACION =
  "Como representante legal o Gerente de la Institución Prestadora de Servicios de Salud, " +
  "declaro bajo la gravedad de juramento que toda la información contenida en el presente " +
  "formulario es veraz."

export const furipsLabel = (
  options: { value: string; label: string }[],
  value?: string | null,
) => options.find((o) => o.value === value)?.label ?? ""
