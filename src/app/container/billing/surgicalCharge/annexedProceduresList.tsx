"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { Button, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AnnexedProcedure } from "./useSurgicalChargeForm";

interface AnnexedProceduresListProps {
  procedures: AnnexedProcedure[];
  onRemove: (tempId: string) => void;
}

const AnnexedProceduresList = ({ procedures, onRemove }: AnnexedProceduresListProps) => {
  const columns: ColumnsType<AnnexedProcedure> = [
    {
      title: "Procedimiento",
      key: "procedure",
      render: (_, record) => `${record.service.code} - ${record.service.name}`,
    },
    {
      title: "Vía de acceso",
      dataIndex: "accessRouteName",
      width: 180,
    },
    {
      title: "Grupo QX",
      key: "qxGroup",
      width: 120,
      render: (_, record) => record.service.surgicalGroupQxGroup ?? "-",
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, record) => (
        <Tooltip title="Quitar procedimiento">
          <Button danger icon={<DeleteOutlined />} onClick={() => onRemove(record.tempId)} />
        </Tooltip>
      ),
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
          padding: "14px 16px",
          borderBottom: "1px solid var(--dash-border, #e5e7eb)",
          fontWeight: 800,
        }}
      >
        Procedimientos cargados
      </div>

      <Table<AnnexedProcedure>
        rowKey="tempId"
        size="small"
        columns={columns}
        dataSource={procedures}
        pagination={false}
        scroll={{ x: 560 }}
      />
    </div>
  );
};

export default AnnexedProceduresList;
