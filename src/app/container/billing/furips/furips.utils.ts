import dayjs, { type Dayjs } from "dayjs"
import type { NamePath } from "antd/es/form/interface"
import type { FormInstance, FormRule } from "antd"
import type {
  FuripsAtencionMedica,
  FuripsDatosSistema,
  FuripsDiagnostico,
  FuripsMedico,
  FuripsPersona,
  FuripsRemision,
  FuripsRequest,
  FuripsResponse,
  FuripsTransporte,
  FuripsUbicacion,
} from "@/core/interfaces/care/furips"
import type { TCities, TStates } from "@/core/interfaces/user/users"

export type PersonaForm = FuripsPersona & { stateId?: number | null }
export type RemisionForm = Omit<FuripsRemision, "fechaRemision"> & { fechaRemision?: Dayjs | null }

export interface FuripsFormValues {
  fechaRadicacion?: Dayjs | null
  numeroRadicado?: string | null
  respuestaGlosa: boolean
  numeroRadicadoAnterior?: string | null
  numeroFactura?: string | null

  serviciosHabilitados?: boolean | null
  tipoAtencionInicial?: string | null
  cobroTopeAseguradora?: boolean | null

  condicionAccidentado?: string

  direccionEvento?: string
  fechaEvento?: Dayjs | null
  horaEvento?: Dayjs | null
  eventoStateId?: number | null
  eventoCityId?: number | null
  zonaEvento?: string | null
  descripcionEvento?: string

  estadoAseguramiento?: string
  marca?: string | null
  placa?: string | null
  tipoServicio?: string | null
  tipoVehiculo?: string | null
  codigoAseguradora?: string | null
  nombreAseguradora?: string | null
  numeroPoliza?: string | null
  siras?: string | null
  vigenciaDesde?: Dayjs | null
  vigenciaHasta?: Dayjs | null
  cobroExcedentePoliza: boolean

  propietario: PersonaForm
  conductor: PersonaForm
  remision: RemisionForm
  transporte: FuripsTransporte

  fechaIngreso?: Dayjs | null
  fechaEgreso?: Dayjs | null
  dxIngreso: (FuripsDiagnostico | null)[]
  dxEgreso: (FuripsDiagnostico | null)[]

  medico: FuripsMedico

  amparoGastosMedicos: boolean
  valorFacturadoGastosMedicos: number
  valorReclamadoGastosMedicos: number
  amparoTransporte: boolean
  valorFacturadoTransporte: number
  valorReclamadoTransporte: number
}

export const isFilled = (value: unknown) =>
  value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "")

const toDay = (value?: string | null) => (value ? dayjs(value) : null)
const toDateOnly = (value?: Dayjs | null) => (value ? value.format("YYYY-MM-DD") : null)
const clean = (value?: string | null) => (isFilled(value) ? value!.trim() : null)

const threeSlots = (list?: FuripsDiagnostico[]) => [0, 1, 2].map((i) => list?.[i] ?? null)

const stateOf = (cities: TCities[], cityId?: number | null) =>
  cities.find((c) => c.id === cityId)?.stateId ?? null

// Partículas que forman parte del nombre o apellido siguiente ("DE LA HOZ").
const PARTICULAS = new Set(["DE", "DEL", "LA", "LAS", "LOS", "SAN", "SANTA", "VAN", "VON", "Y"])

// Los usuarios guardan los dos nombres (o apellidos) juntos; se sugiere el corte y el
// formulario permite corregirlo. Igual que en el backend.
export const splitName = (text?: string | null): [string | null, string | null] => {
  const words = (text ?? "").trim().toUpperCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return [null, null]
  let cut = 0
  while (cut < words.length - 1 && PARTICULAS.has(words[cut])) cut++
  cut++
  const second = words.slice(cut).join(" ")
  return [words.slice(0, cut).join(" "), second || null]
}

// El FURIPS reporta el municipio con 3 dígitos DANE, sin el departamento (001, no 70001).
export const municipioCode = (city?: TCities | null) => {
  if (!city) return null
  if (city.furipsCode?.trim().length === 3) return city.furipsCode.trim()
  const code = city.code?.trim()
  return code?.length === 5 ? code.slice(2) : code ?? null
}

export const ubicacion = (
  cities: TCities[],
  states: TStates[],
  cityId?: number | null,
): FuripsUbicacion => {
  const city = cities.find((c) => c.id === cityId)
  if (!city) return {}
  return {
    municipio: city.name,
    codigoMunicipio: municipioCode(city),
    departamento: city.stateName,
    codigoDepartamento: states.find((s) => s.id === city.stateId)?.daneCode ?? null,
  }
}

// Valores iniciales: lo guardado si existe; si no, lo que el sistema ya sabe de la admisión.
export const toFormValues = (
  furips: FuripsResponse | null | undefined,
  datos: FuripsDatosSistema,
  cities: TCities[],
): FuripsFormValues => {
  if (furips) {
    const evento = dayjs(furips.fechaEvento)
    return {
      fechaRadicacion: toDay(furips.fechaRadicacion),
      numeroRadicado: furips.numeroRadicado,
      respuestaGlosa: furips.respuestaGlosa,
      numeroRadicadoAnterior: furips.numeroRadicadoAnterior,
      numeroFactura: furips.numeroFactura ?? datos.numeroFactura,
      serviciosHabilitados: furips.serviciosHabilitados,
      tipoAtencionInicial: furips.tipoAtencionInicial,
      cobroTopeAseguradora: furips.cobroTopeAseguradora,
      condicionAccidentado: furips.condicionAccidentado,
      direccionEvento: furips.direccionEvento,
      fechaEvento: evento,
      horaEvento: evento,
      eventoStateId: stateOf(cities, furips.eventoCityId),
      eventoCityId: furips.eventoCityId,
      zonaEvento: furips.zonaEvento,
      descripcionEvento: furips.descripcionEvento,
      estadoAseguramiento: furips.estadoAseguramiento,
      marca: furips.marca,
      placa: furips.placa,
      tipoServicio: furips.tipoServicio,
      tipoVehiculo: furips.tipoVehiculo,
      codigoAseguradora: furips.codigoAseguradora,
      nombreAseguradora: furips.nombreAseguradora,
      numeroPoliza: furips.numeroPoliza,
      siras: furips.siras,
      vigenciaDesde: toDay(furips.vigenciaDesde),
      vigenciaHasta: toDay(furips.vigenciaHasta),
      cobroExcedentePoliza: furips.cobroExcedentePoliza,
      propietario: {
        ...furips.propietario,
        stateId: stateOf(cities, furips.propietario?.cityId),
      },
      conductor: { ...furips.conductor, stateId: stateOf(cities, furips.conductor?.cityId) },
      remision: {
        ...remisionInicial(datos),
        ...furips.remision,
        fechaRemision: toDay(furips.remision?.fechaRemision),
      },
      transporte: { ...furips.transporte },
      fechaIngreso: toDay(furips.atencionMedica?.fechaIngreso),
      fechaEgreso: toDay(furips.atencionMedica?.fechaEgreso),
      dxIngreso: threeSlots(furips.atencionMedica?.diagnosticosIngreso),
      dxEgreso: threeSlots(furips.atencionMedica?.diagnosticosEgreso),
      medico: { ...furips.medico },
      amparoGastosMedicos: furips.amparoGastosMedicos,
      valorFacturadoGastosMedicos: furips.valorFacturadoGastosMedicos,
      valorReclamadoGastosMedicos: furips.valorReclamadoGastosMedicos,
      amparoTransporte: furips.amparoTransporte,
      valorFacturadoTransporte: furips.valorFacturadoTransporte,
      valorReclamadoTransporte: furips.valorReclamadoTransporte,
    }
  }

  const [medico] = datos.medicos
  return {
    respuestaGlosa: false,
    numeroFactura: datos.numeroFactura,
    cobroExcedentePoliza: false,
    propietario: {},
    conductor: {},
    remision: remisionInicial(datos),
    transporte: {},
    fechaIngreso: toDay(datos.atencionMedica.fechaIngreso),
    fechaEgreso: toDay(datos.atencionMedica.fechaEgreso),
    dxIngreso: threeSlots(datos.atencionMedica.diagnosticosIngreso),
    dxEgreso: threeSlots(datos.atencionMedica.diagnosticosEgreso),
    medico: medico
      ? {
          userId: medico.userId,
          primerApellido: medico.primerApellido,
          segundoApellido: medico.segundoApellido,
          primerNombre: medico.primerNombre,
          segundoNombre: medico.segundoNombre,
          tipoDocumento: medico.tipoDocumento,
          numeroDocumento: medico.numeroDocumento,
          registroMedico: medico.registroMedico,
        }
      : {},
    amparoGastosMedicos: true,
    valorFacturadoGastosMedicos: datos.valorFacturado,
    valorReclamadoGastosMedicos: datos.valorFacturado,
    amparoTransporte: false,
    valorFacturadoTransporte: 0,
    valorReclamadoTransporte: 0,
  }
}

// La IPS que recibe la remisión es esta institución.
const remisionInicial = (datos: FuripsDatosSistema): RemisionForm => ({
  ipsRecibeNombre: datos.ips.razonSocial,
  ipsRecibeTelefono: datos.ips.telefono,
  ipsRecibeCiudad: datos.ips.municipio,
  ipsRecibeDireccion: datos.ips.direccion,
})

const persona = ({ stateId: _stateId, ...p }: PersonaForm): FuripsPersona => p

// `base` conserva lo que la vista no muestra (en Admisiones, el encabezado y los amparos).
export const toRequest = (
  values: FuripsFormValues,
  base: FuripsResponse | null | undefined,
  admissionId: number,
): FuripsRequest => {
  const merged = { ...toFormValuesFromBase(base), ...values }
  const fecha = merged.fechaEvento!
  const hora = merged.horaEvento ?? fecha
  const fechaEvento = fecha.hour(hora.hour()).minute(hora.minute()).second(0).millisecond(0)
  const diagnosticos = (list: (FuripsDiagnostico | null)[]) =>
    list.filter((d): d is FuripsDiagnostico => !!d?.codigo)

  return {
    admissionId,
    fechaRadicacion: toDateOnly(merged.fechaRadicacion),
    numeroRadicado: clean(merged.numeroRadicado),
    respuestaGlosa: !!merged.respuestaGlosa,
    numeroRadicadoAnterior: clean(merged.numeroRadicadoAnterior),
    numeroFactura: clean(merged.numeroFactura),
    serviciosHabilitados: merged.serviciosHabilitados ?? null,
    tipoAtencionInicial: merged.tipoAtencionInicial ?? null,
    cobroTopeAseguradora: merged.cobroTopeAseguradora ?? null,
    condicionAccidentado: merged.condicionAccidentado!,
    direccionEvento: merged.direccionEvento!,
    fechaEvento: fechaEvento.toISOString(),
    eventoCityId: merged.eventoCityId!,
    zonaEvento: merged.zonaEvento ?? null,
    descripcionEvento: merged.descripcionEvento!,
    estadoAseguramiento: merged.estadoAseguramiento!,
    marca: clean(merged.marca),
    placa: clean(merged.placa),
    tipoServicio: merged.tipoServicio ?? null,
    tipoVehiculo: merged.tipoVehiculo ?? null,
    codigoAseguradora: clean(merged.codigoAseguradora),
    nombreAseguradora: clean(merged.nombreAseguradora),
    numeroPoliza: clean(merged.numeroPoliza),
    siras: clean(merged.siras),
    vigenciaDesde: toDateOnly(merged.vigenciaDesde),
    vigenciaHasta: toDateOnly(merged.vigenciaHasta),
    cobroExcedentePoliza: !!merged.cobroExcedentePoliza,
    propietario: persona(merged.propietario ?? {}),
    conductor: persona(merged.conductor ?? {}),
    remision: { ...merged.remision, fechaRemision: toDateOnly(merged.remision?.fechaRemision) },
    transporte: merged.transporte,
    atencionMedica: {
      fechaIngreso: merged.fechaIngreso?.toISOString() ?? null,
      fechaEgreso: merged.fechaEgreso?.toISOString() ?? null,
      diagnosticosIngreso: diagnosticos(merged.dxIngreso ?? []),
      diagnosticosEgreso: diagnosticos(merged.dxEgreso ?? []),
    },
    medico: merged.medico,
    amparoGastosMedicos: !!merged.amparoGastosMedicos,
    valorFacturadoGastosMedicos: Number(merged.valorFacturadoGastosMedicos ?? 0),
    valorReclamadoGastosMedicos: Number(merged.valorReclamadoGastosMedicos ?? 0),
    amparoTransporte: !!merged.amparoTransporte,
    valorFacturadoTransporte: Number(merged.valorFacturadoTransporte ?? 0),
    valorReclamadoTransporte: Number(merged.valorReclamadoTransporte ?? 0),
  }
}

// Solo los campos que una vista puede ocultar (encabezado y amparos).
const toFormValuesFromBase = (base: FuripsResponse | null | undefined): Partial<FuripsFormValues> =>
  base
    ? {
        fechaRadicacion: toDay(base.fechaRadicacion),
        numeroRadicado: base.numeroRadicado,
        respuestaGlosa: base.respuestaGlosa,
        numeroRadicadoAnterior: base.numeroRadicadoAnterior,
        numeroFactura: base.numeroFactura,
        amparoGastosMedicos: base.amparoGastosMedicos,
        valorFacturadoGastosMedicos: base.valorFacturadoGastosMedicos,
        valorReclamadoGastosMedicos: base.valorReclamadoGastosMedicos,
        amparoTransporte: base.amparoTransporte,
        valorFacturadoTransporte: base.valorFacturadoTransporte,
        valorReclamadoTransporte: base.valorReclamadoTransporte,
      }
    : {}

// Atención médica (sección IX) dato por dato: lo de `primary` y, lo que falte, de `fallback`.
export const mergeAtencion = (
  primary: FuripsAtencionMedica | null | undefined,
  fallback: FuripsAtencionMedica | null | undefined,
): FuripsAtencionMedica => ({
  fechaIngreso: primary?.fechaIngreso || fallback?.fechaIngreso || null,
  fechaEgreso: primary?.fechaEgreso || fallback?.fechaEgreso || null,
  diagnosticosIngreso: primary?.diagnosticosIngreso?.length
    ? primary.diagnosticosIngreso
    : fallback?.diagnosticosIngreso ?? [],
  diagnosticosEgreso: primary?.diagnosticosEgreso?.length
    ? primary.diagnosticosEgreso
    : fallback?.diagnosticosEgreso ?? [],
})

/* ─────────────── Reglas de grupo ─────────────── */

// "Si se llena uno, se llenan todos": el campo es obligatorio cuando alguno de los
// campos que activan el grupo tiene valor (o cuando `force` lo exige).
export const groupRequired = (
  triggers: NamePath[],
  message: string,
  force?: (form: FormInstance) => boolean,
): FormRule => (form) => ({
  validator(_, value) {
    const active =
      triggers.some((name) => isFilled(form.getFieldValue(name))) || !!force?.(form as FormInstance)
    return active && !isFilled(value) ? Promise.reject(new Error(message)) : Promise.resolve()
  },
})

export const PERSONA_CAMPOS = [
  "primerApellido",
  "segundoApellido",
  "primerNombre",
  "segundoNombre",
  "tipoDocumento",
  "numeroDocumento",
  "direccion",
  "telefono",
  "stateId",
  "cityId",
] as const

export const TRANSPORTE_CAMPOS = [
  "placa",
  "primerApellido",
  "segundoApellido",
  "primerNombre",
  "segundoNombre",
  "tipoDocumento",
  "numeroDocumento",
  "transportoDesde",
  "zona",
] as const

// Solo los datos de la IPS que remite dicen que el paciente llegó remitido; la IPS que
// recibe viene precargada con esta institución.
export const REMISION_ACTIVADORES = [
  "ipsRemiteNombre",
  "ipsRemiteNit",
  "fechaRemision",
  "ipsRemiteTelefono",
  "ipsRemiteCiudad",
  "ipsRemiteDireccion",
  "personaRemite",
] as const

export const PLACA_PATTERN = /^[A-Za-z0-9]{5,7}$/
