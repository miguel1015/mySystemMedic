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
import { useDeleteContract } from "@/core/hooks/parameterization/contracts/useDeleteContract";
import { TContract } from "@/core/interfaces/parameterization/types";
import { formatCatalogLabel, formatInstitutionName } from "@/core/utils/displayText";
import { formatDate } from "@/core/utils/date";

interface ContractsTableProps {
  data: TContract[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  activo: "green",
  suspendido: "orange",
  terminado: "red",
};

const statusOf = (c: TContract) => c.contractStatusDescription ?? c.status ?? "";

// Un contrato "activo" cuya fecha final ya pasó: hay que renovarlo o terminarlo.
const isExpired = (c: TContract) => {
  if (!c.endDate || statusOf(c).toLowerCase() !== "activo") return false;
  const end = new Date(c.endDate.length === 10 ? `${c.endDate}T23:59:59` : c.endDate);
  return !Number.isNaN(end.getTime()) && end < new Date();
};

const validityOf = (c: TContract) =>
  `${formatDate(c.startDate)} – ${c.endDate ? formatDate(c.endDate) : "sin fecha final"}`;

export default function ContractsTable({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onCreate,
}: ContractsTableProps) {
  const [toDelete, setToDelete] = useState<TContract | null>(null);
  const deleteContract = useDeleteContract();

  const handleDelete = () => {
    if (!toDelete) return;
    deleteContract.mutate(toDelete.id, {
      onSuccess: () => toast.success("Contrato eliminado"),
      onError: () => toast.error("No se pudo eliminar el contrato"),
      onSettled: () => setToDelete(null),
    });
  };

  const actionsFor = (record: TContract) => (
    <RowActions
      subject={record.contractName}
      onEdit={() => onEdit(record.id)}
      items={[
        {
          key: "delete",
          label: "Eliminar contrato",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => setToDelete(record),
        },
      ]}
    />
  );

  const statusTag = (c: TContract) => {
    const status = statusOf(c);
    return (
      <Tag color={STATUS_COLORS[status.toLowerCase()] ?? "default"}>
        {formatCatalogLabel(status) || "—"}
      </Tag>
    );
  };

  const columns: ColumnsType<TContract> = [
    {
      title: "Contrato",
      key: "contract",
      sorter: (a, b) => (a.contractName ?? "").localeCompare(b.contractName ?? "", "es"),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.personName}>{r.contractName}</span>
          {r.contractNumber && (
            <span className={cellStyles.personDetail}>N° {r.contractNumber}</span>
          )}
        </span>
      ),
    },
    {
      title: "EPS",
      key: "insurer",
      width: 260,
      sorter: (a, b) => (a.insurerName ?? "").localeCompare(b.insurerName ?? "", "es"),
      render: (_, r) => {
        const eps = formatInstitutionName(r.insurerName) || "—";
        return (
          <span className={cellStyles.oneLine} title={eps}>
            {eps}
          </span>
        );
      },
    },
    {
      title: "Vigencia",
      key: "validity",
      width: 240,
      sorter: (a, b) => (a.endDate ?? "9999").localeCompare(b.endDate ?? "9999"),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.tabular}>{validityOf(r)}</span>
          {isExpired(r) && <span className={cellStyles.warningText}>Vencido</span>}
        </span>
      ),
    },
    {
      title: "Estado",
      key: "status",
      width: 130,
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
      <DataTable<TContract>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["contrato", "contratos"]}
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por nombre, número o EPS…"
        searchText={(c) => `${c.contractName ?? ""} ${c.contractNumber ?? ""} ${c.insurerName ?? ""}`}
        quickFilters={[
          {
            key: "eps",
            placeholder: "EPS",
            getValue: (c) => c.insurerName,
            formatLabel: formatInstitutionName,
          },
          {
            key: "status",
            placeholder: "Estado",
            getValue: (c) => statusOf(c) || undefined,
            formatLabel: formatCatalogLabel,
          },
        ]}
        onRowClick={(c) => onEdit(c.id)}
        emptyAction={{ label: "Registrar el primer contrato", onClick: onCreate }}
        renderCard={(c) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.stack}>
              <span className={cellStyles.personName}>{c.contractName}</span>
              <span className={cellStyles.personDetail}>
                {[c.contractNumber && `N° ${c.contractNumber}`, formatInstitutionName(c.insurerName)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <span className={cellStyles.personDetail}>
                {validityOf(c)}
                {isExpired(c) && <span className={cellStyles.warningText}> · Vencido</span>}
              </span>
              <span>{statusTag(c)}</span>
            </div>
            {actionsFor(c)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar contrato"
        subtitle={toDelete ? `¿Eliminar el contrato ${toDelete.contractName}? Esta acción no se puede deshacer.` : ""}
        onConfirm={handleDelete}
        loading={deleteContract.isPending}
        confirmText="Eliminar"
      />
    </>
  );
}
