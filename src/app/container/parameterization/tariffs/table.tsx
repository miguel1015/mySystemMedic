"use client";

import type { ColumnsType } from "antd/es/table";
import { Tag } from "antd";
import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import DataTable from "@/components/dataTable/DataTable";
import { RowActions } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import { useDeleteTariffs } from "@/core/hooks/parameterization/tariffs/useDeleteTariffs";
import { TTariffs } from "@/core/interfaces/parameterization/types";
import { formatCatalogLabel } from "@/core/utils/displayText";

interface TariffsTableProps {
  data: TTariffs[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
}

const methodOf = (t: TTariffs) => t.valueMethodDescription ?? t.tariffDetailDescription ?? "";
const statusOf = (t: TTariffs) => (t.isActive === false ? "Inactivo" : "Activo");
const statusTag = (t: TTariffs) => (
  <Tag color={t.isActive === false ? "red" : "green"}>{statusOf(t)}</Tag>
);

const TariffsTable = ({ data, isLoading, isError, onRetry, onEdit, onCreate }: TariffsTableProps) => {
  const [toDelete, setToDelete] = useState<TTariffs | null>(null);
  const deleteTariffs = useDeleteTariffs();

  const handleDelete = () => {
    if (!toDelete?.id || deleteTariffs.isPending) return;
    deleteTariffs.mutate(toDelete.id, {
      onSuccess: () => toast.success("Tarifario eliminado"),
      onError: () => toast.error("No se pudo eliminar el tarifario"),
      onSettled: () => setToDelete(null),
    });
  };

  const actionsFor = (record: TTariffs) => (
    <RowActions
      subject={record.name}
      onEdit={() => onEdit(record.id!)}
      items={[
        {
          key: "delete",
          label: "Eliminar tarifario",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => setToDelete(record),
        },
      ]}
    />
  );

  const columns: ColumnsType<TTariffs> = [
    {
      title: "Tarifario",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name, "es"),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.personName}>{r.name}</span>
          {methodOf(r) && (
            <span className={cellStyles.personDetail}>{formatCatalogLabel(methodOf(r))}</span>
          )}
        </span>
      ),
    },
    {
      title: "Contrato",
      key: "contract",
      width: 320,
      sorter: (a, b) => (a.contractName ?? "").localeCompare(b.contractName ?? "", "es"),
      render: (_, r) => (
        <span className={cellStyles.oneLine} title={r.contractName}>
          {r.contractName ?? "—"}
        </span>
      ),
    },
    {
      title: "Estado",
      key: "status",
      width: 120,
      render: (_, r) => statusTag(r),
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 96,
      align: "right",
      fixed: "right",
      render: (_, r) => actionsFor(r),
    },
  ];

  return (
    <>
      <DataTable<TTariffs>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["tarifario", "tarifarios"]}
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por nombre, contrato o método…"
        searchText={(t) => `${t.name} ${t.contractName ?? ""} ${methodOf(t)}`}
        quickFilters={[
          { key: "contract", placeholder: "Contrato", getValue: (t) => t.contractName },
          {
            key: "method",
            placeholder: "Método de valoración",
            getValue: (t) => methodOf(t) || undefined,
            formatLabel: formatCatalogLabel,
          },
          { key: "status", placeholder: "Estado", getValue: statusOf },
        ]}
        onRowClick={(t) => onEdit(t.id!)}
        emptyAction={{ label: "Registrar el primer tarifario", onClick: onCreate }}
        renderCard={(t) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.stack}>
              <span className={cellStyles.personName}>{t.name}</span>
              <span className={cellStyles.personDetail}>
                {[t.contractName, formatCatalogLabel(methodOf(t))].filter(Boolean).join(" · ")}
              </span>
              <span>{statusTag(t)}</span>
            </div>
            {actionsFor(t)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => {
          if (!deleteTariffs.isPending) setToDelete(null);
        }}
        title="Eliminar tarifario"
        subtitle={toDelete ? `¿Eliminar el tarifario ${toDelete.name}? Esta acción no se puede deshacer.` : ""}
        loading={deleteTariffs.isPending}
        onConfirm={handleDelete}
        confirmText="Eliminar"
      />
    </>
  );
};

export default TariffsTable;
