"use client";

import { Button } from "antd";
import { ExperimentOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Container } from "@/components/container";
import PageHeader from "@/components/dataTable/PageHeader";
import Modal from "@/components/modal";
import { useMedicalDevices } from "@/core/hooks/parameterization/medicalDevices/useGetAllMedicalDevices";
import MedicalDevicesForm from "./medicalDevicesForm";
import MedicalDevicesTable from "./table";

export default function MedicalDevicesContainer() {
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useMedicalDevices();
  const total = data?.length ?? 0;

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <PageHeader
        icon={<ExperimentOutlined />}
        title="Dispositivos médicos"
        subtitle={
          isLoading
            ? "Cargando dispositivos…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "dispositivo registrado" : "dispositivos registrados"}`
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Crear dispositivo médico
          </Button>
        }
      />

      <MedicalDevicesTable
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
        title={editUserId ? "Editar dispositivo médico" : "Crear dispositivo médico"}
        size="xl"
      >
        <MedicalDevicesForm
          setOpen={setOpen}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
        />
      </Modal>
    </Container>
  );
}
