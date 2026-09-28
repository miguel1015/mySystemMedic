"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Alert, Button, Space, Table, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import Modal from "@/components/modal"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import { useActivateElectronicInvoiceResolution } from "@/core/hooks/parameterization/electronicInvoicing/useElectronicInvoicingMutations"
import {
  TElectronicInvoiceResolution,
  TElectronicInvoiceSoftware,
} from "@/core/interfaces/parameterization/electronicInvoicing"
import { daysUntil, formatDate } from "../utils"
import ResolutionForm from "./resolutionForm"

interface ResolutionsTabProps {
  resolutions: TElectronicInvoiceResolution[]
  software?: TElectronicInvoiceSoftware | null
}

export default function ResolutionsTab({ resolutions, software }: ResolutionsTabProps) {
  const activate = useActivateElectronicInvoiceResolution()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TElectronicInvoiceResolution | null>(null)
  const [toActivate, setToActivate] = useState<TElectronicInvoiceResolution | null>(null)

  const isProduction = software?.environment === "3"

  const openForm = (resolution: TElectronicInvoiceResolution | null) => {
    setEditing(resolution)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const confirmActivate = () => {
    if (!toActivate) return
    activate.mutate(toActivate.resolutionId, {
      onSuccess: () => {
        toast.success(`Resolución ${toActivate.prefix} activada`)
        setToActivate(null)
      },
      onError: (err: Error) => {
        toast.error(err.message)
        setToActivate(null)
      },
    })
  }

  // Coherente con la regla del backend: en pruebas solo la de pruebas, en producción solo
  // las reales; siempre vigentes.
  const activationBlockedReason = (r: TElectronicInvoiceResolution) => {
    if (r.isActive) return "Ya está activa"
    if (daysUntil(r.endDate) < 0) return "La resolución está vencida"
    if (!isProduction && !r.isTestResolution)
      return "En pruebas se usa la resolución de pruebas; cambie el ambiente a producción desde «Software y ambiente»"
    if (isProduction && r.isTestResolution) return "No se puede usar en producción"
    return null
  }

  const columns: ColumnsType<TElectronicInvoiceResolution> = [
    {
      title: "Prefijo",
      dataIndex: "prefix",
      width: 90,
      render: (value: string, r) => (
        <Space size={4}>
          <strong>{value}</strong>
          {r.isTestResolution && <Tag color="blue">Pruebas</Tag>}
        </Space>
      ),
    },
    { title: "Resolución", dataIndex: "resolutionNum", width: 160 },
    {
      title: "Rango",
      width: 200,
      render: (_, r) => `${r.startRange} - ${r.endRange}`,
    },
    {
      title: "Vigencia",
      width: 220,
      render: (_, r) => {
        const days = daysUntil(r.endDate)
        return (
          <Space size={4} wrap>
            <span>
              {formatDate(r.startDate)} a {formatDate(r.endDate)}
            </span>
            {days < 0 ? (
              <Tag color="red">Vencida</Tag>
            ) : days <= 30 ? (
              <Tag color="orange">Vence en {days} días</Tag>
            ) : null}
          </Space>
        )
      },
    },
    {
      title: "Último número usado",
      dataIndex: "lastNumUsed",
      width: 170,
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Estado",
      dataIndex: "isActive",
      width: 100,
      render: (value: boolean) => (value ? <Tag color="green">Activa</Tag> : <Tag>Inactiva</Tag>),
    },
    {
      title: "Acciones",
      width: 180,
      render: (_, r) => {
        const blocked = activationBlockedReason(r)
        return (
          <Space>
            <Button size="small" onClick={() => openForm(r)}>
              Editar
            </Button>
            {!r.isActive && (
              <Tooltip title={blocked ?? undefined}>
                <Button size="small" type="primary" disabled={!!blocked} onClick={() => setToActivate(r)}>
                  Activar
                </Button>
              </Tooltip>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      {!software && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Registre primero el software DIAN en «Software y ambiente» para poder crear resoluciones."
        />
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span style={{ color: "var(--dash-text-tertiary, #9ca3af)" }}>
          La resolución activa define el prefijo y el rango con el que MediNexus numera las facturas.
        </span>
        <Button type="primary" disabled={!software} onClick={() => openForm(null)}>
          Nueva resolución
        </Button>
      </div>

      <Table
        rowKey="resolutionId"
        columns={columns}
        dataSource={resolutions}
        pagination={false}
        size="small"
        scroll={{ x: 1100 }}
        locale={{ emptyText: "No hay resoluciones registradas" }}
      />

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? `Editar resolución ${editing.prefix}` : "Nueva resolución"}
        size="lg"
      >
        <ResolutionForm resolution={editing} onDone={closeForm} />
      </Modal>

      <ModalConfirm
        open={!!toActivate}
        title="Activar resolución"
        subtitle={
          toActivate
            ? `Las próximas facturas se numerarán con el prefijo ${toActivate.prefix} (rango ${toActivate.startRange} - ${toActivate.endRange}). ¿Desea continuar?`
            : undefined
        }
        onClose={() => setToActivate(null)}
        onConfirm={confirmActivate}
        loading={activate.isPending}
        confirmText="Sí, activar"
      />
    </div>
  )
}
