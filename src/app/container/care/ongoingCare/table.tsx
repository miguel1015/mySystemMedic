"use client";

import { Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DollarOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import DataTable from "@/components/dataTable/DataTable";
import { PersonCell, formatDocument } from "@/components/dataTable/cells";
import cellStyles from "@/components/dataTable/dataTable.module.scss";
import { OngoingAttention } from "@/core/interfaces/care/types";
import {
  careScopeColor,
  careScopeKey,
  formatCatalogLabel,
  formatPersonName,
} from "@/core/utils/displayText";
import { STAY_BUCKETS, formatDateTime, formatStay, stayBucket } from "@/core/utils/date";

interface OngoingCareTableProps {
  data: OngoingAttention[];
  loading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const OngoingCareTable = ({ data, loading, isError, onRetry }: OngoingCareTableProps) => {
  const router = useRouter();

  const goToBilling = (record: OngoingAttention) => {
    const params = new URLSearchParams({
      admissionId: String(record.admissionId),
      patientId: String(record.patientId),
      patientName: record.patientFullName,
      documentNumber: record.documentNumber,
      careScope: record.careScope,
      admissionDate: record.admissionDate,
    });
    router.push(`/billing/admissionIntegral?${params.toString()}`);
  };

  const billingButton = (r: OngoingAttention) => (
    <Button
      icon={<DollarOutlined />}
      onClick={() => goToBilling(r)}
      aria-label={`Admisión integral de ${formatPersonName(r.patientFullName)}`}
    >
      Admisión integral
    </Button>
  );

  const columns: ColumnsType<OngoingAttention> = [
    {
      title: "Paciente",
      key: "patient",
      sorter: (a, b) => a.patientFullName.localeCompare(b.patientFullName, "es"),
      render: (_, r) => (
        <PersonCell
          name={formatPersonName(r.patientFullName)}
          detail={formatDocument(r.documentTypeName, r.documentNumber)}
        />
      ),
    },
    {
      title: "Admisión",
      key: "admission",
      width: 190,
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime(),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={cellStyles.tabular}>{formatDateTime(r.admissionDate)}</span>
          <span className={cellStyles.personDetail}>N° {r.admissionId}</span>
        </span>
      ),
    },
    {
      title: "Estancia",
      key: "stay",
      width: 110,
      render: (_, r) => <span className={cellStyles.tabular}>{formatStay(r.admissionDate) || "—"}</span>,
    },
    {
      title: "Ámbito",
      key: "scope",
      width: 170,
      render: (_, r) => <Tag color={careScopeColor(r.careScope)}>{formatCatalogLabel(r.careScope)}</Tag>,
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 180,
      align: "right",
      fixed: "right",
      render: (_, r) => billingButton(r),
    },
  ];

  return (
    <DataTable<OngoingAttention>
      data={data}
      columns={columns}
      rowKey="admissionId"
      entity={["atención", "atenciones"]}
      feminine
      loading={loading}
      error={isError}
      onRetry={onRetry}
      emptyText="No hay atenciones en curso."
      rowNumbers
      syncUrl
      searchPlaceholder="Buscar por nombre, documento o N° de admisión…"
      searchText={(a) => `${a.patientFullName} ${a.documentNumber} ${a.admissionId}`}
      quickFilters={[
        {
          key: "scope",
          placeholder: "Ámbito",
          getValue: (a) => careScopeKey(a.careScope) || undefined,
          formatLabel: formatCatalogLabel,
        },
        {
          key: "stay",
          placeholder: "Estancia",
          getValue: (a) => stayBucket(a.admissionDate),
          order: STAY_BUCKETS,
        },
      ]}
      onRowClick={goToBilling}
      renderCard={(a) => (
        <div className={cellStyles.rowCardBody}>
          <PersonCell
            name={formatPersonName(a.patientFullName)}
            detail={formatDocument(a.documentTypeName, a.documentNumber)}
          />
          <span className={cellStyles.personDetail}>
            N° {a.admissionId} · {formatDateTime(a.admissionDate)} · {formatStay(a.admissionDate)}
          </span>
          <span className={cellStyles.tags}>
            <Tag color={careScopeColor(a.careScope)}>{formatCatalogLabel(a.careScope)}</Tag>
          </span>
        </div>
      )}
    />
  );
};

export default OngoingCareTable;
