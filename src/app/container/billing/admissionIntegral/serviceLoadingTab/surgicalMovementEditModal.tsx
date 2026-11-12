"use client"

import tableStyles from "@/components/dataTable/dataTable.module.scss"
import Modal from "@/components/modal"
import { useUpdateBillingMovement } from "@/core/hooks/care/billing/useUpdateBillingMovement"
import { useTariffDetails } from "@/core/hooks/parameterization/tariffDetails/useGetAllTariffDetails"
import {
  BillingMovementResponse,
  SurgicalConceptDetail,
  isCodeCompatibleWithConcept,
  parseConceptDetails,
  serializeConceptDetails,
} from "@/core/interfaces/care/billing"
import { TTariffDetail } from "@/core/interfaces/parameterization/types"
import { DeleteOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, InputNumber, Popconfirm, Select, Table, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { roundToNearestHundred } from "../../surgicalCharge/utils"
import { formatCurrency } from "../utils"

interface SurgicalMovementEditModalProps {
  open: boolean
  admissionId: number
  movement: BillingMovementResponse | null
  onClose: () => void
  onSaved: () => void
}

// Movimientos guardados antes de registrar el porcentaje se asumen liquidados al 100%.
const DEFAULT_PERCENTAGE = 100

interface EditableConcept extends SurgicalConceptDetail {
  // Código y nombre con que llegó el concepto, para mostrar el cambio antes de guardar.
  originalCode: number
  originalLabel: string
}

const conceptName = (concept: { label: string; qxGroup: string | null }) =>
  concept.qxGroup ? `${concept.label} - ${concept.qxGroup}` : concept.label

const SurgicalMovementEditModal = ({
  open,
  admissionId,
  movement,
  onClose,
  onSaved,
}: SurgicalMovementEditModalProps) => {
  const [concepts, setConcepts] = useState<EditableConcept[]>([])
  const updateMovement = useUpdateBillingMovement()
  const { data: tariffDetails = [], isLoading: loadingTariffDetails } = useTariffDetails()

  useEffect(() => {
    if (movement) {
      setConcepts(
        parseConceptDetails(movement.conceptDetails).map((c) => ({
          ...c,
          originalCode: c.code,
          originalLabel: conceptName(c),
        })),
      )
    }
  }, [movement])

  // Tarifario con el que se cargó la cirugía: el del detalle de tarifa del procedimiento.
  const tariffId = useMemo(
    () => tariffDetails.find((d) => d.id === movement?.itemId)?.tariffId ?? null,
    [tariffDetails, movement?.itemId],
  )

  const catalog = useMemo(
    () => (tariffId ? tariffDetails.filter((d) => d.tariffId === tariffId) : tariffDetails),
    [tariffDetails, tariffId],
  )

  if (!movement) return null

  const total = concepts.reduce((sum, c) => sum + c.unitValue, 0)
  const changedConcepts = concepts.filter((c) => c.code !== c.originalCode)

  const optionsFor = (conceptType: string) =>
    catalog
      .filter((d) => isCodeCompatibleWithConcept(conceptType, d.referenceCode))
      .sort((a, b) => a.referenceCode - b.referenceCode)
      .map((d) => ({
        value: d.id,
        label: `${d.referenceCode} - ${d.description} (${formatCurrency(d.value)})`,
      }))

  const handleValueChange = (index: number, value: number | null) => {
    setConcepts((prev) => prev.map((c, i) => (i === index ? { ...c, unitValue: value ?? 0 } : c)))
  }

  // Al cambiar el código se toma la tarifa base del nuevo código y se le aplica el mismo
  // porcentaje con el que se liquidó el concepto, aproximando a la centena como en el cargue.
  const handleCodeChange = (index: number, detail: TTariffDetail) => {
    setConcepts((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c
        const percentage = c.percentageApplied ?? DEFAULT_PERCENTAGE
        // En el tarifario, `value` ya es el precio final del código (factors es la
        // cantidad de UVB con la que se calculó, no un multiplicador).
        const baseValue = roundToNearestHundred(detail.value)
        return {
          ...c,
          itemId: detail.id,
          code: detail.referenceCode,
          label: detail.description,
          qxGroup: detail.surgicalGroupQxGroup ?? null,
          percentageApplied: percentage,
          unitValue: roundToNearestHundred((baseValue * percentage) / 100),
        }
      }),
    )
  }

  const handleRemove = (index: number) => {
    setConcepts((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = (): boolean => {
    if (concepts.length === 0) {
      toast.error("Debe quedar al menos un concepto. Para retirar toda la cirugía, elimine la fila.")
      return false
    }

    const invalid = changedConcepts.find(
      (c) =>
        !isCodeCompatibleWithConcept(c.conceptType, c.code) ||
        !catalog.some((d) => d.referenceCode === c.code),
    )
    if (invalid) {
      toast.error(`El código ${invalid.code} no existe en el tarifario o no corresponde al concepto.`)
      return false
    }

    return true
  }

  const handleSave = () => {
    if (!validate()) return

    const details: SurgicalConceptDetail[] = concepts.map((c) => ({
      itemId: c.itemId,
      conceptType: c.conceptType,
      code: c.code,
      label: c.label,
      qxGroup: c.qxGroup,
      unitValue: c.unitValue,
      percentageApplied: c.percentageApplied,
    }))

    updateMovement.mutate(
      {
        id: movement.id,
        admissionId,
        data: {
          movementType: movement.movementType,
          itemId: movement.itemId,
          itemCode: movement.itemCode,
          name: movement.name,
          quantity: movement.quantity,
          unitValue: total,
          contractId: movement.contractId,
          serviceCategory: movement.serviceCategory,
          conceptType: movement.conceptType,
          conceptDetails: serializeConceptDetails(details),
          tipoItem: movement.tipoItem,
          notes: movement.notes,
        },
      },
      {
        onSuccess: () => {
          toast.success("Cirugía actualizada correctamente.")
          onSaved()
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo actualizar la cirugía.")
        },
      },
    )
  }

  const columns: ColumnsType<EditableConcept> = [
    {
      title: "Código",
      key: "code",
      width: 320,
      render: (_, record, index) => {
        const options = optionsFor(record.conceptType)
        const current = catalog.find((d) => d.referenceCode === record.code)
        return (
          <Select
            value={current?.id}
            placeholder={`${record.code} - ${conceptName(record)}`}
            options={options}
            loading={loadingTariffDetails}
            showSearch
            optionFilterProp="label"
            // El modal anima con transform y desubica la lista si se monta dentro de él; y como
            // el modal usa z-index 1055 y el desplegable de antd 1050, se sube a 1060 para
            // que no quede detrás.
            getPopupContainer={() => document.body}
            styles={{ popup: { root: { zIndex: 1060 } } }}
            popupMatchSelectWidth={420}
            notFoundContent="No hay códigos compatibles en el tarifario"
            style={{ width: "100%" }}
            onChange={(id: number) => {
              const detail = catalog.find((d) => d.id === id)
              if (detail) handleCodeChange(index, detail)
            }}
          />
        )
      },
    },
    {
      title: "Nombre",
      dataIndex: "label",
      render: (_, record) => (
        <div>
          <div>{record.label}</div>
          {record.qxGroup && (
            <div style={{ fontSize: 12, color: "var(--dash-text-tertiary, #9ca3af)" }}>
              {record.qxGroup}
            </div>
          )}
          {record.code !== record.originalCode && (
            <div style={{ fontSize: 12, color: "var(--theme-primary, #0F6F5C)" }}>
              Antes: {record.originalCode} - {record.originalLabel}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "%",
      dataIndex: "percentageApplied",
      width: 70,
      render: (value?: number) => (value != null ? `${value}%` : "—"),
    },
    {
      title: "Valor",
      dataIndex: "unitValue",
      width: 180,
      render: (value: number, _record, index) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          style={{ width: "100%" }}
          onChange={(v) => handleValueChange(index, v)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, _record, index) => (
        <Tooltip title="Quitar concepto">
          <Button danger icon={<DeleteOutlined />} onClick={() => handleRemove(index)} />
        </Tooltip>
      ),
    },
  ]

  const confirmDescription = (
    <div style={{ maxWidth: 360 }}>
      {changedConcepts.length > 0 ? (
        <>
          <div style={{ marginBottom: 6 }}>Se cambiarán estos códigos:</div>
          {changedConcepts.map((c, i) => (
            <div key={i}>
              {c.originalCode} → {c.code} ({formatCurrency(c.unitValue)})
            </div>
          ))}
        </>
      ) : (
        <div>Se guardarán los cambios de valores de la cirugía.</div>
      )}
      <div style={{ marginTop: 6, fontWeight: 600 }}>Nuevo total: {formatCurrency(total)}</div>
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title="Editar cirugía" size="xl">
      <div style={{ marginBottom: 16, fontWeight: 700 }}>{movement.name}</div>

      <Table<EditableConcept>
        className={tableStyles.table}
        rowKey={(_, index) => String(index)}
        size="small"
        columns={columns}
        dataSource={concepts}
        pagination={false}
        scroll={{ x: 900 }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: 8,
          background: "rgba(15, 111, 92, 0.06)",
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 600 }}>Valor total</span>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{formatCurrency(total)}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button onClick={onClose} disabled={updateMovement.isPending}>
          Cancelar
        </Button>
        <Popconfirm
          title="¿Guardar los cambios de la cirugía?"
          description={confirmDescription}
          okText="Confirmar"
          cancelText="Cancelar"
          onConfirm={handleSave}
          disabled={updateMovement.isPending}
        >
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={updateMovement.isPending}
            disabled={updateMovement.isPending}
          >
            Guardar
          </Button>
        </Popconfirm>
      </div>
    </Modal>
  )
}

export default SurgicalMovementEditModal
