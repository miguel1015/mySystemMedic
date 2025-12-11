"use client";

import { useState, useMemo } from "react";
import { Table, Tag, Input, Space, Button } from "antd";
import { Container } from "@/components/container";
import CustomButton from "@/components/button";
import { useGetUsers } from "@/core/hooks/users/useGetUsers";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import toast from "react-hot-toast";
import { useDeleteUser } from "@/core/hooks/users/useDeleteUser";

interface UsersTableProps {
  onEdit: (id: number) => void;
}

export default function UsersTable({ onEdit }: UsersTableProps) {
  const { data: dataUsers } = useGetUsers();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const filteredUsers = useMemo(() => {
    if (!dataUsers) return [];
    return dataUsers.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        String(user.userRoleId).includes(search.toLowerCase()) ||
        (user.isActive ? "activo" : "inactivo").includes(search.toLowerCase())
    );
  }, [search, dataUsers]);

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      render: (_: any, record: any) => `${record.firstName} ${record.lastName}`,
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
      render: (status: string) => {
        let color =
          status === "Activo"
            ? "green"
            : status === "Inactivo"
            ? "default"
            : status === "Bloqueado"
            ? "red"
            : "blue";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Acciones",
      render: (_: any, record: any) => (
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
      {/* Buscador */}
      <div className="mb-3">
        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Confirmación */}
      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar usuario"
        subtitle="¿Estás seguro de eliminar este usuario?"
        onConfirm={() => {
          deleteUser.mutate(Number(userToDelete), {
            onSuccess: () => toast.success("Usuario eliminado"),
            onError: () => toast.error("Error eliminando usuario"),
          });
          setOpenConfirm(false);
        }}
      />
    </Container>
  );
}
