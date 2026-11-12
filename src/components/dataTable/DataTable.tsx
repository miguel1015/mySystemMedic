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
  // Orden fijo de las opciones (p. ej. rangos de días); sin esto van en orden alfabético.
  order?: string[]
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnsType<T>
  rowKey: keyof T & string
  // Nombre de lo que lista la tabla, para conteos y mensajes: ["paciente", "pacientes"].
  entity: [string, string]
  // Género gramatical de la entidad, para "Ninguna admisión…" / "aseguradoras registradas".
  feminine?: boolean
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
  // Mensaje cuando no hay datos (sin filtros). Por defecto: "Aún no hay pacientes registrados."
  emptyText?: string
  // Vista en celular (< 768 px): una tarjeta por fila en lugar de la tabla.
  renderCard?: (row: T) => ReactNode
  pageSize?: number
  // Guarda búsqueda, filtros, página y tamaño en la URL (?q=…&eps=…&page=2): al volver o
  // compartir el enlace la tabla queda igual.
  syncUrl?: boolean
}

const PAGE_SIZES = [10, 20, 50]

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
  feminine,
  loading,
  error,
  onRetry,
  searchPlaceholder,
  searchText,
  quickFilters = [],
  rowNumbers,
  onRowClick,
  emptyAction,
  emptyText,
  renderCard,
  pageSize: initialPageSize = 10,
  syncUrl,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string | undefined>>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const narrow = useIsNarrow()
  // Con syncUrl, la URL solo se escribe después de leerla, para no borrarla al montar.
  const [urlRead, setUrlRead] = useState(!syncUrl)

  useEffect(() => {
    if (!syncUrl) return
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get("q") ?? "")
    const values: Record<string, string | undefined> = {}
    for (const f of quickFilters) {
      const v = params.get(f.key)
      if (v) values[f.key] = v
    }
    setFilterValues(values)
    const size = Number(params.get("size"))
    if (PAGE_SIZES.includes(size)) setPageSize(size)
    const p = Number(params.get("page"))
    if (Number.isInteger(p) && p > 1) setPage(p)
    setUrlRead(true)
    // Solo al montar: después la tabla es la dueña del estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl])

  // Opciones de cada filtro rápido a partir de los datos, ordenadas.
  const filterOptions = useMemo(
    () =>
      quickFilters.map((f) => {
        const values = Array.from(
          new Set(data.map((row) => f.getValue(row)).filter((v): v is string => !!v)),
        )
        return values
          .map((v) => ({ value: v, label: f.formatLabel ? f.formatLabel(v) : v }))
          .sort((a, b) => {
            if (f.order) {
              const rank = (v: string) => (f.order!.indexOf(v) + 1 || f.order!.length + 1)
              return rank(a.value) - rank(b.value)
            }
            return a.label.localeCompare(b.label, "es")
          })
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

  // Si se borra el último registro de la última página, no quedarse en una página vacía.
  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, lastPage)

  useEffect(() => {
    if (!syncUrl || !urlRead) return
    const params = new URLSearchParams(window.location.search)
    const put = (key: string, value: string | undefined) =>
      value ? params.set(key, value) : params.delete(key)
    put("q", query.trim() || undefined)
    for (const f of quickFilters) put(f.key, filterValues[f.key])
    // Mientras cargan los datos aún no se sabe cuántas páginas hay: se respeta la pedida.
    const shownPage = loading ? page : current
    put("page", shownPage > 1 ? String(shownPage) : undefined)
    put("size", pageSize !== initialPageSize ? String(pageSize) : undefined)
    const qs = params.toString()
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url)
    }
    // quickFilters cambia de identidad en cada render; sus claves no.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, urlRead, query, filterValues, page, current, pageSize, initialPageSize, loading])

  const activeFilters = Object.values(filterValues).filter(Boolean).length + (query.trim() ? 1 : 0)
  // Cualquier cambio de búsqueda o filtro vuelve a la página 1.
  const changeQuery = (value: string) => {
    setQuery(value)
    setPage(1)
  }
  const changeFilter = (key: string, value: string | undefined) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }
  const clearAll = () => {
    setQuery("")
    setFilterValues({})
    setPage(1)
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
  const none = feminine ? "Ninguna" : "Ningún"
  const registered = feminine ? "registradas" : "registrados"
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
        <p className={styles.emptyTitle}>{emptyText ?? `Aún no hay ${plural} ${registered}.`}</p>
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
            ? `${none} ${singular} coincide con “${query.trim()}”.`
            : `${none} ${singular} cumple los filtros elegidos.`}
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
          onChange={(e) => changeQuery(e.target.value)}
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
          onChange={(v) => changeFilter(f.key, v ?? undefined)}
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
              pageSizeOptions: PAGE_SIZES.map(String),
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
