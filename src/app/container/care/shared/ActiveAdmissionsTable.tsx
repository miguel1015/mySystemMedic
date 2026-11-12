"use client"

import { Button, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import type { ReactNode } from "react"
import DataTable from "@/components/dataTable/DataTable"
import { PersonCell, formatDocument } from "@/components/dataTable/cells"
import cellStyles from "@/components/dataTable/dataTable.module.scss"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import {
  careScopeColor,
  careScopeKey,
  formatCatalogLabel,
  formatPersonName,
} from "@/core/utils/displayText"
import { STAY_BUCKETS, formatDateTime, formatStay, stayBucket } from "@/core/utils/date"

interface ActiveAdmissionsTableProps {
  data: ActiveAdmission[]
  loading: boolean
  isError?: boolean
  onRetry?: () => void
  // Qué se hace con el paciente (evolucionar, abrir la admisión integral, cargar cirugía…).
  onAction: (patient: ActiveAdmission) => void
  actionLabel: string
  actionIcon?: ReactNode
  // Búsqueda y filtros en la URL. Apagar si la vista ya usa la URL para otra cosa.
  syncUrl?: boolean
}

/** Pacientes con admisión activa: lista de entrada de evolución, admisión integral y cirugía. */
const ActiveAdmissionsTable = ({
  data,
  loading,
  isError,
  onRetry,
  onAction,
  actionLabel,
  actionIcon,
  syncUrl = true,
}: ActiveAdmissionsTableProps) => {
  const columns: ColumnsType<ActiveAdmission> = [
    {
      title: "Paciente",
      key: "patient",
      sorter: (a, b) => a.patientFullName.localeCompare(b.patientFullName, "es"),
      render: (_, r) => (
        <PersonCell name={formatPersonName(r.patientFullName)} detail={formatDocument(null, r.documentNumber)} />
      ),
    },
    {
      title: "Admisión",
      key: "admission",
      width: 190,
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime(),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.tabular}>{formatDateTime(r.admissionDate)}</span>
          <span className={cellStyles.personDetail}>N° {r.id}</span>
        </span>
      ),
    },
    {
      title: "Estancia",
      key: "stay",
      width: 110,
      render: (_, r) => <span className={cellStyles.tabular}>{formatStay(r.admissionDate) || "—"}</span>,
    },
    {
      title: "Ámbito",
      key: "scope",
      width: 170,
      render: (_, r) => <Tag color={careScopeColor(r.careScope)}>{formatCatalogLabel(r.careScope)}</Tag>,
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 170,
      align: "right",
      fixed: "right",
      render: (_, r) => (
        <Button
          icon={actionIcon}
          onClick={() => onAction(r)}
          aria-label={`${actionLabel}: ${formatPersonName(r.patientFullName)}`}
        >
          {actionLabel}
        </Button>
      ),
    },
  ]

  return (
    <DataTable<ActiveAdmission>
      data={data}
      columns={columns}
      rowKey="id"
      entity={["paciente", "pacientes"]}
      loading={loading}
      error={isError}
      onRetry={onRetry}
      emptyText="No hay pacientes con admisión activa."
      rowNumbers
      syncUrl={syncUrl}
      searchPlaceholder="Buscar por nombre, documento o N° de admisión…"
      searchText={(a) => `${a.patientFullName} ${a.documentNumber} ${a.id}`}
      quickFilters={[
        {
          key: "scope",
          placeholder: "Ámbito",
          getValue: (a) => careScopeKey(a.careScope) || undefined,
          formatLabel: formatCatalogLabel,
        },
        {
          key: "stay",
          placeholder: "Estancia",
          getValue: (a) => stayBucket(a.admissionDate),
          order: STAY_BUCKETS,
        },
      ]}
      onRowClick={onAction}
      renderCard={(a) => (
        <div className={cellStyles.rowCardBody}>
          <PersonCell name={formatPersonName(a.patientFullName)} detail={formatDocument(null, a.documentNumber)} />
          <span className={cellStyles.personDetail}>
            N° {a.id} · {formatDateTime(a.admissionDate)} · {formatStay(a.admissionDate)}
          </span>
          <span className={cellStyles.tags}>
            <Tag color={careScopeColor(a.careScope)}>{formatCatalogLabel(a.careScope)}</Tag>
          </span>
        </div>
      )}
    />
  )
}

export default ActiveAdmissionsTable
