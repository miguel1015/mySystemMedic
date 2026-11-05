"use client"

import { Container } from "@/components/container"
import { formatPersonName, formatInstitutionName } from "@/core/utils/displayText";
import Modal from "@/components/modal"
import Title from "@/components/title"
import {
  useDownloadAttachedDocument,
  useGetElectronicInvoicePdf,
} from "@/core/hooks/care/billing/useElectronicInvoiceDocuments"
import { useGetAllElectronicInvoices } from "@/core/hooks/care/billing/useGetAllElectronicInvoices"
import { ElectronicInvoiceListItem } from "@/core/interfaces/care/billing"
import {
  CodeOutlined,
  DownOutlined,
  FileDoneOutlined,
  FilePdfOutlined,
  LinkOutlined,
  MailOutlined,
  SearchOutlined,
  SolutionOutlined,
} from "@ant-design/icons"
import { Button, Dropdown, Empty, Input, Spin, Table, Tooltip, message } from "antd"
import type { MenuProps } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { RipsStatusTag } from "../rips/RipsStatusTag"
import SendEmailModal from "./sendEmailModal"

const DIAN_SEARCH_URL = "https://catalogo-vpfe-hab.dian.gov.co/User/SearchDocument"

type InvoiceAction = "dian" | "pdf" | "xml" | "email" | "rips"

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
  const [emailInvoice, setEmailInvoice] = useState<ElectronicInvoiceListItem | null>(null)
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()
  const downloadXml = useDownloadAttachedDocument()
  const {
    data: pdf,
    isLoading: isLoadingPdf,
    error: pdfError,
  } = useGetElectronicInvoicePdf(previewInvoice?.id ?? null)

  const handleDownloadXml = (record: ElectronicInvoiceListItem) => {
    downloadXml.mutate(record.id, {
      onError: (error) => messageApi.error(error.message || "No se pudo descargar el XML"),
    })
  }

  const buildMenu = (
    record: ElectronicInvoiceListItem,
    downloadingXml: boolean,
  ): MenuProps["items"] => [
    { key: "dian", icon: <LinkOutlined />, label: "Ver en DIAN", disabled: !record.cufe },
    { key: "pdf", icon: <FilePdfOutlined />, label: "Ver PDF", disabled: !record.hasPdf },
    {
      key: "xml",
      icon: <CodeOutlined />,
      label: "Descargar XML (AttachedDocument)",
      disabled: downloadingXml,
    },
    { key: "email", icon: <MailOutlined />, label: "Enviar PDF y XML por correo" },
    { type: "divider" },
    { key: "rips", icon: <SolutionOutlined />, label: "RIPS" },
  ]

  const handleAction = (action: InvoiceAction, record: ElectronicInvoiceListItem) => {
    switch (action) {
      case "dian":
        window.open(
          `${DIAN_SEARCH_URL}?DocumentKey=${record.cufe}`,
          "_blank",
          "noopener,noreferrer",
        )
        break
      case "pdf":
        setPreviewInvoice(record)
        break
      case "xml":
        handleDownloadXml(record)
        break
      case "email":
        setEmailInvoice(record)
        break
      case "rips":
        router.push(`/billing/rips/${record.id}`)
        break
    }
  }

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
      render: (value: string) => <span style={{ fontWeight: 500 }}>{formatPersonName(value)}</span>,
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
      render: (value: string | null) => (value ? formatInstitutionName(value) : "-"),
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
      // Mientras no exista la integración con el MUV, todas las facturas quedan pendientes.
      title: "Estado RIPS",
      width: 150,
      render: () => <RipsStatusTag status="pending" />,
    },
    {
      title: "Acciones",
      width: 140,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const downloadingXml = downloadXml.isPending && downloadXml.variables === record.id
        return (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: buildMenu(record, downloadingXml),
              onClick: ({ key }) => handleAction(key as InvoiceAction, record),
            }}
          >
            <Button type="primary" loading={downloadingXml}>
              Acciones <DownOutlined />
            </Button>
          </Dropdown>
        )
      },
    },
  ]

  return (
    <Container>
      {contextHolder}
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
        {isLoadingPdf ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "75vh" }}>
            <Spin size="large" />
          </div>
        ) : pdfError ? (
          <Empty description={pdfError.message || "No se pudo cargar el PDF"} />
        ) : (
          pdf && (
            <iframe
              src={`data:application/pdf;base64,${pdf.base64}`}
              title={`Factura ${pdf.invoiceNum}`}
              style={{ width: "100%", height: "75vh", border: "none" }}
            />
          )
        )}
      </Modal>

      <SendEmailModal invoice={emailInvoice} onClose={() => setEmailInvoice(null)} />
    </Container>
  )
}
