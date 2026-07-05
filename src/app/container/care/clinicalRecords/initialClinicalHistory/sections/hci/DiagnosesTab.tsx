"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { cie10Services } from "@/core/hooks/care/cie10/useSearchCie10";
import { useState } from "react";
import type { DiagnosisRow } from "../../types";

interface Cie10SelectProps {
  code: string;
  onSelect: (cie10Id: number, codigo: string, descripcion: string) => void;
  onCodeChange: (codigo: string) => void;
  disabled?: boolean;
}

const Cie10CodeSearch = ({ code, onSelect, onCodeChange, disabled }: Cie10SelectProps) => {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleChange = (value: string) => {
    setNotFound(false);
    onCodeChange(value);
  };

  const handleSearch = async () => {
    const query = code.trim();
    if (!query) return;
    setLoading(true);
    setNotFound(false);
    try {
      const results = await cie10Services.search(query);
      const match = results.find((item) => item.codigo.toLowerCase() === query.toLowerCase());
      if (match) {
        onSelect(match.id, match.codigo, match.descripcion);
      } else {
        onCodeChange(query);
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Input.Search
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        onSearch={handleSearch}
        enterButton
        loading={loading}
        placeholder="Código CIE-10"
        disabled={disabled}
      />
      {notFound && (
        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>El código no existe</div>
      )}
    </div>
  );
};

interface Props {
  diagnoses: DiagnosisRow[];
  onDiagnosesChange: (diagnoses: DiagnosisRow[]) => void;
  disabled?: boolean;
}

export const DiagnosesTab = ({ diagnoses, onDiagnosesChange, disabled }: Props) => {
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
      width: 200,
      render: (_v, record) => (
        <Cie10CodeSearch
          code={record.code}
          onCodeChange={(codigo) => update(record.id, { code: codigo, diagnosis: "", cie10Id: null })}
          onSelect={(cie10Id, codigo, descripcion) =>
            update(record.id, { cie10Id, code: codigo, diagnosis: descripcion })
          }
          disabled={disabled}
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
          disabled={disabled}
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
            disabled={disabled}
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
          4. Diagnósticos (CIE-10) <span className="field-required">*</span>
        </Typography.Title>
        <Button type="primary" ghost icon={<PlusOutlined />} onClick={add} disabled={disabled}>
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
