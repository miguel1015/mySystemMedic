"use client";

import type { ColumnsType } from "antd/es/table";
import { Tag } from "antd";
import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import DataTable from "@/components/dataTable/DataTable";
import { RowActions, formatCOP } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import { TMedicalDevice } from "@/core/interfaces/parameterization/types";
import { formatCatalogLabel } from "@/core/utils/displayText";
import { useDeleteMedicalDevice } from "@/core/hooks/parameterization/medicalDevices/useDeleteMedicalDevice";

interface MedicalDevicesProps {
  data: TMedicalDevice[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
}

// Solo se marca lo que es "sí": un "No" en cada fila es ruido.
const flagsOf = (d: TMedicalDevice) => (
  <span className={cellStyles.tags}>
    {d.isInvasive && <Tag color="orange">Invasivo</Tag>}
    {d.isReusable && <Tag color="green">Reintegrable</Tag>}
  </span>
);

const MedicalDevicesTable = ({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onCreate,
}: MedicalDevicesProps) => {
  const [toDelete, setToDelete] = useState<TMedicalDevice | null>(null);
  const deleteMedicalDevice = useDeleteMedicalDevice();

  const handleDelete = () => {
    if (!toDelete?.id || deleteMedicalDevice.isPending) return;
    deleteMedicalDevice.mutate(toDelete.id, {
      onSuccess: () => toast.success("Dispositivo médico eliminado"),
      onError: () => toast.error("No se pudo eliminar el dispositivo médico"),
      onSettled: () => setToDelete(null),
    });
  };

  const actionsFor = (record: TMedicalDevice) => (
    <RowActions
      subject={record.elementName}
      onEdit={() => onEdit(record.id!)}
      items={[
        {
          key: "delete",
          label: "Eliminar dispositivo",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => setToDelete(record),
        },
      ]}
    />
  );

  const columns: ColumnsType<TMedicalDevice> = [
    {
      title: "Dispositivo",
      key: "name",
      sorter: (a, b) => a.elementName.localeCompare(b.elementName, "es"),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.personName}>{r.elementName}</span>
          <span className={cellStyles.personDetail}>
            {[r.ripsCode && `RIPS ${r.ripsCode}`, formatCatalogLabel(r.inventoryUnitName)]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
      ),
    },
    {
      title: "Tipo y uso",
      key: "type",
      width: 240,
      sorter: (a, b) => (a.elementTypeName ?? "").localeCompare(b.elementTypeName ?? "", "es"),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span>{formatCatalogLabel(r.elementTypeName) || "—"}</span>
          {r.elementUsageName && (
            <span className={cellStyles.personDetail}>{formatCatalogLabel(r.elementUsageName)}</span>
          )}
        </span>
      ),
    },
    {
      title: "Características",
      key: "flags",
      width: 200,
      render: (_, r) => flagsOf(r),
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
  ];

  return (
    <>
      <DataTable<TMedicalDevice>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["dispositivo", "dispositivos"]}
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por nombre, código RIPS o tipo…"
        searchText={(d) =>
          `${d.elementName} ${d.ripsCode ?? ""} ${d.elementTypeName ?? ""} ${d.elementUsageName ?? ""}`
        }
        quickFilters={[
          {
            key: "type",
            placeholder: "Tipo",
            getValue: (d) => d.elementTypeName,
            formatLabel: formatCatalogLabel,
          },
          {
            key: "usage",
            placeholder: "Uso",
            getValue: (d) => d.elementUsageName,
            formatLabel: formatCatalogLabel,
          },
          {
            key: "flag",
            placeholder: "Característica",
            getValue: (d) =>
              d.isInvasive && d.isReusable
                ? "Invasivo y reintegrable"
                : d.isInvasive
                  ? "Invasivo"
                  : d.isReusable
                    ? "Reintegrable"
                    : "Ninguna",
          },
        ]}
        onRowClick={(d) => onEdit(d.id!)}
        emptyAction={{ label: "Registrar el primer dispositivo", onClick: onCreate }}
        renderCard={(d) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.stack}>
              <span className={cellStyles.personName}>{d.elementName}</span>
              <span className={cellStyles.personDetail}>
                {[d.ripsCode && `RIPS ${d.ripsCode}`, formatCatalogLabel(d.elementTypeName), formatCOP(d.price, "")]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {flagsOf(d)}
            </div>
            {actionsFor(d)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar dispositivo médico"
        subtitle={toDelete ? `¿Eliminar ${toDelete.elementName}? Esta acción no se puede deshacer.` : ""}
        loading={deleteMedicalDevice.isPending}
        onConfirm={handleDelete}
        confirmText="Eliminar"
      />
    </>
  );
};

export default MedicalDevicesTable;
