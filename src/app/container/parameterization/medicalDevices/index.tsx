"use client";

import { Button } from "antd";
import { useState } from "react";
import { Container } from "../../../../components/container";
import Modal from "../../../../components/modal";
import Title from "../../../../components/title";

import MedicalDevicesForm from "./medicalDevicesForm";
import MedicalDevicesTable from "./table";

export default function MedicalDevicesContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children="Dispositivos médicos" level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          Crear dispositivo medico
        </Button>

        <Modal
          open={open}
          onClose={() => {
            (setOpen(false), setEditUserId(null));
          }}
          title={editUserId ? "Editar medicamento" : "Crear medicamento"}
          size="xl"
        >
          <MedicalDevicesForm
            setOpen={setOpen}
            editUserId={editUserId}
            setEditUserId={setEditUserId}
          />
        </Modal>
      </div>

      <MedicalDevicesTable onEdit={handleEdit} />
    </Container>
  );
}
