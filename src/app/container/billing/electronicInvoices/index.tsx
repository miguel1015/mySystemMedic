"use client"

import { Container } from "@/components/container"
import { formatPersonName, formatInstitutionName } from "@/core/utils/displayText"
import Modal from "@/components/modal"
import DataTable from "@/components/dataTable/DataTable"
import PageHeader from "@/components/dataTable/PageHeader"
import { PersonCell, RowActions, formatDocument } from "@/components/dataTable/cells"
import cellStyles from "@/components/dataTable/dataTable.module.scss"
import {
  useDownloadAttachedDocument,
  useGetElectronicInvoicePdf,
} from "@/core/hooks/care/billing/useElectronicInvoiceDocuments"
import { useGetAllElectronicInvoices } from "@/core/hooks/care/billing/useGetAllElectronicInvoices"
import { ElectronicInvoiceListItem } from "@/core/interfaces/care/billing"
import { formatDateTime } from "@/core/utils/date"
import {
  CodeOutlined,
  FileDoneOutlined,
  FilePdfOutlined,
  LinkOutlined,
  MailOutlined,
  SolutionOutlined,
} from "@ant-design/icons"
import { Empty, Spin, Tooltip, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { RipsStatusTag } from "../rips/RipsStatusTag"
import SendEmailModal from "./sendEmailModal"

const DIAN_SEARCH_URL = "https://catalogo-vpfe-hab.dian.gov.co/User/SearchDocument"

export default function ElectronicInvoicesContainer() {
  const { data: invoices, isLoading, isError, refetch } = useGetAllElectronicInvoices()
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
  const total = invoices?.length ?? 0

  const handleDownloadXml = (record: ElectronicInvoiceListItem) => {
    downloadXml.mutate(record.id, {
      onError: (error) => messageApi.error(error.message || "No se pudo descargar el XML"),
    })
  }

  const openPdf = (record: ElectronicInvoiceListItem) => {
    if (record.hasPdf) setPreviewInvoice(record)
  }

  const actionsFor = (record: ElectronicInvoiceListItem) => {
    const downloadingXml = downloadXml.isPending && downloadXml.variables === record.id
    return (
      <RowActions
        subject={`la factura ${record.invoiceNum}`}
        editLabel="Ver PDF"
        editIcon={<FilePdfOutlined />}
        onEdit={record.hasPdf ? () => openPdf(record) : undefined}
        items={[
          {
            key: "dian",
            label: "Ver en DIAN",
            icon: <LinkOutlined />,
            disabled: !record.cufe,
            onClick: () =>
              window.open(`${DIAN_SEARCH_URL}?DocumentKey=${record.cufe}`, "_blank", "noopener,noreferrer"),
          },
          {
            key: "xml",
            label: downloadingXml ? "Descargando XML…" : "Descargar XML (AttachedDocument)",
            icon: <CodeOutlined />,
            disabled: downloadingXml,
            onClick: () => handleDownloadXml(record),
          },
          {
            key: "email",
            label: "Enviar PDF y XML por correo",
            icon: <MailOutlined />,
            onClick: () => setEmailInvoice(record),
          },
          {
            key: "rips",
            label: "RIPS",
            icon: <SolutionOutlined />,
            dividerBefore: true,
            onClick: () => router.push(`/billing/rips/${record.id}`),
          },
        ]}
      />
    )
  }

  const columns: ColumnsType<ElectronicInvoiceListItem> = [
    {
      title: "Factura",
      key: "invoice",
      width: 190,
      defaultSortOrder: "descend",
      sorter: (a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
      render: (_, r) => (
        <span className={cellStyles.stack}>
          <span className={`${cellStyles.personName} ${cellStyles.tabular}`}>{r.invoiceNum}</span>
          <span className={`${cellStyles.personDetail} ${cellStyles.tabular}`}>
            {formatDateTime(r.createdAt)}
          </span>
        </span>
      ),
    },
    {
      title: "Paciente",
      key: "patient",
      sorter: (a, b) => (a.patientName ?? "").localeCompare(b.patientName ?? "", "es"),
      render: (_, r) => (
        <PersonCell
          name={formatPersonName(r.patientName)}
          detail={formatDocument(null, r.patientDocument) || undefined}
        />
      ),
    },
    {
      title: "EPS",
      key: "insurer",
      width: 240,
      render: (_, r) => {
        const eps = formatInstitutionName(r.insurerName) || "—"
        return (
          <span className={cellStyles.oneLine} title={eps}>
            {eps}
          </span>
        )
      },
    },
    {
      title: "CUFE",
      key: "cufe",
      width: 150,
      render: (_, r) =>
        r.cufe ? (
          <Tooltip title={r.cufe}>
            <span className={`${cellStyles.tabular} ${cellStyles.personDetail}`}>{r.cufe.slice(0, 12)}…</span>
          </Tooltip>
        ) : (
          <span className={cellStyles.personDetail}>—</span>
        ),
    },
    {
      // Mientras no exista la integración con el MUV, todas las facturas quedan pendientes.
      title: "Estado RIPS",
      key: "rips",
      width: 150,
      render: () => <RipsStatusTag status="pending" />,
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 96,
      align: "right",
      fixed: "right",
      render: (_, r) => actionsFor(r),
    },
  ]

  return (
    <Container>
      {contextHolder}
      <PageHeader
        icon={<FileDoneOutlined />}
        title="Facturas electrónicas"
        subtitle={
          isLoading
            ? "Cargando facturas…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "factura emitida" : "facturas emitidas"}`
        }
      />

      <DataTable<ElectronicInvoiceListItem>
        data={invoices ?? []}
        columns={columns}
        rowKey="id"
        entity={["factura", "facturas"]}
        feminine
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyText="Aún no hay facturas electrónicas emitidas."
        rowNumbers
        syncUrl
        searchPlaceholder="Buscar por paciente, documento, factura, CUFE o EPS…"
        searchText={(i) =>
          `${i.patientName ?? ""} ${i.patientDocument ?? ""} ${i.invoiceNum ?? ""} ${i.cufe ?? ""} ${i.insurerName ?? ""}`
        }
        quickFilters={[
          {
            key: "eps",
            placeholder: "EPS",
            getValue: (i) => i.insurerName,
            formatLabel: formatInstitutionName,
          },
        ]}
        onRowClick={openPdf}
        renderCard={(i) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.rowCardBody}>
              <PersonCell
                name={formatPersonName(i.patientName)}
                detail={formatDocument(null, i.patientDocument) || undefined}
              />
              <span className={cellStyles.personDetail}>
                {i.invoiceNum} · {formatDateTime(i.createdAt)}
              </span>
              <span className={cellStyles.personDetail}>
                {formatInstitutionName(i.insurerName) || "Sin EPS"}
              </span>
            </div>
            {actionsFor(i)}
          </div>
        )}
      />

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
