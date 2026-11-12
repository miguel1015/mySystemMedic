"use client";

import { Button } from "antd";
import { DollarOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Container } from "@/components/container";
import PageHeader from "@/components/dataTable/PageHeader";
import Modal from "@/components/modal";
import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs";
import TariffsForm from "./tariffsForm";
import TariffsTable from "./table";

export default function TariffsContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useTariffs();
  const total = data?.length ?? 0;

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <PageHeader
        icon={<DollarOutlined />}
        title="Tarifarios"
        subtitle={
          isLoading
            ? "Cargando tarifarios…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "tarifario registrado" : "tarifarios registrados"}`
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Crear tarifario
          </Button>
        }
      />

      <TariffsTable
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
        title={editUserId ? "Editar tarifario" : "Crear tarifario"}
        size="xl"
      >
        <TariffsForm
          setOpen={setOpen}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
        />
      </Modal>
    </Container>
  );
}
