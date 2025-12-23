"use client";

import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { Button } from "antd";
import { useState } from "react";
import UsersTable from "./table";
import UserForm from "./userForm";

export default function UsersContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children={dict.users.users} level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          {dict.users.newUser}
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false), setEditUserId(null);
        }}
        title={editUserId ? "Editar usuario" : "Crear usuario"}
        size="xl"
      >
        <UserForm setOpen={setOpen} editUserId={editUserId} />
      </Modal>

      <UsersTable onEdit={handleEdit} />
    </Container>
  );
}
