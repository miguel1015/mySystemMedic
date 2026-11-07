"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { Button, ConfigProvider, Select, Skeleton, Table, Tag } from "antd"
import { getSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { CheckCircleFilled, CloudOutlined, HomeOutlined } from "@ant-design/icons"
import Modal from "@/components/modal"
import { useMovement, usePharmacyProducts, useWarehouses } from "@/core/hooks/pharmacy/usePharmacy"
import type {
  InventoryStatus,
  Movement,
  MovementDetailLine,
  MovementType,
  PharmacyProduct,
  ProductType,
} from "@/core/interfaces/pharmacy/types"
import { formatPersonName } from "@/core/utils/displayText"
import { MOVEMENT_META, STATUS_META, fmtDate, fmtDateTime, fmtQty, fmtUnit, movementNumber, productKey } from "./format"
import styles from "./pharmacy.module.scss"
import tableStyles from "@/components/dataTable/dataTable.module.scss"

// El modal del sistema usa z-index 1050: sin esto los desplegables de antd (selects,
// calendarios) se abren detrás de él.
export function PopupLayer({ children }: { children: ReactNode }) {
  return <ConfigProvider theme={{ token: { zIndexPopupBase: 1100 } }}>{children}</ConfigProvider>
}

// Nombre del usuario autenticado: es quien queda como responsable de la operación.
export function useCurrentUserName() {
  // La app no monta SessionProvider; getSession consulta /api/auth/session directamente.
  const { data } = useQuery({ queryKey: ["session-user"], queryFn: () => getSession(), staleTime: 5 * 60_000 })
  const user = data?.user as { firstName?: string; lastName?: string; username?: string } | undefined
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ")
  return name ? formatPersonName(name) : (user?.username ?? "Usuario actual")
}

export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function StatusTag({ status }: { status: InventoryStatus }) {
  const meta = STATUS_META[status]
  return <Tag color={meta.color}>{meta.label}</Tag>
}

export function MovementTypeTag({ type }: { type: MovementType }) {
  const meta = MOVEMENT_META[type]
  return <Tag color={meta.color}>{meta.label}</Tag>
}

export function ProductCell({
  name,
  code,
  type,
  extra,
}: {
  name: string
  code?: string | null
  type?: ProductType
  extra?: ReactNode
}) {
  return (
    <span className={styles.product}>
      <span className={styles.productName}>{name}</span>
      <span className={styles.sub}>
        {[type, code].filter(Boolean).join(" · ")}
        {extra}
      </span>
    </span>
  )
}

export function WarehouseName({ name, isVirtual }: { name: string; isVirtual?: boolean }) {
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      {isVirtual ? <CloudOutlined aria-label="Bodega virtual" /> : <HomeOutlined aria-hidden />} {name}
    </span>
  )
}

// ───────────────────────── Selectores ─────────────────────────

export function WarehouseSelect({
  value,
  onChange,
  placeholder = "Seleccione la bodega",
  exclude,
  allowClear,
  className,
  disabled,
  status,
}: {
  value?: number | null
  onChange: (id: number | undefined) => void
  placeholder?: string
  exclude?: number | null
  allowClear?: boolean
  className?: string
  disabled?: boolean
  status?: "error"
}) {
  const { data = [], isLoading } = useWarehouses()
  const options = data
    .filter((w) => w.id !== exclude)
    .map((w) => ({
      value: w.id,
      label: `${w.name} (${w.code})${w.isVirtual ? " · virtual" : ""}`,
    }))

  return (
    <Select
      className={className}
      style={className ? undefined : { width: "100%" }}
      value={value ?? undefined}
      onChange={(v) => onChange(v ?? undefined)}
      options={options}
      placeholder={placeholder}
      loading={isLoading}
      allowClear={allowClear}
      showSearch
      optionFilterProp="label"
      disabled={disabled}
      status={status}
      aria-label={placeholder}
      notFoundContent={isLoading ? "Cargando…" : "No hay bodegas activas. Créelas en Bodegas."}
    />
  )
}

export function useWarehouseName(id?: number | null) {
  const { data } = useWarehouses()
  return data?.find((w) => w.id === id)?.name
}

// Búsqueda en el catálogo de medicamentos e insumos. Con warehouseId solo muestra lo que
// tiene existencia en esa bodega (y la cantidad disponible).
export function ProductSelect({
  value,
  onChange,
  warehouseId,
  requireWarehouse,
  includeExpired,
  type,
  excludeKeys,
  placeholder = "Buscar medicamento o insumo por nombre o código",
  status,
}: {
  value?: PharmacyProduct | null
  onChange: (product: PharmacyProduct | null) => void
  warehouseId?: number
  requireWarehouse?: boolean
  includeExpired?: boolean
  type?: ProductType
  excludeKeys?: string[]
  placeholder?: string
  status?: "error"
}) {
  const [search, setSearch] = useState("")
  const debounced = useDebounced(search)
  const blocked = requireWarehouse && !warehouseId
  const { data = [], isFetching } = usePharmacyProducts(
    { search: debounced || undefined, type, warehouseId, includeExpired },
    !blocked,
  )

  const products = useMemo(() => {
    const list = data.filter((p) => !excludeKeys?.includes(productKey(p.productType, p.productId)))
    if (
      value &&
      !list.some((p) => productKey(p.productType, p.productId) === productKey(value.productType, value.productId))
    )
      list.unshift(value)
    return list
  }, [data, excludeKeys, value])

  return (
    <Select
      style={{ width: "100%" }}
      showSearch
      filterOption={false}
      onSearch={setSearch}
      searchValue={search}
      value={value ? productKey(value.productType, value.productId) : undefined}
      onChange={(key) => {
        onChange(products.find((p) => productKey(p.productType, p.productId) === key) ?? null)
        setSearch("")
      }}
      placeholder={blocked ? "Primero seleccione la bodega" : placeholder}
      disabled={blocked}
      loading={isFetching}
      status={status}
      aria-label="Medicamento o insumo"
      notFoundContent={
        isFetching ? "Buscando…" : warehouseId ? "Sin existencias que coincidan en esta bodega" : "Sin resultados"
      }
      options={products.map((p) => ({
        value: productKey(p.productType, p.productId),
        label: (
          <span className={styles.product} style={{ minWidth: 0 }}>
            <span className={styles.productName} style={{ whiteSpace: "normal" }}>
              {p.name}
            </span>
            <span className={styles.sub} style={{ whiteSpace: "normal" }}>
              {[p.productType, p.code, p.detail].filter(Boolean).join(" · ")}
              {p.availableQuantity != null && ` · ${fmtQty(p.availableQuantity)} ${fmtUnit(p.unit)} disponibles`}
            </span>
          </span>
        ),
      }))}
      labelRender={() => (value ? `${value.name}${value.code ? ` · ${value.code}` : ""}` : undefined)}
    />
  )
}

// ───────────────────────── Detalle de movimiento ─────────────────────────

function Lines({ lines }: { lines: MovementDetailLine[] }) {
  return (
    <Table<MovementDetailLine>
      className={tableStyles.table}
      size="small"
      rowKey="id"
      pagination={false}
      scroll={{ x: "max-content" }}
      dataSource={lines}
      columns={[
        {
          title: "Producto",
          render: (_, l) => <ProductCell name={l.productName} code={l.code} type={l.productType} />,
        },
        {
          title: "Lote",
          render: (_, l) => (
            <>
              <div className={styles.mono}>{l.lotNumber}</div>
              <div className={styles.sub}>Vence {fmtDate(l.expirationDate)}</div>
            </>
          ),
        },
        { title: "Bodega", dataIndex: "warehouseName" },
        {
          title: "Cantidad",
          align: "right",
          render: (_, l) => (
            <span className={`${styles.qty} ${l.direction === "Entrada" ? styles.qtyIn : styles.qtyOut}`}>
              {l.direction === "Entrada" ? "+" : "−"}
              {fmtQty(l.quantity)} {fmtUnit(l.unit)}
            </span>
          ),
        },
        {
          title: "Solicitada",
          align: "right",
          render: (_, l) => (l.requestedQuantity != null ? fmtQty(l.requestedQuantity) : "—"),
        },
        {
          title: "Saldo después",
          align: "right",
          render: (_, l) => <span className={styles.qty}>{fmtQty(l.balanceAfter)}</span>,
        },
      ]}
    />
  )
}

export function MovementDetails({ movement }: { movement: Movement }) {
  const items: [string, ReactNode][] = [
    [
      "Número",
      <span key="n" className={styles.mono}>
        {movementNumber(movement.id)}
      </span>,
    ],
    ["Tipo", <MovementTypeTag key="t" type={movement.type} />],
    ["Fecha y hora", fmtDateTime(movement.occurredAt)],
    ["Responsable", formatPersonName(movement.userName)],
  ]
  if (movement.sourceWarehouseName) items.push(["Bodega de origen", movement.sourceWarehouseName])
  if (movement.destinationWarehouseName) items.push(["Bodega de destino", movement.destinationWarehouseName])
  if (movement.patientName)
    items.push(["Paciente", `${formatPersonName(movement.patientName)} · ${movement.patientDocument ?? ""}`])
  if (movement.admissionId) items.push(["Admisión", `#${movement.admissionId}`])
  if (movement.supplierName) items.push(["Proveedor", movement.supplierName])
  if (movement.supportDocument) items.push(["Documento soporte", movement.supportDocument])
  if (movement.documentDate) items.push(["Fecha de ingreso", fmtDate(movement.documentDate)])
  if (movement.correctsMovementId) items.push(["Corrige el movimiento", movementNumber(movement.correctsMovementId)])

  return (
    <div>
      <dl className={styles.meta}>
        {items.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {movement.reason && (
        <div className={styles.note}>
          <strong>Motivo:</strong> {movement.reason}
        </div>
      )}
      {movement.observations && (
        <div className={styles.note}>
          <strong>Observaciones:</strong> {movement.observations}
        </div>
      )}
      <Lines lines={movement.details} />
    </div>
  )
}

export function MovementDetailModal({ movementId, onClose }: { movementId: number | null; onClose: () => void }) {
  const { data, isLoading, isError } = useMovement(movementId)
  return (
    <Modal
      open={!!movementId}
      onClose={onClose}
      size="xl"
      title={movementId ? `Movimiento ${movementNumber(movementId)}` : ""}
    >
      {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}
      {isError && <p>No se pudo cargar el movimiento.</p>}
      {data && <MovementDetails movement={data} />}
    </Modal>
  )
}

// Resultado de una operación registrada: número de movimiento y acciones siguientes.
export function OperationSuccess({
  movement,
  title,
  onNew,
  newLabel,
}: {
  movement: Movement
  title: string
  onNew: () => void
  newLabel: string
}) {
  const [showDetail, setShowDetail] = useState(false)
  return (
    <div className={styles.panel}>
      <div className={styles.success} role="status">
        <CheckCircleFilled className={styles.successIcon} aria-hidden />
        <p className={styles.successTitle}>{title}</p>
        <p className={styles.sub}>
          Movimiento <span className={styles.mono}>{movementNumber(movement.id)}</span> ·{" "}
          {fmtDateTime(movement.occurredAt)} · {formatPersonName(movement.userName)}
        </p>
        <div className={styles.successActions}>
          <Button onClick={() => setShowDetail((v) => !v)}>{showDetail ? "Ocultar detalle" : "Ver detalle"}</Button>
          <Button type="primary" onClick={onNew}>
            {newLabel}
          </Button>
        </div>
      </div>
      {showDetail && (
        <div style={{ marginTop: 20 }}>
          <MovementDetails movement={movement} />
        </div>
      )}
    </div>
  )
}
