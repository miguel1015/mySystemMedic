"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Alert, Button, Card, Descriptions, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import Input from "@/components/input"
import FileInput from "@/components/fileInput"
import GridContainer from "@/components/componentLayout"
import { useUploadElectronicInvoiceCertificate } from "@/core/hooks/parameterization/electronicInvoicing/useElectronicInvoicingMutations"
import { TElectronicInvoiceCertificate } from "@/core/interfaces/parameterization/electronicInvoicing"
import { daysUntil, fileToBase64, formatDate } from "../utils"

const certificateSchema = z.object({
  file: z.custom<File>((v) => v instanceof File, "Seleccione el archivo .pfx del certificado"),
  password: z.string().min(1, "La clave del certificado es obligatoria"),
})

type TCertificateForm = z.infer<typeof certificateSchema>

interface CertificateTabProps {
  certificates: TElectronicInvoiceCertificate[]
  hasCertificatePin: boolean
}

export function certificateStatus(certificate?: TElectronicInvoiceCertificate) {
  if (!certificate) return { color: "red", text: "Sin certificado" }
  const days = daysUntil(certificate.endDate)
  if (days < 0) return { color: "red", text: "Vencido" }
  if (days <= 30) return { color: "orange", text: `Vence en ${days} días` }
  return { color: "green", text: "Vigente" }
}

export default function CertificateTab({ certificates, hasCertificatePin }: CertificateTabProps) {
  const upload = useUploadElectronicInvoiceCertificate()
  const active = certificates.find((c) => c.isActive)
  const status = certificateStatus(active)

  const { control, handleSubmit, reset } = useForm<TCertificateForm>({
    resolver: zodResolver(certificateSchema),
    defaultValues: { password: "" },
  })

  const onSubmit = async (data: TCertificateForm) => {
    const fileBase64 = await fileToBase64(data.file)
    upload.mutate(
      { fileBase64, fileName: data.file.name, password: data.password },
      {
        onSuccess: () => {
          toast.success("Certificado actualizado")
          reset({ password: "", file: undefined })
        },
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  const columns: ColumnsType<TElectronicInvoiceCertificate> = [
    { title: "Desde", dataIndex: "startDate", render: (v: string) => formatDate(v) },
    { title: "Hasta", dataIndex: "endDate", render: (v: string) => formatDate(v) },
    {
      title: "Estado",
      dataIndex: "isActive",
      render: (value: boolean) => (value ? <Tag color="green">Activo</Tag> : <Tag>Reemplazado</Tag>),
    },
  ]

  return (
    <div className="d-flex flex-column gap-4">
      <Card title="Certificado de firma digital" size="small">
        <Descriptions size="small" column={{ xs: 1, md: 3 }}>
          <Descriptions.Item label="Estado">
            <Tag color={status.color}>{status.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vigencia">
            {active ? `${formatDate(active.startDate)} a ${formatDate(active.endDate)}` : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Clave">
            {hasCertificatePin ? "Configurada" : <Tag color="red">Sin configurar</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Cargar nuevo certificado" size="small">
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Se valida el archivo con su clave antes de enviarlo. La vigencia se toma del propio certificado y reemplaza al certificado actual."
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <GridContainer columns="col-12 col-md-6" gap="g-3">
            <FileInput name="file" control={control} label="Archivo .pfx" accept=".pfx" />
            <Input
              name="password"
              type="password"
              label="Clave del certificado"
              placeholder="Clave"
              autoComplete="new-password"
              control={control}
            />
          </GridContainer>
          <div className="d-flex justify-content-end">
            <Button type="primary" htmlType="submit" loading={upload.isPending}>
              Subir certificado
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Historial" size="small">
        <Table
          rowKey="certificateId"
          columns={columns}
          dataSource={certificates}
          pagination={false}
          size="small"
          locale={{ emptyText: "No hay certificados registrados" }}
        />
      </Card>
    </div>
  )
}
