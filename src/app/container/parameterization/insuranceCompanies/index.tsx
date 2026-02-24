"use client";

import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { Button } from "antd";
import { useState } from "react";
import InsuranceCompaniesForm from "./insuranceCompaniesForm";
import InsuranceTable from "./table";

export default function InsuranceCompaniesContainer() {
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
        <Title children={dict.insuranceCompanies.title} level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          {dict.insuranceCompanies.create}
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false), setEditUserId(null);
        }}
        title={editUserId ? "Editar aseguradora" : "Crear aseguradora"}
        size="xl"
      >
        <InsuranceCompaniesForm
          setOpen={setOpen}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
        />
      </Modal>
      <InsuranceTable onEdit={handleEdit} />
    </Container>
  );
}
