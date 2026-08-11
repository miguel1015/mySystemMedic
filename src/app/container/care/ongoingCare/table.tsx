"use client";

import { Button, DatePicker, Input, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { DollarOutlined, SearchOutlined } from "@ant-design/icons";
import { OngoingAttention } from "@/core/interfaces/care/types";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface OngoingCareTableProps {
  data: OngoingAttention[];
  loading: boolean;
}

const CARE_SCOPE_COLORS: Record<string, string> = {
  Triage: "gold",
  Urgencia: "red",
  Hospitalización: "blue",
  "Consulta externa": "green",
  Cirugía: "purple",
};

const OngoingCareTable = ({ data, loading }: OngoingCareTableProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

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
  const [careScopeFilter, setCareScopeFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const careScopeOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map((item) => item.careScope)));
    return unique.map((scope) => ({ label: scope, value: scope }));
  }, [data]);

  const filteredData = useMemo(() => {
    const term = search.toLowerCase().trim();

    return data
      .filter((item) => {
        const matchesText =
          !term ||
          item.patientFullName.toLowerCase().includes(term) ||
          item.documentNumber.toLowerCase().includes(term);

        const matchesScope =
          !careScopeFilter || item.careScope === careScopeFilter;

        const matchesDate =
          !dateRange ||
          (() => {
            const admissionDay = dayjs(item.admissionDate);
            return (
              admissionDay.isAfter(dateRange[0].startOf("day")) &&
              admissionDay.isBefore(dateRange[1].endOf("day"))
            );
          })();

        return matchesText && matchesScope && matchesDate;
      })
      .sort(
        (a, b) =>
          new Date(b.admissionDate).getTime() -
          new Date(a.admissionDate).getTime(),
      );
  }, [search, careScopeFilter, dateRange, data]);

  const columns: ColumnsType<OngoingAttention> = [
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
      title: "Admisión",
      dataIndex: "admissionId",
      width: 100,
      render: (value: number) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
          #{value}
        </span>
      ),
    },
    {
      title: "Fecha y hora de admisión",
      dataIndex: "admissionDate",
      width: 200,
      sorter: (a, b) =>
        new Date(a.admissionDate).getTime() -
        new Date(b.admissionDate).getTime(),
      render: (value: string) => {
        const date = new Date(value);
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {date.toLocaleDateString("es-CO", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </div>
            <div style={{ fontSize: 12 }}>
              {date.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
    {
      title: "Nombre del paciente",
      dataIndex: "patientFullName",
      width: 260,
      sorter: (a, b) => a.patientFullName.localeCompare(b.patientFullName),
      render: (value: string) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "Tipo doc.",
      dataIndex: "documentTypeName",
      width: 110,
    },
    {
      title: "Nro. Documento",
      dataIndex: "documentNumber",
      width: 160,
      render: (value: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
          {value}
        </span>
      ),
    },
    {
      title: "Ámbito de atención",
      dataIndex: "careScope",
      width: 180,
      render: (value: string) => (
        <Tag color={CARE_SCOPE_COLORS[value] || "default"}>{value}</Tag>
      ),
    },
    {
      title: "Estado",
      width: 120,
      align: "center",
      render: () => <Tag color="success">En curso</Tag>,
    },
    {
      title: "Acciones",
      width: 150,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<DollarOutlined />}
          onClick={() => goToBilling(record)}
        >
          Admisión integral
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}
      >
        <Input
          placeholder="Buscar por nombre o documento..."
          prefix={
            <SearchOutlined
              style={{ color: "var(--theme-primary, #0F6F5C)" }}
            />
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={loading}
          style={{ maxWidth: 340, borderRadius: 8 }}
        />
        <Select
          placeholder="Filtrar por ámbito"
          value={careScopeFilter ?? undefined}
          onChange={(value) => setCareScopeFilter(value ?? null)}
          allowClear
          size="large"
          disabled={loading}
          style={{ minWidth: 220 }}
          options={careScopeOptions}
        />
        <RangePicker
          placeholder={["Fecha desde", "Fecha hasta"]}
          value={dateRange}
          onChange={(range) =>
            setDateRange(
              range && range[0] && range[1] ? [range[0], range[1]] : null,
            )
          }
          allowClear
          size="large"
          disabled={loading}
        />
      </div>
      <Table<OngoingAttention>
        size="middle"
        columns={columns}
        dataSource={filteredData}
        rowKey="admissionId"
        loading={{ spinning: loading, tip: "Cargando atenciones en curso..." }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} atenciones en curso`,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay atenciones en curso" }}
      />
    </div>
  );
};

export default OngoingCareTable;
