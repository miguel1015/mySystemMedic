"use client"

import { useEffect, useState } from "react"
import { Alert, Button, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMovements } from "@/core/hooks/pharmacy/usePharmacy"
import type { MovementQuery, MovementRow } from "@/core/interfaces/pharmacy/types"
import { formatPersonName } from "@/core/utils/displayText"
import tableStyles from "@/components/dataTable/dataTable.module.scss"
import { MovementDetailModal, MovementTypeTag, ProductCell } from "./components"
import { fmtDate, fmtDateTime, fmtQty, fmtUnit, movementNumber } from "./format"
import styles from "./pharmacy.module.scss"

// Historial de movimientos paginado en el servidor: una fila por lote movido.
export default function MovementsTable({
  query,
  hideProduct,
  compact,
}: {
  query: Omit<MovementQuery, "page" | "pageSize">
  hideProduct?: boolean
  compact?: boolean
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(compact ? 10 : 20)
  const [detailId, setDetailId] = useState<number | null>(null)
  const { data, isLoading, isFetching, isError, refetch } = useMovements({ ...query, page, pageSize })

  // Un filtro nuevo vuelve a la primera página.
  const queryKey = JSON.stringify(query)
  useEffect(() => setPage(1), [queryKey])

  const columns: ColumnsType<MovementRow> = [
    {
      title: "Número",
      key: "number",
      render: (_, r) => <span className={styles.mono}>{movementNumber(r.movementId)}</span>,
    },
    {
      title: "Fecha y hora",
      key: "date",
      render: (_, r) => <span style={{ whiteSpace: "nowrap" }}>{fmtDateTime(r.occurredAt)}</span>,
    },
    { title: "Tipo", key: "type", render: (_, r) => <MovementTypeTag type={r.type} /> },
    ...(hideProduct
      ? []
      : [
          {
            title: "Medicamento / insumo",
            key: "product",
            render: (_: unknown, r: MovementRow) => (
              <ProductCell name={r.productName} code={r.code} type={r.productType} />
            ),
          },
        ]),
    {
      title: "Lote",
      key: "lot",
      render: (_, r) => (
        <>
          <div className={styles.mono}>{r.lotNumber}</div>
          <div className={styles.sub}>Vence {fmtDate(r.expirationDate)}</div>
        </>
      ),
    },
    { title: "Origen", key: "source", render: (_, r) => r.sourceWarehouseName ?? "—" },
    { title: "Destino", key: "destination", render: (_, r) => r.destinationWarehouseName ?? "—" },
    {
      title: "Cantidad",
      key: "qty",
      align: "right",
      render: (_, r) => {
        // Un traslado no suma ni resta al total: solo cambia de bodega.
        const sign = r.type === "Traslado" ? "" : r.direction === "Entrada" ? "+" : "−"
        const tone = r.type === "Traslado" ? "" : r.direction === "Entrada" ? styles.qtyIn : styles.qtyOut
        return (
          <span className={`${styles.qty} ${tone}`}>
            {sign}
            {fmtQty(r.quantity)} {fmtUnit(r.unit)}
          </span>
        )
      },
    },
    {
      title: "Paciente",
      key: "patient",
      render: (_, r) =>
        r.patientName ? (
          <>
            <div>{formatPersonName(r.patientName)}</div>
            <div className={styles.sub}>{r.patientDocument}</div>
          </>
        ) : (
          "—"
        ),
    },
    { title: "Responsable", key: "user", render: (_, r) => formatPersonName(r.userName) },
    {
      title: "Observaciones",
      key: "notes",
      render: (_, r) => {
        const text = [r.reason, r.observations].filter(Boolean).join(" · ")
        return text ? (
          <span className={tableStyles.oneLine} title={text} style={{ maxWidth: 260, display: "inline-block" }}>
            {text}
          </span>
        ) : (
          "—"
        )
      },
    },
  ]

  if (isError)
    return (
      <Alert
        type="warning"
        showIcon
        message="No se pudieron cargar los movimientos"
        action={<Button onClick={() => refetch()}>Reintentar</Button>}
      />
    )

  return (
    <>
      <Table<MovementRow>
        className={tableStyles.table}
        rowKey="detailId"
        size={compact ? "small" : "middle"}
        columns={columns}
        dataSource={data?.items ?? []}
        loading={isLoading || isFetching}
        scroll={{ x: "max-content" }}
        rowClassName={() => tableStyles.rowClickable}
        onRow={(r) => ({
          onClick: () => setDetailId(r.movementId),
          onKeyDown: (e) => {
            if (e.key === "Enter") setDetailId(r.movementId)
          },
          tabIndex: 0,
        })}
        locale={{ emptyText: "No hay movimientos con estos filtros." }}
        pagination={{
          current: page,
          pageSize,
          total: data?.totalCount ?? 0,
          showSizeChanger: !compact,
          pageSizeOptions: ["10", "20", "50", "100"],
          locale: { items_per_page: "/ página" },
          showTotal: (total, range) => `${range[0]}–${range[1]} de ${total.toLocaleString("es-CO")}`,
          onChange: (p, size) => {
            setPage(size !== pageSize ? 1 : p)
            setPageSize(size)
          },
        }}
      />
      <MovementDetailModal movementId={detailId} onClose={() => setDetailId(null)} />
    </>
  )
}
