"use client";

import { Container } from "@/components/container";
import Title from "@/components/title";
import { Button } from "antd";
import { useState } from "react";
import PatientsForm from "./patientsForm";
import Modal from "../../../components/modal";

export default function PatientsContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children="Pacientes" level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          Crear paciente
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Crear paciente"
        size="xl"
      >
        <PatientsForm setOpen={setOpen} setEditUserId={setEditUserId} />
      </Modal>
      {/* <InsuranceTable onEdit={handleEdit} /> */}
    </Container>
  );
}
