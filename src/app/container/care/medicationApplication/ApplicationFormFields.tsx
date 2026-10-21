"use client"

import type { OrdenActiva } from "@/core/interfaces/care/aplicacionOrden"
import { AMBITOS_ORDEN, type AmbitoOrden } from "@/core/interfaces/care/ordenMedica"
import { Input, InputNumber, Select, TimePicker } from "antd"
import dayjs from "dayjs"
import {
  MAX_DOSIS,
  formatQty,
  isMedicine,
  maxUnidades,
  todayInput,
  type AplicacionFormValues,
} from "./medicationApplication.utils"

const { TextArea } = Input

type Option<T> = { value: T; label: string }

interface Props {
  orden: OrdenActiva
  values: AplicacionFormValues
  onChange: (patch: Partial<AplicacionFormValues>) => void
  // Lo que la aplicación puede consumir de la orden.
  disponible: number
  showErrors: boolean
  viaOptions: Option<string>[]
  loadingVias?: boolean
  profesionalOptions: Option<number>[]
  loadingProfesionales?: boolean
}

const ApplicationFormFields = ({
  orden,
  values,
  onChange,
  disponible,
  showErrors,
  viaOptions,
  loadingVias,
  profesionalOptions,
  loadingProfesionales,
}: Props) => {
  const { fecha, hora, cantidad, unidades, viaCodigo, ambito, profesionalId, observaciones } = values
  const medicine = isMedicine(orden)
  const maxUnd = maxUnidades(disponible)

  return (
    <div className="ma-form-grid">
      <label className="ma-field">
        <span>
          Fecha de aplicación <span className="ma-required">*</span>
        </span>
        <Input
          type="date"
          value={fecha}
          max={todayInput()}
          status={showErrors && !fecha ? "error" : undefined}
          onChange={(e) => onChange({ fecha: e.target.value })}
        />
      </label>
      <label className="ma-field">
        <span>
          Hora de aplicación <span className="ma-required">*</span>
        </span>
        <TimePicker
          format="HH:mm"
          needConfirm={false}
          allowClear={false}
          value={hora ? dayjs(`2000-01-01T${hora}`) : null}
          status={showErrors && !hora ? "error" : undefined}
          onChange={(value) => onChange({ hora: value ? value.format("HH:mm") : "" })}
          style={{ width: "100%" }}
        />
      </label>
      <label className="ma-field">
        <span>
          Cantidad administrada <span className="ma-required">*</span>
        </span>
        <InputNumber
          min={0.01}
          max={medicine ? MAX_DOSIS : disponible}
          precision={2}
          value={cantidad}
          placeholder={medicine ? "Dosis, p. ej. 500" : undefined}
          status={
            showErrors && (cantidad === null || cantidad <= 0 || (!medicine && cantidad > disponible))
              ? "error"
              : undefined
          }
          onChange={(value) => onChange({ cantidad: typeof value === "number" ? value : null })}
          style={{ width: "100%" }}
        />
        {!medicine && <small className="ma-muted">Máximo pendiente: {formatQty(disponible)}</small>}
      </label>
      <label className="ma-field">
        <span>Unidad de medida</span>
        <Input value={orden.unidadMedida || (medicine ? "—" : "Unidad")} disabled />
      </label>
      {medicine && (
        <label className="ma-field">
          <span>
            Unidades consumidas <span className="ma-required">*</span>
          </span>
          <InputNumber
            min={1}
            max={maxUnd}
            precision={0}
            value={unidades}
            status={showErrors && (unidades === null || unidades <= 0 || unidades > maxUnd) ? "error" : undefined}
            onChange={(value) => onChange({ unidades: typeof value === "number" ? value : null })}
            style={{ width: "100%" }}
          />
        </label>
      )}
      {medicine && (
        <label className="ma-field">
          <span>
            Vía de administración <span className="ma-required">*</span>
          </span>
          <Select
            showSearch
            optionFilterProp="label"
            value={viaCodigo}
            options={viaOptions}
            loading={loadingVias}
            placeholder="Seleccione la vía"
            status={showErrors && !viaCodigo ? "error" : undefined}
            onChange={(value) => onChange({ viaCodigo: value })}
            style={{ width: "100%" }}
          />
        </label>
      )}
      <label className="ma-field">
        <span>
          Ámbito <span className="ma-required">*</span>
        </span>
        <Select
          value={ambito}
          options={AMBITOS_ORDEN.map((value) => ({ value, label: value }))}
          status={showErrors && !ambito ? "error" : undefined}
          onChange={(value: AmbitoOrden) => onChange({ ambito: value })}
          style={{ width: "100%" }}
        />
        {ambito && ambito !== orden.ambito && (
          <small className="ma-muted">Distinto al de la orden ({orden.ambito}).</small>
        )}
      </label>
      <label className="ma-field ma-field--wide">
        <span>
          Profesional que {medicine ? "aplica" : "realiza"} <span className="ma-required">*</span>
        </span>
        <Select
          showSearch
          optionFilterProp="label"
          value={profesionalId}
          options={profesionalOptions}
          loading={loadingProfesionales}
          placeholder="Seleccione el profesional"
          status={showErrors && !profesionalId ? "error" : undefined}
          onChange={(value) => onChange({ profesionalId: value })}
          style={{ width: "100%" }}
        />
      </label>
      <label className="ma-field ma-field--full">
        <span>{medicine ? "Evento de la aplicación" : "Observaciones de la realización"}</span>
        <TextArea
          rows={3}
          maxLength={2000}
          showCount
          value={observaciones}
          placeholder={
            medicine
              ? "Respuesta del paciente, reacciones adversas, eventos presentados u observaciones..."
              : "Observaciones relevantes de la realización del estudio o procedimiento..."
          }
          onChange={(e) => onChange({ observaciones: e.target.value })}
        />
      </label>
    </div>
  )
}

export default ApplicationFormFields
