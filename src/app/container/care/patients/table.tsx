"use client";

import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HistoryOutlined,
  MedicineBoxOutlined,
  SolutionOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import DataTable from "@/components/dataTable/DataTable";
import { PersonCell, RowActions, RowMenuItem, formatDocument } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import {
  formatCatalogLabel,
  formatInstitutionName,
  formatPersonName,
} from "@/core/utils/displayText";
import { formatAge } from "@/core/utils/date";
import { canAccessRoute } from "@/core/utils/routeAccess";
import { AdmissionHistoryPatient, GetPatient } from "@/core/interfaces/care/types";
import { useDeletePatient } from "@/core/hooks/care/patients/useDeletePatient";
import { useNavigationAccess } from "@/core/hooks/authentication/useNavigationAccess";
import PatientAdmissionsModal from "../admissionHistory/patientAdmissionsModal";

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

// Para ordenar por edad: fecha de nacimiento más reciente = más joven. Sin fecha va al final.
const birthTimeOf = (p: GetPatient) => {
  const t = p.birthDate ? new Date(p.birthDate).getTime() : NaN;
  return Number.isNaN(t) ? -Infinity : t;
};

// "34 años · Masculino"
const ageAndSexOf = (p: GetPatient) =>
  [formatAge(p.birthDate, ""), formatCatalogLabel(p.sexName)].filter(Boolean).join(" · ");

const PhoneLink = ({ phone }: { phone?: string | null }) => {
  const value = phone?.trim();
  if (!value) return <span className={cellStyles.personDetail}>—</span>;
  return (
    <a href={`tel:${value.replace(/[^\d+]/g, "")}`} className={cellStyles.phone}>
      {value}
    </a>
  );
};

export default function PatientsTable({
  data,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onCreate,
}: PatientsTableProps) {
  const router = useRouter();
  const { data: access } = useNavigationAccess();
  const [patientToDeactivate, setPatientToDeactivate] = useState<GetPatient | null>(null);
  const [historyPatient, setHistoryPatient] = useState<AdmissionHistoryPatient | null>(null);
  const deletePatient = useDeletePatient();

  // Solo se ofrecen las acciones de las vistas que el usuario puede abrir.
  const can = (route: string) => !!access && canAccessRoute(route, access);

  // El backend inactiva al paciente (no lo borra): sus admisiones e historia se conservan.
  const handleDeactivate = () => {
    if (!patientToDeactivate) return;
    deletePatient.mutate(patientToDeactivate.id, {
      onSuccess: () => {
        toast.success("Paciente inactivado");
        setPatientToDeactivate(null);
      },
      onError: (err: Error) => {
        toast.error(err.message);
        setPatientToDeactivate(null);
      },
    });
  };

  const actionsFor = (record: GetPatient) => {
    const name = formatPersonName(fullNameOf(record));
    const document = encodeURIComponent(record.documentNumber ?? "");
    const items: RowMenuItem[] = [];

    if (can("/care/triage/new")) {
      items.push({
        key: "triage",
        label: "Registrar triage",
        icon: <MedicineBoxOutlined />,
        onClick: () => router.push(`/care/triage/new?document=${document}`),
      });
    }
    if (can("/care/admissions/new")) {
      items.push({
        key: "admission",
        label: "Registrar admisión",
        icon: <SolutionOutlined />,
        onClick: () => router.push(`/care/admissions/new?document=${document}`),
      });
    }
    if (can("/care/admissionHistory")) {
      items.push({
        key: "history",
        label: "Historial de admisiones",
        icon: <HistoryOutlined />,
        onClick: () =>
          setHistoryPatient({
            patientId: record.id,
            nombrePaciente: name,
            documentTypeCode: record.documentTypeCode,
            documentoPatiente: record.documentNumber,
            epsNombre: record.insurerName,
            totalAdmisiones: 0,
            ultimaAdmision: "",
          }),
      });
    }
    items.push({
      key: "deactivate",
      label: "Inactivar paciente",
      icon: <UserDeleteOutlined />,
      danger: true,
      dividerBefore: items.length > 0,
      onClick: () => setPatientToDeactivate(record),
    });

    return <RowActions subject={name} onEdit={() => onEdit(record.id)} items={items} />;
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
      title: "Edad",
      key: "age",
      width: 140,
      sorter: (a, b) => birthTimeOf(b) - birthTimeOf(a),
      render: (_, record) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.tabular}>{formatAge(record.birthDate)}</span>
          {record.sexName && (
            <span className={cellStyles.personDetail}>{formatCatalogLabel(record.sexName)}</span>
          )}
        </span>
      ),
    },
    {
      title: "EPS y contrato",
      key: "insurer",
      width: 300,
      sorter: (a, b) => (a.insurerName ?? "").localeCompare(b.insurerName ?? "", "es"),
      render: (_, record) => {
        const eps = formatInstitutionName(record.insurerName) || "Sin EPS";
        const contract = record.contractName?.trim();
        return (
          <span className={cellStyles.stack}>
            <span className={cellStyles.oneLine} title={eps}>
              {eps}
            </span>
            {contract && (
              <span className={`${cellStyles.oneLine} ${cellStyles.personDetail}`} title={contract}>
                {contract}
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: "Teléfono",
      key: "phone",
      width: 150,
      render: (_, record) => <PhoneLink phone={record.phone} />,
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
        syncUrl
        searchPlaceholder="Buscar por nombre, documento, EPS o teléfono…"
        searchText={(p) =>
          `${fullNameOf(p)} ${p.documentNumber ?? ""} ${p.insurerName ?? ""} ${p.phone ?? ""}`
        }
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
          {
            key: "sex",
            placeholder: "Sexo",
            getValue: (p) => p.sexName,
            formatLabel: formatCatalogLabel,
          },
        ]}
        onRowClick={(p) => onEdit(p.id)}
        emptyAction={{ label: "Registrar el primer paciente", onClick: onCreate }}
        renderCard={(p) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.rowCardBody}>
              <PersonCell
                name={formatPersonName(fullNameOf(p))}
                detail={formatDocument(p.documentTypeCode, p.documentNumber)}
              />
              <span className={cellStyles.personDetail}>
                {[ageAndSexOf(p), formatInstitutionName(p.insurerName) || "Sin EPS"]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {p.phone?.trim() && <PhoneLink phone={p.phone} />}
            </div>
            {actionsFor(p)}
          </div>
        )}
      />

      <ModalConfirm
        open={!!patientToDeactivate}
        onClose={() => setPatientToDeactivate(null)}
        title="Inactivar paciente"
        subtitle={
          patientToDeactivate
            ? `¿Inactivar a ${formatPersonName(fullNameOf(patientToDeactivate))}? Dejará de aparecer en la lista y en las búsquedas. Sus admisiones e historia clínica se conservan.`
            : ""
        }
        onConfirm={handleDeactivate}
        loading={deletePatient.isPending}
        confirmText="Inactivar"
      />

      <PatientAdmissionsModal patient={historyPatient} onClose={() => setHistoryPatient(null)} />
    </>
  );
}
