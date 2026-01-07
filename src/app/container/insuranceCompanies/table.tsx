"use client";

import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDeleteUser } from "@/core/hooks/users/useDeleteUser";
import { useInsurers } from "@/core/hooks/utils/useInsurer";
import { TInsurers } from "../../../core/interfaces/user/users";
import { useDeleteInsuranceCompany } from "../../../core/hooks/parameterization/insuranceCompany/useDeleteInsuranceCompany";

interface InsuranceTableProps {
  onEdit: (id: number) => void;
}

export default function InsuranceTable({ onEdit }: InsuranceTableProps) {
  const { data: dataInsurers = [] } = useInsurers();
  const deleteInsurer = useDeleteInsuranceCompany();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [insurerToDelete, setInsurerToDelete] = useState<number | null>(null);

  // ---------- FILTRO ----------
  const filteredInsurers = useMemo<TInsurers[]>(() => {
    const term = search.toLowerCase();

    return dataInsurers.filter(
      (insurer) =>
        insurer.name.toLowerCase().includes(term) ||
        String(insurer.id).includes(term)
    );
  }, [search, dataInsurers]);

  // ---------- COLUMNAS ----------
  const columns: ColumnsType<TInsurers> = [
    {
      title: "#",
      width: 80,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record.id)}>
            Editar
          </Button>

          <Button
            danger
            onClick={() => {
              setInsurerToDelete(record.id);
              setOpenConfirm(true);
            }}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Container className="py-4">
      {/* Buscador */}
      <div className="mb-3">
        <Input
          placeholder="Buscar aseguradora..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      {/* Tabla */}
      <Table<TInsurers>
        size="small"
        columns={columns}
        dataSource={filteredInsurers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* Confirmación */}
      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar aseguradora"
        subtitle="¿Estás seguro de eliminar esta aseguradora?"
        onConfirm={() => {
          if (!insurerToDelete) return;

          deleteInsurer.mutate(insurerToDelete, {
            onSuccess: () => toast.success("Aseguradora eliminada"),
            onError: () => toast.error("Error eliminando aseguradora"),
          });

          setOpenConfirm(false);
        }}
      />
    </Container>
  );
}
