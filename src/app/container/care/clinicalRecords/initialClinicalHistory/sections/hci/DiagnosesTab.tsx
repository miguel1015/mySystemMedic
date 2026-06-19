"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchCie10 } from "@/core/hooks/care/cie10/useSearchCie10";
import { useRef, useState } from "react";
import type { DiagnosisRow, DiagnosisType } from "../../types";

interface Cie10Option {
  value: string;
  label: string;
  diagnosis: string;
}

interface Cie10SelectProps {
  value: string;
  diagnosis: string;
  onChange: (code: string, diagnosis: string) => void;
}

const Cie10Select = ({ value, diagnosis, onChange }: Cie10SelectProps) => {
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isFetching } = useSearchCie10(search);

  const handleSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(query.trim());
    }, 400);
  };

  const options: Cie10Option[] = data
    ? data.map((item) => ({
        value: item.cod4,
        label: `${item.cod4} - ${item.descripcionCodigoCuatroCaracteres}`,
        diagnosis: item.descripcionCodigoCuatroCaracteres,
      }))
    : value
    ? [{ value, label: `${value} - ${diagnosis}`, diagnosis }]
    : [];

  const notFound = !isFetching && search.length >= 2 && (!data || data.length === 0);

  const handleChange = (val: string, opt: unknown) => {
    const selected = opt as Cie10Option;
    onChange(val, selected?.diagnosis ?? "");
  };

  return (
    <Select
      showSearch={{ filterOption: false, onSearch: handleSearch }}
      value={value || undefined}
      options={options}
      loading={isFetching}
      onChange={handleChange}
      placeholder="Buscar código CIE-10"
      style={{ width: "100%" }}
      notFoundContent={
        isFetching ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <Spin size="small" />
          </div>
        ) : notFound ? (
          <div style={{ textAlign: "center", padding: "8px 0", color: "#9ca3af", fontSize: 13 }}>
            Sin resultados
          </div>
        ) : null
      }
    />
  );
};

interface Props {
  diagnoses: DiagnosisRow[];
  onDiagnosesChange: (diagnoses: DiagnosisRow[]) => void;
}

export const DiagnosesTab = ({ diagnoses, onDiagnosesChange }: Props) => {
  const update = (id: number, patch: Partial<DiagnosisRow>) => {
    onDiagnosesChange(
      diagnoses.map((item) => {
        if (item.id !== id) return patch.main ? { ...item, main: false } : item;
        return { ...item, ...patch };
      }),
    );
  };

  const add = () => {
    onDiagnosesChange([
      ...diagnoses,
      {
        id: Date.now(),
        code: "",
        diagnosis: "",
        type: "Secundario" as DiagnosisType,
        main: false,
        required: false,
      },
    ]);
  };

  const remove = (id: number) => {
    onDiagnosesChange(diagnoses.filter((item) => item.id !== id));
  };

  const columns: ColumnsType<DiagnosisRow> = [
    {
      title: "Código CIE-10",
      dataIndex: "code",
      width: 280,
      render: (_v, record) => (
        <Cie10Select
          value={record.code}
          diagnosis={record.diagnosis}
          onChange={(code, diag) =>
            update(record.id, { code, diagnosis: diag })
          }
        />
      ),
    },
    {
      title: "Descripción",
      dataIndex: "diagnosis",
      render: (_v, record) => (
        <span
          style={{
            color: record.diagnosis ? undefined : "#9ca3af",
            fontSize: 13,
          }}
        >
          {record.diagnosis || "—"}
        </span>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 160,
      render: (_v, record) => (
        <Select
          value={record.type}
          style={{ width: "100%" }}
          options={[
            { value: "Principal", label: "Principal" },
            { value: "Relacionado", label: "Relacionado" },
            { value: "Secundario", label: "Secundario" },
          ]}
          onChange={(value) => update(record.id, { type: value })}
        />
      ),
    },
    {
      title: "Principal",
      dataIndex: "main",
      width: 105,
      align: "center",
      render: (_v, record) => (
        <Checkbox
          checked={record.main}
          onChange={(e) => update(record.id, { main: e.target.checked })}
        />
      ),
    },
    {
      title: "Obligatorio",
      dataIndex: "required",
      width: 115,
      align: "center",
      render: (_v, record) => (
        <Tag color={record.required || record.main ? "blue" : "default"}>
          {record.required || record.main ? "Sí" : "Opcional"}
        </Tag>
      ),
    },
    {
      title: "",
      width: 64,
      align: "center",
      render: (_v, record) => (
        <Tooltip title="Eliminar">
          <Button
            icon={<DeleteOutlined />}
            danger
            type="text"
            onClick={() => remove(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="tab-section-inner">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          4. Diagnósticos (CIE-10)
        </Typography.Title>
        <Button type="primary" ghost icon={<PlusOutlined />} onClick={add}>
          Agregar diagnóstico
        </Button>
      </div>
      <div className="diagnosis-table-wrap">
        <Table<DiagnosisRow>
          columns={columns}
          dataSource={diagnoses}
          rowKey="id"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
};
