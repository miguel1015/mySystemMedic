"use client";

import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import {
  CarOutlined,
  DeleteOutlined,
  HistoryOutlined,
  SendOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import DataTable from "@/components/dataTable/DataTable";
import { PersonCell, RowActions, formatDocument } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import { AdmissionResponse } from "@/core/interfaces/care/types";
import { useDeleteAdmission } from "@/core/hooks/care/admissions/useDeleteAdmission";
import {
  careScopeColor,
  careScopeKey,
  formatCatalogLabel,
  formatInstitutionName,
  formatPersonName,
} from "@/core/utils/displayText";
import { formatDateTime } from "@/core/utils/date";

interface AdmissionsTableProps {
  data: AdmissionResponse[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit?: (admission: AdmissionResponse) => void;
  onHistory?: (admission: AdmissionResponse) => void;
  onFurips?: (admission: AdmissionResponse) => void;
  onCompanion?: (admission: AdmissionResponse) => void;
  onReferral?: (admission: AdmissionResponse) => void;
  // Si se omite, la tabla es de solo consulta (sin columna de acciones).
  withActions?: boolean;
  emptyText?: string;
  // Guardar búsqueda y filtros en la URL (solo en la vista principal, no en modales).
  syncUrl?: boolean;
}

const statusTag = (a: AdmissionResponse) =>
  a.isActive ? <Tag color="green">Activa</Tag> : <Tag>Cerrada</Tag>;

export default function AdmissionsTable({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onHistory,
  onFurips,
  onCompanion,
  onReferral,
  withActions = true,
  emptyText = "No hay admisiones para los criterios de búsqueda.",
  syncUrl,
}: AdmissionsTableProps) {
  const [toDelete, setToDelete] = useState<AdmissionResponse | null>(null);
  const deleteAdmission = useDeleteAdmission();

  const handleDelete = () => {
    if (!toDelete) return;
    deleteAdmission.mutate(toDelete.id, {
      onSuccess: () => toast.success("Admisión eliminada"),
      onError: (err: Error) => toast.error(err.message),
      onSettled: () => setToDelete(null),
    });
  };

  // Editar, acompañante, remisión y eliminar solo aplican a admisiones activas; las
  // cerradas quedan para consulta.
  const actionsFor = (r: AdmissionResponse) => (
    <RowActions
      subject={`la admisión ${r.id}`}
      editLabel="Editar admisión"
      onEdit={r.isActive && onEdit ? () => onEdit(r) : undefined}
      items={[
        {
          key: "history",
          label: "Historial de admisiones",
          icon: <HistoryOutlined />,
          onClick: () => onHistory?.(r),
        },
        {
          key: "furips",
          label: "Información del accidente (FURIPS)",
          icon: <CarOutlined />,
          onClick: () => onFurips?.(r),
        },
        {
          key: "companion",
          label: r.acompananteNombre ? "Editar acompañante" : "Ingresar acompañante",
          icon: <UserAddOutlined />,
          disabled: !r.isActive,
          onClick: () => onCompanion?.(r),
        },
        {
          key: "referral",
          label: r.tieneRemision ? "Editar remisión" : "Remisión",
          icon: <SendOutlined />,
          disabled: !r.isActive,
          onClick: () => onReferral?.(r),
        },
        {
          key: "delete",
          label: "Eliminar admisión",
          icon: <DeleteOutlined />,
          danger: true,
          disabled: !r.isActive,
          dividerBefore: true,
          onClick: () => setToDelete(r),
        },
      ]}
    />
  );

  const columns: ColumnsType<AdmissionResponse> = [
    {
      title: "Admisión",
      key: "admission",
      width: 170,
      sorter: (a, b) => a.admissionDate.localeCompare(b.admissionDate),
      defaultSortOrder: "descend",
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={`${cellStyles.personName} ${cellStyles.tabular}`}>N° {r.id}</span>
          <span className={`${cellStyles.personDetail} ${cellStyles.tabular}`}>
            {formatDateTime(r.admissionDate)}
          </span>
        </span>
      ),
    },
    {
      title: "Paciente",
      key: "patient",
      sorter: (a, b) => a.nombrePaciente.localeCompare(b.nombrePaciente, "es"),
      render: (_, r) => (
        <PersonCell
          name={formatPersonName(r.nombrePaciente)}
          detail={formatDocument(r.documentTypeCode, r.documentoPatiente)}
        />
      ),
    },
    {
      title: "Ámbito y triage",
      key: "scope",
      width: 170,
      render: (_, r) => (
        <span className={cellStyles.tags}>
          {r.careScopeName && (
            <Tag color={careScopeColor(r.careScopeName)}>{formatCatalogLabel(r.careScopeName)}</Tag>
          )}
          {r.triagePrioridad && <Tag color="blue">Triage {r.triagePrioridad}</Tag>}
        </span>
      ),
    },
    {
      title: "EPS y convenio",
      key: "insurer",
      width: 260,
      render: (_, r) => {
        const eps = formatInstitutionName(r.epsNombre) || "—";
        return (
          <span className={cellStyles.stack}>
            <span className={cellStyles.oneLine} title={eps}>
              {eps}
            </span>
            {r.convenioNombre && (
              <span className={`${cellStyles.oneLine} ${cellStyles.personDetail}`} title={r.convenioNombre}>
                {r.convenioNombre}
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: "Acompañante",
      key: "companion",
      width: 200,
      render: (_, r) =>
        r.acompananteNombre ? (
          <span className={cellStyles.stack}>
            <span>{formatPersonName(r.acompananteNombre)}</span>
            {r.acompananteParentesco && (
              <span className={cellStyles.personDetail}>
                {formatCatalogLabel(r.acompananteParentesco)}
              </span>
            )}
          </span>
        ) : (
          <span className={cellStyles.personDetail}>—</span>
        ),
    },
    {
      title: "Estado",
      key: "status",
      width: 100,
      render: (_, r) => statusTag(r),
    },
  ];

  if (withActions) {
    columns.push({
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 96,
      align: "right",
      fixed: "right",
      render: (_, r) => actionsFor(r),
    });
  }

  return (
    <>
      <DataTable<AdmissionResponse>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["admisión", "admisiones"]}
        feminine
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        emptyText={emptyText}
        syncUrl={syncUrl}
        searchPlaceholder="Filtrar por paciente, documento, EPS o N°…"
        searchText={(a) =>
          `${a.id} ${a.nombrePaciente} ${a.documentoPatiente} ${a.epsNombre ?? ""} ${a.convenioNombre ?? ""}`
        }
        quickFilters={[
          {
            key: "scope",
            placeholder: "Ámbito",
            getValue: (a) => careScopeKey(a.careScopeName) || undefined,
            formatLabel: formatCatalogLabel,
          },
          {
            key: "eps",
            placeholder: "EPS",
            getValue: (a) => a.epsNombre,
            formatLabel: formatInstitutionName,
          },
        ]}
        onRowClick={withActions && onEdit ? (a) => a.isActive && onEdit(a) : undefined}
        renderCard={(a) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.rowCardBody}>
              <PersonCell
                name={formatPersonName(a.nombrePaciente)}
                detail={formatDocument(a.documentTypeCode, a.documentoPatiente)}
              />
              <span className={cellStyles.personDetail}>
                N° {a.id} · {formatDateTime(a.admissionDate)}
              </span>
              <span className={cellStyles.personDetail}>
                {formatInstitutionName(a.epsNombre) || "Sin EPS"}
              </span>
              <span className={cellStyles.tags}>
                {statusTag(a)}
                {a.triagePrioridad && <Tag color="blue">Triage {a.triagePrioridad}</Tag>}
              </span>
            </div>
            {withActions && actionsFor(a)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar admisión"
        subtitle={
          toDelete
            ? `¿Eliminar la admisión N° ${toDelete.id} de ${formatPersonName(toDelete.nombrePaciente)}? Se cerrará y no se puede deshacer.`
            : ""
        }
        loading={deleteAdmission.isPending}
        onConfirm={handleDelete}
        confirmText="Eliminar"
      />
    </>
  );
}
