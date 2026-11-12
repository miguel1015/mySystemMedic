"use client";

import { Button } from "antd";
import { MedicineBoxOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Container } from "@/components/container";
import PageHeader from "@/components/dataTable/PageHeader";
import Modal from "@/components/modal";
import { useMedicines } from "@/core/hooks/parameterization/medicines/useGetAllMedicines";
import MedicinesForm from "./medicineForm";
import MedicineTable from "./table";

export default function MedicineContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useMedicines();
  const total = data?.length ?? 0;

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <PageHeader
        icon={<MedicineBoxOutlined />}
        title="Medicamentos"
        subtitle={
          isLoading
            ? "Cargando medicamentos…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "medicamento registrado" : "medicamentos registrados"}`
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Crear medicamento
          </Button>
        }
      />

      <MedicineTable
        data={data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onCreate={() => setOpen(true)}
      />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditUserId(null);
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
    </Container>
  );
}
