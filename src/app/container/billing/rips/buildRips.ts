import type { BillingMovementResponse } from "@/core/interfaces/care/billing"
import type {
  Cie10CodeResponse,
  DiagnosticoEgresoResponse,
} from "@/core/interfaces/care/hciInicial"
import type { AdmissionResponse, GetPatient } from "@/core/interfaces/care/types"
import type { TProvider } from "@/core/interfaces/parameterization/types"

// Estructura del RIPS como soporte de la FEV en salud (Resolución 948 de 2026,
// Documento Técnico 1 v003). Todos los campos van siempre presentes: cuando no hay
// dato se envía null. Los valores codificados que MediNexus todavía no guarda
// (catálogos sin código SISPRO) se dejan en null y se reportan en `missing`.

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
  conceptoRecaudo: Nullable<string>
  valorPagoModerador: number
  numFEVPagoModerador: null
  consecutivo: number
  codigoVIDA: null
}

export interface RipsProcedimiento extends DiagnosticFields {
  codPrestador: Nullable<string>
  fechaInicioAtencion: Nullable<string>
  idMIPRES: null
  numAutorizacion: null
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
  conceptoRecaudo: Nullable<string>
  valorPagoModerador: number
  numFEVPagoModerador: null
  consecutivo: number
  codigoVIDA: null
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
  consecutivo: number
  codigoVIDA: null
}

export type RipsUrgencia = EgresoFields

export interface RipsHospitalizacion extends EgresoFields {
  viaIngresoServicioSalud: Nullable<string>
  numAutorizacion: null
  codComplicacion: null
  codComplicacionCIE11: null
  nomCodComplicacionCIE11: null
}

export interface RipsMedicamento extends DiagnosticFields {
  codPrestador: Nullable<string>
  numAutorizacion: null
  idMIPRES: null
  fechaDispensAdmon: Nullable<string>
  codDiagnosticoRelacionado: Nullable<string>
  codDiagnosticoRelacionadoCIE11: null
  nomCodDiagnosticoRelacionadoCIE11: null
  tipoMedicamento: Nullable<string>
  codTecnologiaSalud: Nullable<string>
  nomTecnologiaSalud: string
  concentracionMedicamento: Nullable<number>
  unidadMedida: Nullable<number>
  formaFarmaceutica: Nullable<string>
  unidadMinDispensa: Nullable<number>
  cantidadMedicamento: number
  diasTratamiento: Nullable<number>
  tipoDocumentoIdentificacion: Nullable<string>
  numDocumentoIdentificacion: Nullable<string>
  vrUnitMedicamento: number
  vrServicio: number
  vrDispensacion: null
  conceptoRecaudo: Nullable<string>
  valorPagoModerador: number
  numFEVPagoModerador: null
  consecutivo: number
  codigoVIDA: null
}

export interface RipsOtroServicio {
  codPrestador: Nullable<string>
  numAutorizacion: null
  idMIPRES: null
  fechaSuministroTecnologia: Nullable<string>
  tipoOS: Nullable<string>
  codTecnologiaSalud: Nullable<string>
  nomTecnologiaSalud: string
  cantidadOS: number
  tipoDocumentoIdentificacion: Nullable<string>
  numDocumentoIdentificacion: Nullable<string>
  vrUnitOS: number
  vrServicio: number
  vrDispensacion: null
  conceptoRecaudo: Nullable<string>
  valorPagoModerador: number
  numFEVPagoModerador: null
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
  incapacidad: Nullable<string>
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

export interface RipsMissingField {
  // Grupo donde falta el dato ("Factura", "Usuario" o el grupo de servicios).
  group: string
  field: string
  reason: string
}

export interface RipsBuildResult {
  rips: RipsDocument
  missing: RipsMissingField[]
  totalServicios: number
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
}

// Catálogos que hoy solo tienen Id + Name en MediNexus. Hasta que tengan su columna
// Code con el valor de la tabla SISPRO, el campo sale en null.
const PENDING_CATALOG_CODE = "El catálogo no tiene código SISPRO"

const pad = (value: number) => String(value).padStart(2, "0")

// Formato de fecha y hora del RIPS: "AAAA-MM-DD HH:MM" en hora local.
export function toRipsDateTime(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toRipsDate(value: string | null | undefined): string | null {
  return toRipsDateTime(value)?.slice(0, 10) ?? null
}

// La vista del RIPS clasifica cada cargo en el grupo del JSON donde se reporta.
export function classifyMovement(movement: BillingMovementResponse): RipsServiceGroupKey {
  if (movement.movementType === "medicine") return "medicamentos"
  if (movement.movementType === "supply") return "otrosServicios"
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
}: BuildRipsArgs): RipsBuildResult {
  const missingMap = new Map<string, RipsMissingField>()
  const addMissing = (group: string, field: string, reason: string) => {
    const key = `${group}|${field}|${reason}`
    if (!missingMap.has(key)) missingMap.set(key, { group, field, reason })
  }

  const codPrestador = provider?.enableCode?.trim() || null
  if (!codPrestador) {
    addMissing("Factura", "codPrestador", "El prestador no tiene código de habilitación REPS")
  }

  const numDocumentoIdObligado = provider?.nit?.trim() || null
  if (!numDocumentoIdObligado) {
    addMissing("Factura", "numDocumentoIdObligado", "El prestador no tiene NIT registrado")
  }

  // Diagnóstico principal: el de egreso si existe; si no, el primero de ingreso. Los
  // relacionados no pueden repetir el principal ni repetirse entre sí (RVC086-RVC089).
  const principal =
    diagnosticoEgreso?.codigoDiagnosticoEgreso1 ?? diagnosticosIngreso[0]?.codigo ?? null
  const relacionados = Array.from(
    new Set(
      [
        diagnosticoEgreso?.codigoDiagnosticoEgreso2,
        diagnosticoEgreso?.codigoDiagnosticoEgreso3,
        ...diagnosticosIngreso.map((diagnostico) => diagnostico.codigo),
      ].filter((code): code is string => !!code && code !== principal),
    ),
  )

  const fechaInicioAtencion = toRipsDateTime(admission.admissionDate)
  const fechaEgreso = toRipsDateTime(diagnosticoEgreso?.fechaEgreso)
  const profesionalTipoDoc = professional?.documentTypeCode ?? null
  const profesionalNumDoc = professional?.documentNumber ?? null

  const servicios: RipsServicios = {
    consultas: [],
    procedimientos: [],
    urgencias: [],
    hospitalizacion: [],
    recienNacidos: [],
    medicamentos: [],
    otrosServicios: [],
  }

  const noteCommonMissing = (group: string) => {
    addMissing(group, "modalidadGrupoServicioTecSal", PENDING_CATALOG_CODE)
    addMissing(group, "grupoServicios", PENDING_CATALOG_CODE)
    addMissing(group, "codServicio", "No se registra el servicio habilitado (REPS)")
    addMissing(group, "finalidadTecnologiaSalud", PENDING_CATALOG_CODE)
    addMissing(group, "conceptoRecaudo", "No se registra copago / cuota moderadora")
    if (!profesionalNumDoc) {
      addMissing(group, "numDocumentoIdentificacion", "No se identificó el profesional tratante")
    }
    if (!profesionalTipoDoc) {
      addMissing(group, "tipoDocumentoIdentificacion", "El tipo de documento del profesional no tiene código")
    }
  }

  const checkCups = (group: string, code: string | null) => {
    if (!code) {
      addMissing(group, "código CUPS", "El cargo no tiene código")
    } else if (!CUPS_PATTERN.test(code)) {
      addMissing(group, "código CUPS", "Hay códigos que no tienen formato CUPS (6 caracteres)")
    }
  }

  for (const movement of movements.filter((item) => item.isActive !== false)) {
    const group = classifyMovement(movement)
    const code = movement.itemCode?.trim() || null

    if (group === "consultas") {
      checkCups("Consultas", code)
      noteCommonMissing("Consultas")
      addMissing("Consultas", "causaMotivoAtencion", PENDING_CATALOG_CODE)
      addMissing("Consultas", "tipoDiagnosticoPrincipal", "No se registra si el diagnóstico es impresión o confirmado")
      servicios.consultas.push({
        codPrestador,
        fechaInicioAtencion,
        numAutorizacion: null,
        codConsulta: code,
        modalidadGrupoServicioTecSal: null,
        grupoServicios: null,
        codServicio: null,
        finalidadTecnologiaSalud: null,
        causaMotivoAtencion: null,
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
        tipoDiagnosticoPrincipal: null,
        tipoDocumentoIdentificacion: profesionalTipoDoc,
        numDocumentoIdentificacion: profesionalNumDoc,
        vrServicio: movement.totalValue,
        conceptoRecaudo: null,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        consecutivo: servicios.consultas.length + 1,
        codigoVIDA: null,
      })
    } else if (group === "procedimientos") {
      checkCups("Procedimientos", code)
      noteCommonMissing("Procedimientos")
      addMissing("Procedimientos", "viaIngresoServicioSalud", PENDING_CATALOG_CODE)
      servicios.procedimientos.push({
        codPrestador,
        fechaInicioAtencion,
        idMIPRES: null,
        numAutorizacion: null,
        codProcedimiento: code,
        viaIngresoServicioSalud: null,
        modalidadGrupoServicioTecSal: null,
        grupoServicios: null,
        codServicio: null,
        finalidadTecnologiaSalud: null,
        tipoDocumentoIdentificacion: profesionalTipoDoc,
        numDocumentoIdentificacion: profesionalNumDoc,
        codDiagnosticoPrincipal: principal,
        codDiagnosticoPrincipalCIE11: null,
        nomCodDiagnosticoPrincipalCIE11: null,
        codDiagnosticoRelacionado: relacionados[0] ?? null,
        codDiagnosticoRelacionadoCIE11: null,
        nomCodDiagnosticoRelacionadoCIE11: null,
        codComplicacion: null,
        codComplicacionCIE11: null,
        nomCodComplicacionCIE11: null,
        vrServicio: movement.totalValue,
        conceptoRecaudo: null,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        consecutivo: servicios.procedimientos.length + 1,
        codigoVIDA: null,
      })
    } else if (group === "medicamentos") {
      if (!code) addMissing("Medicamentos", "codTecnologiaSalud", "El medicamento no tiene CUM")
      addMissing("Medicamentos", "tipoMedicamento", PENDING_CATALOG_CODE)
      addMissing("Medicamentos", "concentración / unidad / forma farmacéutica", "Falta enviar los datos del catálogo de medicamentos")
      addMissing("Medicamentos", "diasTratamiento", "No se registran días de tratamiento")
      addMissing("Medicamentos", "conceptoRecaudo", "No se registra copago / cuota moderadora")
      servicios.medicamentos.push({
        codPrestador,
        numAutorizacion: null,
        idMIPRES: null,
        fechaDispensAdmon: toRipsDateTime(movement.createdAt),
        codDiagnosticoPrincipal: principal,
        codDiagnosticoPrincipalCIE11: null,
        nomCodDiagnosticoPrincipalCIE11: null,
        codDiagnosticoRelacionado: relacionados[0] ?? null,
        codDiagnosticoRelacionadoCIE11: null,
        nomCodDiagnosticoRelacionadoCIE11: null,
        tipoMedicamento: null,
        codTecnologiaSalud: code,
        nomTecnologiaSalud: movement.name,
        concentracionMedicamento: null,
        unidadMedida: null,
        formaFarmaceutica: null,
        unidadMinDispensa: null,
        cantidadMedicamento: movement.quantity,
        diasTratamiento: null,
        tipoDocumentoIdentificacion: profesionalTipoDoc,
        numDocumentoIdentificacion: profesionalNumDoc,
        vrUnitMedicamento: movement.unitValue,
        vrServicio: movement.totalValue,
        vrDispensacion: null,
        conceptoRecaudo: null,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        consecutivo: servicios.medicamentos.length + 1,
        codigoVIDA: null,
      })
    } else {
      const isSupply = movement.movementType === "supply"
      if (!code) addMissing("Otros servicios", "codTecnologiaSalud", "El cargo no tiene código")
      if (!isSupply) {
        addMissing("Otros servicios", "tipoOS", "Falta definir el tipo de otro servicio para estancias")
      }
      addMissing("Otros servicios", "conceptoRecaudo", "No se registra copago / cuota moderadora")
      servicios.otrosServicios.push({
        codPrestador,
        numAutorizacion: null,
        idMIPRES: null,
        fechaSuministroTecnologia: toRipsDateTime(movement.createdAt),
        // "01" = dispositivos médicos e insumos (tabla TipoOtrosServicios).
        tipoOS: isSupply ? "01" : null,
        codTecnologiaSalud: code,
        nomTecnologiaSalud: movement.name,
        cantidadOS: movement.quantity,
        tipoDocumentoIdentificacion: profesionalTipoDoc,
        numDocumentoIdentificacion: profesionalNumDoc,
        vrUnitOS: movement.unitValue,
        vrServicio: movement.totalValue,
        vrDispensacion: null,
        conceptoRecaudo: null,
        valorPagoModerador: 0,
        numFEVPagoModerador: null,
        consecutivo: servicios.otrosServicios.length + 1,
      })
    }
  }

  // La admisión por urgencias u hospitalización se reporta como un registro propio,
  // sin valor, con los datos de ingreso y egreso.
  const scope = admission.careScopeName?.toLowerCase() ?? ""
  const isUrgencias = scope.includes("urgencia")
  const isHospitalizacion = scope.includes("hospitaliz")

  if (isUrgencias || isHospitalizacion) {
    const groupLabel = isUrgencias ? "Urgencias" : "Hospitalización"
    addMissing(groupLabel, "causaMotivoAtencion", PENDING_CATALOG_CODE)
    addMissing(groupLabel, "condicionDestinoUsuarioEgreso", PENDING_CATALOG_CODE)
    if (!diagnosticoEgreso) {
      addMissing(groupLabel, "diagnóstico y fecha de egreso", "No hay egreso registrado")
    }

    const egreso: EgresoFields = {
      codPrestador,
      fechaInicioAtencion,
      causaMotivoAtencion: null,
      codDiagnosticoPrincipal: diagnosticosIngreso[0]?.codigo ?? principal,
      codDiagnosticoPrincipalCIE11: null,
      nomCodDiagnosticoPrincipalCIE11: null,
      codDiagnosticoPrincipalE: diagnosticoEgreso?.codigoDiagnosticoEgreso1 ?? null,
      codDiagnosticoPrincipalECIE11: null,
      nomCodDiagnosticoPrincipalECIE11: null,
      codDiagnosticoRelacionadoE1: diagnosticoEgreso?.codigoDiagnosticoEgreso2 ?? null,
      codDiagnosticoRelacionadoE1CIE11: null,
      nomCodDiagnosticoRelacionadoE1CIE11: null,
      codDiagnosticoRelacionadoE2: diagnosticoEgreso?.codigoDiagnosticoEgreso3 ?? null,
      codDiagnosticoRelacionadoE2CIE11: null,
      nomCodDiagnosticoRelacionadoE2CIE11: null,
      codDiagnosticoRelacionadoE3: null,
      codDiagnosticoRelacionadoE3CIE11: null,
      nomCodDiagnosticoRelacionadoE3CIE11: null,
      condicionDestinoUsuarioEgreso: null,
      codDiagnosticoCausaMuerte: null,
      codDiagnosticoCausaMuerteCIE11: null,
      nomCodDiagnosticoCausaMuerteCIE11: null,
      fechaEgreso,
      consecutivo: 1,
      codigoVIDA: null,
    }

    if (isUrgencias) {
      servicios.urgencias.push(egreso)
    } else {
      addMissing(groupLabel, "viaIngresoServicioSalud", PENDING_CATALOG_CODE)
      servicios.hospitalizacion.push({
        ...egreso,
        viaIngresoServicioSalud: null,
        numAutorizacion: null,
        codComplicacion: null,
        codComplicacionCIE11: null,
        nomCodComplicacionCIE11: null,
      })
    }
  }

  if (!principal && movements.length > 0) {
    addMissing("Servicios", "codDiagnosticoPrincipal", "No hay diagnósticos de ingreso ni de egreso")
  }

  addMissing("Usuario", "tipoUsuario", "Se define por paciente; hoy solo existe en el contrato")
  addMissing("Usuario", "codSexo", PENDING_CATALOG_CODE)
  addMissing("Usuario", "codPaisResidencia / codPaisOrigen", "El país no tiene código numérico ISO")
  addMissing("Usuario", "codMunicipioResidencia", "La respuesta del paciente no incluye el código DANE")
  addMissing("Usuario", "codZonaTerritorialResidencia", PENDING_CATALOG_CODE)
  addMissing("Usuario", "incapacidad", PENDING_CATALOG_CODE)

  const usuario: RipsUsuario = {
    tipoDocumentoIdentificacion: admission.documentTypeCode || null,
    numDocumentoIdentificacion: admission.documentoPatiente || patient?.documentNumber || null,
    tipoUsuario: null,
    fechaNacimiento: toRipsDate(patient?.birthDate),
    codSexo: null,
    codPaisResidencia: null,
    codMunicipioResidencia: null,
    codZonaTerritorialResidencia: null,
    incapacidad: null,
    consecutivo: 1,
    codPaisOrigen: null,
    registroSIRAS: null,
    servicios,
  }

  const totalServicios = [
    ...servicios.consultas,
    ...servicios.procedimientos,
    ...servicios.medicamentos,
    ...servicios.otrosServicios,
  ].reduce((sum, item) => sum + item.vrServicio, 0)

  return {
    rips: {
      numDocumentoIdObligado,
      numFactura: invoiceNum,
      tipoNota: null,
      numNota: null,
      usuarios: [usuario],
    },
    missing: Array.from(missingMap.values()),
    totalServicios,
  }
}
