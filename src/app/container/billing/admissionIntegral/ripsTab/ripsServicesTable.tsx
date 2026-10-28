"use client"

import type { RipsProfessional } from "@/app/container/billing/rips/buildRips"
import type { BillingMovementResponse } from "@/core/interfaces/care/billing"
import type { ProfessionalOption } from "@/core/interfaces/user/users"
import { EditOutlined, ExclamationCircleFilled } from "@ant-design/icons"
import { Input, InputNumber, Select, Space, Table, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { ReactNode, useMemo, useState } from "react"
import { formatCurrency } from "../utils"
import type { MovementEdit, MovementEdits, RipsCategory } from "./ripsServiceEdits"

const monoStyle: React.CSSProperties = { fontFamily: "monospace" }

const editedStyle: React.CSSProperties = {
  background: "color-mix(in srgb, var(--theme-primary, #0F6F5C) 18%, transparent)",
  borderRadius: 4,
}

interface ClickToEditProps {
  disabled: boolean
  edited: boolean
  display: ReactNode
  disabledHint?: string
  // Recibe la función para cerrar el editor.
  renderEditor?: (close: () => void) => ReactNode
  // Si se pasa, el clic no abre un editor en la celda sino que llama esta acción (p. ej. un modal).
  onActivate?: () => void
}

// Celda que muestra el valor y, al presionarla, se vuelve editable.
function ClickToEdit({
  disabled,
  edited,
  display,
  disabledHint,
  renderEditor,
  onActivate,
}: ClickToEditProps) {
  const [editing, setEditing] = useState(false)

  if (editing && !disabled && renderEditor) return <>{renderEditor(() => setEditing(false))}</>

  const content = (
    <div
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onClick={() => {
        if (disabled) return
        if (onActivate) onActivate()
        else setEditing(true)
      }}
      onKeyDown={(event) => {
        if (disabled || event.key !== "Enter") return
        if (onActivate) onActivate()
        else setEditing(true)
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 6px",
        margin: "-2px -6px",
        cursor: disabled ? "default" : "pointer",
        borderBottom: disabled ? undefined : "1px dashed var(--dash-border-strong, #9ca3af)",
        ...(edited ? editedStyle : null),
      }}
    >
      {display}
      {!disabled && (
        <EditOutlined style={{ fontSize: 11, color: "var(--dash-text-secondary, #6b7280)" }} />
      )}
    </div>
  )

  return disabled && disabledHint ? <Tooltip title={disabledHint}>{content}</Tooltip> : content
}

function MissingCode({ hint }: { hint: string }) {
  return (
    <Tooltip title={hint}>
      <Tag color="orange" style={{ marginInlineEnd: 0 }}>
        Sin código
      </Tag>
    </Tooltip>
  )
}

interface RipsServicesTableProps {
  category: RipsCategory
  // Cargos de la categoría con las ediciones ya aplicadas.
  movements: BillingMovementResponse[]
  edits: MovementEdits
  rowErrors: Record<number, string[]>
  readOnly: boolean
  principalDiagnosis: string | null
  hcProfessional: RipsProfessional | null
  professionals: ProfessionalOption[]
  onEdit: (movementId: number, edit: MovementEdit) => void
  onPickItem: (movement: BillingMovementResponse) => void
}

// Las cirugías con detalle de conceptos se corrigen en su propio modal: el valor es la suma
// de honorarios y derechos.
const isGroupedSurgery = (movement: BillingMovementResponse) =>
  movement.movementType === "surgery" && !!movement.conceptDetails

export default function RipsServicesTable({
  category,
  movements,
  edits,
  rowErrors,
  readOnly,
  principalDiagnosis,
  hcProfessional,
  professionals,
  onEdit,
  onPickItem,
}: RipsServicesTableProps) {
  const professionalOptions = useMemo(
    () =>
      professionals.map((professional) => ({
        value: professional.id,
        label: [professional.documentTypeCode, professional.documentNumber, "·", professional.fullName]
          .filter(Boolean)
          .join(" "),
      })),
    [professionals],
  )

  const isEdited = (movement: BillingMovementResponse, ...fields: (keyof MovementEdit)[]) =>
    fields.some((field) => edits[movement.id]?.[field] !== undefined)

  const codeTitle =
    category === "medicamentos" ? "CUM" : category === "insumos" ? "Código" : "CUPS"
  const pickLabel =
    category === "medicamentos"
      ? "Elegir otro medicamento"
      : category === "insumos"
        ? "Elegir otro insumo"
        : "Elegir otro servicio del tarifario"

  const columns: ColumnsType<BillingMovementResponse> = [
    {
      title: "",
      key: "status",
      width: 32,
      render: (_, movement) =>
        rowErrors[movement.id] ? (
          <Tooltip
            title={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {rowErrors[movement.id].map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            }
          >
            <ExclamationCircleFilled style={{ color: "#dc2626" }} />
          </Tooltip>
        ) : null,
    },
    { title: "#", key: "index", width: 44, render: (_, __, index) => index + 1 },
    {
      title: codeTitle,
      key: "code",
      width: 130,
      render: (_, movement) => {
        const code =
          movement.movementType === "service" || movement.movementType === "surgery"
            ? movement.cupsCode?.trim() || movement.itemCode?.trim() || null
            : movement.itemCode?.trim() || null
        return (
          <Tooltip
            title={readOnly ? undefined : isGroupedSurgery(movement) ? "Abrir el detalle de la cirugía" : pickLabel}
          >
            <span>
              <ClickToEdit
                disabled={readOnly}
                edited={isEdited(movement, "itemId", "itemCode", "cupsCode")}
                display={
                  code ? <span style={monoStyle}>{code}</span> : <MissingCode hint="El cargo no tiene código" />
                }
                onActivate={() => onPickItem(movement)}
              />
            </span>
          </Tooltip>
        )
      },
    },
    {
      title: "Descripción",
      key: "name",
      render: (_, movement) => (
        <ClickToEdit
          disabled={readOnly}
          edited={isEdited(movement, "name")}
          display={<span>{movement.name || "-"}</span>}
          renderEditor={(close) => (
            <Input
              autoFocus
              size="small"
              maxLength={500}
              defaultValue={movement.name}
              onBlur={(event) => {
                onEdit(movement.id, { name: event.target.value })
                close()
              }}
              onPressEnter={(event) => {
                onEdit(movement.id, { name: event.currentTarget.value })
                close()
              }}
            />
          )}
        />
      ),
    },
    {
      title: "Dx principal",
      key: "diagnosis",
      width: 110,
      render: () =>
        principalDiagnosis ? (
          <Tooltip title="Se toma de la historia clínica (egreso o ingreso); se corrige allí">
            <span style={monoStyle}>{principalDiagnosis}</span>
          </Tooltip>
        ) : (
          <MissingCode hint="No hay diagnósticos en la historia clínica de ingreso ni en el egreso" />
        ),
    },
    {
      title: "Profesional",
      key: "professional",
      width: 260,
      render: (_, movement) => {
        const hasOwn = movement.professionalUserId != null
        const document = hasOwn
          ? [movement.professionalDocumentTypeCode, movement.professionalDocumentNumber]
          : [hcProfessional?.documentTypeCode, hcProfessional?.documentNumber]
        const documentText = document.filter(Boolean).join(" ")
        const name = hasOwn ? movement.professionalName : hcProfessional?.name
        return (
          <ClickToEdit
            disabled={readOnly}
            edited={isEdited(movement, "professionalUserId")}
            display={
              documentText ? (
                <Space size={6}>
                  <Tooltip title={name}>
                    <span style={monoStyle}>{documentText}</span>
                  </Tooltip>
                  {!hasOwn && (
                    <Tooltip title="El cargo no tiene profesional: se reporta el médico de la historia clínica de ingreso">
                      <Tag style={{ marginInlineEnd: 0 }}>HC</Tag>
                    </Tooltip>
                  )}
                </Space>
              ) : (
                <MissingCode hint="No se identificó el profesional" />
              )
            }
            renderEditor={(close) => (
              <Select
                autoFocus
                defaultOpen
                showSearch
                size="small"
                style={{ width: 240 }}
                placeholder="Buscar por nombre o documento"
                optionFilterProp="label"
                options={professionalOptions}
                defaultValue={movement.professionalUserId ?? undefined}
                onBlur={close}
                onChange={(value: number) => {
                  const professional = professionals.find((item) => item.id === value)
                  onEdit(movement.id, {
                    professionalUserId: value,
                    professionalName: professional?.fullName ?? null,
                    professionalDocumentTypeCode: professional?.documentTypeCode ?? null,
                    professionalDocumentNumber: professional?.documentNumber ?? null,
                  })
                  close()
                }}
              />
            )}
          />
        )
      },
    },
    {
      title: "Cant.",
      key: "quantity",
      width: 80,
      align: "right",
      render: (_, movement) => (
        <ClickToEdit
          disabled={readOnly || isGroupedSurgery(movement)}
          disabledHint={readOnly ? undefined : "Se corrige desde el detalle de la cirugía (columna CUPS)"}
          edited={isEdited(movement, "quantity")}
          display={<span>{movement.quantity}</span>}
          renderEditor={(close) => (
            <InputNumber
              autoFocus
              size="small"
              min={1}
              precision={0}
              style={{ width: 70 }}
              defaultValue={movement.quantity}
              onBlur={(event) => {
                const value = Number(event.target.value)
                if (Number.isFinite(value)) onEdit(movement.id, { quantity: value })
                close()
              }}
              onPressEnter={(event) => {
                const value = Number(event.currentTarget.value)
                if (Number.isFinite(value)) onEdit(movement.id, { quantity: value })
                close()
              }}
            />
          )}
        />
      ),
    },
    {
      title: "Valor unitario",
      key: "unitValue",
      width: 140,
      align: "right",
      render: (_, movement) => (
        <ClickToEdit
          disabled={readOnly || isGroupedSurgery(movement)}
          disabledHint={readOnly ? undefined : "Se corrige desde el detalle de la cirugía (columna CUPS)"}
          edited={isEdited(movement, "unitValue")}
          display={<span>{formatCurrency(movement.unitValue)}</span>}
          renderEditor={(close) => {
            const commit = (raw: string) => {
              const value = Number(raw.replace(/[^0-9.]/g, ""))
              if (Number.isFinite(value)) onEdit(movement.id, { unitValue: value })
              close()
            }
            return (
              <InputNumber
                autoFocus
                size="small"
                min={0}
                style={{ width: 130 }}
                defaultValue={movement.unitValue}
                onBlur={(event) => commit(event.target.value)}
                onPressEnter={(event) => commit(event.currentTarget.value)}
              />
            )
          }}
        />
      ),
    },
    {
      title: "Valor total",
      key: "totalValue",
      width: 130,
      align: "right",
      render: (_, movement) => <strong>{formatCurrency(movement.totalValue)}</strong>,
    },
  ]

  return (
    <Table<BillingMovementResponse>
      size="small"
      rowKey="id"
      columns={columns}
      dataSource={movements}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  )
}
