"use client"

import type { ColumnsType } from "antd/es/table"
import { useState } from "react"
import { DeleteOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import DataTable from "@/components/dataTable/DataTable"
import { RowActions, formatCOP } from "@/components/dataTable/cells"
import cellStyles from "@/components/dataTable/dataTable.module.scss"
import { TMedicine } from "@/core/interfaces/parameterization/types"
import { useDeleteMedicine } from "@/core/hooks/parameterization/medicines/useDeleteMedicine"

interface MedicineProps {
  data: TMedicine[]
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
  onEdit: (id: number) => void
  onCreate: () => void
}

const codesOf = (m: TMedicine) =>
  [m.cum && `CUM ${m.cum}`, m.atc && `ATC ${m.atc}`, m.invima && `INVIMA ${m.invima}`]
    .filter(Boolean)
    .join(" · ")

const MedicineTable = ({ data, isLoading, isError, onRetry, onEdit, onCreate }: MedicineProps) => {
  const [toDelete, setToDelete] = useState<TMedicine | null>(null)
  const deleteMedicine = useDeleteMedicine()

  const handleDelete = () => {
    if (!toDelete?.id || deleteMedicine.isPending) return
    deleteMedicine.mutate(toDelete.id, {
      onSuccess: () => toast.success("Medicamento eliminado"),
      onError: () => toast.error("No se pudo eliminar el medicamento"),
      onSettled: () => setToDelete(null),
    })
  }

  const actionsFor = (record: TMedicine) => (
    <RowActions
      subject={record.name}
      onEdit={() => onEdit(record.id!)}
      items={[
        {
          key: "delete",
          label: "Eliminar medicamento",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => setToDelete(record),
        },
      ]}
    />
  )

  const columns: ColumnsType<TMedicine> = [
    {
      title: "Medicamento",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name, "es"),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.personName}>{r.name}</span>
          <span className={cellStyles.personDetail}>{codesOf(r)}</span>
        </span>
      ),
    },
    {
      title: "Concentración",
      dataIndex: "concentration",
      width: 200,
      render: (value?: string) => value?.trim() || "—",
    },
    {
      title: "Precio",
      dataIndex: "price",
      width: 130,
      align: "right",
      sorter: (a, b) => (a.price ?? -1) - (b.price ?? -1),
      render: (value?: number | null) => <span className={cellStyles.tabular}>{formatCOP(value)}</span>,
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
      <DataTable<TMedicine>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["medicamento", "medicamentos"]}
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por nombre, CUM, ATC o INVIMA…"
        searchText={(m) => `${m.name} ${m.cum ?? ""} ${m.atc ?? ""} ${m.invima ?? ""} ${m.concentration ?? ""}`}
        onRowClick={(m) => onEdit(m.id!)}
        emptyAction={{ label: "Registrar el primer medicamento", onClick: onCreate }}
        renderCard={(m) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.stack}>
              <span className={cellStyles.personName}>{m.name}</span>
              <span className={cellStyles.personDetail}>
                {[m.concentration?.trim(), formatCOP(m.price, "")].filter(Boolean).join(" · ")}
              </span>
              <span className={cellStyles.personDetail}>{codesOf(m)}</span>
            </div>
            {actionsFor(m)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar medicamento"
        subtitle={toDelete ? `¿Eliminar ${toDelete.name}? Esta acción no se puede deshacer.` : ""}
        loading={deleteMedicine.isPending}
        onConfirm={handleDelete}
        confirmText="Eliminar"
      />
    </>
  )
}

export default MedicineTable
