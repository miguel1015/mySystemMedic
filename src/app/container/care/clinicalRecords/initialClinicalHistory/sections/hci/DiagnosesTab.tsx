"use client";

import tableStyles from "@/components/dataTable/dataTable.module.scss"
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Cie10DiagnosisSelect } from "../../../dischargeNote/Cie10DiagnosisSelect";
import type { DiagnosisRow } from "../../types";

interface Props {
  diagnoses: DiagnosisRow[];
  onDiagnosesChange: (diagnoses: DiagnosisRow[]) => void;
  disabled?: boolean;
}

// El diagnóstico principal es la primera fila; se cambia moviendo las filas.
export const DiagnosesTab = ({ diagnoses, onDiagnosesChange, disabled }: Props) => {
  const update = (id: number, patch: Partial<DiagnosisRow>) => {
    onDiagnosesChange(
      diagnoses.map((item) => (item.id === id ? { ...item, ...patch } : item)),
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
        confirmed: false,
      },
    ]);
  };

  const remove = (id: number) => {
    onDiagnosesChange(diagnoses.filter((item) => item.id !== id));
  };

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= diagnoses.length) return;
    const next = [...diagnoses];
    [next[index], next[target]] = [next[target], next[index]];
    onDiagnosesChange(next);
  };

  const isDuplicate = (record: DiagnosisRow) =>
    !!record.cie10Id &&
    diagnoses.some((item) => item.id !== record.id && item.cie10Id === record.cie10Id);

  const columns: ColumnsType<DiagnosisRow> = [
    {
      title: "Orden",
      width: 110,
      align: "center",
      render: (_v, _record, index) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <Tooltip title="Subir">
            <Button
              size="small"
              type="text"
              icon={<ArrowUpOutlined />}
              onClick={() => move(index, -1)}
              disabled={disabled || index === 0}
            />
          </Tooltip>
          <Tooltip title="Bajar">
            <Button
              size="small"
              type="text"
              icon={<ArrowDownOutlined />}
              onClick={() => move(index, 1)}
              disabled={disabled || index === diagnoses.length - 1}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Diagnóstico CIE-10 (código o descripción)",
      dataIndex: "diagnosis",
      render: (_v, record, index) => (
        <div style={{ display: "grid", gap: 4 }}>
          {index === 0 && (
            <Tag color="green" style={{ width: "fit-content", margin: 0 }}>
              Principal
            </Tag>
          )}
          <Cie10DiagnosisSelect
            value={record.cie10Id ?? undefined}
            selectedLabel={
              record.cie10Id ? `${record.code} - ${record.diagnosis}` : undefined
            }
            onSelect={(cie10Id, codigo, descripcion) =>
              update(record.id, {
                cie10Id: cie10Id ?? null,
                code: codigo,
                diagnosis: descripcion,
              })
            }
            placeholder="Buscar por código o descripción"
            allowClear
            disabled={disabled}
          />
          {isDuplicate(record) && (
            <span style={{ color: "#ef4444", fontSize: 12 }}>
              Este diagnóstico ya está en la tabla
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Confirmado",
      dataIndex: "confirmed",
      width: 120,
      align: "center",
      render: (_v, record) => (
        <Tooltip title="Sin marcar se reporta como impresión diagnóstica">
          <Checkbox
            checked={record.confirmed}
            onChange={(e) => update(record.id, { confirmed: e.target.checked })}
            disabled={disabled}
          />
        </Tooltip>
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
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            4. Diagnósticos (CIE-10) <span className="field-required">*</span>
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            El primero de la tabla es el diagnóstico principal.
          </Typography.Text>
        </div>
        <Button type="primary" ghost icon={<PlusOutlined />} onClick={add} disabled={disabled}>
          Agregar diagnóstico
        </Button>
      </div>
      <div className="diagnosis-table-wrap">
        <Table<DiagnosisRow>
          className={tableStyles.table}
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
