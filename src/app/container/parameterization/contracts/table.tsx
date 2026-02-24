"use client";

import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { Button, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useContracts } from "../../../../core/hooks/parameterization/contracts/useGetAllContracts";
import { useDeleteContract } from "../../../../core/hooks/parameterization/contracts/useDeleteContract";
import { TContract } from "../../../../core/interfaces/parameterization/types";

interface ContractsTableProps {
  onEdit: (id: number) => void;
}

const ContractsTable = ({ onEdit }: ContractsTableProps) => {
  const { data: dataContracts = [], isLoading } = useContracts();
  const deleteContract = useDeleteContract();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);

  // ---------- FILTRO ----------
  const filteredContracts = useMemo<TContract[]>(() => {
    const term = search.toLowerCase();

    return dataContracts.filter(
      (contract) =>
        contract.contractNumber.toLowerCase().includes(term) ||
        contract.contractType.toLowerCase().includes(term) ||
        String(contract.id).includes(term),
    );
  }, [search, dataContracts]);

  // ---------- COLUMNAS ----------
  const columns: ColumnsType<TContract> = [
    {
      title: "#",
      width: 60,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Nro Contrato",
      dataIndex: "contractNumber",
      width: 150,
    },
    {
      title: "Tipo",
      dataIndex: "contractType",
      width: 150,
    },
    {
      title: "Fecha Inicio",
      dataIndex: "startDate",
      width: 130,
    },
    {
      title: "Activo",
      dataIndex: "isActive",
      width: 80,
      render: (value: boolean) => (value ? "Sí" : "No"),
    },
    {
      title: "Acciones",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record.id)}>
            Editar
          </Button>

          <Button
            danger
            onClick={() => {
              setContractToDelete(record.id);
              setOpenConfirm(true);
            }}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const handleDelete = () => {
    if (!contractToDelete || deleteContract.isPending) return;
    deleteContract.mutate(contractToDelete, {
      onSuccess: () => {
        toast.success("Contrato eliminado correctamente");
        setOpenConfirm(false);
      },
      onError: () => {
        toast.error("Error eliminando contrato");
        setOpenConfirm(false);
      },
    });
  };

  return (
    <Container className="py-4">
      {/* Buscador */}
      <div className="mb-3">
        <Input
          placeholder="Buscar contrato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={isLoading}
        />
      </div>

      {/* Tabla */}
      <Table<TContract>
        size="small"
        columns={columns}
        dataSource={filteredContracts}
        rowKey="id"
        loading={{ spinning: isLoading, tip: "Cargando contratos..." }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* Confirmación */}
      <ModalConfirm
        open={openConfirm}
        onClose={() => {
          if (deleteContract.isPending) return;
          setOpenConfirm(false);
        }}
        title="Eliminar contrato"
        subtitle="¿Estás seguro de eliminar este contrato?"
        loading={deleteContract.isPending}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default ContractsTable;
