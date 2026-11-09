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
import {
  TElectronicInvoiceCertificate,
  TElectronicInvoiceCertificateFile,
} from "@/core/interfaces/parameterization/electronicInvoicing"
import { daysUntil, fileToBase64, formatDate } from "../utils"

const certificateSchema = z.object({
  file: z.custom<File>((v) => v instanceof File, "Seleccione el archivo .pfx del certificado"),
  password: z.string().min(1, "La clave del certificado es obligatoria"),
})

type TCertificateForm = z.infer<typeof certificateSchema>

interface CertificateTabProps {
  certificates: TElectronicInvoiceCertificate[]
  certificateFile?: TElectronicInvoiceCertificateFile | null
  hasCertificatePin: boolean
}

type TStatus = { color: string; text: string }

function statusByEndDate(endDate?: string | null): TStatus {
  if (!endDate) return { color: "red", text: "Sin certificado" }
  const days = daysUntil(endDate)
  if (days < 0) return { color: "red", text: "Vencido" }
  if (days <= 30) return { color: "orange", text: `Vence en ${days} días` }
  return { color: "green", text: "Vigente" }
}

// El estado se toma del archivo que Facturación Electrónica usa para firmar. El historial solo
// se usa si el archivo no se pudo consultar (o el backend aún no envía esa información).
export function certificateStatus(
  certificates: TElectronicInvoiceCertificate[],
  certificateFile?: TElectronicInvoiceCertificateFile | null,
): TStatus {
  switch (certificateFile?.status) {
    case "OK":
      return statusByEndDate(certificateFile.endDate)
    case "MISSING":
      return { color: "red", text: "Sin certificado" }
    case "UNREADABLE":
      return { color: "red", text: "No se puede abrir" }
  }

  const registered = statusByEndDate(certificates.find((c) => c.isActive)?.endDate)
  return certificateFile?.status === "ERROR"
    ? { color: "orange", text: `${registered.text} (sin verificar)` }
    : registered
}

function CertificateFileAlerts({
  file,
  active,
}: {
  file?: TElectronicInvoiceCertificateFile | null
  active?: TElectronicInvoiceCertificate
}) {
  if (!file) return null

  if (file.status === "MISSING" || file.status === "UNREADABLE") {
    return <Alert type="error" showIcon style={{ marginBottom: 12 }} message={file.message} />
  }

  if (file.status === "ERROR") {
    return (
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 12 }}
        message="No se pudo verificar el certificado en uso; se muestran los datos del historial."
        description={file.message}
      />
    )
  }

  if (!file.matchesRegistry) {
    return (
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 12 }}
        message="El historial no coincide con el certificado en uso"
        description={
          active
            ? `El historial registra una vigencia de ${formatDate(active.startDate)} a ${formatDate(active.endDate)}, pero Facturación Electrónica firma con el archivo mostrado aquí. Si ya tiene un certificado nuevo, vuelva a cargarlo.`
            : "No hay un certificado activo en el historial. Vuelva a cargar el certificado para registrarlo."
        }
      />
    )
  }

  return null
}

export default function CertificateTab({ certificates, certificateFile, hasCertificatePin }: CertificateTabProps) {
  const upload = useUploadElectronicInvoiceCertificate()
  const active = certificates.find((c) => c.isActive)
  const status = certificateStatus(certificates, certificateFile)
  const fileOk = certificateFile?.status === "OK"

  const { control, handleSubmit, reset } = useForm<TCertificateForm>({
    resolver: zodResolver(certificateSchema),
    defaultValues: { password: "" },
  })

  const onSubmit = async (data: TCertificateForm) => {
    let fileBase64: string
    try {
      fileBase64 = await fileToBase64(data.file)
    } catch {
      toast.error("No se pudo leer el archivo seleccionado.")
      return
    }

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

  // Si el archivo se leyó, la vigencia mostrada es la real; si no, la del historial.
  const startDate = fileOk ? certificateFile?.startDate : active?.startDate
  const endDate = fileOk ? certificateFile?.endDate : active?.endDate

  return (
    <div className="d-flex flex-column gap-4">
      <Card title="Certificado en uso" size="small">
        <CertificateFileAlerts file={certificateFile} active={active} />
        <Descriptions size="small" column={{ xs: 1, md: 3 }}>
          <Descriptions.Item label="Estado">
            <Tag color={status.color}>{status.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vigencia">
            {startDate || endDate ? `${formatDate(startDate)} a ${formatDate(endDate)}` : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Clave">
            {hasCertificatePin ? "Configurada" : <Tag color="red">Sin configurar</Tag>}
          </Descriptions.Item>
          {fileOk && (
            <>
              <Descriptions.Item label="Titular">{certificateFile?.subject || "-"}</Descriptions.Item>
              <Descriptions.Item label="Emitido por">{certificateFile?.issuer || "-"}</Descriptions.Item>
              <Descriptions.Item label="Serie">
                <span style={{ wordBreak: "break-all" }}>{certificateFile?.serialNumber || "-"}</span>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      <Card title="Cargar nuevo certificado" size="small">
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Se valida el archivo con su clave antes de enviarlo y, después de subirlo, se confirma que quedó como certificado en uso. La vigencia se toma del propio certificado."
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
