"use client";

import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { Button, Input, Space, Table } from "antd";
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

  // ---------- FILTRO ----------
  const filteredTariffs = useMemo<TTariffs[]>(() => {
    const term = search.toLowerCase();

    return dataTariffs.filter(
      (tariffs) =>
        tariffs.name.toLowerCase().includes(term) ||
        String(tariffs.id).includes(term),
    );
  }, [search, dataTariffs]);

  // ---------- COLUMNAS ----------
  const columns: ColumnsType<TTariffs> = [
    {
      title: "#",
      width: 80,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 120,
      sorter: (a, b) => a.id! - b.id!,
    },
    {
      title: "Nombre",
      dataIndex: "name",
      width: 300,
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
      {/* Buscador */}
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

      {/* Tabla */}
      <Table<TTariffs>
        size="small"
        columns={columns}
        dataSource={filteredTariffs}
        rowKey="id"
        loading={{ spinning: isLoading, tip: "Cargando información..." }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* Confirmación */}
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
