"use client"

import Link from "next/link"
import { ReactNode, useMemo } from "react"
import { Button } from "antd"
import { useContracts } from "@/core/hooks/parameterization/contracts/useGetAllContracts"
import { useMedicines } from "@/core/hooks/parameterization/medicines/useGetAllMedicines"
import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs"
import { formatNumber, useIsSlow } from "../utils"
import styles from "../dashboard.module.scss"

const DAY_MS = 24 * 60 * 60 * 1000
// El listado de contratos solo trae la descripción del estado ("ACTIVO", "SUSPENDIDO"…).
const isActive = (c: { contractStatusDescription?: string; contractStatusId?: number }) =>
  c.contractStatusDescription?.trim().toUpperCase() === "ACTIVO" || c.contractStatusId === 1

interface ItemProps {
  href: string
  title: string
  query: { isLoading: boolean; isError: boolean; isFetching: boolean; refetch: () => void }
  value?: number
  detail?: ReactNode
}

function SetupItem({ href, title, query, value, detail }: ItemProps) {
  const slow = useIsSlow(query.isLoading)

  let body: ReactNode
  if (query.isLoading) {
    body = <span className={styles.setupDetail}>{slow ? "El servidor está iniciando…" : "Cargando…"}</span>
  } else if (query.isError) {
    body = (
      <span className={styles.setupDetail}>
        No se pudo cargar.{" "}
        <Button type="link" size="small" className={styles.inlineRetry} onClick={() => query.refetch()} loading={query.isFetching}>
          Reintentar
        </Button>
      </span>
    )
  } else {
    body = (
      <>
        <span className={styles.setupValue}>{formatNumber(value ?? 0)}</span>
        {detail && <span className={styles.setupDetail}>{detail}</span>}
      </>
    )
  }

  return (
    <li className={styles.setupItem}>
      <Link href={href} className={styles.setupTitle}>
        {title}
      </Link>
      <div className={styles.setupBody}>{body}</div>
    </li>
  )
}

export function ContractsItem({ now }: { now: Date }) {
  const query = useContracts()
  const { active, expiring } = useMemo(() => {
    const list = query.data ?? []
    const limit = now.getTime() + 30 * DAY_MS
    return {
      active: list.filter(isActive).length,
      expiring: list.filter((c) => {
        if (!c.endDate || !isActive(c)) return false
        const end = new Date(c.endDate).getTime()
        return end >= now.getTime() && end <= limit
      }).length,
    }
  }, [query.data, now])

  return (
    <SetupItem
      href="/parameterization/contracts"
      title="Contratos"
      query={query}
      value={query.data?.length}
      detail={
        <>
          {formatNumber(active)} activos
          {expiring > 0 && <span className={styles.setupWarn}>, {formatNumber(expiring)} vencen en 30 días</span>}
        </>
      }
    />
  )
}

export function MedicinesItem() {
  const query = useMedicines()
  return <SetupItem href="/parameterization/medicines" title="Medicamentos" query={query} value={query.data?.length} detail="registrados" />
}

export function TariffsItem() {
  const query = useTariffs()
  return <SetupItem href="/parameterization/tariffs" title="Tarifarios" query={query} value={query.data?.length} detail="configurados" />
}
