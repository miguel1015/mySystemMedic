"use client";

import { useState } from "react";
import { Container } from "../../../../components/container";
import Title from "../../../../components/title";
import { Button } from "antd";
import Modal from "../../../../components/modal";
import TariffsForm from "./tariffsForm";
import TariffsTable from "./table";

export default function TariffsContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children="Tarifarios" level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          Crear tarifario
        </Button>

        <Modal
          open={open}
          onClose={() => {
            (setOpen(false), setEditUserId(null));
          }}
          title={editUserId ? "Editar tarifario" : "Crear tarifario"}
          size="xl"
        >
          <TariffsForm
            setOpen={setOpen}
            editUserId={editUserId}
            setEditUserId={setEditUserId}
          />
        </Modal>
      </div>

      <TariffsTable onEdit={handleEdit} />
    </Container>
  );
}
