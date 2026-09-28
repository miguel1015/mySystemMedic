"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Alert, Button, Card, InputNumber, Select as AntdSelect, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  useUpdateElectronicInvoiceGeneral,
  useUpdateElectronicInvoiceNumbering,
} from "@/core/hooks/parameterization/electronicInvoicing/useElectronicInvoicingMutations"
import {
  TElectronicInvoiceLocalSettings,
  TElectronicInvoiceNumbering,
  TElectronicInvoiceResolution,
} from "@/core/interfaces/parameterization/electronicInvoicing"
import { PAYMENT_MEANS_DESCRIPTIONS, PAYMENT_MEANS_OPTIONS, withCurrentOption } from "../catalogs"

interface GeneralTabProps {
  local: TElectronicInvoiceLocalSettings
  resolutions: TElectronicInvoiceResolution[]
}

export default function GeneralTab({ local, resolutions }: GeneralTabProps) {
  const updateGeneral = useUpdateElectronicInvoiceGeneral()
  const updateNumbering = useUpdateElectronicInvoiceNumbering()

  const [paymentMeansCode, setPaymentMeansCode] = useState(local.paymentMeansCode)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nextNumber, setNextNumber] = useState<number | null>(null)

  useEffect(() => setPaymentMeansCode(local.paymentMeansCode), [local.paymentMeansCode])

  const activeResolution = resolutions.find((r) => r.isActive)

  const savePaymentMeans = () => {
    updateGeneral.mutate(
      {
        paymentMeansCode,
        paymentMeansDescription:
          PAYMENT_MEANS_DESCRIPTIONS[paymentMeansCode] ??
          (paymentMeansCode === local.paymentMeansCode ? local.paymentMeansDescription : paymentMeansCode),
      },
      {
        onSuccess: () => toast.success("Forma de pago actualizada"),
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  const saveNumbering = (id: number) => {
    if (!nextNumber) return
    updateNumbering.mutate(
      { id, nextNumber },
      {
        onSuccess: () => {
          toast.success("Consecutivo actualizado")
          setEditingId(null)
        },
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  const columns: ColumnsType<TElectronicInvoiceNumbering> = [
    {
      title: "Prefijo",
      dataIndex: "prefix",
      render: (value: string) => (
        <Space size={4}>
          <strong>{value}</strong>
          {value === local.activePrefix && <Tag color="green">Activo</Tag>}
        </Space>
      ),
    },
    {
      title: "Próximo número",
      dataIndex: "nextNumber",
      render: (value: number, row) =>
        editingId === row.id ? (
          <InputNumber
            min={1}
            precision={0}
            value={nextNumber}
            onChange={(v) => setNextNumber(v)}
            style={{ width: 180 }}
          />
        ) : (
          `${row.prefix}${value}`
        ),
    },
    {
      title: "Último en Facturación Electrónica",
      render: (_, row) =>
        resolutions.find((r) => r.prefix === row.prefix && r.lastNumUsed)?.lastNumUsed ?? "-",
    },
    {
      title: "Acciones",
      width: 200,
      render: (_, row) =>
        editingId === row.id ? (
          <Space>
            <Button size="small" type="primary" loading={updateNumbering.isPending} onClick={() => saveNumbering(row.id)}>
              Guardar
            </Button>
            <Button size="small" onClick={() => setEditingId(null)} disabled={updateNumbering.isPending}>
              Cancelar
            </Button>
          </Space>
        ) : (
          <Button
            size="small"
            onClick={() => {
              setEditingId(row.id)
              setNextNumber(row.nextNumber)
            }}
          >
            Corregir
          </Button>
        ),
    },
  ]

  return (
    <div className="d-flex flex-column gap-4">
      <Card title="Consecutivo de facturas" size="small">
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="El consecutivo avanza solo al emitir. Corríjalo únicamente si otro sistema consumió números del mismo prefijo; un número repetido será rechazado por la DIAN."
        />
        {activeResolution && (
          <div style={{ marginBottom: 12 }}>
            Rango autorizado de la resolución activa: <strong>{activeResolution.startRange}</strong> a{" "}
            <strong>{activeResolution.endRange}</strong>
          </div>
        )}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={local.numberings}
          pagination={false}
          size="small"
          locale={{ emptyText: "Se crea automáticamente al activar una resolución" }}
        />
      </Card>

      <Card title="Forma de pago por defecto" size="small">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6">
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Medio de pago</label>
            <AntdSelect
              style={{ width: "100%" }}
              value={paymentMeansCode}
              onChange={setPaymentMeansCode}
              options={withCurrentOption(PAYMENT_MEANS_OPTIONS, local.paymentMeansCode)}
            />
          </div>
          <div className="col-12 col-md-3">
            <Button
              type="primary"
              loading={updateGeneral.isPending}
              disabled={paymentMeansCode === local.paymentMeansCode}
              onClick={savePaymentMeans}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
