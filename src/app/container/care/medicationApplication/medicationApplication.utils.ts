import type { AplicacionOrden, OrdenActiva } from "@/core/interfaces/care/aplicacionOrden"
import type { AmbitoOrden } from "@/core/interfaces/care/ordenMedica"

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000
export const MAX_DOSIS = 1000000

export interface AplicacionFormValues {
  fecha: string
  hora: string
  cantidad: number | null
  unidades: number | null
  viaCodigo?: string
  ambito?: AmbitoOrden
  profesionalId?: number
  observaciones: string
}

const pad = (n: number) => n.toString().padStart(2, "0")
export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
export const todayInput = () => toDateInput(new Date())
export const nowTimeInput = () => toTimeInput(new Date())

// dd/mm/aaaa HH:mm (hora militar).
export const formatDateTime = (value?: string | null) => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${toTimeInput(d)}`
}

export const formatQty = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "")

export const isMedicine = (orden: Pick<OrdenActiva, "tipoOrden">) => orden.tipoOrden === "Medicamento"

// En medicamentos la cantidad de la orden son unidades (ampollas, viales...): lo
// que descuenta son las unidades consumidas. Una orden fraccionaria admite
// completar la última unidad.
export const maxUnidades = (disponible: number) => Math.ceil(disponible)

// Lo que una aplicación descontó de la orden: unidades en medicamentos, cantidad
// realizada en estudios y procedimientos.
export const consumoDe = (a: AplicacionOrden) => (isMedicine(a) ? a.unidadesConsumidas : a.cantidad)

export const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

// "disponible" es lo que la aplicación puede consumir de la orden: lo pendiente
// al registrar, o lo pendiente más lo que ya consumía al editar.
export const validateAplicacion = (orden: OrdenActiva, values: AplicacionFormValues, disponible: number) => {
  const { fecha, hora, cantidad, unidades, viaCodigo, ambito, profesionalId } = values
  const errors: string[] = []
  const aplicacion = new Date(`${fecha}T${hora}`)

  if (!fecha || !hora) {
    errors.push("Indique la fecha y la hora de aplicación.")
  } else if (Number.isNaN(aplicacion.getTime())) {
    errors.push("La fecha u hora de aplicación no es válida.")
  } else {
    if (aplicacion.getTime() > Date.now() + FUTURE_TOLERANCE_MS)
      errors.push("La fecha y hora de aplicación no puede ser futura.")
    if (aplicacion.getTime() < new Date(orden.fechaOrden).getTime() - 60 * 1000)
      errors.push("La aplicación no puede ser anterior a la fecha de la orden.")
  }

  if (cantidad === null || !Number.isFinite(cantidad) || cantidad <= 0)
    errors.push("La cantidad administrada debe ser mayor a cero.")
  else if (!isMedicine(orden) && cantidad > disponible)
    errors.push(
      `La cantidad administrada (${formatQty(cantidad)}) supera la cantidad pendiente (${formatQty(disponible)}).`,
    )

  if (isMedicine(orden)) {
    if (unidades === null || !Number.isInteger(unidades) || unidades <= 0)
      errors.push("Las unidades consumidas deben ser un número entero mayor a cero.")
    else if (unidades > maxUnidades(disponible))
      errors.push(
        `Las unidades consumidas (${unidades}) superan la cantidad pendiente (${formatQty(disponible)}).`,
      )
  }

  if (isMedicine(orden) && !viaCodigo) errors.push("Seleccione la vía de administración.")
  if (!ambito) errors.push("Seleccione el ámbito de la aplicación.")
  if (!profesionalId) errors.push("Seleccione el profesional que aplica.")

  return errors
}

export const toRequest = (orden: OrdenActiva, values: AplicacionFormValues) => ({
  fechaHoraAplicacion: new Date(`${values.fecha}T${values.hora}`).toISOString(),
  cantidad: values.cantidad!,
  unidadesConsumidas: isMedicine(orden) ? values.unidades : null,
  viaAdministracionCodigo: isMedicine(orden) ? values.viaCodigo : null,
  ambito: values.ambito!,
  profesionalId: values.profesionalId!,
  observaciones: values.observaciones.trim(),
})
