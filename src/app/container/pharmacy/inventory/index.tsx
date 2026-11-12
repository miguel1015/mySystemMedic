"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Alert, Button, Dropdown, Input, Select, Table, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  DownOutlined,
  ExportOutlined,
  HistoryOutlined,
  ImportOutlined,
  MedicineBoxOutlined,
  SearchOutlined,
  SwapOutlined,
} from "@ant-design/icons"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import Modal from "@/components/modal"
import tableStyles from "@/components/dataTable/dataTable.module.scss"
import { useInventory, useInventorySummary } from "@/core/hooks/pharmacy/usePharmacy"
import type { InventoryQuery, InventoryRow, InventoryStatus, ProductType } from "@/core/interfaces/pharmacy/types"
import { PHARMACY_ROUTES, usePharmacyAccess } from "../shared/access"
import { PopupLayer, ProductCell, StatusTag, WarehouseName, WarehouseSelect, useDebounced } from "../shared/components"
import { PRODUCT_TYPE_OPTIONS, STATUS_META, expiryHint, fmtDate, fmtQty, fmtUnit } from "../shared/format"
import MovementsTable from "../shared/MovementsTable"
import styles from "../shared/pharmacy.module.scss"
import { useUrlState } from "@/core/hooks/utils/useUrlState"

type StatusFilter = InventoryStatus | "ConExistencia" | undefined

const STATUS_OPTIONS = [
  { value: "ConExistencia", label: "Con existencia" },
  ...(Object.keys(STATUS_META) as InventoryStatus[]).map((s) => ({ value: s, label: STATUS_META[s].label })),
]

export default function InventoryContainer() {
  const can = usePharmacyAccess()
  // Filtros y página en la URL (?buscar=…&bodega=3&estado=Vencido): al volver quedan igual.
  // "estado=todos" representa "sin filtro de estado", distinto del valor por defecto.
  const [url, setUrl] = useUrlState({
    buscar: "",
    tipo: "",
    bodega: "",
    estado: "ConExistencia",
    pagina: "1",
    tamano: "20",
  })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounced(search)
  const productType = (url.tipo || undefined) as ProductType | undefined
  const warehouseId = url.bodega ? Number(url.bodega) : undefined
  const status = (url.estado === "todos" ? undefined : url.estado) as StatusFilter
  const page = Math.max(1, Number(url.pagina) || 1)
  const pageSize = [10, 20, 50, 100].includes(Number(url.tamano)) ? Number(url.tamano) : 20
  const [historyRow, setHistoryRow] = useState<InventoryRow | null>(null)

  // Cada cambio de filtro vuelve a la página 1.
  const setStatus = (value: StatusFilter) => setUrl({ estado: value ?? "todos", pagina: "1" })
  const setProductType = (value?: ProductType) => setUrl({ tipo: value ?? "", pagina: "1" })
  const setWarehouseId = (value?: number) => setUrl({ bodega: value ? String(value) : "", pagina: "1" })

  // El cuadro de búsqueda se llena con la URL; lo escrito pasa a la URL ya sin rebote.
  useEffect(() => setSearch(url.buscar ?? ""), [url.buscar])
  useEffect(() => {
    const term = debouncedSearch.trim()
    if (term !== (url.buscar ?? "")) setUrl({ buscar: term, pagina: "1" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const filters = { search: url.buscar || undefined, productType, warehouseId }
  const query: InventoryQuery = { ...filters, status, page, pageSize }
  const { data, isLoading, isFetching, isError, refetch } = useInventory(query)
  const { data: summary } = useInventorySummary(filters)

  const columns: ColumnsType<InventoryRow> = [
    {
      title: "Código",
      key: "code",
      render: (_, r) => <span className={styles.mono}>{r.code ?? "—"}</span>,
    },
    {
      title: "Medicamento / insumo",
      key: "product",
      render: (_, r) => <ProductCell name={r.productName} type={r.productType} />,
    },
    {
      title: "Bodega",
      key: "warehouse",
      render: (_, r) => <WarehouseName name={r.warehouseName} isVirtual={r.isVirtualWarehouse} />,
    },
    {
      title: "Lote",
      key: "lot",
      render: (_, r) => <span className={styles.mono}>{r.lotNumber}</span>,
    },
    {
      title: "Vencimiento",
      key: "expiration",
      render: (_, r) => (
        <>
          <div style={{ whiteSpace: "nowrap" }}>{fmtDate(r.expirationDate)}</div>
          {r.quantity > 0 && <div className={styles.sub}>{expiryHint(r.daysToExpire)}</div>}
        </>
      ),
    },
    {
      title: "Existencia",
      key: "qty",
      align: "right",
      render: (_, r) => <span className={styles.qty}>{fmtQty(r.quantity)}</span>,
    },
    { title: "Unidad", key: "unit", render: (_, r) => fmtUnit(r.unit) },
    { title: "Estado", key: "status", render: (_, r) => <StatusTag status={r.status} /> },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <Tooltip title="Ver historial del lote en esta bodega">
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => setHistoryRow(r)}
            aria-label={`Historial del lote ${r.lotNumber}`}
          />
        </Tooltip>
      ),
    },
  ]

  const stats: { key: StatusFilter; label: string; value?: number; color: string }[] = [
    {
      key: "ConExistencia",
      label: "Lotes con existencia",
      value: summary?.lotsWithStock,
      color: "var(--theme-primary, #0f6f5c)",
    },
    { key: "Disponible", label: "Disponibles", value: summary?.available, color: "#16a34a" },
    {
      key: "ProximoAVencer",
      label: `Vencen en ${summary?.nearExpiryDays ?? 90} días`,
      value: summary?.nearExpiry,
      color: "#d97706",
    },
    { key: "Vencido", label: "Vencidos con existencia", value: summary?.expired, color: "#dc2626" },
    { key: "Agotado", label: "Agotados", value: summary?.outOfStock, color: "#9ca3af" },
  ]

  const secondary = [
    can(PHARMACY_ROUTES.entries) && {
      key: "entry",
      icon: <ImportOutlined />,
      label: <Link href={PHARMACY_ROUTES.entries}>Registrar entrada</Link>,
    },
    can(PHARMACY_ROUTES.adjustments) && {
      key: "exit",
      icon: <ExportOutlined />,
      label: <Link href={PHARMACY_ROUTES.adjustments}>Registrar salida o ajuste</Link>,
    },
    can(PHARMACY_ROUTES.transfers) && {
      key: "transfer",
      icon: <SwapOutlined />,
      label: <Link href={PHARMACY_ROUTES.transfers}>Trasladar entre bodegas</Link>,
    },
    can(PHARMACY_ROUTES.warehouses) && {
      key: "warehouses",
      label: <Link href={PHARMACY_ROUTES.warehouses}>Administrar bodegas</Link>,
    },
    can(PHARMACY_ROUTES.movements) && {
      key: "movements",
      icon: <HistoryOutlined />,
      label: <Link href={PHARMACY_ROUTES.movements}>Ver movimientos</Link>,
    },
  ].filter(Boolean) as { key: string; label: React.ReactNode; icon?: React.ReactNode }[]

  return (
    <PopupLayer>
      <Container>
        <PageHeader
          icon={<MedicineBoxOutlined />}
          title="Inventario de farmacia"
          subtitle={
            summary
              ? `${summary.products.toLocaleString("es-CO")} productos y ${summary.lotsWithStock.toLocaleString("es-CO")} lotes con existencia`
              : "Existencias por producto, lote y bodega"
          }
          actions={
            <>
              {secondary.length > 0 && (
                <Dropdown menu={{ items: secondary }} trigger={["click"]} placement="bottomRight">
                  <Button>
                    Operaciones <DownOutlined />
                  </Button>
                </Dropdown>
              )}
              {can(PHARMACY_ROUTES.dispensing) && (
                <Link href={PHARMACY_ROUTES.dispensing}>
                  <Button type="primary" icon={<MedicineBoxOutlined />}>
                    Dispensar a paciente
                  </Button>
                </Link>
              )}
            </>
          }
        />

        <div className={styles.stats}>
          {stats.map((s) => (
            <button
              key={String(s.key)}
              type="button"
              className={`${styles.stat} ${status === s.key ? styles.statActive : ""}`}
              onClick={() => setStatus(status === s.key ? undefined : s.key)}
              aria-pressed={status === s.key}
            >
              <span className={styles.statLabel}>
                <span className={styles.dot} style={{ background: s.color }} aria-hidden />
                {s.label}
              </span>
              <span className={styles.statValue}>{s.value != null ? s.value.toLocaleString("es-CO") : "—"}</span>
            </button>
          ))}
        </div>

        <div className={styles.toolbar}>
          <Input
            className={styles.search}
            placeholder="Buscar por nombre, código o lote…"
            prefix={<SearchOutlined aria-hidden />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            aria-label="Buscar en el inventario"
          />
          <Select
            className={styles.filter}
            placeholder="Tipo de producto"
            allowClear
            value={productType}
            onChange={setProductType}
            options={PRODUCT_TYPE_OPTIONS}
            aria-label="Tipo de producto"
          />
          <WarehouseSelect
            className={styles.filter}
            placeholder="Todas las bodegas"
            value={warehouseId}
            onChange={setWarehouseId}
            allowClear
          />
          <Select
            className={styles.filter}
            placeholder="Todos los estados"
            allowClear
            value={status}
            onChange={(v) => setStatus(v)}
            options={STATUS_OPTIONS}
            aria-label="Estado del inventario"
          />
          <span className={styles.toolbarEnd} role="status">
            {data ? `${data.totalCount.toLocaleString("es-CO")} registros` : ""}
          </span>
        </div>

        {isError ? (
          <Alert
            type="warning"
            showIcon
            message="No se pudo cargar el inventario"
            action={<Button onClick={() => refetch()}>Reintentar</Button>}
          />
        ) : (
          <Table<InventoryRow>
            className={tableStyles.table}
            rowKey="stockId"
            size="middle"
            columns={columns}
            dataSource={data?.items ?? []}
            loading={isLoading || isFetching}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText:
                search || productType || warehouseId || status
                  ? "Nada coincide con los filtros elegidos."
                  : "Aún no hay existencias. Registre una entrada para empezar.",
            }}
            pagination={{
              current: page,
              pageSize,
              total: data?.totalCount ?? 0,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              locale: { items_per_page: "/ página" },
              showTotal: (total, range) => `${range[0]}–${range[1]} de ${total.toLocaleString("es-CO")}`,
              onChange: (p, size) =>
                setUrl({ pagina: String(size !== pageSize ? 1 : p), tamano: String(size) }),
            }}
          />
        )}

        <Modal
          open={!!historyRow}
          onClose={() => setHistoryRow(null)}
          size="xl"
          title={historyRow ? `Historial · ${historyRow.productName}` : ""}
        >
          {historyRow && (
            <>
              <dl className={styles.meta}>
                <div>
                  <dt>Lote</dt>
                  <dd className={styles.mono}>{historyRow.lotNumber}</dd>
                </div>
                <div>
                  <dt>Vencimiento</dt>
                  <dd>{fmtDate(historyRow.expirationDate)}</dd>
                </div>
                <div>
                  <dt>Bodega</dt>
                  <dd>{historyRow.warehouseName}</dd>
                </div>
                <div>
                  <dt>Existencia actual</dt>
                  <dd>
                    {fmtQty(historyRow.quantity)} {fmtUnit(historyRow.unit)}
                  </dd>
                </div>
              </dl>
              <MovementsTable
                compact
                hideProduct
                query={{ lotId: historyRow.lotId, warehouseId: historyRow.warehouseId }}
              />
            </>
          )}
        </Modal>
      </Container>
    </PopupLayer>
  )
}
