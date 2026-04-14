"use client";

import { Button, Input, Space, Table, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import toast from "react-hot-toast";
import { GetPatient } from "@/core/interfaces/care/types";
import { useDeletePatient } from "@/core/hooks/care/patients/useDeletePatient";

interface PatientsTableProps {
  data: GetPatient[];
  isLoading: boolean;
  onEdit: (id: number) => void;
}

export default function PatientsTable({
  data,
  isLoading,
  onEdit,
}: PatientsTableProps) {
  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
  const deletePatient = useDeletePatient();

  const getFullName = (p: GetPatient) =>
    [p.firstName, p.middleName, p.lastName, p.secondLastName]
      .filter(Boolean)
      .join(" ");

  const filteredPatients = useMemo(() => {
    const term = search.toLowerCase();
    return (data ?? []).filter(
      (p) =>
        getFullName(p).toLowerCase().includes(term) ||
        (p.documentNumber ?? "").toLowerCase().includes(term) ||
        (p.insurerName ?? "").toLowerCase().includes(term),
    );
  }, [search, data]);

  const handleDelete = () => {
    if (!patientToDelete) return;

    deletePatient.mutate(patientToDelete, {
      onSuccess: () => {
        toast.success("Paciente eliminado correctamente");
        setOpenConfirm(false);
        setPatientToDelete(null);
      },
      onError: (err: Error) => {
        toast.error(err.message);
        setOpenConfirm(false);
        setPatientToDelete(null);
      },
    });
  };

  const columns: ColumnsType<GetPatient> = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_v, _r, index) => (
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
      title: "Tipo Doc.",
      dataIndex: "documentTypeCode",
      width: 100,
    },
    {
      title: "Documento",
      dataIndex: "documentNumber",
      width: 140,
      render: (value: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
          {value}
        </span>
      ),
    },
    {
      title: "Nombre completo",
      width: 280,
      sorter: (a, b) => getFullName(a).localeCompare(getFullName(b)),
      render: (_, record) => (
        <span style={{ fontWeight: 500 }}>{getFullName(record)}</span>
      ),
    },
    {
      title: "EPS",
      dataIndex: "insurerName",
      width: 160,
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      width: 140,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
    },
    {
      title: "Acciones",
      width: 180,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record.id)}>
            Editar
          </Button>
          <Button
            danger
            onClick={() => {
              setPatientToDelete(record.id);
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
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar por nombre, documento o EPS..."
          prefix={
            <SearchOutlined
              style={{ color: "var(--theme-primary, #0F6F5C)" }}
            />
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: 480, borderRadius: 8 }}
        />
      </div>

      <Table<GetPatient>
        size="middle"
        columns={columns}
        dataSource={filteredPatients}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} pacientes`,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay pacientes registrados" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar paciente"
        subtitle="¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
      />
    </div>
  );
}
