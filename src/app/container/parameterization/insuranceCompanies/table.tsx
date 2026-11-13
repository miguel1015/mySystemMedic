"use client";

import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import DataTable from "@/components/dataTable/DataTable";
import { RowActions } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import { useDeleteInsuranceCompany } from "@/core/hooks/parameterization/insuranceCompany/useDeleteInsuranceCompany";
import { TInsurers } from "@/core/interfaces/user/users";
import { formatCatalogLabel, formatInstitutionName } from "@/core/utils/displayText";

interface InsuranceTableProps {
  data: TInsurers[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
}

// "900156264" + 2 -> "NIT 900.156.264-2"
const formatNit = (nit?: string | null, dv?: number | string | null) => {
  const n = (nit ?? "").trim();
  if (!n) return "";
  const pretty = /^\d+$/.test(n) ? Number(n).toLocaleString("es-CO") : n;
  return `NIT ${pretty}${dv !== null && dv !== undefined && dv !== "" ? `-${dv}` : ""}`;
};

const placeOf = (i: TInsurers) =>
  [formatCatalogLabel(i.cityName), formatCatalogLabel(i.stateName)].filter(Boolean).join(", ");

export default function InsuranceTable({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onCreate,
}: InsuranceTableProps) {
  const [toDelete, setToDelete] = useState<TInsurers | null>(null);
  const deleteInsurer = useDeleteInsuranceCompany();

  const handleDelete = () => {
    if (!toDelete) return;
    deleteInsurer.mutate(toDelete.id, {
      onSuccess: () => toast.success("Aseguradora eliminada"),
      onError: () => toast.error("No se pudo eliminar la aseguradora"),
      onSettled: () => setToDelete(null),
    });
  };

  const actionsFor = (record: TInsurers) => (
    <RowActions
      subject={formatInstitutionName(record.name)}
      onEdit={() => onEdit(record.id)}
      items={[
        {
          key: "delete",
          label: "Eliminar aseguradora",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => setToDelete(record),
        },
      ]}
    />
  );

  const columns: ColumnsType<TInsurers> = [
    {
      title: "Aseguradora",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name, "es"),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.personName}>{formatInstitutionName(r.name)}</span>
          <span className={cellStyles.personDetail}>
            {[formatNit(r.nit, r.verificationDigit), r.code && `Código ${r.code}`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
      ),
    },
    {
      title: "Tipo",
      key: "type",
      width: 200,
      sorter: (a, b) =>
        (a.administratorTypeName ?? "").localeCompare(b.administratorTypeName ?? "", "es"),
      render: (_, r) => (
        <span className={cellStyles.oneLine} title={r.administratorTypeName}>
          {formatCatalogLabel(r.administratorTypeName) || "—"}
        </span>
      ),
    },
    {
      title: "Ubicación",
      key: "place",
      width: 220,
      render: (_, r) => placeOf(r) || "—",
    },
    {
      title: "Contacto",
      key: "contact",
      width: 240,
      render: (_, r) => (
        <span className={cellStyles.stack}>
          {r.phone1 ? (
            <a href={`tel:${r.phone1.replace(/[^\d+]/g, "")}`} className={cellStyles.phone}>
              {r.phone1}
            </a>
          ) : (
            <span className={cellStyles.personDetail}>—</span>
          )}
          {r.email && (
            <span className={`${cellStyles.oneLine} ${cellStyles.personDetail} keep-case`} title={r.email}>
              {r.email}
            </span>
          )}
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
  ];

  return (
    <>
      <DataTable<TInsurers>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["aseguradora", "aseguradoras"]}
        feminine
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por nombre, NIT o código…"
        searchText={(i) => `${i.name} ${i.nit ?? ""} ${i.code ?? ""} ${i.email ?? ""}`}
        quickFilters={[
          {
            key: "type",
            placeholder: "Tipo",
            getValue: (i) => i.administratorTypeName,
            formatLabel: formatCatalogLabel,
          },
          {
            key: "state",
            placeholder: "Departamento",
            getValue: (i) => i.stateName,
            formatLabel: formatCatalogLabel,
          },
        ]}
        onRowClick={(i) => onEdit(i.id)}
        emptyAction={{ label: "Registrar la primera aseguradora", onClick: onCreate }}
        renderCard={(i) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.stack}>
              <span className={cellStyles.personName}>{formatInstitutionName(i.name)}</span>
              <span className={cellStyles.personDetail}>
                {[formatNit(i.nit, i.verificationDigit), formatCatalogLabel(i.administratorTypeName)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {placeOf(i) && <span className={cellStyles.personDetail}>{placeOf(i)}</span>}
            </div>
            {actionsFor(i)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar aseguradora"
        subtitle={
          toDelete ? `¿Eliminar ${formatInstitutionName(toDelete.name)}? Esta acción no se puede deshacer.` : ""
        }
        onConfirm={handleDelete}
        loading={deleteInsurer.isPending}
        confirmText="Eliminar"
      />
    </>
  );
}
