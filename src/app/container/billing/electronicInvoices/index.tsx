"use client"

import { Container } from "@/components/container"
import Modal from "@/components/modal"
import Title from "@/components/title"
import { useGetAllElectronicInvoices } from "@/core/hooks/care/billing/useGetAllElectronicInvoices"
import { ElectronicInvoiceListItem } from "@/core/interfaces/care/billing"
import { FileDoneOutlined, FilePdfOutlined, LinkOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Input, Space, Spin, Table, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"

const DIAN_SEARCH_URL = "https://catalogo-vpfe-hab.dian.gov.co/User/SearchDocument"

function formatDateTime(value: string): string {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ElectronicInvoicesContainer() {
  const { data: invoices, isLoading } = useGetAllElectronicInvoices()
  const [search, setSearch] = useState("")
  const [previewInvoice, setPreviewInvoice] = useState<ElectronicInvoiceListItem | null>(null)

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return (invoices ?? []).filter((invoice) => {
      if (!term) return true
      return (
        invoice.patientName?.toLowerCase().includes(term) ||
        invoice.patientDocument?.toLowerCase().includes(term) ||
        invoice.invoiceNum?.toLowerCase().includes(term) ||
        invoice.cufe?.toLowerCase().includes(term) ||
        invoice.insurerName?.toLowerCase().includes(term)
      )
    })
  }, [invoices, search])


  const columns: ColumnsType<ElectronicInvoiceListItem> = [
    {
      title: "Fecha",
      dataIndex: "createdAt",
      width: 170,
      sorter: (a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
      defaultSortOrder: "descend",
      render: (value: string) => (
        <span style={{ fontFamily: "monospace" }}>{formatDateTime(value)}</span>
      ),
    },
    {
      title: "Paciente",
      dataIndex: "patientName",
      width: 220,
      render: (value: string) => <span style={{ fontWeight: 500 }}>{value}</span>,
    },
    {
      title: "Documento",
      dataIndex: "patientDocument",
      width: 130,
      render: (value: string | null) => (
        <span style={{ fontFamily: "monospace" }}>{value ?? "-"}</span>
      ),
    },
    {
      title: "EPS",
      dataIndex: "insurerName",
      width: 200,
      ellipsis: true,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "N° Factura",
      dataIndex: "invoiceNum",
      width: 150,
    },
    {
      title: "CUFE",
      dataIndex: "cufe",
      width: 160,
      render: (value: string | null) =>
        value ? (
          <Tooltip title={value}>
            <span style={{ fontFamily: "monospace" }}>
              {value.slice(0, 12)}…
            </span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Acciones",
      width: 260,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            icon={<LinkOutlined />}
            disabled={!record.cufe}
            onClick={() =>
              window.open(
                `${DIAN_SEARCH_URL}?DocumentKey=${record.cufe}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            Ver en DIAN
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            disabled={!record.pdfBase64}
            onClick={() => setPreviewInvoice(record)}
          >
            Ver PDF
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileDoneOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>Visualización de factura</Title>
        </div>
        <Input
          placeholder="Buscar por paciente, documento, factura, CUFE o EPS..."
          prefix={<SearchOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: 440, borderRadius: 8 }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table<ElectronicInvoiceListItem>
          size="middle"
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} facturas`,
          }}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "No hay facturas electrónicas emitidas" }}
        />
      )}

      <Modal
        open={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        title={previewInvoice ? `Factura ${previewInvoice.invoiceNum}` : ""}
        size="xl"
      >
        {previewInvoice?.pdfBase64 && (
          <iframe
            src={`data:application/pdf;base64,${previewInvoice.pdfBase64}`}
            title={`Factura ${previewInvoice.invoiceNum}`}
            style={{ width: "100%", height: "75vh", border: "none" }}
          />
        )}
      </Modal>
    </Container>
  )
}
