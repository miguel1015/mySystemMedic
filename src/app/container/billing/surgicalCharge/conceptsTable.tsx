"use client";

import { TTariffDetail } from "@/core/interfaces/parameterization/types";
import { Button, Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency, formatFactor } from "./utils";

interface ConceptsTableProps {
  concepts: TTariffDetail[];
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onClose: () => void;
  onAnnex: () => void;
  canAnnex: boolean;
}

const ConceptsTable = ({
  concepts,
  selectedIds,
  onSelectedIdsChange,
  onClose,
  onAnnex,
  canAnnex,
}: ConceptsTableProps) => {
  const columns: ColumnsType<TTariffDetail> = [
    { title: "Código alterno", dataIndex: "referenceCode", width: 90 },
    { title: "Nombre", dataIndex: "description", width: 150 },
    {
      title: "Método de cobro",
      dataIndex: "paymentMethodDescription",
      width: 170,
      render: (value?: string) => value ?? "-",
    },
    {
      title: "Tarifario",
      dataIndex: "tariffName",
      width: 80,
      render: (v?: string) => v ?? "-",
    },
    {
      title: "Unidad",
      dataIndex: "factors",
      width: 50,
      render: (v: number) => formatFactor(v),
    },
    {
      title: "Valor",
      dataIndex: "value",
      width: 70,
      render: (v: number) => formatCurrency(v),
    },
  ];

  return (
    <div
      style={{
        border: "1px solid var(--dash-border, #e5e7eb)",
        borderRadius: 8,
        background: "var(--dash-surface, #ffffff)",
        overflow: "hidden",
        marginTop: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--dash-border, #e5e7eb)",
        }}
      >
        <div style={{ fontWeight: 800 }}>Conceptos quirúrgicos</div>
      </div>

      <Table<TTariffDetail>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={concepts}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => onSelectedIdsChange(keys as number[]),
        }}
        pagination={false}
        scroll={{ x: 720 }}
        locale={{
          emptyText: <Empty description="No hay conceptos para esta cirugía" />,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          padding: 16,
        }}
      >
        <Button onClick={onClose}>Cerrar</Button>
        <Button type="primary" onClick={onAnnex} disabled={!canAnnex}>
          Anexar
        </Button>
      </div>
    </div>
  );
};

export default ConceptsTable;
