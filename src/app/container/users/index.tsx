"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { useState } from "react";
import UserForm from "./userForm";
import UsersTable from "./table";

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
        <CustomButton onClick={() => setOpen(true)} variant="primary" size="lg">
          {dict.users.newUser}
        </CustomButton>
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
