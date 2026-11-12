"use client";

import { Container } from "@/components/container";
import PageHeader from "@/components/dataTable/PageHeader";
import Modal from "@/components/modal";
import useDictionary from "@/locales/dictionary-hook";
import { Button } from "antd";
import { FileProtectOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useContracts } from "@/core/hooks/parameterization/contracts/useGetAllContracts";
import ContractForm from "./contractForm";
import ContractsTable from "./table";

export default function ContractsContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useContracts();
  const total = data?.length ?? 0;

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <PageHeader
        icon={<FileProtectOutlined />}
        title={dict.contracts.title}
        subtitle={
          isLoading
            ? "Cargando contratos…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "contrato registrado" : "contratos registrados"}`
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            {dict.contracts.newContract}
          </Button>
        }
      />

      <ContractsTable
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
        title={editUserId ? "Editar contrato" : "Crear contrato"}
        size="xl"
      >
        <ContractForm
          setOpen={setOpen}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
        />
      </Modal>
    </Container>
  );
}
