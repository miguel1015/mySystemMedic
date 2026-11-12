"use client";

import { Container } from "@/components/container";
import PageHeader from "@/components/dataTable/PageHeader";
import Modal from "@/components/modal";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useState } from "react";
import TariffDetailForm from "./tariffDetailForm";
import TariffDetailsTable from "./table";

export default function TariffDetailsContainer() {
  const [editingRecord, setEditingRecord] = useState<TTariffDetail | null>(null);
  const [total, setTotal] = useState<number | undefined>();

  const handleClose = () => setEditingRecord(null);

  return (
    <Container>
      <PageHeader
        icon={<UnorderedListOutlined />}
        title="Detalle del tarifario"
        subtitle={
          total === undefined
            ? "Códigos, valores y CUPS de cada tarifario"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "código" : "códigos"} en los tarifarios`
        }
      />

      <TariffDetailsTable onEdit={setEditingRecord} onTotal={setTotal} />

      <Modal
        open={!!editingRecord}
        onClose={handleClose}
        title="Editar detalle del tarifario"
        size="xl"
      >
        <TariffDetailForm record={editingRecord} onClose={handleClose} />
      </Modal>
    </Container>
  );
}
