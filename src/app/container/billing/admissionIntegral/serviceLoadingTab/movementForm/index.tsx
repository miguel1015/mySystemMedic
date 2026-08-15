"use client"

import RHFAntdInput from "@/components/input"
import RHFAntdInputNumber from "@/components/inputNumber"
import RHFAntdSelect from "@/components/select"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { BILLING_SERVICE_CATEGORIES, BillingMovementResponse } from "@/core/interfaces/care/billing"
import { SaveOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useWatch } from "react-hook-form"
import { formatCurrency } from "../../utils"
import { MovementDraft, useMovementForm } from "./useMovementForm"

interface MovementFormProps {
  admissionId: number
  admission: AdmissionResponse | undefined
  draft: MovementDraft | null
  title: string
  onClose: () => void
  onSaved: (movement?: BillingMovementResponse) => void
}

const serviceCategoryOptions = BILLING_SERVICE_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}))

const MovementForm = ({
  admissionId,
  admission,
  draft,
  title,
  onClose,
  onSaved,
}: MovementFormProps) => {
  const { control, handleSubmit, onSubmit, isSubmitting } = useMovementForm({
    admissionId,
    admission,
    draft,
    onDone: onSaved,
  })

  const quantity = useWatch({ control, name: "quantity" })
  const unitValue = useWatch({ control, name: "unitValue" })
  const total = (Number(quantity) || 0) * (Number(unitValue) || 0)

  if (!draft) return null

  return (
    <div>
      <h5 style={{ marginBottom: 16, fontWeight: 700 }}>{title}</h5>

      <form onSubmit={handleSubmit(onSubmit)}>
        <RHFAntdInput name="name" control={control} label="Nombre del servicio / elemento" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <RHFAntdInputNumber
            name="quantity"
            control={control}
            min={1}
            precision={0}
            label="Cantidad"
          />
          <RHFAntdInputNumber
            name="unitValue"
            control={control}
            min={0}
            precision={2}
            label="Valor unitario"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Convenio</label>
          <div>{admission?.convenioNombre || "Sin convenio"}</div>
        </div>

        {draft.movementType === "service" && (
          <RHFAntdSelect
            name="serviceCategory"
            control={control}
            label="Tipo de servicio"
            placeholder="Seleccione el tipo de servicio"
            options={serviceCategoryOptions}
          />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderRadius: 8,
            background: "rgba(15, 111, 92, 0.06)",
            marginBottom: 16,
          }}
        >
          <span style={{ fontWeight: 600 }}>Valor total</span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{formatCurrency(total)}</span>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Guardar movimiento
          </Button>
        </div>
      </form>
    </div>
  )
}

export default MovementForm
