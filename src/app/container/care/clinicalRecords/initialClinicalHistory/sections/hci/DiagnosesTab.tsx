"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Checkbox,
  Spin,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchCie10 } from "@/core/hooks/care/cie10/useSearchCie10";
import { useRef, useState } from "react";
import type { DiagnosisRow } from "../../types";

interface Cie10SelectProps {
  code: string;
  onSelect: (cie10Id: number, codigo: string, descripcion: string) => void;
  onCodeChange: (codigo: string) => void;
}

const Cie10AutoComplete = ({ code, onSelect, onCodeChange }: Cie10SelectProps) => {
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isFetching } = useSearchCie10(search);

  const handleSearch = (query: string) => {
    onCodeChange(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(query.trim());
    }, 400);
  };

  const options = (data ?? []).map((item) => ({
    value: item.codigo,
    label: `${item.codigo} — ${item.descripcion}`,
    item,
  }));

  const notFound = !isFetching && search.length >= 2 && (!data || data.length === 0);

  const handleSelect = (_value: string, option: (typeof options)[number]) => {
    onSelect(option.item.id, option.item.codigo, option.item.descripcion);
  };

  return (
    <AutoComplete
      value={code}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onChange={onCodeChange}
      placeholder="Escriba el código CIE-10"
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
        cie10Id: null,
        code: "",
        diagnosis: "",
        main: false,
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
      width: 320,
      render: (_v, record) => (
        <Cie10AutoComplete
          code={record.code}
          onCodeChange={(codigo) => update(record.id, { code: codigo, diagnosis: "", cie10Id: null })}
          onSelect={(cie10Id, codigo, descripcion) =>
            update(record.id, { cie10Id, code: codigo, diagnosis: descripcion })
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
          scroll={{ x: 700 }}
        />
      </div>
    </div>
  );
};
