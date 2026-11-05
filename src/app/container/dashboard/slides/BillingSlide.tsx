"use client"

import { useMemo } from "react"
import { CheckCircleFilled, ClockCircleFilled, ExclamationCircleFilled } from "@ant-design/icons"
import { useGetAllElectronicInvoices } from "@/core/hooks/care/billing/useGetAllElectronicInvoices"
import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import { useAppTheme } from "@/themes/antdTheme"
import { Panel, QueryState } from "../sections/Panel"
import { MonthlyColumns } from "../charts/MonthlyColumns"
import { HBars, SegmentedBar } from "../charts/Bars"
import { SERIES_COLOR, countBy, formatNumber, lastMonths, monthKey, toTitleCase } from "../utils"
import styles from "../dashboard.module.scss"

const MAX_BARS = 5

// La DIAN responde "00 - Procesado Correctamente…" cuando autoriza. Sin respuesta, el
// listado trae " - " o nada. Cualquier otro código es una respuesta distinta a revisar.
type DianStatus = "authorized" | "pending" | "other"
function dianStatus(state?: string | null): DianStatus {
  const s = (state ?? "").replace(/[\s-]/g, "")
  if (!s) return "pending"
  return (state ?? "").trim().startsWith("00") ? "authorized" : "other"
}

const STATUS = {
  authorized: { label: "Autorizadas", color: "#2e9a4c", icon: <CheckCircleFilled /> },
  pending: { label: "Sin respuesta registrada", color: "#c98500", icon: <ClockCircleFilled /> },
  other: { label: "Con otra respuesta", color: "#c9302c", icon: <ExclamationCircleFilled /> },
}

interface Props {
  now: Date
  cycle: number
  showPending: boolean
}

// Vista 3: facturación electrónica.
export function BillingSlide({ now, cycle, showPending }: Props) {
  const query = useGetAllElectronicInvoices()
  const { theme } = useAppTheme()
  const color = theme === "dark" ? SERIES_COLOR.dark : SERIES_COLOR.light
  const months = useMemo(() => lastMonths(now, 6), [now])

  const stats = useMemo(() => {
    const list = query.data ?? []
    const perMonth = countBy(list, (i) => monthKey(i.createdAt))
    const values = months.map((m) => perMonth.get(m.key) ?? 0)
    const status = countBy(list, (i) => dianStatus(i.stateDian))
    const insurers = [...countBy(list, (i) => toTitleCase(i.insurerName) || "Sin aseguradora").entries()].sort(
      (a, b) => b[1] - a[1]
    )
    const rest = insurers.slice(MAX_BARS).reduce((acc, [, v]) => acc + v, 0)
    return {
      total: list.length,
      values,
      thisMonth: values[values.length - 1],
      lastMonth: values[values.length - 2],
      authorized: status.get("authorized") ?? 0,
      status,
      byInsurer: [
        ...insurers.slice(0, MAX_BARS).map(([label, value]) => ({ label, value })),
        ...(rest > 0 ? [{ label: "Otras", value: rest }] : []),
      ],
    }
  }, [query.data, months])

  const current = months[months.length - 1]
  const previous = months[months.length - 2]
  const range = `de ${months[0].month} a ${current.long}`

  return (
    <div className={styles.slideStack}>
      <section className={styles.setup} aria-label="Resumen de facturación">
        <ul className={styles.setupList}>
          <Fact label={`Emitidas en ${current.month}`} query={query} value={stats.thisMonth} />
          <Fact label={`Emitidas en ${previous.month}`} query={query} value={stats.lastMonth} />
          <Fact
            label="Autorizadas por la DIAN"
            query={query}
            value={stats.authorized}
            detail={`de ${formatNumber(stats.total)}`}
          />
          {showPending && <PendingFact />}
        </ul>
      </section>

      <div className={styles.chartLayout}>
        <Panel title="Facturas emitidas por mes" link={{ href: "/billing/electronicInvoices", label: "Ver facturas" }}>
          <QueryState {...query} what="las facturas" rows={6}>
            <p className={styles.chartSummary}>
              {stats.values.some(Boolean)
                ? `${formatNumber(stats.values.reduce((a, b) => a + b, 0))} facturas ${range}.`
                : `No hay facturas emitidas ${range}.`}
            </p>
            <MonthlyColumns
              key={cycle}
              months={months}
              series={[{ label: "Facturas", color, values: stats.values }]}
              unit={["factura", "facturas"]}
              ariaLabel={`Facturas electrónicas emitidas por mes, ${range}`}
              height={260}
            />
          </QueryState>
        </Panel>

        <div className={styles.slideStack}>
          <Panel title="Estado ante la DIAN">
            <QueryState {...query} what="las facturas">
              {stats.total === 0 ? (
                <p className={styles.emptyText}>Aún no hay facturas electrónicas.</p>
              ) : (
                <SegmentedBar
                  key={cycle}
                  unit={["factura", "facturas"]}
                  segments={(Object.keys(STATUS) as DianStatus[]).map((k) => ({
                    ...STATUS[k],
                    value: stats.status.get(k) ?? 0,
                  }))}
                />
              )}
            </QueryState>
          </Panel>
          <Panel title="Facturas por aseguradora">
            <QueryState {...query} what="las facturas">
              {stats.total === 0 ? (
                <p className={styles.emptyText}>Aún no hay facturas electrónicas.</p>
              ) : (
                <HBars key={cycle} items={stats.byInsurer} color={color} unit={["factura", "facturas"]} />
              )}
            </QueryState>
          </Panel>
        </div>
      </div>
    </div>
  )
}

// Va aparte para no pedir las admisiones si el rol no puede abrir facturación integral.
function PendingFact() {
  const pending = useActiveAdmissions()
  return <Fact label="Admisiones por facturar" query={pending} value={pending.data?.length ?? 0} />
}

interface FactProps {
  label: string
  value: number
  detail?: string
  query: { isLoading: boolean; isError: boolean; isFetching: boolean; refetch: () => void }
}

function Fact({ label, value, detail, query }: FactProps) {
  return (
    <li className={styles.setupItem}>
      <span className={styles.factLabel}>{label}</span>
      <div className={styles.setupBody}>
        {query.isLoading ? (
          <span className={styles.setupDetail}>Cargando…</span>
        ) : query.isError ? (
          <span className={styles.setupDetail}>
            No se pudo cargar.{" "}
            <button type="button" className={styles.linkButton} onClick={() => query.refetch()}>
              Reintentar
            </button>
          </span>
        ) : (
          <>
            <span className={styles.setupValue}>{formatNumber(value)}</span>
            {detail && <span className={styles.setupDetail}>{detail}</span>}
          </>
        )}
      </div>
    </li>
  )
}
