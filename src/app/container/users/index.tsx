"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { useState } from "react";
import CreateUser from "./create";
import { useGetUsers } from "@/core/hooks/users/useGetUsers";
import UsersTable from "./table";

export default function UsersContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);

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
        onClose={() => setOpen(false)}
        title="Crear usuario"
        size="xl"
      >
        <CreateUser setOpen={setOpen} />
      </Modal>

      <UsersTable />
    </Container>
  );
}
