"use client";

import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { Button } from "antd";
import { useState } from "react";
import ContractForm from "./contractForm";
import ContractsTable from "./table";

export default function ContractsContainer() {
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
        <Title children={dict.contracts.title} level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          {dict.contracts.newContract}
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditUserId(null);
        }}
        title={editUserId ? "Editar contrato" : "Crear contrato"}
        size="xl"
      >
        <ContractForm
          setOpen={setOpen}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
        />
      </Modal>
      <ContractsTable onEdit={handleEdit} />
    </Container>
  );
}
