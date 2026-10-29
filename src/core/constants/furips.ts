// Catálogos del FURIPS. Los códigos son los que valida el backend (FuripsCodigos).

// El formato oficial llama "Ocupante" al 3; en la institución se usa "Pasajero".
export const FURIPS_CONDICIONES_ACCIDENTADO = [
  { value: "2", label: "Peatón" },
  { value: "4", label: "Ciclista" },
  { value: "1", label: "Conductor" },
  { value: "3", label: "Pasajero" },
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
  { value: FURIPS_ESTADO.FANTASMA, label: "Vehículo fantasma" },
  { value: FURIPS_ESTADO.ASEGURADO, label: "Vehículo asegurado" },
  { value: FURIPS_ESTADO.NO_ASEGURADO, label: "Vehículo no asegurado" },
  { value: FURIPS_ESTADO.POLIZA_FALSA, label: "Póliza falsa" },
  { value: FURIPS_ESTADO.EN_FUGA, label: "Vehículo en fuga" },
  { value: FURIPS_ESTADO.ASEGURADO_D2497, label: "Asegurado D. 2497" },
  { value: FURIPS_ESTADO.PROPIETARIO_INDETERMINADO, label: "No asegurado indeterminado" },
  { value: FURIPS_ESTADO.SIN_PLACA, label: "No asegurado sin placa" },
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

// Solo se desconoce el vehículo cuando es fantasma o se dio a la fuga.
export const furipsRequiereTipoVehiculo = (estado?: string | null) =>
  !!estado && estado !== FURIPS_ESTADO.FANTASMA && estado !== FURIPS_ESTADO.EN_FUGA

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

// Clases de vehículo del RUNT. Los códigos son propios: no se cuenta con la tabla oficial del
// FURIPS; si llega, se ajustan aquí y en el backend (FuripsCodigos.TiposVehiculo).
export const FURIPS_TIPOS_VEHICULO = [
  { value: "01", label: "Automóvil" },
  { value: "02", label: "Bus" },
  { value: "03", label: "Buseta" },
  { value: "04", label: "Camión" },
  { value: "05", label: "Camioneta" },
  { value: "06", label: "Campero" },
  { value: "07", label: "Microbús" },
  { value: "08", label: "Tractocamión" },
  { value: "09", label: "Volqueta" },
  { value: "10", label: "Motocicleta" },
  { value: "11", label: "Motocarro" },
  { value: "12", label: "Mototriciclo" },
  { value: "13", label: "Cuatrimoto" },
  { value: "14", label: "Ciclomotor" },
  { value: "15", label: "Tricimoto" },
  { value: "16", label: "Cuadriciclo" },
  { value: "17", label: "Maquinaria agrícola" },
  { value: "18", label: "Maquinaria industrial" },
  { value: "19", label: "Maquinaria de construcción o minera" },
  { value: "20", label: "Remolque" },
  { value: "21", label: "Semirremolque" },
  { value: "22", label: "Vehículo de tracción animal" },
  { value: "23", label: "Bicicleta" },
  { value: "24", label: "Otro" },
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
  { value: "1", label: "Atención médica inicial del evento" },
  { value: "2", label: "Transporte primario" },
  { value: "3", label: "Transporte secundario" },
  { value: "4", label: "Continuidad hospitalaria" },
  { value: "5", label: "Atención ambulatoria" },
  { value: "6", label: "Atención médica + transporte primario" },
  { value: "7", label: "Atención médica + transporte secundario" },
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
