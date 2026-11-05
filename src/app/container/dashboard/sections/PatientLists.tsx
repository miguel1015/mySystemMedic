"use client"

import { useMemo } from "react"
import { useOngoingAttentions } from "@/core/hooks/care/admissions/useGetOngoingAttentions"
import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import { Panel, QueryState } from "./Panel"
import { elapsedSince, formatNumber, toDisplayName, toSentenceCase } from "../utils"
import styles from "../dashboard.module.scss"

const MAX_ROWS = 6

interface Row {
  id: number
  name: string
  scope: string
  since: string
}

function PatientRows({ rows, now, emptyText }: { rows: Row[]; now: Date; emptyText: string }) {
  if (rows.length === 0) return <p className={styles.emptyText}>{emptyText}</p>

  return (
    <ul className={styles.rows}>
      {rows.slice(0, MAX_ROWS).map((r) => (
        <li key={r.id} className={styles.row}>
          <span className={styles.rowName} title={toDisplayName(r.name)}>
            {toDisplayName(r.name)}
          </span>
          <span className={styles.rowScope}>{toSentenceCase(r.scope) || "Sin ámbito"}</span>
          <span className={styles.rowTime}>{elapsedSince(r.since, now)}</span>
        </li>
      ))}
    </ul>
  )
}

// Más antiguos primero: son los que más esperan.
const byOldest = (a: Row, b: Row) => new Date(a.since).getTime() - new Date(b.since).getTime()

export function OngoingCare({ now }: { now: Date }) {
  const { data, isLoading, isError, isFetching, refetch } = useOngoingAttentions()

  const rows = useMemo<Row[]>(
    () =>
      (data ?? [])
        .map((a) => ({ id: a.admissionId, name: a.patientFullName, scope: a.careScope, since: a.admissionDate }))
        .sort(byOldest),
    [data]
  )

  return (
    <Panel
      title={rows.length ? `En atención ahora (${formatNumber(rows.length)})` : "En atención ahora"}
      link={{ href: "/care/ongoingCare", label: "Ver todas" }}
    >
      <QueryState isLoading={isLoading} isError={isError} isFetching={isFetching} refetch={refetch} what="las atenciones en curso">
        <PatientRows rows={rows} now={now} emptyText="No hay pacientes en atención en este momento." />
      </QueryState>
    </Panel>
  )
}

export function PendingBilling({ now }: { now: Date }) {
  const { data, isLoading, isError, isFetching, refetch } = useActiveAdmissions()

  const rows = useMemo<Row[]>(
    () =>
      (data ?? [])
        .map((a) => ({ id: a.id, name: a.patientFullName, scope: a.careScope, since: a.admissionDate }))
        .sort(byOldest),
    [data]
  )

  return (
    <Panel
      title={rows.length ? `Por facturar (${formatNumber(rows.length)})` : "Por facturar"}
      link={{ href: "/billing/admissionIntegral", label: "Ir a facturación" }}
    >
      <QueryState isLoading={isLoading} isError={isError} isFetching={isFetching} refetch={refetch} what="las admisiones por facturar">
        <PatientRows rows={rows} now={now} emptyText="Todas las admisiones activas están facturadas." />
      </QueryState>
    </Panel>
  )
}
