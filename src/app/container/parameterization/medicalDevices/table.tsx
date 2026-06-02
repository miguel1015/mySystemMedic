"use client";

import { Container } from "@/components/container";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import { Button, Input, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { TMedicalDevice } from "../../../../core/interfaces/parameterization/types";
import { useDeleteMedicalDevice } from "@/core/hooks/parameterization/medicalDevices/useDeleteMedicalDevice";
import { useMedicalDevices } from "@/core/hooks/parameterization/medicalDevices/useGetAllMedicalDevices";

interface MedicalDevicesProps {
  onEdit: (id: number) => void;
}

const MedicalDevicesTable = ({ onEdit }: MedicalDevicesProps) => {
  const { data: dataMedicalDevices = [], isLoading } = useMedicalDevices();
  const deleteMedicalDevice = useDeleteMedicalDevice();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [medicalDeviceToDelete, setMedicalDeviceToDelete] = useState<
    number | null
  >(null);

  const filteredMedicalDevices = useMemo<TMedicalDevice[]>(() => {
    const term = search.toLowerCase();

    return dataMedicalDevices.filter(
      (device) =>
        device.elementName.toLowerCase().includes(term) ||
        device.ripsCode.toLowerCase().includes(term) ||
        (device.elementTypeName ?? "").toLowerCase().includes(term) ||
        (device.elementUsageName ?? "").toLowerCase().includes(term) ||
        String(device.id).includes(term),
    );
  }, [search, dataMedicalDevices]);

  const columns: ColumnsType<TMedicalDevice> = [
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
      title: "Nombre de elemento",
      dataIndex: "elementName",
      width: "auto",
    },
    {
      title: "Tipo de elemento",
      dataIndex: "elementTypeName",
      width: "auto",
    },
    {
      title: "Uso del elemento",
      dataIndex: "elementUsageName",
      width: "auto",
    },
    {
      title: "Código RIPS",
      dataIndex: "ripsCode",
      width: "auto",
    },
    {
      title: "Reintegrable",
      dataIndex: "isReusable",
      width: 120,
      render: (value: boolean) => (
        <Tag color={value ? "green" : "default"}>{value ? "Sí" : "No"}</Tag>
      ),
    },
    {
      title: "Invasivo",
      dataIndex: "isInvasive",
      width: 120,
      render: (value: boolean) => (
        <Tag color={value ? "orange" : "default"}>{value ? "Sí" : "No"}</Tag>
      ),
    },
    {
      title: "Acciones",
      width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button type="default" icon={<EyeOutlined />} disabled />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id!)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setMedicalDeviceToDelete(record.id!);
                setOpenConfirm(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleDelete = () => {
    if (!medicalDeviceToDelete || deleteMedicalDevice.isPending) return;

    deleteMedicalDevice.mutate(medicalDeviceToDelete, {
      onSuccess: () => {
        toast.success("Dispositivo médico eliminado correctamente");
        setOpenConfirm(false);
        setMedicalDeviceToDelete(null);
      },
      onError: () => {
        toast.error("Error eliminando dispositivo médico");
        setOpenConfirm(false);
      },
    });
  };

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar dispositivo médico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={isLoading}
        />
      </div>

      <Table<TMedicalDevice>
        size="small"
        columns={columns}
        dataSource={filteredMedicalDevices}
        rowKey="id"
        loading={{ spinning: isLoading, tip: "Cargando información..." }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => {
          setOpenConfirm(false);
          setMedicalDeviceToDelete(null);
        }}
        title="Eliminar dispositivo médico"
        subtitle="¿Estás seguro de eliminar este dispositivo médico?"
        loading={deleteMedicalDevice.isPending}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default MedicalDevicesTable;
