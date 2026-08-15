"use client";

import { Container } from "@/components/container";
import { useTariffDetailsPaged } from "@/core/hooks/parameterization/tariffDetails/useGetTariffDetailsPaged";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";
import { Empty, Input, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRef, useState } from "react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

const TariffDetailsTable = () => {
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
      width: 80,
    },
    {
      title: "Código referencia",
      dataIndex: "referenceCode",
      width: 140,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      width: 350,
    },
    {
      title: "Valor",
      dataIndex: "value",
      width: 140,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Tarifario",
      dataIndex: "tariffName",
      width: 200,
      render: (value?: string) => value ?? "-",
    },
    {
      title: "Procedimiento quirúrgico",
      dataIndex: "isSurgicalProcedure",
      width: 170,
      render: (value: boolean) =>
        value ? <Tag color="blue">Sí</Tag> : <Tag>No</Tag>,
    },
    {
      title: "Factor",
      dataIndex: "factors",
      width: 100,
    },
    {
      title: "Grupo quirúrgico",
      dataIndex: "surgicalGroupReferenceCode",
      width: 160,
      render: (value?: string) => value ?? "-",
    },
  ];

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar por descripción..."
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
