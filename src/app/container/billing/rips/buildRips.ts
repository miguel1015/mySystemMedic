import type { BillingMovementResponse } from "@/core/interfaces/care/billing"
import type {
  Cie10CodeResponse,
  DiagnosticoEgresoResponse,
} from "@/core/interfaces/care/hciInicial"
import type { AdmissionResponse, GetPatient } from "@/core/interfaces/care/types"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { FevSummary } from "./parseFevXml"

// Estructura del RIPS como soporte de la FEV en salud (Resolución 948 de 2026, Documento
// Técnico 1 v001 del 4 de junio de 2026). Todos los campos van siempre presentes: sin dato se
// envía null en los de tipo cadena y 0 en los numéricos que lo permiten. Lo que MediNexus no
// tiene, o tiene con un valor que el MUV rechaza, se reporta en `missing`.
//
// Cuando el ejemplo del documento técnico contradice su tabla de campos prevalece la tabla
// (numeral 1.7). Para la complicación CIE-11 se usa nomCodComplicacionCIE11, el nombre de las
// ejemplificaciones oficiales de procedimientos y hospitalización y de la tabla de
// hospitalización, consistente con los demás nomCod*CIE11.
//
// Las propiedades van en el orden de las ejemplificaciones oficiales de la Res. 948.

type Nullable<T> = T | null

interface DiagnosticFields {
  codDiagnosticoPrincipal: Nullable<string>
  codDiagnosticoPrincipalCIE11: null
  nomCodDiagnosticoPrincipalCIE11: null
}

export interface RipsConsulta extends DiagnosticFields {
  codPrestador: Nullable<string>
  fechaInicioAtencion: Nullable<string>
  numAutorizacion: null
  codConsulta: Nullable<string>
  modalidadGrupoServicioTecSal: Nullable<string>
  grupoServicios: Nullable<string>
  codServicio: Nullable<number>
  finalidadTecnologiaSalud: Nullable<string>
  causaMotivoAtencion: Nullable<string>
  codDiagnosticoRelacionado1: Nullable<string>
  codDiagnosticoRelacionado1CIE11: null
  nomCodDiagnosticoRelacionado1CIE11: null
  codDiagnosticoRelacionado2: Nullable<string>
  codDiagnosticoRelacionado2CIE11: null
  nomCodDiagnosticoRelacionado2CIE11: null
  codDiagnosticoRelacionado3: Nullable<string>
  codDiagnosticoRelacionado3CIE11: null
  nomCodDiagnosticoRelacionado3CIE11: null
  tipoDiagnosticoPrincipal: Nullable<string>
  tipoDocumentoIdentificacion: Nullable<string>
  numDocumentoIdentificacion: Nullable<string>
  vrServicio: number
  conceptoRecaudo: string
  valorPagoModerador: number
  numFEVPagoModerador: null
  codigoVIDA: null
  consecutivo: number
}

export interface RipsProcedimiento extends DiagnosticFields {
  codPrestador: Nullable<string>
  fechaInicioAtencion: Nullable<string>
  numAutorizacion: null
  idMIPRES: null
  codProcedimiento: Nullable<string>
  viaIngresoServicioSalud: Nullable<string>
  modalidadGrupoServicioTecSal: Nullable<string>
  grupoServicios: Nullable<string>
  codServicio: Nullable<number>
  finalidadTecnologiaSalud: Nullable<string>
  tipoDocumentoIdentificacion: Nullable<string>
  numDocumentoIdentificacion: Nullable<string>
  codDiagnosticoRelacionado: Nullable<string>
  codDiagnosticoRelacionadoCIE11: null
  nomCodDiagnosticoRelacionadoCIE11: null
  codComplicacion: null
  codComplicacionCIE11: null
  nomCodComplicacionCIE11: null
  vrServicio: number
  conceptoRecaudo: string
  valorPagoModerador: number
  numFEVPagoModerador: null
  codigoVIDA: null
  consecutivo: number
}

interface EgresoFields extends DiagnosticFields {
  codPrestador: Nullable<string>
  fechaInicioAtencion: Nullable<string>
  causaMotivoAtencion: Nullable<string>
  codDiagnosticoPrincipalE: Nullable<string>
  codDiagnosticoPrincipalECIE11: null
  nomCodDiagnosticoPrincipalECIE11: null
  codDiagnosticoRelacionadoE1: Nullable<string>
  codDiagnosticoRelacionadoE1CIE11: null
  nomCodDiagnosticoRelacionadoE1CIE11: null
  codDiagnosticoRelacionadoE2: Nullable<string>
  codDiagnosticoRelacionadoE2CIE11: null
  nomCodDiagnosticoRelacionadoE2CIE11: null
  codDiagnosticoRelacionadoE3: Nullable<string>
  codDiagnosticoRelacionadoE3CIE11: null
  nomCodDiagnosticoRelacionadoE3CIE11: null
  condicionDestinoUsuarioEgreso: Nullable<string>
  codDiagnosticoCausaMuerte: null
  codDiagnosticoCausaMuerteCIE11: null
  nomCodDiagnosticoCausaMuerteCIE11: null
  fechaEgreso: Nullable<string>
  codigoVIDA: null
  consecutivo: number
}

export type RipsUrgencia = EgresoFields

export interface RipsHospitalizacion extends EgresoFields {
  viaIngresoServicioSalud: Nullable<string>
  numAutorizacion: null
  codComplicacion: null
  codComplicacionCIE11: null
  nomCodComplicacionCIE11: null
}

// La Res. 948 eliminó numAutorizacion (M02) de medicamentos.
export interface RipsMedicamento extends DiagnosticFields {
  codPrestador: Nullable<string>
  idMIPRES: null
  fechaDispensAdmon: Nullable<string>
  codDiagnosticoRelacionado: Nullable<string>
  codDiagnosticoRelacionadoCIE11: null
  nomCodDiagnosticoRelacionadoCIE11: null
  tipoMedicamento: Nullable<string>
  codTecnologiaSalud: Nullable<string>
  nomTecnologiaSalud: null
  concentracionMedicamento: number
  unidadMedida: number
  formaFarmaceutica: null
  unidadMinDispensa: Nullable<number>
  cantidadMedicamento: number
  diasTratamiento: number
  tipoDocumentoIdentificacion: Nullable<string>
  numDocumentoIdentificacion: Nullable<string>
  vrUnitMedicamento: number
  vrDispensacion: number
  vrServicio: number
  conceptoRecaudo: string
  valorPagoModerador: number
  numFEVPagoModerador: null
  codigoVIDA: null
  consecutivo: number
}

export interface RipsOtroServicio {
  codPrestador: Nullable<string>
  numAutorizacion: null
  idMIPRES: null
  fechaSuministroTecnologia: Nullable<string>
  tipoOS: string
  codTecnologiaSalud: Nullable<string>
  nomTecnologiaSalud: Nullable<string>
  cantidadOS: number
  tipoDocumentoIdentificacion: Nullable<string>
  numDocumentoIdentificacion: Nullable<string>
  vrUnitOS: number
  vrDispensacion: number
  vrServicio: number
  conceptoRecaudo: string
  valorPagoModerador: number
  numFEVPagoModerador: null
  codigoVIDA: null
  consecutivo: number
}

export interface RipsServicios {
  consultas: RipsConsulta[]
  procedimientos: RipsProcedimiento[]
  urgencias: RipsUrgencia[]
  hospitalizacion: RipsHospitalizacion[]
  recienNacidos: never[]
  medicamentos: RipsMedicamento[]
  otrosServicios: RipsOtroServicio[]
}

export interface RipsUsuario {
  tipoDocumentoIdentificacion: Nullable<string>
  numDocumentoIdentificacion: Nullable<string>
  tipoUsuario: Nullable<string>
  fechaNacimiento: Nullable<string>
  codSexo: Nullable<string>
  codPaisResidencia: Nullable<string>
  codMunicipioResidencia: Nullable<string>
  codZonaTerritorialResidencia: Nullable<string>
  incapacidad: string
  consecutivo: number
  codPaisOrigen: Nullable<string>
  registroSIRAS: null
  servicios: RipsServicios
}

export interface RipsDocument {
  numDocumentoIdObligado: Nullable<string>
  numFactura: string
  tipoNota: null
  numNota: null
  usuarios: RipsUsuario[]
}

export type RipsServiceGroupKey = keyof RipsServicios

// error: el MUV rechaza el RIPS (regla de rechazo o campo obligatorio sin dato).
// warning: se reporta un valor por defecto o la regla es solo de notificación.
export type RipsIssueSeverity = "error" | "warning"

export interface RipsMissingField {
  // Grupo donde falta el dato ("Factura", "Usuario" o el grupo de servicios).
  group: string
  field: string
  reason: string
  severity: RipsIssueSeverity
}

export interface RipsBuildResult {
  rips: RipsDocument
  missing: RipsMissingField[]
  totalServicios: number
  codPrestador: string | null
}

export interface RipsProfessional {
  documentTypeCode: string | null
  documentNumber: string | null
  name: string | null
}

export interface BuildRipsArgs {
  invoiceNum: string
  admission: AdmissionResponse
  patient: GetPatient | null | undefined
  provider: TProvider | null | undefined
  movements: BillingMovementResponse[]
  diagnosticosIngreso: Cie10CodeResponse[]
  diagnosticoEgreso: DiagnosticoEgresoResponse | null
  professional: RipsProfessional | null
  // Factura electrónica leída del XML. undefined: aún no se ha cargado (no se valida);
  // null: no hay XML o no se pudo leer.
  fev?: FevSummary | null
}

// El valor seleccionado en MediNexus no tiene el código de la tabla de referencia SISPRO
// (columna Code del catálogo vacía): el campo sale en null.
const PENDING_CATALOG_CODE = "El valor seleccionado no tiene código SISPRO"

// conceptoRecaudo (tabla conceptoRecaudo): MediNexus no registra copagos ni cuotas
// moderadoras, así que se reporta 05 = No aplica. El MUV no acepta el campo en null.
const CONCEPTO_RECAUDO_NO_APLICA = "05"

// modalidadPago 04 = Pago por evento. Solo en evento el valor del servicio va mayor a cero;
// en las demás modalidades se informa 0 (RVC034).
const MODALIDAD_PAGO_EVENTO = "04"

// tipoUsuario 10 = Tomador / Amparado SOAT: exige registroSIRAS (RVC095).
const TIPO_USUARIO_SOAT = "10"

// codSexo: el catálogo guarda el código de la tabla SISPRO "Sexo" (H, M, I); el RIPS usa la
// columna Extra_III de esa tabla: M (masculino), F (femenino) e I (indeterminado).
const SEXO_RIPS: Record<string, string> = { H: "M", M: "F", I: "I" }

// incapacidad (tabla LstSiNo, códigos "SI" / "NO"): indica si la atención generó una
// incapacidad. No se registra en la atención, así que se reporta NO.
const INCAPACIDAD_NO = "NO"

// tipoMedicamento (TipoMedicamentoPOSVersion2) 01 = medicamento con registro sanitario. Es el
// tipo de todo medicamento con CUM; MediNexus no factura preparaciones magistrales ni vitales
// no disponibles.
const TIPO_MEDICAMENTO_REGISTRO_SANITARIO = "01"

// diasTratamiento: los medicamentos se cargan como aplicación intrahospitalaria, sin días de
// tratamiento registrados; se reporta el mínimo permitido, 1.
const DIAS_TRATAMIENTO_APLICACION = 1

// tipoDiagnosticoPrincipal (RIPSTipoDiagnosticoPrincipalVersion2): 01 = impresión
// diagnóstica. MediNexus no registra si el diagnóstico está confirmado.
const TIPO_DIAGNOSTICO_IMPRESION = "01"

// Tabla TipoOtrosServicios.
const TIPO_OS_DISPOSITIVOS = "01"
const TIPO_OS_ESTANCIAS = "03"

// Tipos de documento (TipoIdPISIS) que acepta el RIPS para el profesional.
const TIPOS_DOCUMENTO_PROFESIONAL = new Set(["CC", "CE", "CD", "PA", "SC", "PE", "DE", "PT"])

// Tipos de documento (TipoIdPISIS) del usuario.
const TIPOS_DOCUMENTO_USUARIO = new Set([
  "CC", "CE", "CD", "PA", "SC", "PE", "RC", "TI", "CN", "AS", "MS", "DE", "PT", "SI",
])

// Aplicabilidad por grupo de las tablas de referencia (columnas Extra_I a Extra_IV de SISPRO,
// consultadas el 2026-10-07). Un código que no aplica al grupo se rechaza.
// RIPSFinalidadConsultaVersion2: finalidades que no aplican a consultas / a procedimientos.
const FINALIDADES_NO_CONSULTA = new Set([
  "14", "26", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42",
])
const FINALIDADES_NO_PROCEDIMIENTO = new Set(["21"])
// RIPSCausaExternaVersion2: 40 y 41 no aplican a urgencias ni hospitalización.
const CAUSAS_NO_INTERNACION = new Set(["40", "41"])
// ViaIngresoUsuario: 01 (demanda espontánea) y 04 (derivado de hospitalización) no aplican a
// hospitalización.
const VIAS_NO_HOSPITALIZACION = new Set(["01", "04"])
// CondicionyDestinoUsuarioEgreso: 03 (derivado a otro servicio) no aplica a hospitalización.
const CONDICIONES_NO_HOSPITALIZACION = new Set(["03"])
const CONDICION_PACIENTE_MUERTO = "02"

// numDocumentoIdObligado: NIT sin dígito de verificación ni separadores.
function toNit(nit: string | null | undefined): string | null {
  const value = nit?.split("-")[0].replace(/[^0-9]/g, "")
  return value || null
}

// codPaisResidencia / codPaisOrigen: código numérico ISO 3166 de 3 dígitos (Colombia = 170).
function toCountryCode(code: string | null | undefined): string | null {
  const value = code?.trim().toUpperCase()
  if (!value) return null
  if (/^\d{3}$/.test(value)) return value
  if (value === "CO" || value === "COL" || value === "COLOMBIA") return "170"
  return null
}

// codServicio es numérico de 3 o 4 dígitos (código REPS del servicio habilitado).
function toServiceCode(code: string | null | undefined): number | null {
  const value = code?.trim()
  return value && /^\d{3,4}$/.test(value) ? Number(value) : null
}

// unidadMinDispensa: código numérico de 1 a 3 dígitos de la tabla UPR ("066" → 66).
function toUnidadMinDispensa(code: string | null | undefined): number | null {
  const value = code?.trim()
  if (!value || !/^\d+$/.test(value)) return null
  const number = Number(value)
  return number >= 1 && number <= 999 ? number : null
}

// Códigos CIE-10 como en la tabla CIE10 de SISPRO: 4 caracteres, sin punto; los de 3
// caracteres se completan con X ("J00" → "J00X", "A09.0" → "A090").
export function toCie10(code: string | null | undefined): string | null {
  const value = code?.trim().toUpperCase().replace(/[^0-9A-Z]/g, "")
  if (!value) return null
  return value.length === 3 ? `${value}X` : value
}

// Valores monetarios: enteros (el RIPS no acepta decimales en los valores).
const toMoney = (value: number) => Math.round(value)

const pad = (value: number) => String(value).padStart(2, "0")

// Formato de fecha y hora del RIPS: "AAAA-MM-DD HH:MM" en hora local.
export function toRipsDateTime(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Fechas sin hora (nacimiento): se toma el texto tal cual para no correr el día por la zona
// horaria ("2010-01-03" interpretado como UTC sería el 2 de enero en Colombia).
function toRipsDate(value: string | null | undefined): string | null {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  return toRipsDateTime(value)?.slice(0, 10) ?? null
}

// Edad en años cumplidos a una fecha "AAAA-MM-DD".
function ageAt(birthDate: string, date: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number)
  const [y, m, d] = date.split("-").map(Number)
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0)
}

// Tipo de documento esperado según la edad (RVC007). Devuelve el motivo si no coincide.
function checkDocumentForAge(tipoDocumento: string, age: number): string | null {
  if (age <= 6 && ["CC", "TI"].includes(tipoDocumento)) {
    return `El usuario tiene ${age} años: debe identificarse con registro civil (RC)`
  }
  if (age >= 7 && age <= 17 && ["CC", "RC", "CN"].includes(tipoDocumento)) {
    return `El usuario tiene ${age} años: debe identificarse con tarjeta de identidad (TI)`
  }
  if (age >= 20 && ["TI", "RC", "CN"].includes(tipoDocumento)) {
    return `El usuario tiene ${age} años: debe identificarse con cédula de ciudadanía (CC)`
  }
  return null
}

// Grupo del JSON donde se reporta cada cargo. Para servicios y cirugías manda el tipo RIPS
// del CUPS (tabla CUPSRips): AC consulta, AP procedimiento, AT estancia / otros servicios.
export function classifyMovement(movement: BillingMovementResponse): RipsServiceGroupKey {
  if (movement.movementType === "medicine") return "medicamentos"
  if (movement.movementType === "supply") return "otrosServicios"

  switch (movement.cupsRipsType) {
    case "AC":
      return "consultas"
    case "AP":
      return "procedimientos"
    case "AT":
      return "otrosServicios"
  }

  if (movement.movementType === "surgery") return "procedimientos"
  switch (movement.serviceCategory?.trim()) {
    case "Consulta":
      return "consultas"
    case "Estancia":
      return "otrosServicios"
    default:
      return "procedimientos"
  }
}

const CUPS_PATTERN = /^[0-9A-Z]{6}$/

export function buildRips({
  invoiceNum,
  admission,
  patient,
  provider,
  movements,
  diagnosticosIngreso,
  diagnosticoEgreso,
  professional,
  fev,
}: BuildRipsArgs): RipsBuildResult {
  const missingMap = new Map<string, RipsMissingField>()
  const addIssue = (
    group: string,
    field: string,
    reason: string,
    severity: RipsIssueSeverity = "error",
  ) => {
    const key = `${group}|${field}|${reason}`
    if (!missingMap.has(key)) missingMap.set(key, { group, field, reason, severity })
  }
  const addWarning = (group: string, field: string, reason: string) =>
    addIssue(group, field, reason, "warning")

  // Código de habilitación REPS: 12 dígitos (10 del prestador + 2 de la sede), sin guiones.
  const codPrestador = provider?.enableCode?.replace(/[^0-9]/g, "") || null
  if (!codPrestador) {
    addIssue("Factura", "codPrestador", "El prestador no tiene código de habilitación REPS")
  } else if (codPrestador.length !== 12) {
    addIssue("Factura", "codPrestador", "El código de habilitación REPS debe tener 12 dígitos (prestador + sede)")
  }

  const numDocumentoIdObligado = toNit(provider?.nit)
  if (!numDocumentoIdObligado) {
    addIssue("Factura", "numDocumentoIdObligado", "El prestador no tiene NIT registrado")
  }

  // Valores: en pago por evento van mayores a cero; en otras modalidades se reporta 0.
  const paymentModality = admission.paymentModalityCode ?? null
  const isEvento = !paymentModality || paymentModality === MODALIDAD_PAGO_EVENTO
  if (!paymentModality) {
    addIssue("Factura", "modalidadPago", "La modalidad de pago del convenio no tiene código SISPRO; se reportan los valores como pago por evento", "warning")
  }
  const money = (value: number) => (isEvento ? toMoney(value) : 0)

  // Diagnóstico principal: el de egreso si existe; si no, el primero de ingreso. Los
  // relacionados no pueden repetir el principal ni repetirse entre sí (RVC086-RVC089).
  const ingresoCodes = diagnosticosIngreso
    .map((diagnostico) => toCie10(diagnostico.codigo))
    .filter((code): code is string => !!code)
  const egresoPrincipal = toCie10(diagnosticoEgreso?.codigoDiagnosticoEgreso1)
  const principal = egresoPrincipal ?? ingresoCodes[0] ?? null
  const relacionados = Array.from(
    new Set(
      [
        toCie10(diagnosticoEgreso?.codigoDiagnosticoEgreso2),
        toCie10(diagnosticoEgreso?.codigoDiagnosticoEgreso3),
        ...ingresoCodes,
      ].filter((code): code is string => !!code && code !== principal),
    ),
  )
  for (const code of [principal, ...relacionados]) {
    if (code && code.length !== 4) {
      addIssue("Servicios", "codDiagnosticoPrincipal", `El código CIE-10 ${code} no tiene 4 caracteres`)
    }
  }

  const fechaInicioAtencion = toRipsDateTime(admission.admissionDate)
  const fechaEgreso = toRipsDateTime(diagnosticoEgreso?.fechaEgreso)

  // Códigos de catálogo. Finalidad y causa salen del egreso si existe; si no, de la admisión.
  const modalidad = admission.careModalityCode ?? null
  const grupoServicios = admission.serviceClassificationCode ?? null
  const codServicio = toServiceCode(admission.serviceGroupCode)
  const finalidad =
    diagnosticoEgreso?.codigoFinalidadConsulta ?? admission.carePurposeCode ?? null
  const causaMotivo = diagnosticoEgreso?.codigoCausaExterna ?? admission.careReasonCode ?? null
  const viaIngreso = admission.admissionTypeCode ?? null
  const condicionEgreso = diagnosticoEgreso?.codigoCondicionSalida ?? null

  const servicios: RipsServicios = {
    consultas: [],
    procedimientos: [],
    urgencias: [],
    hospitalizacion: [],
    recienNacidos: [],
    medicamentos: [],
    otrosServicios: [],
  }

  // Profesional que prestó, prescribió u ordenó cada cargo (RVG11: debe estar en ReTHUS). Los
  // cargos sin profesional, anteriores a ese dato, usan el médico de la HC inicial.
  const resolveProfessional = (group: string, movement: BillingMovementResponse) => {
    const hasOwn = movement.professionalUserId != null
    if (!hasOwn && !professional) {
      addIssue(group, "tipo / numDocumentoIdentificacion", `${movement.name}: el cargo no tiene profesional y no hay historia clínica de ingreso de donde tomarlo`)
      return { tipoDocumentoIdentificacion: null, numDocumentoIdentificacion: null }
    }
    if (!hasOwn) {
      addWarning(group, "tipo / numDocumentoIdentificacion", "Hay cargos sin profesional: se reporta el médico de la historia clínica de ingreso. Asígnelo en la carga de servicios")
    }

    const tipo = (hasOwn ? movement.professionalDocumentTypeCode : professional?.documentTypeCode)?.trim().toUpperCase() || null
    const numero = (hasOwn ? movement.professionalDocumentNumber : professional?.documentNumber)?.trim() || null
    const quien = hasOwn
      ? `${movement.name} (${movement.professionalName ?? "profesional del cargo"})`
      : "El médico de la historia clínica de ingreso"
    if (!numero) addIssue(group, "numDocumentoIdentificacion", `${quien}: no tiene número de documento`)
    if (!tipo) {
      addIssue(group, "tipoDocumentoIdentificacion", `${quien}: el tipo de documento no tiene código`)
    } else if (!TIPOS_DOCUMENTO_PROFESIONAL.has(tipo)) {
      addIssue(group, "tipoDocumentoIdentificacion", `${quien}: el tipo de documento ${tipo} no está en TipoIdPISIS (CC, CE, CD, PA, SC, PE, DE o PT)`)
    }
    return {
      tipoDocumentoIdentificacion: tipo && TIPOS_DOCUMENTO_PROFESIONAL.has(tipo) ? tipo : null,
      numDocumentoIdentificacion: numero,
    }
  }

  const checkCommon = (group: string) => {
    if (!modalidad) addIssue(group, "modalidadGrupoServicioTecSal", PENDING_CATALOG_CODE)
    if (!grupoServicios) addIssue(group, "grupoServicios", PENDING_CATALOG_CODE)
    if (codServicio === null) {
      addIssue(group, "codServicio", "El grupo de servicio de la admisión no tiene código REPS")
    }
    if (!finalidad) addIssue(group, "finalidadTecnologiaSalud", PENDING_CATALOG_CODE)
    if (!principal) {
      addIssue(group, "codDiagnosticoPrincipal", "No hay diagnósticos en la historia clínica de ingreso ni en el egreso")
    }
  }

  const checkValue = (group: string, name: string, value: number) => {
    if (isEvento && value <= 0) {
      addIssue(group, "vrServicio", `${name}: en pago por evento el valor debe ser mayor a cero`)
    }
  }

  // Código CUPS: debe existir y estar habilitado en CUPSRips (RVC096).
  const checkCups = (group: string, movement: BillingMovementResponse, code: string | null) => {
    if (!code) {
      addIssue(group, "código CUPS", `${movement.name}: el cargo no tiene código`)
    } else if (!CUPS_PATTERN.test(code)) {
      addIssue(
        group,
        "código CUPS",
        movement.cupsCode
          ? `${movement.name}: el CUPS ${code} no tiene el formato de 6 caracteres`
          : `${movement.name}: el código ${code} del manual tarifario no está homologado a CUPS`,
      )
    } else if (!movement.cupsRipsType) {
      addIssue(group, "código CUPS", `${movement.name}: el código ${code} no existe en la tabla CUPSRips`)
    } else if (movement.cupsEnabled === false) {
      addIssue(group, "código CUPS", `${movement.name}: el CUPS ${code} está deshabilitado en CUPSRips`)
    }
  }

  const activeMovements = movements.filter((item) => item.isActive !== false)
  const groups = new Set(activeMovements.map(classifyMovement))
  if (finalidad && FINALIDADES_NO_CONSULTA.has(finalidad) && groups.has("consultas")) {
    addIssue("Consultas", "finalidadTecnologiaSalud", `La finalidad ${finalidad} no aplica a consultas (RIPSFinalidadConsultaVersion2)`)
  }
  if (finalidad && FINALIDADES_NO_PROCEDIMIENTO.has(finalidad) && groups.has("procedimientos")) {
    addIssue("Procedimientos", "finalidadTecnologiaSalud", `La finalidad ${finalidad} no aplica a procedimientos (RIPSFinalidadConsultaVersion2)`)
  }

  for (const movement of activeMovements) {
    const group = classifyMovement(movement)
    const code = movement.itemCode?.trim() || null
    // Servicios y cirugías se reportan con el CUPS homologado del detalle de tarifa; si no lo
    // tiene, con el código del manual tarifario (y se avisa si no es un CUPS válido).
    const procedureCode = movement.cupsCode?.trim() || code

    if (group === "consultas") {
      checkCups("Consultas", movement, procedureCode)
      checkCommon("Consultas")
      const profesional = resolveProfessional("Consultas", movement)
      if (!causaMotivo) addIssue("Consultas", "causaMotivoAtencion", PENDING_CATALOG_CODE)
      addWarning("Consultas", "tipoDiagnosticoPrincipal", "No se registra si el diagnóstico está confirmado; se reporta 01 (impresión diagnóstica)")
      const vrServicio = money(movement.totalValue)
      checkValue("Consultas", movement.name, vrServicio)
      servicios.consultas.push({
        codPrestador,
        fechaInicioAtencion,
        numAutorizacion: null,
        codConsulta: procedureCode,
        modalidadGrupoServicioTecSal: modalidad,
        grupoServicios,
        codServicio,
        finalidadTecnologiaSalud: finalidad,
        causaMotivoAtencion: causaMotivo,
        codDiagnosticoPrincipal: principal,
        codDiagnosticoPrincipalCIE11: null,
        nomCodDiagnosticoPrincipalCIE11: null,
        codDiagnosticoRelacionado1: relacionados[0] ?? null,
        codDiagnosticoRelacionado1CIE11: null,
        nomCodDiagnosticoRelacionado1CIE11: null,
        codDiagnosticoRelacionado2: relacionados[1] ?? null,
        codDiagnosticoRelacionado2CIE11: null,
        nomCodDiagnosticoRelacionado2CIE11: null,
        codDiagnosticoRelacionado3: relacionados[2] ?? null,
        codDiagnosticoRelacionado3CIE11: null,
        nomCodDiagnosticoRelacionado3CIE11: null,
        tipoDiagnosticoPrincipal: TIPO_DIAGNOSTICO_IMPRESION,
        ...profesional,
        vrServicio,
        conceptoRecaudo: CONCEPTO_RECAUDO_NO_APLICA,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        codigoVIDA: null,
        consecutivo: servicios.consultas.length + 1,
      })
    } else if (group === "procedimientos") {
      checkCups("Procedimientos", movement, procedureCode)
      checkCommon("Procedimientos")
      const profesional = resolveProfessional("Procedimientos", movement)
      if (!viaIngreso) addIssue("Procedimientos", "viaIngresoServicioSalud", PENDING_CATALOG_CODE)
      const vrServicio = money(movement.totalValue)
      checkValue("Procedimientos", movement.name, vrServicio)
      servicios.procedimientos.push({
        codPrestador,
        fechaInicioAtencion,
        numAutorizacion: null,
        idMIPRES: null,
        codProcedimiento: procedureCode,
        viaIngresoServicioSalud: viaIngreso,
        modalidadGrupoServicioTecSal: modalidad,
        grupoServicios,
        codServicio,
        finalidadTecnologiaSalud: finalidad,
        ...profesional,
        codDiagnosticoPrincipal: principal,
        codDiagnosticoPrincipalCIE11: null,
        nomCodDiagnosticoPrincipalCIE11: null,
        codDiagnosticoRelacionado: relacionados[0] ?? null,
        codDiagnosticoRelacionadoCIE11: null,
        nomCodDiagnosticoRelacionadoCIE11: null,
        codComplicacion: null,
        codComplicacionCIE11: null,
        nomCodComplicacionCIE11: null,
        vrServicio,
        conceptoRecaudo: CONCEPTO_RECAUDO_NO_APLICA,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        codigoVIDA: null,
        consecutivo: servicios.procedimientos.length + 1,
      })
    } else if (group === "medicamentos") {
      // Para medicamentos con CUM (tipo 01) la concentración y la unidad de medida van en 0 y
      // la forma farmacéutica en null: solo se informan en preparaciones magistrales (M10-M12).
      const unidadMinDispensa = toUnidadMinDispensa(movement.medicinePresentationCode)
      if (!code) addIssue("Medicamentos", "codTecnologiaSalud", `${movement.name}: el medicamento no tiene CUM`)
      if (unidadMinDispensa === null) {
        addIssue("Medicamentos", "unidadMinDispensa", `${movement.name}: el medicamento no tiene presentación (tabla UPR)`)
      }
      if (!principal) {
        addIssue("Medicamentos", "codDiagnosticoPrincipal", "No hay diagnósticos en la historia clínica de ingreso ni en el egreso")
      }
      addWarning("Medicamentos", "diasTratamiento", "No se registran días de tratamiento; se reporta 1")
      // M16 / M17: profesional que prescribe el medicamento.
      const profesional = resolveProfessional("Medicamentos", movement)

      const vrUnitMedicamento = money(movement.unitValue)
      const vrServicio = money(movement.totalValue)
      checkValue("Medicamentos", movement.name, vrServicio)
      // RVC094: el valor del servicio debe ser cantidad × valor unitario.
      if (vrServicio !== movement.quantity * vrUnitMedicamento) {
        addIssue("Medicamentos", "vrServicio", `${movement.name}: el valor total no es cantidad × valor unitario`)
      }
      servicios.medicamentos.push({
        codPrestador,
        idMIPRES: null,
        fechaDispensAdmon: toRipsDateTime(movement.createdAt),
        codDiagnosticoPrincipal: principal,
        codDiagnosticoPrincipalCIE11: null,
        nomCodDiagnosticoPrincipalCIE11: null,
        codDiagnosticoRelacionado: relacionados[0] ?? null,
        codDiagnosticoRelacionadoCIE11: null,
        nomCodDiagnosticoRelacionadoCIE11: null,
        tipoMedicamento: code ? TIPO_MEDICAMENTO_REGISTRO_SANITARIO : null,
        codTecnologiaSalud: code,
        nomTecnologiaSalud: null,
        concentracionMedicamento: 0,
        unidadMedida: 0,
        formaFarmaceutica: null,
        unidadMinDispensa,
        cantidadMedicamento: movement.quantity,
        diasTratamiento: DIAS_TRATAMIENTO_APLICACION,
        ...profesional,
        vrUnitMedicamento,
        vrDispensacion: 0,
        vrServicio,
        conceptoRecaudo: CONCEPTO_RECAUDO_NO_APLICA,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        codigoVIDA: null,
        consecutivo: servicios.medicamentos.length + 1,
      })
    } else {
      const isSupply = movement.movementType === "supply"
      const tipoOS = isSupply ? TIPO_OS_DISPOSITIVOS : TIPO_OS_ESTANCIAS
      const codTecnologiaSalud = isSupply ? code : procedureCode
      if (!codTecnologiaSalud) {
        addIssue("Otros servicios", "codTecnologiaSalud", `${movement.name}: el cargo no tiene código`)
      } else if (!isSupply) {
        // Estancias y traslados se reportan con CUPS.
        checkCups("Otros servicios", movement, codTecnologiaSalud)
      }
      // El profesional solo se informa en dispositivos, servicios complementarios y honorarios
      // (RVC050); en estancias va null.
      const profesional = isSupply
        ? resolveProfessional("Otros servicios", movement)
        : { tipoDocumentoIdentificacion: null, numDocumentoIdentificacion: null }
      const vrUnitOS = money(movement.unitValue)
      const vrServicio = money(movement.totalValue)
      checkValue("Otros servicios", movement.name, vrServicio)
      servicios.otrosServicios.push({
        codPrestador,
        numAutorizacion: null,
        idMIPRES: null,
        fechaSuministroTecnologia: toRipsDateTime(movement.createdAt),
        tipoOS,
        codTecnologiaSalud,
        // Obligatorio para dispositivos médicos e insumos (hasta 200 caracteres).
        nomTecnologiaSalud: movement.name.trim().slice(0, 200) || null,
        cantidadOS: movement.quantity,
        ...profesional,
        vrUnitOS,
        vrDispensacion: 0,
        vrServicio,
        conceptoRecaudo: CONCEPTO_RECAUDO_NO_APLICA,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        codigoVIDA: null,
        consecutivo: servicios.otrosServicios.length + 1,
      })
    }
  }

  // La admisión por urgencias u hospitalización se reporta como un registro propio, sin valor,
  // con los datos de ingreso y egreso.
  const scope = admission.careScopeName?.toLowerCase() ?? ""
  const isUrgencias = scope.includes("urgencia")
  const isHospitalizacion = scope.includes("hospitaliz")

  if (isUrgencias || isHospitalizacion) {
    const groupLabel = isUrgencias ? "Urgencias" : "Hospitalización"
    const diagnosticoIngreso = ingresoCodes[0] ?? principal

    if (!causaMotivo) {
      addIssue(groupLabel, "causaMotivoAtencion", PENDING_CATALOG_CODE)
    } else if (CAUSAS_NO_INTERNACION.has(causaMotivo)) {
      addIssue(groupLabel, "causaMotivoAtencion", `La causa ${causaMotivo} no aplica a ${groupLabel.toLowerCase()} (RIPSCausaExternaVersion2)`)
    }
    if (!diagnosticoIngreso) {
      addIssue(groupLabel, "codDiagnosticoPrincipal", "No hay diagnóstico de ingreso")
    }
    if (!diagnosticoEgreso) {
      addIssue(groupLabel, "codDiagnosticoPrincipalE / condicionDestinoUsuarioEgreso / fechaEgreso", "No hay egreso registrado: son obligatorios")
    } else {
      if (!egresoPrincipal) addIssue(groupLabel, "codDiagnosticoPrincipalE", "El egreso no tiene diagnóstico principal")
      if (!fechaEgreso) addIssue(groupLabel, "fechaEgreso", "El egreso no tiene fecha")
      if (!condicionEgreso) {
        addIssue(groupLabel, "condicionDestinoUsuarioEgreso", PENDING_CATALOG_CODE)
      } else if (isHospitalizacion && CONDICIONES_NO_HOSPITALIZACION.has(condicionEgreso)) {
        addIssue(groupLabel, "condicionDestinoUsuarioEgreso", `La condición ${condicionEgreso} no aplica a hospitalización`)
      }
      if (condicionEgreso === CONDICION_PACIENTE_MUERTO) {
        addIssue(groupLabel, "codDiagnosticoCausaMuerte", "El paciente egresó muerto: falta la causa básica de muerte (RVC042)")
      }
    }

    // Relacionados de egreso: distintos del principal de egreso y entre sí (RVC088/RVC089).
    const relacionadosEgreso = Array.from(
      new Set(
        [
          toCie10(diagnosticoEgreso?.codigoDiagnosticoEgreso2),
          toCie10(diagnosticoEgreso?.codigoDiagnosticoEgreso3),
        ].filter((code): code is string => !!code && code !== egresoPrincipal),
      ),
    )

    // Urgencias y hospitalización comparten estos bloques, pero hospitalización intercala sus
    // propios campos (vía de ingreso, autorización y complicación); se arman por partes para
    // respetar el orden de cada grupo.
    const diagnosticosEgresoFields = {
      codDiagnosticoPrincipal: diagnosticoIngreso,
      codDiagnosticoPrincipalCIE11: null,
      nomCodDiagnosticoPrincipalCIE11: null,
      codDiagnosticoPrincipalE: egresoPrincipal,
      codDiagnosticoPrincipalECIE11: null,
      nomCodDiagnosticoPrincipalECIE11: null,
      codDiagnosticoRelacionadoE1: relacionadosEgreso[0] ?? null,
      codDiagnosticoRelacionadoE1CIE11: null,
      nomCodDiagnosticoRelacionadoE1CIE11: null,
      codDiagnosticoRelacionadoE2: relacionadosEgreso[1] ?? null,
      codDiagnosticoRelacionadoE2CIE11: null,
      nomCodDiagnosticoRelacionadoE2CIE11: null,
      codDiagnosticoRelacionadoE3: null,
      codDiagnosticoRelacionadoE3CIE11: null,
      nomCodDiagnosticoRelacionadoE3CIE11: null,
    } as const
    const cierreEgresoFields = {
      condicionDestinoUsuarioEgreso: condicionEgreso,
      codDiagnosticoCausaMuerte: null,
      codDiagnosticoCausaMuerteCIE11: null,
      nomCodDiagnosticoCausaMuerteCIE11: null,
      fechaEgreso,
      codigoVIDA: null,
      consecutivo: 1,
    } as const

    if (isUrgencias) {
      servicios.urgencias.push({
        codPrestador,
        fechaInicioAtencion,
        causaMotivoAtencion: causaMotivo,
        ...diagnosticosEgresoFields,
        ...cierreEgresoFields,
      })
    } else {
      if (!viaIngreso) {
        addIssue(groupLabel, "viaIngresoServicioSalud", PENDING_CATALOG_CODE)
      } else if (VIAS_NO_HOSPITALIZACION.has(viaIngreso)) {
        addIssue(groupLabel, "viaIngresoServicioSalud", `La vía de ingreso ${viaIngreso} no aplica a hospitalización: use derivado de consulta externa (02), de urgencias (03), referido (13) u otra que aplique`)
      }
      servicios.hospitalizacion.push({
        codPrestador,
        viaIngresoServicioSalud: viaIngreso,
        fechaInicioAtencion,
        numAutorizacion: null,
        causaMotivoAtencion: causaMotivo,
        ...diagnosticosEgresoFields,
        codComplicacion: null,
        codComplicacionCIE11: null,
        nomCodComplicacionCIE11: null,
        ...cierreEgresoFields,
      })
    }
  }

  // Las estancias se validan contra un registro de urgencias u hospitalización (RVC056).
  const hasEstancias = servicios.otrosServicios.some((item) => item.tipoOS === TIPO_OS_ESTANCIAS)
  if (hasEstancias && servicios.urgencias.length === 0 && servicios.hospitalizacion.length === 0) {
    addIssue("Otros servicios", "tipoOS", "Hay estancias pero la admisión no es de urgencias ni hospitalización")
  }

  // ---------- Usuario ----------
  // tipoUsuario sale del convenio de la admisión (tabla RIPSTipoUsuarioVersion2).
  const tipoDocumento = admission.documentTypeCode?.trim().toUpperCase() || null
  const numDocumento = admission.documentoPatiente?.trim() || patient?.documentNumber?.trim() || null
  const tipoUsuario = admission.healthUserTypeCode ?? null
  const fechaNacimiento = toRipsDate(patient?.birthDate)
  const codSexo = patient?.sexCode ? SEXO_RIPS[patient.sexCode] ?? null : null
  const codPaisResidencia = toCountryCode(patient?.residenceCountryCode)
  const codPaisOrigen = toCountryCode(patient?.birthCountryCode)
  const codMunicipio = /^\d{5}$/.test(patient?.cityCode ?? "") ? patient!.cityCode! : null
  const codZona = patient?.zoneCode ?? null

  if (!tipoDocumento) {
    addIssue("Usuario", "tipoDocumentoIdentificacion", PENDING_CATALOG_CODE)
  } else if (!TIPOS_DOCUMENTO_USUARIO.has(tipoDocumento)) {
    addIssue("Usuario", "tipoDocumentoIdentificacion", `El tipo de documento ${tipoDocumento} no está en la tabla TipoIdPISIS`)
  }
  if (!numDocumento) addIssue("Usuario", "numDocumentoIdentificacion", "El paciente no tiene número de documento")
  if (!fechaNacimiento) {
    addIssue("Usuario", "fechaNacimiento", "El paciente no tiene fecha de nacimiento")
  } else if (tipoDocumento && fechaInicioAtencion) {
    const reason = checkDocumentForAge(tipoDocumento, ageAt(fechaNacimiento, fechaInicioAtencion.slice(0, 10)))
    if (reason) addWarning("Usuario", "tipoDocumentoIdentificacion", `${reason} (RVC007)`)
  }
  if (!tipoUsuario) {
    addIssue("Usuario", "tipoUsuario", "El tipo de usuario del convenio no tiene código SISPRO")
  } else if (tipoUsuario === TIPO_USUARIO_SOAT) {
    addIssue("Usuario", "registroSIRAS", "El tipo de usuario es 10 (SOAT): el RIPS exige el número de registro SIRAS, que MediNexus no captura (RVC095)")
  }
  if (!codSexo) addIssue("Usuario", "codSexo", PENDING_CATALOG_CODE)
  if (!codPaisResidencia || !codPaisOrigen) {
    addIssue("Usuario", "codPaisResidencia / codPaisOrigen", "El país no tiene el código numérico ISO (Colombia = 170)")
  }
  if (codPaisResidencia === "170") {
    if (!codMunicipio) addIssue("Usuario", "codMunicipioResidencia", "El municipio no tiene código DANE de 5 dígitos")
    if (!codZona) addIssue("Usuario", "codZonaTerritorialResidencia", PENDING_CATALOG_CODE)
  }
  addWarning("Usuario", "incapacidad", "No se registra si la atención generó incapacidad; se reporta NO")

  const usuario: RipsUsuario = {
    consecutivo: 1,
    tipoDocumentoIdentificacion: tipoDocumento,
    numDocumentoIdentificacion: numDocumento,
    tipoUsuario,
    fechaNacimiento,
    codSexo,
    codPaisResidencia,
    codMunicipioResidencia: codMunicipio,
    codZonaTerritorialResidencia: codZona,
    incapacidad: INCAPACIDAD_NO,
    codPaisOrigen,
    registroSIRAS: null,
    servicios,
  }

  const totalServicios = [
    ...servicios.consultas,
    ...servicios.procedimientos,
    ...servicios.medicamentos,
    ...servicios.otrosServicios,
  ].reduce((sum, item) => sum + item.vrServicio, 0)

  // Cada usuario debe tener al menos un servicio (RVG03 / RVG07).
  if (Object.values(servicios).every((items) => items.length === 0)) {
    addIssue("Servicios", "servicios", "La admisión no tiene servicios para reportar (RVG03)")
  }

  // ---------- Cruce con la factura electrónica ----------
  if (fev === null) {
    addWarning("Factura", "xmlFevFile", "No se pudo leer el XML de la factura: el RIPS no se comparó con la factura electrónica")
  } else if (fev) {
    if (fev.invoiceNum !== invoiceNum) {
      addIssue("Factura", "numFactura", `El número del RIPS (${invoiceNum}) no coincide con el de la factura electrónica (${fev.invoiceNum ?? "sin número"}) (RVC004)`)
    }
    const fevNit = toNit(fev.supplierNit)
    if (numDocumentoIdObligado && fevNit !== numDocumentoIdObligado) {
      addIssue("Factura", "numDocumentoIdObligado", `El NIT del RIPS (${numDocumentoIdObligado}) no coincide con el del emisor de la factura (${fevNit ?? "sin NIT"}) (RVC001)`)
    }
    // Fuera de pago por evento los servicios van en 0 (RVC034) y no suman el valor facturado.
    const valorFactura = fev.lineExtensionAmount === null ? null : toMoney(fev.lineExtensionAmount)
    if (isEvento && valorFactura === null) {
      addIssue("Factura", "vrServicio", "La factura electrónica no tiene LineExtensionAmount: no se puede comparar el valor (RVG08)")
    } else if (isEvento && valorFactura !== totalServicios) {
      addIssue("Factura", "vrServicio", `La suma de los servicios del RIPS (${totalServicios}) no coincide con el valor de la factura (${valorFactura}). Revise si se anularon o agregaron cargos después de facturar (RVG08)`)
    }
    if (!fev.customizationId?.startsWith("SS-")) {
      addIssue("Factura", "CustomizationID", `La factura es de tipo de operación ${fev.customizationId ?? "sin tipo"}, no una FEV en salud (SS-CUFE, SS-SinAporte, etc.): debe emitirse con los campos del sector salud`)
    }
    if (!fev.hasHealthExtension) {
      addIssue("Factura", "CustomTagGeneral", "La factura no trae los campos adicionales del sector salud (UBLExtensions / CustomTagGeneral) (FED060)")
    }
    if (!fev.periodStart || !fev.periodEnd) {
      addIssue("Factura", "InvoicePeriod", "La factura no trae el periodo de facturación (InvoicePeriod StartDate / EndDate) (VFE020 / VFE021)")
    } else {
      // Fechas de los servicios y de egreso dentro del periodo facturado (RVC014 / RVC044).
      const { periodStart, periodEnd } = fev
      const outOfPeriod = (value: string | null) => {
        const day = value?.slice(0, 10)
        return !!day && (day < periodStart || day > periodEnd)
      }
      const period = `${periodStart} a ${periodEnd}`
      const datedServices: [string, string | null][] = [
        ...servicios.consultas.map((item): [string, string | null] => ["Consultas", item.fechaInicioAtencion]),
        ...servicios.procedimientos.map((item): [string, string | null] => ["Procedimientos", item.fechaInicioAtencion]),
        ...servicios.medicamentos.map((item): [string, string | null] => ["Medicamentos", item.fechaDispensAdmon]),
        ...servicios.otrosServicios.map((item): [string, string | null] => ["Otros servicios", item.fechaSuministroTecnologia]),
      ]
      for (const [group, date] of datedServices) {
        if (outOfPeriod(date)) {
          addIssue(group, "fecha del servicio", `Hay servicios con fecha fuera del periodo facturado (${period}) (RVC014)`)
        }
      }
      for (const [group, items] of [["Urgencias", servicios.urgencias], ["Hospitalización", servicios.hospitalizacion]] as const) {
        if (items.some((item) => outOfPeriod(item.fechaEgreso))) {
          addIssue(group, "fechaEgreso", `La fecha de egreso está fuera del periodo facturado (${period}) (RVC044)`)
        }
      }
    }
  }

  // Primero los errores, luego los avisos.
  const missing = Array.from(missingMap.values()).sort(
    (a, b) => Number(a.severity === "warning") - Number(b.severity === "warning"),
  )

  return {
    rips: {
      numDocumentoIdObligado,
      numFactura: invoiceNum,
      tipoNota: null,
      numNota: null,
      usuarios: [usuario],
    },
    missing,
    totalServicios,
    codPrestador,
  }
}
