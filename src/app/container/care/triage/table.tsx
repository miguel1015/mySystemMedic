"use client"

import { Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DeleteOutlined, EyeOutlined, SolutionOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import DataTable from "@/components/dataTable/DataTable"
import { PersonCell, RowActions, RowMenuItem, formatDocument } from "@/components/dataTable/cells"
import cellStyles from "@/components/dataTable/dataTable.module.scss"
import { TriagePriority, TriageResponse } from "@/core/interfaces/care/types"
import { useDeleteTriage } from "@/core/hooks/care/triage/useDeleteTriage"
import { useNavigationAccess } from "@/core/hooks/authentication/useNavigationAccess"
import { formatPersonName } from "@/core/utils/displayText"
import { formatDateTime } from "@/core/utils/date"
import { canAccessRoute } from "@/core/utils/routeAccess"

// Colores de la escala de triage. El texto se elige por contraste: el amarillo (III) lleva
// texto oscuro; con blanco no se lee.
const PRIORITY_STYLE: Record<TriagePriority, { bg: string; fg: string }> = {
  I: { bg: "#d9363e", fg: "#fff" },
  II: { bg: "#d46b08", fg: "#fff" },
  III: { bg: "#fadb14", fg: "#3d3300" },
  IV: { bg: "#389e0d", fg: "#fff" },
  V: { bg: "#1677ff", fg: "#fff" },
}

const PRIORITY_LABEL: Record<TriagePriority, string> = {
  I: "I · Resucitación",
  II: "II · Emergencia",
  III: "III · Urgencia",
  IV: "IV · Menos urgente",
  V: "V · No urgente",
}

const PRIORITY_ORDER: TriagePriority[] = ["I", "II", "III", "IV", "V"]

function PriorityTag({ value }: { value: TriagePriority }) {
  const style = PRIORITY_STYLE[value]
  if (!style) return <Tag>{value}</Tag>
  return (
    <Tag
      style={{ color: style.fg, background: style.bg, borderColor: style.bg, fontWeight: 600 }}
      title={PRIORITY_LABEL[value]}
    >
      {value}
    </Tag>
  )
}

// "hace 25 min", "hace 3 h", "hace 2 días": cuánto lleva el paciente desde el triage.
function elapsedSince(value: string, now = Date.now()) {
  const t = new Date(value).getTime()
  if (Number.isNaN(t) || t > now) return ""
  const min = Math.floor((now - t) / 60_000)
  if (min < 1) return "hace un momento"
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return `hace ${d} ${d === 1 ? "día" : "días"}`
}

interface TriageTableProps {
  data: TriageResponse[]
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
}

export default function TriageTable({ data, isLoading, isError, onRetry }: TriageTableProps) {
  const router = useRouter()
  const { data: access } = useNavigationAccess()
  const [toDelete, setToDelete] = useState<TriageResponse | null>(null)
  const deleteTriage = useDeleteTriage()

  const handleDelete = () => {
    if (!toDelete) return
    deleteTriage.mutate(toDelete.id, {
      onSuccess: () => toast.success("Triage eliminado"),
      onError: (err: Error) => toast.error(err.message),
      onSettled: () => setToDelete(null),
    })
  }

  const actionsFor = (r: TriageResponse) => {
    const items: RowMenuItem[] = [
      {
        key: "view",
        label: "Ver triage",
        icon: <EyeOutlined />,
        onClick: () => router.push(`/care/triage/${r.id}`),
      },
    ]
    // Paso siguiente del flujo: admitir al paciente con este triage.
    if (access && canAccessRoute("/care/admissions/new", access)) {
      items.push({
        key: "admit",
        label: "Registrar admisión",
        icon: <SolutionOutlined />,
        onClick: () =>
          router.push(
            `/care/admissions/new?document=${encodeURIComponent(r.numeroDocumento ?? "")}&triageId=${r.id}`,
          ),
      })
    }
    items.push({
      key: "delete",
      label: "Eliminar triage",
      icon: <DeleteOutlined />,
      danger: true,
      dividerBefore: true,
      onClick: () => setToDelete(r),
    })
    return (
      <RowActions
        subject={`el triage de ${formatPersonName(r.nombrePaciente)}`}
        editLabel="Editar triage"
        onEdit={() => router.push(`/care/triage/${r.id}/edit`)}
        items={items}
      />
    )
  }

  const columns: ColumnsType<TriageResponse> = [
    {
      title: "Fecha y hora",
      key: "date",
      width: 170,
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.tabular}>{formatDateTime(r.fechaHora)}</span>
          <span className={cellStyles.personDetail}>{elapsedSince(r.fechaHora)}</span>
        </span>
      ),
    },
    {
      title: "Paciente",
      key: "patient",
      sorter: (a, b) => (a.nombrePaciente ?? "").localeCompare(b.nombrePaciente ?? "", "es"),
      render: (_, r) => (
        <PersonCell
          name={formatPersonName(r.nombrePaciente)}
          detail={formatDocument(null, r.numeroDocumento)}
        />
      ),
    },
    {
      title: "Prioridad",
      key: "priority",
      width: 110,
      align: "center",
      sorter: (a, b) => PRIORITY_ORDER.indexOf(a.prioridad) - PRIORITY_ORDER.indexOf(b.prioridad),
      render: (_, r) => <PriorityTag value={r.prioridad} />,
    },
    {
      title: "Motivo de consulta",
      key: "reason",
      render: (_, r) => (
        <span className={cellStyles.clamp2} title={r.motivoConsulta}>
          {r.motivoConsulta || "—"}
        </span>
      ),
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 96,
      align: "right",
      fixed: "right",
      render: (_, r) => actionsFor(r),
    },
  ]

  return (
    <>
      <DataTable<TriageResponse>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["triage", "triages"]}
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por nombre, documento o motivo…"
        searchText={(t) => `${t.nombrePaciente ?? ""} ${t.numeroDocumento ?? ""} ${t.motivoConsulta ?? ""}`}
        quickFilters={[
          {
            key: "priority",
            placeholder: "Prioridad",
            getValue: (t) => t.prioridad,
            formatLabel: (v) => PRIORITY_LABEL[v as TriagePriority] ?? v,
          },
        ]}
        onRowClick={(t) => router.push(`/care/triage/${t.id}`)}
        emptyAction={{ label: "Registrar el primer triage", onClick: () => router.push("/care/triage/new") }}
        renderCard={(t) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.rowCardBody}>
              <PersonCell
                name={formatPersonName(t.nombrePaciente)}
                detail={formatDocument(null, t.numeroDocumento)}
              />
              <span className={cellStyles.personDetail}>
                {formatDateTime(t.fechaHora)} · {elapsedSince(t.fechaHora)}
              </span>
              <span className={cellStyles.tags}>
                <PriorityTag value={t.prioridad} />
              </span>
              {t.motivoConsulta && (
                <span className={`${cellStyles.clamp2} ${cellStyles.personDetail}`}>
                  {t.motivoConsulta}
                </span>
              )}
            </div>
            {actionsFor(t)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar triage"
        subtitle={
          toDelete
            ? `¿Eliminar el triage de ${formatPersonName(toDelete.nombrePaciente)}? Esta acción no se puede deshacer.`
            : ""
        }
        loading={deleteTriage.isPending}
        onConfirm={handleDelete}
        confirmText="Eliminar"
      />
    </>
  )
}
