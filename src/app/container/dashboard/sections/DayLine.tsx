"use client"

import { useMemo } from "react"
import { Tooltip } from "antd"
import { useGetAllTriages } from "@/core/hooks/care/triage/useGetAllTriages"
import { TriagePriority } from "@/core/interfaces/care/types"
import { Panel, QueryState } from "./Panel"
import { TRIAGE_LEVELS, formatNumber, formatTime, isSameDay } from "../utils"
import styles from "../dashboard.module.scss"

const HOUR_MARKS = [0, 6, 12, 18, 24]
const MINUTES_IN_DAY = 24 * 60

const colorOf = (p: TriagePriority) => TRIAGE_LEVELS.find((t) => t.level === p)?.color

// Línea del día: cada triage de hoy es una marca en la hora en que se hizo, con el color
// de su nivel. Debajo, el conteo por nivel (I a V).
export function DayLine({ now }: { now: Date }) {
  const { data, isLoading, isError, isFetching, refetch } = useGetAllTriages()

  const today = useMemo(() => {
    return (data ?? [])
      .map((t) => ({ ...t, date: new Date(t.fechaHora) }))
      .filter((t) => !isNaN(t.date.getTime()) && isSameDay(t.date, now))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [data, now])

  const counts = useMemo(() => {
    const acc: Record<string, number> = {}
    today.forEach((t) => (acc[t.prioridad] = (acc[t.prioridad] ?? 0) + 1))
    return acc
  }, [today])

  const nowPct = ((now.getHours() * 60 + now.getMinutes()) / MINUTES_IN_DAY) * 100
  const urgent = (counts.I ?? 0) + (counts.II ?? 0)

  const summary =
    today.length === 0
      ? "Aún no hay triages registrados hoy."
      : `${formatNumber(today.length)} ${today.length === 1 ? "triage" : "triages"} hoy` +
        (urgent > 0 ? `, ${formatNumber(urgent)} de nivel I o II.` : ".")

  return (
    <Panel title="Hoy en la clínica" link={{ href: "/care/triage", label: "Ver triages" }} className={styles.dayPanel}>
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        refetch={refetch}
        what="los triages de hoy"
        rows={4}
      >
        <p className={styles.daySummary}>{summary}</p>

        <div className={styles.track} role="img" aria-label={`Línea del día: ${summary}`}>
          <div className={styles.trackElapsed} style={{ width: `${nowPct}%` }} />
          {HOUR_MARKS.map((h) => (
            <span key={h} className={styles.hourMark} style={{ left: `${(h / 24) * 100}%` }}>
              <span className={styles.hourLabel}>{h === 24 ? "24 h" : `${h}`}</span>
            </span>
          ))}
          {today.map((t) => {
            const minutes = t.date.getHours() * 60 + t.date.getMinutes()
            return (
              <Tooltip key={t.id} title={`${formatTime(t.date)}, triage ${t.prioridad}`}>
                <span
                  className={styles.tick}
                  style={{
                    left: `${(minutes / MINUTES_IN_DAY) * 100}%`,
                    background: colorOf(t.prioridad),
                  }}
                />
              </Tooltip>
            )
          })}
          <span className={styles.nowMarker} style={{ left: `${nowPct}%` }}>
            <span className={styles.nowLabel}>{formatTime(now)}</span>
          </span>
        </div>

        <ul className={styles.levels}>
          {TRIAGE_LEVELS.map(({ level, label, color }) => (
            <li key={level} className={styles.level}>
              <span className={styles.levelSwatch} style={{ background: color }} aria-hidden />
              <span className={styles.levelName}>
                <strong>{level}</strong> {label}
              </span>
              <span className={styles.levelCount}>{formatNumber(counts[level] ?? 0)}</span>
            </li>
          ))}
        </ul>
      </QueryState>
    </Panel>
  )
}
