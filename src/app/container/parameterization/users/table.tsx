"use client";

import type { ColumnsType } from "antd/es/table";
import { Tag } from "antd";
import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import DataTable from "@/components/dataTable/DataTable";
import { PersonCell, RowActions } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import { useDeleteUser } from "@/core/hooks/users/useDeleteUser";
import { GetUser } from "@/core/interfaces/user/users";
import { formatCatalogLabel, formatPersonName } from "@/core/utils/displayText";

interface UsersTableProps {
  data: GetUser[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  activo: "green",
  inactivo: "default",
  bloqueado: "red",
};

const nameOf = (u: GetUser) => formatPersonName(`${u.firstName} ${u.lastName}`);

// Perfil asistencial (Médico, Enfermero…) con la especialidad cuando la tiene.
const profileOf = (u: GetUser) =>
  [formatCatalogLabel(u.userProfileName), u.especialidadNombre].filter(Boolean).join(" · ");

const statusTag = (u: GetUser) => (
  <Tag color={STATUS_COLORS[(u.userStatusName ?? "").toLowerCase()] ?? "blue"}>
    {u.userStatusName || "—"}
  </Tag>
);

export default function UsersTable({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onCreate,
}: UsersTableProps) {
  const [toDelete, setToDelete] = useState<GetUser | null>(null);
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (!toDelete) return;
    deleteUser.mutate(toDelete.id, {
      onSuccess: () => toast.success("Usuario eliminado"),
      onError: () => toast.error("No se pudo eliminar el usuario"),
      onSettled: () => setToDelete(null),
    });
  };

  const actionsFor = (record: GetUser) => (
    <RowActions
      subject={nameOf(record)}
      onEdit={() => onEdit(record.id)}
      items={[
        {
          key: "delete",
          label: "Eliminar usuario",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => setToDelete(record),
        },
      ]}
    />
  );

  const columns: ColumnsType<GetUser> = [
    {
      title: "Usuario",
      key: "user",
      sorter: (a, b) => nameOf(a).localeCompare(nameOf(b), "es"),
      render: (_, r) => (
        <PersonCell
          name={nameOf(r)}
          detail={[r.username && `@${r.username}`, r.email].filter(Boolean).join(" · ")}
        />
      ),
    },
    {
      title: "Perfil",
      key: "profile",
      width: 240,
      sorter: (a, b) => (a.userProfileName ?? "").localeCompare(b.userProfileName ?? "", "es"),
      render: (_, r) => profileOf(r) || "—",
    },
    {
      title: "Rol",
      dataIndex: "userRoleName",
      width: 180,
      sorter: (a, b) => (a.userRoleName ?? "").localeCompare(b.userRoleName ?? "", "es"),
      render: (value?: string) => value || "—",
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
      <DataTable<GetUser>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["usuario", "usuarios"]}
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por nombre, usuario, correo o documento…"
        searchText={(u) =>
          `${u.firstName} ${u.lastName} ${u.username ?? ""} ${u.email ?? ""} ${u.documentNumber ?? ""}`
        }
        quickFilters={[
          {
            key: "profile",
            placeholder: "Perfil",
            getValue: (u) => u.userProfileName,
            formatLabel: formatCatalogLabel,
          },
          { key: "role", placeholder: "Rol", getValue: (u) => u.userRoleName },
          { key: "status", placeholder: "Estado", getValue: (u) => u.userStatusName },
        ]}
        onRowClick={(u) => onEdit(u.id)}
        emptyAction={{ label: "Registrar el primer usuario", onClick: onCreate }}
        renderCard={(u) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.rowCardBody}>
              <PersonCell name={nameOf(u)} detail={u.email} />
              <span className={cellStyles.personDetail}>
                {[profileOf(u), u.userRoleName].filter(Boolean).join(" · ")}
              </span>
              <span>{statusTag(u)}</span>
            </div>
            {actionsFor(u)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar usuario"
        subtitle={toDelete ? `¿Eliminar a ${nameOf(toDelete)}? Esta acción no se puede deshacer.` : ""}
        onConfirm={handleDelete}
        loading={deleteUser.isPending}
        confirmText="Eliminar"
      />
    </>
  );
}
