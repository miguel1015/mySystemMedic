"use client";

import { Container } from "@/components/container";
import PageHeader from "@/components/dataTable/PageHeader";
import Modal from "@/components/modal";
import useDictionary from "@/locales/dictionary-hook";
import { Button } from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useGetUsers } from "@/core/hooks/users/useGetUsers";
import UsersTable from "./table";
import UserForm from "./userForm";

export default function UsersContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useGetUsers();
  const total = data?.length ?? 0;

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <PageHeader
        icon={<TeamOutlined />}
        title={dict.users.users}
        subtitle={
          isLoading
            ? "Cargando usuarios…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "usuario registrado" : "usuarios registrados"}`
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            {dict.users.newUser}
          </Button>
        }
      />

      <UsersTable
        data={data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onCreate={() => setOpen(true)}
      />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditUserId(null);
        }}
        title={editUserId ? "Editar usuario" : "Crear usuario"}
        size="xl"
      >
        <UserForm
          setOpen={setOpen}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
        />
      </Modal>
    </Container>
  );
}
