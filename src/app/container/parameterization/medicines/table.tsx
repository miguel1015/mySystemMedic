"use client";

import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { Button, Input, Space, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  UploadOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  TTableMedicine,
  TTariffs,
} from "../../../../core/interfaces/parameterization/types";

interface MedicineProps {
  onEdit: (id: number) => void;
}

const MedicineTable = ({ onEdit }: MedicineProps) => {
  //   const { data: dataTariffs = [], isLoading } = useTariffs();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);

  // ---------- FILTRO ----------
  //   const filteredTariffs = useMemo<TTariffs[]>(() => {
  //     const term = search.toLowerCase();

  //     return dataTariffs.filter(
  //       (tariffs) =>
  //         tariffs.name.toLowerCase().includes(term) ||
  //         String(tariffs.id).includes(term),
  //     );
  //   }, [search, dataTariffs]);

  // ---------- COLUMNAS ----------
  const columns: ColumnsType<TTableMedicine> = [
    {
      title: "#",
      width: 20,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      width: 20,
      sorter: (a, b) => a.id! - b.id!,
    },
    {
      title: "Código",
      dataIndex: "name",
      width: "auto",
    },
    {
      title: "Nombre del medicamento",
      dataIndex: "name",
      width: "auto",
    },
    {
      title: "CUM",
      dataIndex: "name",
      width: "auto",
    },
    {
      title: "Estado",
      dataIndex: "name",
      width: "auto",
    },
    {
      title: "Acciones",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => onEdit(record.id!)}
            />
          </Tooltip>
          <Tooltip title="Cargar lote">
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => onEdit(record.id!)}
            />
          </Tooltip>
          <Tooltip title="Editar lote">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id!)}
            />
          </Tooltip>
          <Tooltip title="Agregar a hoja de hospitalización">
            <Button type="default" icon={<MedicineBoxOutlined />} />
          </Tooltip>
          <Tooltip title="Agregar a hoja de cirugía">
            <Button type="default" icon={<ScissorOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleDelete = () => {
    toast.success("Formulario visual");
    // if (!tariffsDelete || deleteTariffs.isPending) return;
    // deleteTariffs.mutate(tariffsDelete, {
    //   onSuccess: () => {
    //     toast.success("Medicamento eliminado correctamente");
    //     setOpenConfirm(false);
    //   },
    //   onError: () => {
    //     toast.error("Error eliminando tarifario");
    //     setOpenConfirm(false);
    //   },
    // });
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
          //   disabled={isLoading}
        />
      </div>

      {/* Tabla */}
      <Table<TTableMedicine>
        size="small"
        columns={columns}
        dataSource={[
          { id: 1, name: "Medicamento 1", cum: "CUM 1", status: "Activo" },
        ]}
        rowKey="id"
        // loading={{ spinning: isLoading, tip: "Cargando información..." }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* Confirmación */}
      <ModalConfirm
        open={openConfirm}
        onClose={() => {
          setOpenConfirm(false);
        }}
        title="Eliminar medicamento"
        subtitle="¿Estás seguro de eliminar este medicamento?"
        // loading={deleteTariffs.isPending}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default MedicineTable;
