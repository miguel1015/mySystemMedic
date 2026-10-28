"use client";

import { Button, Dropdown, Table, Tag } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import {
  CarOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  HistoryOutlined,
  SendOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import toast from "react-hot-toast";
import { AdmissionResponse } from "@/core/interfaces/care/types";
import { useDeleteAdmission } from "@/core/hooks/care/admissions/useDeleteAdmission";
import { formatDateTime } from "@/core/utils/date";

export type AdmissionAction =
  | "edit"
  | "history"
  | "furips"
  | "companion"
  | "referral"
  | "delete";

interface AdmissionsTableProps {
  data: AdmissionResponse[];
  isLoading: boolean;
  onEdit?: (admission: AdmissionResponse) => void;
  onHistory?: (admission: AdmissionResponse) => void;
  onFurips?: (admission: AdmissionResponse) => void;
  // Si se omite, la tabla es de solo consulta (sin columna de acciones).
  withActions?: boolean;
  emptyText?: string;
}

// Opciones que aún no tienen módulo propio.
const PENDING_ACTIONS: Partial<Record<AdmissionAction, string>> = {
  companion: "Ingresar acompañante",
  referral: "Remisión",
};

export default function AdmissionsTable({
  data,
  isLoading,
  onEdit,
  onHistory,
  onFurips,
  withActions = true,
  emptyText = "No existen registros para los criterios de búsqueda",
}: AdmissionsTableProps) {
  const [admissionToDelete, setAdmissionToDelete] =
    useState<AdmissionResponse | null>(null);
  const deleteAdmission = useDeleteAdmission();

  const handleDelete = () => {
    if (!admissionToDelete) return;
    deleteAdmission.mutate(admissionToDelete.id, {
      onSuccess: () => {
        toast.success("Admision eliminada correctamente");
        setAdmissionToDelete(null);
      },
      onError: (err: Error) => {
        toast.error(err.message);
        setAdmissionToDelete(null);
      },
    });
  };

  const handleAction = (action: AdmissionAction, record: AdmissionResponse) => {
    switch (action) {
      case "edit":
        onEdit?.(record);
        break;
      case "history":
        onHistory?.(record);
        break;
      case "furips":
        onFurips?.(record);
        break;
      case "delete":
        setAdmissionToDelete(record);
        break;
      default:
        toast(`${PENDING_ACTIONS[action]}: funcionalidad en desarrollo`, {
          icon: "🛠️",
        });
    }
  };

  // Editar y eliminar solo aplican a admisiones activas; las cerradas quedan
  // para consulta del historial.
  const buildMenu = (record: AdmissionResponse): MenuProps["items"] => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Editar admisión",
      disabled: !record.isActive,
    },
    { key: "history", icon: <HistoryOutlined />, label: "Historial de admisiones" },
    { key: "furips", icon: <CarOutlined />, label: "Información del accidente (FURIPS)" },
    { key: "companion", icon: <UserAddOutlined />, label: PENDING_ACTIONS.companion },
    { key: "referral", icon: <SendOutlined />, label: PENDING_ACTIONS.referral },
    { type: "divider" },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Eliminar admisión",
      danger: true,
      disabled: !record.isActive,
    },
  ];

  const columns: ColumnsType<AdmissionResponse> = [
    {
      title: "N° admisión",
      dataIndex: "id",
      width: 120,
      align: "center",
      render: (value: number) => (
        <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
          {value}
        </span>
      ),
    },
    {
      title: "Fecha de admision",
      dataIndex: "admissionDate",
      width: 200,
      render: (value: string) => (
        <span style={{ fontFamily: "monospace" }}>
          {formatDateTime(value)}
        </span>
      ),
    },
    {
      title: "Documento",
      dataIndex: "documentoPatiente",
      width: 160,
      render: (value: string, record) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
          {record.documentTypeCode} {value}
        </span>
      ),
    },
    {
      title: "Paciente",
      dataIndex: "nombrePaciente",
      width: 240,
      render: (value: string) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "Triage",
      dataIndex: "triagePrioridad",
      width: 100,
      align: "center",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "EPS",
      dataIndex: "epsNombre",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Convenio",
      dataIndex: "convenioNombre",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Estado",
      dataIndex: "isActive",
      width: 110,
      align: "center",
      render: (value: boolean) =>
        value ? <Tag color="green">Activa</Tag> : <Tag>Cerrada</Tag>,
    },
  ];

  if (withActions) {
    columns.push({
      title: "Acciones",
      width: 140,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: buildMenu(record),
            onClick: ({ key }) => handleAction(key as AdmissionAction, record),
          }}
        >
          <Button type="primary">
            Acciones <DownOutlined />
          </Button>
        </Dropdown>
      ),
    });
  }

  return (
    <div>
      <Table<AdmissionResponse>
        size="middle"
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        pagination={data.length > 10 ? { pageSize: 10 } : false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText }}
      />

      <ModalConfirm
        open={!!admissionToDelete}
        onClose={() => setAdmissionToDelete(null)}
        title="Eliminar admision"
        subtitle="Esta accion cerrara la admision seleccionada. No se puede deshacer."
        loading={deleteAdmission.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
