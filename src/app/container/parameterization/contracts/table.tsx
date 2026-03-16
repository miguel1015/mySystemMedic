"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { useDeleteContract } from "../../../../core/hooks/parameterization/contracts/useDeleteContract";
import { useContracts } from "../../../../core/hooks/parameterization/contracts/useGetAllContracts";
import { TContract } from "../../../../core/interfaces/parameterization/types";
import { Input, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

interface ContractsTableProps {
  onEdit: (id: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  activo: "green",
  suspendido: "orange",
  terminado: "red",
};

const ContractsTable = ({ onEdit }: ContractsTableProps) => {
  const { data: dataContracts = [], isLoading } = useContracts();
  const deleteContract = useDeleteContract();
  console.log("🤩🤩🤩", dataContracts);

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);

  const filteredContracts = useMemo<TContract[]>(() => {
    const term = search.toLowerCase();
    return dataContracts.filter(
      (contract) =>
        contract.contractName?.toLowerCase().includes(term) ||
        contract.contractNumber?.toLowerCase().includes(term) ||
        String(contract.id).includes(term),
    );
  }, [search, dataContracts]);

  const columns: ColumnsType<TContract> = [
    {
      title: "#",
      width: 60,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "Nombre del contrato",
      dataIndex: "contractName",
      width: 250,
    },
    {
      title: "Fecha de inicio",
      dataIndex: "startDate",
      width: 150,
    },
    {
      title: "Fecha final",
      dataIndex: "endDate",
      width: 150,
      render: (value: string | null) => value ?? "—",
    },
    {
      title: "Estado",
      dataIndex: "contractStatusDescription",
      width: 130,
      render: (value: string) => (
        <Tag color={STATUS_COLORS[value?.toLowerCase()] ?? "default"}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "—"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <Space>
          <CustomButton
            size="sm"
            variant="outline"
            onClick={() => onEdit(record.id)}
          >
            Editar
          </CustomButton>
          <CustomButton
            size="sm"
            variant="danger"
            onClick={() => {
              setContractToDelete(record.id);
              setOpenConfirm(true);
            }}
          >
            Eliminar
          </CustomButton>
        </Space>
      ),
    },
  ];

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar contrato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      <Table<TContract>
        columns={columns}
        dataSource={filteredContracts}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={{ spinning: isLoading, tip: "Cargando contratos..." }}
        scroll={{ x: "max-content" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar contrato"
        subtitle="¿Estás seguro de eliminar este contrato?"
        onConfirm={() => {
          if (!contractToDelete) return;

          deleteContract.mutate(contractToDelete, {
            onSuccess: () => toast.success("Contrato eliminado"),
            onError: () => toast.error("Error eliminando contrato"),
          });

          setOpenConfirm(false);
        }}
      />
    </Container>
  );
};

export default ContractsTable;
