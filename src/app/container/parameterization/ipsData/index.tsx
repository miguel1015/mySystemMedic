"use client";

import { useState } from "react";
import { Container } from "../../../../components/container";
import Title from "../../../../components/title";
import { Button } from "antd";
import Modal from "../../../../components/modal";

export default function IpsDataContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children="Ips data" level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          Crear Ips data
        </Button>

        <Modal
          open={open}
          onClose={() => {
            (setOpen(false), setEditUserId(null));
          }}
          title={editUserId ? "Editar medicamento" : "Crear medicamento"}
          size="xl"
        >
          Ips Data
          {/* <MedicinesForm
            setOpen={setOpen}
            editUserId={editUserId}
            setEditUserId={setEditUserId}
          /> */}
        </Modal>
      </div>

      {/* <MedicineTable onEdit={handleEdit} /> */}
    </Container>
  );
}
