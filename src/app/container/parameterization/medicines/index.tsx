"use client";

import { useState } from "react";
import { Container } from "../../../../components/container";
import Title from "../../../../components/title";
import { Button } from "antd";
import Modal from "../../../../components/modal";
import MedicinesForm from "./medicineForm";
import MedicineTable from "./table";

export default function MedicineContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children="Medicamentos" level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          Crear medicamento
        </Button>

        <Modal
          open={open}
          onClose={() => {
            (setOpen(false), setEditUserId(null));
          }}
          title={editUserId ? "Editar medicamento" : "Crear medicamento"}
          size="xl"
        >
          <MedicinesForm
            setOpen={setOpen}
            editUserId={editUserId}
            setEditUserId={setEditUserId}
          />
        </Modal>
      </div>

      <MedicineTable onEdit={handleEdit} />
    </Container>
  );
}
