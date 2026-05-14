"use client";

import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { Button, Input, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDeleteTariffs } from "../../../../core/hooks/parameterization/tariffs/useDeleteTariffs";
import { useTariffs } from "../../../../core/hooks/parameterization/tariffs/useGetAllTariffs";
import { TTariffs } from "../../../../core/interfaces/parameterization/types";

interface TariffsTableProps {
  onEdit: (id: number) => void;
}

const TariffsTable = ({ onEdit }: TariffsTableProps) => {
  const { data: dataTariffs = [], isLoading } = useTariffs();
  const deleteTariffs = useDeleteTariffs();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [tariffsDelete, setTariffsDelete] = useState<number | null>(null);

  const filteredTariffs = useMemo<TTariffs[]>(() => {
    const term = search.toLowerCase();

    return dataTariffs.filter(
      (tariffs) =>
        tariffs.name.toLowerCase().includes(term) ||
        (tariffs.valueMethodDescription ?? "").toLowerCase().includes(term) ||
        (tariffs.tariffDetailDescription ?? "").toLowerCase().includes(term) ||
        (tariffs.contractName ?? "").toLowerCase().includes(term) ||
        String(tariffs.id).includes(term),
    );
  }, [search, dataTariffs]);

  const columns: ColumnsType<TTariffs> = [
    {
      title: "#",
      width: 50,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
      sorter: (a, b) => a.id! - b.id!,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "Contrato",
      dataIndex: "contractName",
      width: 300,
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "Método de valoración",
      dataIndex: "valueMethodDescription",
      width: 200,
      render: (_value: string | undefined, record) =>
        record.valueMethodDescription ?? record.tariffDetailDescription ?? "-",
    },
    {
      title: "Estado",
      dataIndex: "isActive",
      width: 100,
      render: (value: boolean) =>
        value ? (
          <Tag color="green">Activo</Tag>
        ) : (
          <Tag color="red">Inactivo</Tag>
        ),
    },
    {
      title: "Acciones",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record.id!)}>
            Editar
          </Button>

          <Button
            danger
            onClick={() => {
              setTariffsDelete(record.id!);
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
    if (!tariffsDelete || deleteTariffs.isPending) return;
    deleteTariffs.mutate(tariffsDelete, {
      onSuccess: () => {
        toast.success("Tarifario eliminado correctamente");
        setOpenConfirm(false);
      },
      onError: () => {
        toast.error("Error eliminando tarifario");
        setOpenConfirm(false);
      },
    });
  };

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar tarifario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={isLoading}
        />
      </div>

      <Table<TTariffs>
        size="small"
        columns={columns}
        dataSource={filteredTariffs}
        rowKey="id"
        loading={{ spinning: isLoading, tip: "Cargando información..." }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => {
          if (deleteTariffs.isPending) return;
          setOpenConfirm(false);
        }}
        title="Eliminar tarifario"
        subtitle="¿Estás seguro de eliminar este tarifario?"
        loading={deleteTariffs.isPending}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default TariffsTable;
