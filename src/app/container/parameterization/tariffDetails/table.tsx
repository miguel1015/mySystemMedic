"use client";

import { Container } from "@/components/container";
import { useTariffDetailsPaged } from "@/core/hooks/parameterization/tariffDetails/useGetTariffDetailsPaged";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";
import { EditOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRef, useState } from "react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

const formatFactor = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);

interface TariffDetailsTableProps {
  onEdit: (record: TTariffDetail) => void;
}

const TariffDetailsTable = ({ onEdit }: TariffDetailsTableProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data, isLoading, isFetching } = useTariffDetailsPaged(
    page,
    pageSize,
    search || undefined,
  );

  const handleSearch = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(text.trim());
    }, 400);
  };

  const columns: ColumnsType<TTariffDetail> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Código referencia",
      dataIndex: "referenceCode",
      width: 80,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      width: 350,
      render: (value: string, record) =>
        record.isSurgicalProcedure && record.surgicalGroupQxGroup
          ? `${value} - ${record.surgicalGroupQxGroup}`
          : value,
    },
    {
      title: "Valor",
      dataIndex: "value",
      width: 80,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Tarifario",
      dataIndex: "tariffName",
      width: 180,
      render: (value?: string) => value ?? "-",
    },
    {
      title: "Procedimiento quirúrgico",
      dataIndex: "isSurgicalProcedure",
      width: 80,
      render: (value: boolean) =>
        value ? <Tag color="blue">Sí</Tag> : <Tag>No</Tag>,
    },
    {
      title: "Factor",
      dataIndex: "factors",
      width: 80,
      render: (value: number) => formatFactor(value),
    },
    {
      title: "Grupo quirúrgico",
      dataIndex: "surgicalGroupQxGroup",
      width: 120,
      render: (value?: string) => value ?? "-",
    },
    {
      title: "Acciones",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="Editar">
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar por código o descripción..."
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      <Table<TTariffDetail>
        size="small"
        columns={columns}
        dataSource={data?.items ?? []}
        rowKey="id"
        loading={{
          spinning: isLoading || isFetching,
          tip: "Cargando información...",
        }}
        pagination={{
          current: page,
          pageSize,
          total: data?.totalCount ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
        }}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: <Empty description="No hay tarifas de detalle" />,
        }}
      />
    </Container>
  );
};

export default TariffDetailsTable;
