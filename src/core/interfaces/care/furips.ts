// FURIPS: reclamación a la aseguradora SOAT / ADRES por la atención de víctimas de
// accidentes de tránsito. Uno por admisión.

export interface FuripsPersona {
  primerApellido?: string | null
  segundoApellido?: string | null
  primerNombre?: string | null
  segundoNombre?: string | null
  tipoDocumento?: string | null
  numeroDocumento?: string | null
  direccion?: string | null
  telefono?: string | null
  cityId?: number | null
}

export interface FuripsRemision {
  ipsRemiteNombre?: string | null
  ipsRemiteNit?: string | null
  // YYYY-MM-DD
  fechaRemision?: string | null
  ipsRemiteTelefono?: string | null
  ipsRemiteCiudad?: string | null
  ipsRemiteDireccion?: string | null
  personaRemite?: string | null
  ipsRecibeNombre?: string | null
  ipsRecibeTelefono?: string | null
  ipsRecibeCiudad?: string | null
  ipsRecibeDireccion?: string | null
  medicoRecibeUserId?: number | null
  medicoRecibeNombre?: string | null
}

export interface FuripsTransporte {
  placa?: string | null
  primerApellido?: string | null
  segundoApellido?: string | null
  primerNombre?: string | null
  segundoNombre?: string | null
  tipoDocumento?: string | null
  numeroDocumento?: string | null
  transportoDesde?: string | null
  zona?: string | null
}

export interface FuripsDiagnostico {
  codigo: string
  descripcion: string
}

export interface FuripsAtencionMedica {
  fechaIngreso?: string | null
  fechaEgreso?: string | null
  diagnosticosIngreso: FuripsDiagnostico[]
  diagnosticosEgreso: FuripsDiagnostico[]
}

export interface FuripsMedico {
  userId?: number | null
  primerApellido?: string | null
  segundoApellido?: string | null
  primerNombre?: string | null
  segundoNombre?: string | null
  tipoDocumento?: string | null
  numeroDocumento?: string | null
  registroMedico?: string | null
}

export interface FuripsRequest {
  admissionId: number

  // YYYY-MM-DD
  fechaRadicacion?: string | null
  numeroRadicado?: string | null
  respuestaGlosa: boolean
  numeroRadicadoAnterior?: string | null
  numeroFactura?: string | null

  serviciosHabilitados?: boolean | null
  tipoAtencionInicial?: string | null
  cobroTopeAseguradora?: boolean | null

  condicionAccidentado: string

  direccionEvento: string
  // ISO con hora
  fechaEvento: string
  eventoCityId: number
  zonaEvento?: string | null
  descripcionEvento: string

  estadoAseguramiento: string
  marca?: string | null
  placa?: string | null
  tipoServicio?: string | null
  tipoVehiculo?: string | null
  codigoAseguradora?: string | null
  nombreAseguradora?: string | null
  numeroPoliza?: string | null
  siras?: string | null
  // YYYY-MM-DD
  vigenciaDesde?: string | null
  vigenciaHasta?: string | null
  cobroExcedentePoliza: boolean

  propietario?: FuripsPersona | null
  conductor?: FuripsPersona | null
  remision?: FuripsRemision | null
  transporte?: FuripsTransporte | null
  atencionMedica: FuripsAtencionMedica
  medico?: FuripsMedico | null

  amparoGastosMedicos: boolean
  valorFacturadoGastosMedicos: number
  valorReclamadoGastosMedicos: number
  amparoTransporte: boolean
  valorFacturadoTransporte: number
  valorReclamadoTransporte: number
}

export interface FuripsResponse extends FuripsRequest {
  id: number
  nombreRegistradoPor: string
  createdAt: string
  updatedAt: string
}

export interface FuripsUbicacion {
  departamento?: string | null
  codigoDepartamento?: string | null
  municipio?: string | null
  codigoMunicipio?: string | null
}

export interface FuripsIps extends FuripsUbicacion {
  razonSocial?: string | null
  codigoHabilitacion?: string | null
  nit?: string | null
  direccion?: string | null
  telefono?: string | null
  representanteLegal?: string | null
}

export interface FuripsVictima extends FuripsUbicacion {
  primerApellido: string
  segundoApellido?: string | null
  primerNombre: string
  segundoNombre?: string | null
  tipoDocumento?: string | null
  numeroDocumento: string
  fechaNacimiento: string
  sexo?: string | null
  direccion?: string | null
  telefono?: string | null
  cityId?: number | null
}

export interface FuripsMedicoSugerido extends FuripsMedico {
  origen: string
  nombreCompleto: string
}

// Lo que el sistema ya sabe de la admisión: IPS, víctima, atención, médicos y facturación.
export interface FuripsDatosSistema {
  admissionId: number
  admissionDate: string
  admissionActiva: boolean
  epsNombre?: string | null
  ips: FuripsIps
  victima: FuripsVictima
  atencionMedica: FuripsAtencionMedica
  medicos: FuripsMedicoSugerido[]
  numeroFactura?: string | null
  valorFacturado: number
}
