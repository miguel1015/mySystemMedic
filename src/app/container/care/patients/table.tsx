"use client";

import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import DataTable from "@/components/dataTable/DataTable";
import { PersonCell, RowActions, formatDocument } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import { formatInstitutionName, formatPersonName } from "@/core/utils/displayText";
import { GetPatient } from "@/core/interfaces/care/types";
import { useDeletePatient } from "@/core/hooks/care/patients/useDeletePatient";

interface PatientsTableProps {
  data: GetPatient[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
}

const fullNameOf = (p: GetPatient) =>
  [p.firstName, p.middleName, p.lastName, p.secondLastName].filter(Boolean).join(" ");

export default function PatientsTable({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onCreate,
}: PatientsTableProps) {
  const [patientToDelete, setPatientToDelete] = useState<GetPatient | null>(null);
  const deletePatient = useDeletePatient();

  const handleDelete = () => {
    if (!patientToDelete) return;
    deletePatient.mutate(patientToDelete.id, {
      onSuccess: () => {
        toast.success("Paciente eliminado");
        setPatientToDelete(null);
      },
      onError: (err: Error) => {
        toast.error(err.message);
        setPatientToDelete(null);
      },
    });
  };

  const actionsFor = (record: GetPatient) => {
    const name = formatPersonName(fullNameOf(record));
    return (
      <RowActions
        subject={name}
        onEdit={() => onEdit(record.id)}
        items={[
          {
            key: "delete",
            label: "Eliminar paciente",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => setPatientToDelete(record),
          },
        ]}
      />
    );
  };

  const columns: ColumnsType<GetPatient> = [
    {
      title: "Paciente",
      key: "patient",
      sorter: (a, b) => fullNameOf(a).localeCompare(fullNameOf(b), "es"),
      render: (_, record) => (
        <PersonCell
          name={formatPersonName(fullNameOf(record))}
          detail={formatDocument(record.documentTypeCode, record.documentNumber)}
        />
      ),
    },
    {
      title: "EPS",
      dataIndex: "insurerName",
      width: 300,
      sorter: (a, b) => (a.insurerName ?? "").localeCompare(b.insurerName ?? "", "es"),
      render: (value: string) => {
        const label = formatInstitutionName(value) || "Sin EPS";
        return (
          <span className={cellStyles.oneLine} title={label}>
            {label}
          </span>
        );
      },
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 96,
      align: "right",
      fixed: "right",
      render: (_, record) => actionsFor(record),
    },
  ];

  return (
    <>
      <DataTable<GetPatient>
        data={data}
        columns={columns}
        rowKey="id"
        entity={["paciente", "pacientes"]}
        loading={isLoading}
        error={isError}
        onRetry={onRetry}
        rowNumbers
        searchPlaceholder="Buscar por nombre, documento o EPS…"
        searchText={(p) => `${fullNameOf(p)} ${p.documentNumber ?? ""} ${p.insurerName ?? ""}`}
        quickFilters={[
          {
            key: "eps",
            placeholder: "EPS",
            getValue: (p) => p.insurerName,
            formatLabel: formatInstitutionName,
          },
          {
            key: "docType",
            placeholder: "Tipo de documento",
            getValue: (p) => p.documentTypeCode,
            formatLabel: (code) => {
              const name = data.find((p) => p.documentTypeCode === code)?.documentTypeName;
              return name ? `${code} · ${name}` : code;
            },
          },
        ]}
        onRowClick={(p) => onEdit(p.id)}
        emptyAction={{ label: "Registrar el primer paciente", onClick: onCreate }}
        renderCard={(p) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              <PersonCell
                name={formatPersonName(fullNameOf(p))}
                detail={formatDocument(p.documentTypeCode, p.documentNumber)}
              />
              <span className={cellStyles.personDetail} style={{ paddingLeft: 46 }}>
                {formatInstitutionName(p.insurerName) || "Sin EPS"}
              </span>
            </div>
            {actionsFor(p)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        title="Eliminar paciente"
        subtitle={
          patientToDelete
            ? `¿Eliminar a ${formatPersonName(fullNameOf(patientToDelete))}? Esta acción no se puede deshacer.`
            : ""
        }
        onConfirm={handleDelete}
        loading={deletePatient.isPending}
        confirmText="Eliminar"
      />
    </>
  );
}
