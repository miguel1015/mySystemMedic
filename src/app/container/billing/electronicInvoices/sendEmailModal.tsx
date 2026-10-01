"use client"

import Modal from "@/components/modal"
import { useSendElectronicInvoiceEmail } from "@/core/hooks/care/billing/useElectronicInvoiceDocuments"
import type { ElectronicInvoiceListItem } from "@/core/interfaces/care/billing"
import { MailOutlined } from "@ant-design/icons"
import { Alert, Button, Input, Space, message } from "antd"
import { useEffect, useState } from "react"

interface SendEmailModalProps {
  invoice: ElectronicInvoiceListItem | null
  onClose: () => void
}

const EMAIL_PATTERN = /^[^\s@;]+@[^\s@;]+\.[^\s@;]+$/

// Varios correos se separan con ";" (Facturación Electrónica los envía a todos).
function isValidEmailList(value: string) {
  const parts = value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length > 0 && parts.every((part) => EMAIL_PATTERN.test(part))
}

const SendEmailModal = ({ invoice, onClose }: SendEmailModalProps) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [email, setEmail] = useState("")
  const sendEmail = useSendElectronicInvoiceEmail()

  useEffect(() => {
    setEmail(invoice?.patientEmail ?? "")
    sendEmail.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice])

  const trimmed = email.trim()
  const isValid = isValidEmailList(trimmed)

  const handleSend = () => {
    if (!invoice || !isValid) return
    sendEmail.mutate(
      { id: invoice.id, email: trimmed },
      {
        onSuccess: (data) => {
          messageApi.success(`Factura enviada a ${data.email}`)
          onClose()
        },
      },
    )
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={!!invoice}
        onClose={onClose}
        size="sm"
        title={invoice ? `Enviar factura ${invoice.invoiceNum}` : ""}
        footer={
          <Space>
            <Button onClick={onClose} disabled={sendEmail.isPending}>
              Cancelar
            </Button>
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={handleSend}
              loading={sendEmail.isPending}
              disabled={!isValid}
            >
              Enviar
            </Button>
          </Space>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0 }}>
            Se enviará un .zip con la factura en PDF y el XML (AttachedDocument) validado por la DIAN.
          </p>
          <div>
            <label htmlFor="invoice-email" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
              Correo del destinatario
            </label>
            <Input
              id="invoice-email"
              size="large"
              prefix={<MailOutlined />}
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onPressEnter={handleSend}
              status={trimmed && !isValid ? "error" : undefined}
            />
            <small style={{ color: "var(--dash-text-secondary, #6b7280)" }}>
              {invoice?.patientEmail
                ? "Se propone el correo registrado del paciente. Para varios destinatarios sepárelos con “;”."
                : "El paciente no tiene correo registrado. Para varios destinatarios sepárelos con “;”."}
            </small>
          </div>
          {sendEmail.isError && (
            <Alert type="error" showIcon title="No se pudo enviar el correo" description={sendEmail.error.message} />
          )}
        </div>
      </Modal>
    </>
  )
}

export default SendEmailModal
