"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Input, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { RowActions, formatCOP } from "@/components/dataTable/cells";
import tableStyles from "@/components/dataTable/dataTable.module.scss";
import { useTariffDetailsPaged } from "@/core/hooks/parameterization/tariffDetails/useGetTariffDetailsPaged";
import { useUrlState } from "@/core/hooks/utils/useUrlState";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";

const PAGE_SIZES = [10, 20, 50, 100];

const formatFactor = (value: number) =>
  new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(value);

interface TariffDetailsTableProps {
  onEdit: (record: TTariffDetail) => void;
  // Total de detalles (para el encabezado de la página).
  onTotal?: (total: number | undefined) => void;
}

// Detalles de todos los tarifarios: miles de filas, así que pagina y busca en el servidor.
// Búsqueda, página y tamaño quedan en la URL.
const TariffDetailsTable = ({ onEdit, onTotal }: TariffDetailsTableProps) => {
  const [url, setUrl] = useUrlState({ buscar: "", pagina: "1", tamano: "20" });
  const [searchInput, setSearchInput] = useState("");
  const page = Math.max(1, Number(url.pagina) || 1);
  const pageSize = PAGE_SIZES.includes(Number(url.tamano)) ? Number(url.tamano) : 20;

  // El cuadro de búsqueda se llena con lo que traiga la URL.
  useEffect(() => setSearchInput(url.buscar ?? ""), [url.buscar]);

  // Se busca 350 ms después de dejar de escribir, desde la página 1.
  useEffect(() => {
    const term = searchInput.trim();
    if (term === (url.buscar ?? "")) return;
    const id = setTimeout(() => setUrl({ buscar: term, pagina: "1" }), 350);
    return () => clearTimeout(id);
  }, [searchInput, url.buscar, setUrl]);

  const { data, isLoading, isFetching, isError, refetch } = useTariffDetailsPaged(
    page,
    pageSize,
    url.buscar || undefined,
  );

  // El total del encabezado es el de todo el tarifario, no el de la búsqueda.
  useEffect(() => {
    if (!url.buscar && data) onTotal?.(data.totalCount);
  }, [url.buscar, data, onTotal]);

  const columns: ColumnsType<TTariffDetail> = [
    {
      title: "Código",
      key: "code",
      width: 150,
      render: (_, r) => (
        <span className={tableStyles.stack}>
          <span className={`${tableStyles.personName} ${tableStyles.tabular}`}>{r.referenceCode}</span>
          {r.cupsCode ? (
            <span className={`${tableStyles.personDetail} ${tableStyles.tabular}`}>CUPS {r.cupsCode}</span>
          ) : (
            <span className={tableStyles.warningText}>Sin CUPS</span>
          )}
        </span>
      ),
    },
    {
      title: "Descripción",
      key: "description",
      render: (_, r) => (
        <span className={tableStyles.stack}>
          <span className={tableStyles.clamp2} title={r.description}>
            {r.description}
          </span>
          {r.tariffName && <span className={tableStyles.personDetail}>{r.tariffName}</span>}
        </span>
      ),
    },
    {
      title: "Grupo quirúrgico",
      key: "surgical",
      width: 150,
      render: (_, r) =>
        r.isSurgicalProcedure ? (
          <Tag color="blue">{r.surgicalGroupQxGroup ? `Grupo ${r.surgicalGroupQxGroup}` : "Quirúrgico"}</Tag>
        ) : (
          <span className={tableStyles.personDetail}>—</span>
        ),
    },
    {
      title: "Factor",
      dataIndex: "factors",
      width: 90,
      align: "right",
      render: (value: number) => <span className={tableStyles.tabular}>{formatFactor(value)}</span>,
    },
    {
      title: "Valor",
      dataIndex: "value",
      width: 140,
      align: "right",
      render: (value: number) => <span className={tableStyles.tabular}>{formatCOP(value)}</span>,
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 72,
      align: "right",
      fixed: "right",
      render: (_, r) => (
        <RowActions subject={`el código ${r.referenceCode}`} onEdit={() => onEdit(r)} />
      ),
    },
  ];

  return (
    <div className={tableStyles.root}>
      <div className={tableStyles.toolbar}>
        <Input
          className={tableStyles.search}
          placeholder="Buscar por código, CUPS o descripción…"
          prefix={<SearchOutlined aria-hidden />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          allowClear
          aria-label="Buscar detalles del tarifario"
        />
        <span className={tableStyles.count} role="status">
          {url.buscar && data
            ? `${data.totalCount.toLocaleString("es-CO")} ${data.totalCount === 1 ? "resultado" : "resultados"}`
            : ""}
        </span>
      </div>

      {isError ? (
        <Alert
          type="warning"
          showIcon
          message="No se pudieron cargar los detalles del tarifario"
          description="Revisa tu conexión e inténtalo de nuevo."
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      ) : (
        <Table<TTariffDetail>
          className={tableStyles.table}
          size="middle"
          columns={columns}
          dataSource={data?.items ?? []}
          rowKey="id"
          loading={isLoading || isFetching}
          rowClassName={() => tableStyles.rowClickable}
          onRow={(r) => ({
            onClick: (e) => {
              if ((e.target as HTMLElement).closest("button, a, .ant-dropdown")) return;
              onEdit(r);
            },
            onKeyDown: (e) => {
              if (e.key === "Enter" && e.target === e.currentTarget) onEdit(r);
            },
            tabIndex: 0,
          })}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: url.buscar
              ? `Ningún detalle coincide con “${url.buscar}”.`
              : "Aún no hay detalles de tarifario.",
          }}
          pagination={{
            current: page,
            pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZES.map(String),
            locale: { items_per_page: "/ página" },
            showTotal: (total, range) => `${range[0]}–${range[1]} de ${total.toLocaleString("es-CO")}`,
            onChange: (p, size) =>
              setUrl({ pagina: String(size !== pageSize ? 1 : p), tamano: String(size) }),
          }}
        />
      )}
    </div>
  );
};

export default TariffDetailsTable;
