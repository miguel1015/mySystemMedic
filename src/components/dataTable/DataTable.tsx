"use client"

import { Key, ReactNode, useEffect, useMemo, useState } from "react"
import { Alert, Button, Input, Pagination, Select, Skeleton, Table } from "antd"
import type { ColumnsType, TableProps } from "antd/es/table"
import { InboxOutlined, SearchOutlined } from "@ant-design/icons"
import styles from "./dataTable.module.scss"

export interface QuickFilter<T> {
  key: string
  placeholder: string
  getValue: (row: T) => string | null | undefined
  // Cómo mostrar cada opción (p. ej. "NUEVA EPS S.A" -> "Nueva EPS S.A").
  formatLabel?: (value: string) => string
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnsType<T>
  rowKey: keyof T & string
  // Nombre de lo que lista la tabla, para conteos y mensajes: ["paciente", "pacientes"].
  entity: [string, string]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  searchPlaceholder?: string
  // Texto en el que busca cada fila. Sin esto no hay buscador.
  searchText?: (row: T) => string
  quickFilters?: QuickFilter<T>[]
  // Agrega la columna "#" con numeración continua entre páginas.
  rowNumbers?: boolean
  // Clic (o Enter) en la fila. Los botones de la fila no la disparan.
  onRowClick?: (row: T) => void
  // Acción del estado vacío: "Registrar el primer paciente".
  emptyAction?: { label: string; onClick: () => void }
  // Vista en celular (< 768 px): una tarjeta por fila en lugar de la tabla.
  renderCard?: (row: T) => ReactNode
  pageSize?: number
}

// Búsqueda sin tildes ni mayúsculas. Los puntos de miles se ignoran, así "1.952" encuentra
// el documento 1952654.
const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function useIsNarrow(maxWidth = 767.98) {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const update = () => setNarrow(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [maxWidth])
  return narrow
}

/**
 * Tabla común del sistema sobre antd Table: barra con buscador y filtros, conteo,
 * numeración continua, estados de carga / vacío / sin resultados / error, filas
 * clicables con teclado y tarjetas en celular. Cada vista solo define sus columnas.
 */
export default function DataTable<T extends object>({
  data,
  columns,
  rowKey,
  entity,
  loading,
  error,
  onRetry,
  searchPlaceholder,
  searchText,
  quickFilters = [],
  rowNumbers,
  onRowClick,
  emptyAction,
  renderCard,
  pageSize: initialPageSize = 10,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string | undefined>>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const narrow = useIsNarrow()

  // Opciones de cada filtro rápido a partir de los datos, ordenadas.
  const filterOptions = useMemo(
    () =>
      quickFilters.map((f) => {
        const values = Array.from(
          new Set(data.map((row) => f.getValue(row)).filter((v): v is string => !!v)),
        )
        return values
          .map((v) => ({ value: v, label: f.formatLabel ? f.formatLabel(v) : v }))
          .sort((a, b) => a.label.localeCompare(b.label, "es"))
      }),
    [data, quickFilters],
  )

  const filtered = useMemo(() => {
    const q = fold(query.trim())
    const qDigits = q.replace(/[.\s]/g, "")
    return data.filter((row) => {
      for (const f of quickFilters) {
        const wanted = filterValues[f.key]
        if (wanted && f.getValue(row) !== wanted) return false
      }
      if (!q || !searchText) return true
      const text = fold(searchText(row))
      return text.includes(q) || (qDigits.length > 0 && text.replace(/[.\s]/g, "").includes(qDigits))
    })
  }, [data, query, filterValues, quickFilters, searchText])

  // Cualquier cambio de búsqueda o filtro vuelve a la página 1.
  useEffect(() => setPage(1), [query, filterValues])

  // Si se borra el último registro de la última página, no quedarse en una página vacía.
  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, lastPage)

  const activeFilters = Object.values(filterValues).filter(Boolean).length + (query.trim() ? 1 : 0)
  const clearAll = () => {
    setQuery("")
    setFilterValues({})
  }

  const allColumns: ColumnsType<T> = rowNumbers
    ? [
        {
          title: "#",
          key: "__rowNumber",
          width: 56,
          align: "center",
          className: styles.numberCell,
          render: (_v, _r, index) => (current - 1) * pageSize + index + 1,
        },
        ...columns,
      ]
    : columns

  const onRow: TableProps<T>["onRow"] = onRowClick
    ? (record) => ({
        onClick: (e) => {
          // Los controles de la fila (botones, menús, enlaces) tienen su propia acción.
          if ((e.target as HTMLElement).closest("button, a, .ant-dropdown, input")) return
          onRowClick(record)
        },
        onKeyDown: (e) => {
          if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(record)
        },
        tabIndex: 0,
      })
    : undefined

  const [singular, plural] = entity
  // El total ya lo muestra el encabezado de la página: aquí solo aparece al filtrar.
  const countLabel =
    activeFilters > 0
      ? `${filtered.length.toLocaleString("es-CO")} de ${data.length.toLocaleString("es-CO")} ${plural}`
      : ""

  // ── Estados ──
  const emptyState =
    data.length === 0 ? (
      <div className={styles.empty}>
        <InboxOutlined className={styles.emptyIcon} aria-hidden />
        <p className={styles.emptyTitle}>Aún no hay {plural} registrados.</p>
        {emptyAction && (
          <Button type="primary" onClick={emptyAction.onClick}>
            {emptyAction.label}
          </Button>
        )}
      </div>
    ) : (
      <div className={styles.empty}>
        <SearchOutlined className={styles.emptyIcon} aria-hidden />
        <p className={styles.emptyTitle}>
          {query.trim()
            ? `Ningún ${singular} coincide con “${query.trim()}”.`
            : `Ningún ${singular} cumple los filtros elegidos.`}
        </p>
        <Button onClick={clearAll}>Limpiar búsqueda y filtros</Button>
      </div>
    )

  const toolbar = (
    <div className={styles.toolbar}>
      {searchText && (
        <Input
          className={styles.search}
          placeholder={searchPlaceholder ?? `Buscar ${plural}…`}
          prefix={<SearchOutlined aria-hidden />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          allowClear
          aria-label={searchPlaceholder ?? `Buscar ${plural}`}
        />
      )}
      {quickFilters.map((f, i) => (
        <Select
          key={f.key}
          className={styles.filter}
          placeholder={f.placeholder}
          aria-label={f.placeholder}
          allowClear
          showSearch
          optionFilterProp="label"
          value={filterValues[f.key]}
          onChange={(v) => setFilterValues((prev) => ({ ...prev, [f.key]: v ?? undefined }))}
          options={filterOptions[i]}
          popupMatchSelectWidth={false}
        />
      ))}
      <span className={styles.count} role="status">
        {!loading && !error && countLabel}
        {activeFilters > 0 && (
          <Button type="link" size="small" onClick={clearAll} className={styles.clear}>
            Limpiar
          </Button>
        )}
      </span>
    </div>
  )

  if (error) {
    return (
      <div className={styles.root}>
        {toolbar}
        <Alert
          type="warning"
          showIcon
          message={`No se pudieron cargar los ${plural}`}
          description="Revisa tu conexión e inténtalo de nuevo."
          action={onRetry && <Button onClick={onRetry}>Reintentar</Button>}
        />
      </div>
    )
  }

  if (loading) {
    // Filas fantasma con la forma de la tabla: la página no salta al terminar de cargar.
    return (
      <div className={styles.root} aria-busy="true">
        {toolbar}
        <div className={styles.skeleton}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow}>
              <Skeleton.Avatar active size={34} />
              <Skeleton active title={false} paragraph={{ rows: 2, width: ["45%", "25%"] }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize)

  return (
    <div className={styles.root}>
      {toolbar}

      {narrow && renderCard ? (
        <>
          {filtered.length === 0 ? (
            emptyState
          ) : (
            <ul className={styles.cards}>
              {pageRows.map((row) => (
                <li
                  key={String(row[rowKey] as Key)}
                  className={`${styles.card} ${onRowClick ? styles.cardClickable : ""}`}
                  {...(onRow ? onRow(row) : {})}
                >
                  {renderCard(row)}
                </li>
              ))}
            </ul>
          )}
          {filtered.length > pageSize && (
            <Pagination
              className={styles.cardPagination}
              simple
              current={current}
              pageSize={pageSize}
              total={filtered.length}
              onChange={setPage}
            />
          )}
        </>
      ) : (
        <Table<T>
          className={styles.table}
          columns={allColumns}
          dataSource={filtered}
          rowKey={rowKey}
          size="middle"
          rowClassName={() => (onRowClick ? styles.rowClickable : "")}
          onRow={onRow}
          locale={{ emptyText: emptyState }}
          scroll={{ x: "max-content" }}
          pagination={
            filtered.length > 0 && {
              current,
              pageSize,
              total: filtered.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              locale: { items_per_page: "/ página" },
              showTotal: (total, range) => `${range[0]}–${range[1]} de ${total.toLocaleString("es-CO")}`,
              onChange: (p, size) => {
                setPage(size !== pageSize ? 1 : p)
                setPageSize(size)
              },
            }
          }
        />
      )}
    </div>
  )
}
