"use client";

import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";
import { useState } from "react";
import TariffDetailForm from "./tariffDetailForm";
import TariffDetailsTable from "./table";

export default function TariffDetailsContainer() {
  const [editingRecord, setEditingRecord] = useState<TTariffDetail | null>(
    null,
  );

  const handleClose = () => setEditingRecord(null);

  return (
    <Container>
      <Title children="Detalle del tarifario" level={3} />

      <Modal
        open={!!editingRecord}
        onClose={handleClose}
        title="Editar detalle del tarifario"
        size="xl"
      >
        <TariffDetailForm record={editingRecord} onClose={handleClose} />
      </Modal>

      <TariffDetailsTable onEdit={setEditingRecord} />
    </Container>
  );
}
