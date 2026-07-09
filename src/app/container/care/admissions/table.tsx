"use client";

import { Button, Input, Space, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import toast from "react-hot-toast";
import { AdmissionResponse } from "@/core/interfaces/care/types";
import { useDeleteAdmission } from "@/core/hooks/care/admissions/useDeleteAdmission";

interface AdmissionsTableProps {
  data: AdmissionResponse[];
  isLoading: boolean;
  onEdit: (admission: AdmissionResponse) => void;
}

function formatAdmissionDate(value: string): string {
  const datePart = value?.split("T")[0];
  if (!datePart) return "-";
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return "-";
  return `${day}/${month}/${year}`;
}

export default function AdmissionsTable({
  data,
  isLoading,
  onEdit,
}: AdmissionsTableProps) {
  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState<number | null>(
    null,
  );
  const deleteAdmission = useDeleteAdmission();

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return (data ?? []).filter((admission) => {
      if (!term) return true;
      return (
        admission.nombrePaciente?.toLowerCase().includes(term) ||
        admission.documentoPatiente?.toLowerCase().includes(term) ||
        admission.epsNombre?.toLowerCase().includes(term) ||
        admission.convenioNombre?.toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const handleDelete = () => {
    if (!admissionToDelete) return;
    deleteAdmission.mutate(admissionToDelete, {
      onSuccess: () => {
        toast.success("Admision eliminada correctamente");
        setOpenConfirm(false);
        setAdmissionToDelete(null);
      },
      onError: (err: Error) => {
        toast.error(err.message);
        setOpenConfirm(false);
        setAdmissionToDelete(null);
      },
    });
  };

  const columns: ColumnsType<AdmissionResponse> = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_value, _record, index) => (
        <span
          style={{
            fontWeight: 600,
            color: "var(--dash-text-secondary, #6b7280)",
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: "Fecha de admision",
      dataIndex: "admissionDate",
      width: 150,
      sorter: (a, b) =>
        (a.admissionDate ?? "").localeCompare(b.admissionDate ?? ""),
      render: (value: string) => (
        <span style={{ fontFamily: "monospace" }}>
          {formatAdmissionDate(value)}
        </span>
      ),
    },
    {
      title: "Fecha de registro",
      dataIndex: "createdAt",
      width: 180,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (value: string) => (
        <span style={{ fontFamily: "monospace" }}>
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Documento",
      dataIndex: "documentoPatiente",
      width: 140,
      render: (value: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
          {value}
        </span>
      ),
    },
    {
      title: "Paciente",
      dataIndex: "nombrePaciente",
      width: 240,
      sorter: (a, b) =>
        (a.nombrePaciente ?? "").localeCompare(b.nombrePaciente ?? ""),
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
      title: "Acciones",
      width: 180,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record)}>
            Editar
          </Button>
          <Button
            danger
            onClick={() => {
              setAdmissionToDelete(record.id);
              setOpenConfirm(true);
            }}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Input
          placeholder="Buscar por documento, paciente, EPS o convenio..."
          prefix={
            <SearchOutlined
              style={{ color: "var(--theme-primary, #0F6F5C)" }}
            />
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: 440, borderRadius: 8 }}
        />
      </div>

      <Table<AdmissionResponse>
        size="middle"
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} admisiones`,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay admisiones registradas" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar admision"
        subtitle="Esta accion cerrara la admision seleccionada. No se puede deshacer."
        loading={deleteAdmission.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
