"use client"

import { useActualizarAplicacion } from "@/core/hooks/care/aplicacionesOrdenes/useAplicacionesOrdenes"
import type { AplicacionOrden, OrdenActiva } from "@/core/interfaces/care/aplicacionOrden"
import { Alert, Modal, message } from "antd"
import { useEffect, useState } from "react"
import ApplicationFormFields from "./ApplicationFormFields"
import {
  consumoDe,
  errorMessage,
  isMedicine,
  toDateInput,
  toRequest,
  toTimeInput,
  validateAplicacion,
  type AplicacionFormValues,
} from "./medicationApplication.utils"

type Option<T> = { value: T; label: string }

interface Props {
  orden: OrdenActiva
  // Aplicación en edición; null cierra el modal.
  aplicacion: AplicacionOrden | null
  onClose: () => void
  viaOptions: Option<string>[]
  loadingVias?: boolean
  profesionalOptions: Option<number>[]
  loadingProfesionales?: boolean
}

const valuesFrom = (a: AplicacionOrden): AplicacionFormValues => {
  const fecha = new Date(a.fechaHoraAplicacion)
  return {
    fecha: toDateInput(fecha),
    hora: toTimeInput(fecha),
    cantidad: a.cantidad,
    unidades: a.unidadesConsumidas,
    viaCodigo: a.viaAdministracionCodigo ?? undefined,
    ambito: a.ambito,
    profesionalId: a.profesionalId,
    observaciones: a.observaciones ?? "",
  }
}

const EditApplicationModal = ({ orden, aplicacion, onClose, ...options }: Props) => {
  const [messageApi, contextHolder] = message.useMessage()
  const actualizar = useActualizarAplicacion()
  const [values, setValues] = useState<AplicacionFormValues | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    setValues(aplicacion ? valuesFrom(aplicacion) : null)
    setValidationErrors([])
  }, [aplicacion])

  // Lo que ya consumía esta aplicación vuelve a estar disponible para ella.
  const disponible = aplicacion ? orden.cantidadPendiente + consumoDe(aplicacion) : 0
  const label = isMedicine(orden) ? "aplicación" : "realización"

  const handleSave = async () => {
    if (!aplicacion || !values) return
    const errors = validateAplicacion(orden, values, disponible)
    setValidationErrors(errors)
    if (errors.length > 0) return

    try {
      await actualizar.mutateAsync({ id: aplicacion.id, data: toRequest(orden, values) })
      messageApi.success(`${isMedicine(orden) ? "Aplicación" : "Realización"} actualizada.`)
      onClose()
    } catch (err) {
      messageApi.error(errorMessage(err, `No se pudo actualizar la ${label}.`))
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={aplicacion !== null}
        title={`Editar ${label} · ${orden.descripcion}`}
        okText="Guardar cambios"
        cancelText="Cancelar"
        width={760}
        confirmLoading={actualizar.isPending}
        onOk={handleSave}
        onCancel={onClose}
        destroyOnHidden
      >
        {validationErrors.length > 0 && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title="No se puede guardar"
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            }
          />
        )}
        {values && (
          <ApplicationFormFields
            orden={orden}
            values={values}
            onChange={(patch) => setValues((prev) => (prev ? { ...prev, ...patch } : prev))}
            disponible={disponible}
            showErrors={validationErrors.length > 0}
            {...options}
          />
        )}
      </Modal>
    </>
  )
}

export default EditApplicationModal
