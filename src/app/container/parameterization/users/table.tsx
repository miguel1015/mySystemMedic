"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { useDeleteUser } from "@/core/hooks/users/useDeleteUser";
import { useGetUsers } from "@/core/hooks/users/useGetUsers";
import { GetUser } from "@/core/interfaces/user/users";
import { Input, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function UsersTable({
  onEdit,
}: {
  onEdit: (id: number) => void;
}) {
  const { data: dataUsers = [], isLoading } = useGetUsers();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const filteredUsers = useMemo<GetUser[]>(() => {
    return dataUsers.filter((user) =>
      [
        `${user.firstName} ${user.lastName}`,
        user.email,
        String(user.userRoleId),
        user.isActive ? "activo" : "inactivo",
      ].some((field) => field.toLowerCase().includes(search.toLowerCase())),
    );
  }, [search, dataUsers]);

  const columns: ColumnsType<GetUser> = [
    {
      title: "#",
      width: 60,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "Nombre",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Rol",
      dataIndex: "userRoleName",
    },
    {
      title: "Estado",
      dataIndex: "userStatusName",
      render: (status) => {
        const colorMap: Record<string, string> = {
          Activo: "green",
          Inactivo: "default",
          Bloqueado: "red",
        };

        return <Tag color={colorMap[status] ?? "blue"}>{status}</Tag>;
      },
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <Space>
          <CustomButton
            size="sm"
            variant="outline"
            onClick={() => onEdit(record.id)}
          >
            Editar
          </CustomButton>

          <CustomButton
            size="sm"
            variant="danger"
            onClick={() => {
              setUserToDelete(record.id);
              setOpenConfirm(true);
            }}
          >
            Eliminar
          </CustomButton>
        </Space>
      ),
    },
  ];

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      <Table<GetUser>
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={{ spinning: isLoading, tip: "Cargando usuarios..." }}
        scroll={{ x: "max-content" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar usuario"
        subtitle="¿Estás seguro de eliminar este usuario?"
        onConfirm={() => {
          if (!userToDelete) return;

          deleteUser.mutate(userToDelete, {
            onSuccess: () => toast.success("Usuario eliminado"),
            onError: () => toast.error("Error eliminando usuario"),
          });

          setOpenConfirm(false);
        }}
      />
    </Container>
  );
}
