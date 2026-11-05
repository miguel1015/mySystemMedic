"use client"

import { useMemo } from "react"
import { useGetAllTriages } from "@/core/hooks/care/triage/useGetAllTriages"
import { useGetAllAdmissions } from "@/core/hooks/care/admissions/useGetAllAdmissions"
import { useOngoingAttentions } from "@/core/hooks/care/admissions/useGetOngoingAttentions"
import { Heatmap } from "../charts/Heatmap"
import { useAppTheme } from "@/themes/antdTheme"
import { Panel, QueryState } from "../sections/Panel"
import { MonthlyColumns } from "../charts/MonthlyColumns"
import { HBars } from "../charts/Bars"
import {
  SERIES_COLOR,
  TRIAGE_LEVELS,
  countBy,
  formatNumber,
  lastMonths,
  monthKey,
  toSentenceCase,
  toTitleCase,
} from "../utils"
import styles from "../dashboard.module.scss"

const MAX_BARS = 5

interface Props {
  now: Date
  cycle: number
  showTriage: boolean
  showAdmissions: boolean
  showOngoing: boolean
}

// Vista 2: tendencias clínicas.
export function ClinicalSlide({ now, cycle, showTriage, showAdmissions, showOngoing }: Props) {
  const bottom = showTriage || showOngoing
  return (
    <div className={styles.slideStack}>
      <div className={showTriage && showAdmissions ? styles.chartLayout : styles.slideStack}>
        {showTriage && <TriagesByMonth now={now} cycle={cycle} />}
        {showAdmissions && (
          <div className={styles.slideStack}>
            <AdmissionsBreakdown cycle={cycle} />
          </div>
        )}
      </div>
      {bottom && (
        <div className={showTriage && showOngoing ? styles.chartLayout : styles.slideStack}>
          {showTriage && <TriageHours now={now} cycle={cycle} />}
          {showOngoing && <StayLength now={now} cycle={cycle} />}
        </div>
      )}
    </div>
  )
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const WEEKDAYS_LONG = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const SLOT_HOURS = 2
const SLOTS = Array.from({ length: 24 / SLOT_HOURS }, (_, i) => i * SLOT_HOURS)

// Mapa de calor: en qué días y horas llegan más pacientes a triage (últimos 6 meses).
function TriageHours({ now, cycle }: { now: Date; cycle: number }) {
  const query = useGetAllTriages()

  const { grid, total, peak } = useMemo(() => {
    const from = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime()
    const grid = WEEKDAYS.map(() => SLOTS.map(() => 0))
    let total = 0
    ;(query.data ?? []).forEach((t) => {
      const d = new Date(t.fechaHora)
      if (isNaN(d.getTime()) || d.getTime() < from || d.getTime() > now.getTime()) return
      const day = (d.getDay() + 6) % 7 // lunes = 0
      grid[day][Math.floor(d.getHours() / SLOT_HOURS)]++
      total++
    })
    let peak = { r: 0, c: 0, v: 0 }
    grid.forEach((row, r) => row.forEach((v, c) => v > peak.v && (peak = { r, c, v })))
    return { grid, total, peak }
  }, [query.data, now])

  const slotLabel = (c: number) => `${SLOTS[c]} a ${SLOTS[c] + SLOT_HOURS} h`

  return (
    <Panel title="Horas con más triages" link={{ href: "/care/triage", label: "Ver triages" }}>
      <QueryState {...query} what="los triages" rows={5}>
        <p className={styles.chartSummary}>
          {total === 0
            ? "No hay triages en los últimos 6 meses."
            : `La franja con más llegadas es ${WEEKDAYS_LONG[peak.r].toLowerCase()} de ${slotLabel(peak.c)} ` +
              `(${formatNumber(peak.v)} de ${formatNumber(total)} triages en los últimos 6 meses).`}
        </p>
        <Heatmap
          key={cycle}
          rows={WEEKDAYS}
          cols={SLOTS.map((h) => `${h}`)}
          values={grid}
          describe={(r, c, v) =>
            `${WEEKDAYS_LONG[r]}, ${slotLabel(c)}: ${formatNumber(v)} ${v === 1 ? "triage" : "triages"}`
          }
        />
      </QueryState>
    </Panel>
  )
}

const STAY_BUCKETS: { label: string; maxDays: number }[] = [
  { label: "Menos de 1 día", maxDays: 1 },
  { label: "1 a 7 días", maxDays: 8 },
  { label: "8 a 30 días", maxDays: 31 },
  { label: "1 a 6 meses", maxDays: 183 },
  { label: "Más de 6 meses", maxDays: Infinity },
]

// Cuánto llevan los pacientes en atención. Las estancias muy largas suelen ser
// admisiones que no se cerraron.
function StayLength({ now, cycle }: { now: Date; cycle: number }) {
  const query = useOngoingAttentions()
  const { theme } = useAppTheme()
  const color = theme === "dark" ? SERIES_COLOR.dark : SERIES_COLOR.light

  const { items, total, long } = useMemo(() => {
    const counts = STAY_BUCKETS.map(() => 0)
    ;(query.data ?? []).forEach((a) => {
      const start = new Date(a.admissionDate).getTime()
      if (isNaN(start)) return
      const days = (now.getTime() - start) / 86_400_000
      counts[STAY_BUCKETS.findIndex((b) => days < b.maxDays)]++
    })
    return {
      items: STAY_BUCKETS.map((b, i) => ({ label: b.label, value: counts[i] })),
      total: counts.reduce((a, b) => a + b, 0),
      long: counts[counts.length - 1],
    }
  }, [query.data, now])

  return (
    <Panel title="Tiempo en atención" link={{ href: "/care/ongoingCare", label: "Ver atenciones" }}>
      <QueryState {...query} what="las atenciones en curso">
        {total === 0 ? (
          <p className={styles.emptyText}>No hay pacientes en atención en este momento.</p>
        ) : (
          <>
            <p className={styles.chartSummary}>
              {long > 0
                ? `${formatNumber(long)} de ${formatNumber(total)} pacientes llevan más de 6 meses en atención. Revisa si sus admisiones deben cerrarse.`
                : `${formatNumber(total)} pacientes en atención, ninguno con más de 6 meses.`}
            </p>
            <HBars key={cycle} items={items} color={color} unit={["paciente", "pacientes"]} />
          </>
        )}
      </QueryState>
    </Panel>
  )
}

function TriagesByMonth({ now, cycle }: { now: Date; cycle: number }) {
  const query = useGetAllTriages()
  const months = useMemo(() => lastMonths(now, 6), [now])

  const { series, total, peak } = useMemo(() => {
    const keys = months.map((m) => m.key)
    const series = TRIAGE_LEVELS.map(({ level, label, color }) => ({
      label: `${level} ${label}`,
      color,
      values: keys.map(
        (k) => (query.data ?? []).filter((t) => t.prioridad === level && monthKey(t.fechaHora) === k).length
      ),
    }))
    const totals = keys.map((_, i) => series.reduce((acc, s) => acc + s.values[i], 0))
    const total = totals.reduce((a, b) => a + b, 0)
    const peakIndex = totals.indexOf(Math.max(...totals))
    return { series, total, peak: total > 0 ? { month: months[peakIndex].month, value: totals[peakIndex] } : null }
  }, [query.data, months])

  const range = `de ${months[0].month} a ${months[months.length - 1].long}`
  const summary =
    total === 0
      ? `No hay triages registrados ${range}.`
      : `${formatNumber(total)} ${total === 1 ? "triage" : "triages"} ${range}. ` +
        `${peak!.month.charAt(0).toUpperCase() + peak!.month.slice(1)} fue el mes con más (${formatNumber(peak!.value)}).`

  return (
    <Panel title="Triages por mes" link={{ href: "/care/triage", label: "Ver triages" }}>
      <QueryState {...query} what="los triages" rows={6}>
        <p className={styles.chartSummary}>{summary}</p>
        <ul className={styles.legend} aria-label="Niveles de triage">
          {TRIAGE_LEVELS.map(({ level, label, color }) => (
            <li key={level}>
              <span className={styles.legendSwatch} style={{ background: color }} aria-hidden />
              <strong>{level}</strong> {label}
            </li>
          ))}
        </ul>
        <MonthlyColumns
          key={cycle}
          months={months}
          series={series}
          unit={["triage", "triages"]}
          ariaLabel={`Triages por mes y nivel, ${range}`}
          height={260}
        />
      </QueryState>
    </Panel>
  )
}

function AdmissionsBreakdown({ cycle }: { cycle: number }) {
  const query = useGetAllAdmissions()
  const { theme } = useAppTheme()
  const color = theme === "dark" ? SERIES_COLOR.dark : SERIES_COLOR.light

  const { byScope, byInsurer, total } = useMemo(() => {
    const active = (query.data ?? []).filter((a) => a.isActive !== false)
    const top = (map: Map<string, number>) => {
      const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
      const head = sorted.slice(0, MAX_BARS).map(([label, value]) => ({ label, value }))
      const rest = sorted.slice(MAX_BARS).reduce((acc, [, v]) => acc + v, 0)
      return rest > 0 ? [...head, { label: "Otros", value: rest }] : head
    }
    return {
      total: active.length,
      byScope: top(countBy(active, (a) => toSentenceCase(a.careScopeName) || "Sin ámbito")),
      byInsurer: top(countBy(active, (a) => toTitleCase(a.epsNombre) || "Sin aseguradora")),
    }
  }, [query.data])

  const empty = <p className={styles.emptyText}>No hay admisiones activas.</p>

  return (
    <>
      <Panel
        title={total ? `Admisiones activas por ámbito (${formatNumber(total)})` : "Admisiones activas por ámbito"}
        link={{ href: "/care/admissions", label: "Ver admisiones" }}
      >
        <QueryState {...query} what="las admisiones">
          {total === 0 ? empty : <HBars key={cycle} items={byScope} color={color} unit={["admisión", "admisiones"]} />}
        </QueryState>
      </Panel>
      <Panel title="Admisiones activas por aseguradora">
        <QueryState {...query} what="las admisiones">
          {total === 0 ? empty : <HBars key={cycle} items={byInsurer} color={color} unit={["admisión", "admisiones"]} />}
        </QueryState>
      </Panel>
    </>
  )
}
