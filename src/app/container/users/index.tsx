"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import CreateUser from "./create";
import { useState } from "react";
import Modal from "@/components/modal";
import Title from "@/components/title";
import UsersTable from "@/components/table";
import useDictionary from "@/locales/dictionary-hook";
import { useUserRoles } from "@/core/hooks/roles/useUser";

export default function UsersContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useUserRoles();

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
