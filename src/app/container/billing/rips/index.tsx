"use client"

import { formatCurrency, formatDate } from "@/app/container/billing/admissionIntegral/utils"
import { Container } from "@/components/container"
import Title from "@/components/title"
import { INSTITUTION_PROVIDER_ID } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import {
  useDownloadAttachedDocument,
  useGetElectronicInvoiceAttachedDocument,
  useGetElectronicInvoiceById,
} from "@/core/hooks/care/billing/useElectronicInvoiceDocuments"
import { useGetBillingMovementsByAdmission } from "@/core/hooks/care/billing/useGetBillingMovementsByAdmission"
import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission"
import { useGetDiagnosticosEgresoByIds } from "@/core/hooks/care/dischargeNote/useGetDiagnosticosEgresoByIds"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetUserById } from "@/core/hooks/users/useGetByIdUser"
import { useGetProfessionals } from "@/core/hooks/users/useGetProfessionals"
import type { BillingMovementResponse } from "@/core/interfaces/care/billing"
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  SolutionOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Badge,
  Button,
  Collapse,
  Col,
  Descriptions,
  Empty,
  Row,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { parseFevXml } from "./parseFevXml"
import { RipsStatusTag } from "./RipsStatusTag"
import {
  RipsMissingField,
  RipsServiceGroupKey,
  RipsServicios,
  buildRips,
  classifyMovement,
} from "./buildRips"

interface RipsDetailProps {
  invoiceId: number
}

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border, #e5e7eb)",
  borderRadius: 10,
  padding: "16px 18px",
  height: "100%",
}

const monoStyle: React.CSSProperties = { fontFamily: "monospace" }

// Muestra el valor tal como iría en el JSON; si falta, lo marca para que se vea qué
// dato hay que completar en MediNexus.
function CodeCell({ value, hint }: { value: string | number | null | undefined; hint?: string }) {
  if (value === null || value === undefined || value === "") {
    return (
      <Tooltip title={hint ?? "Dato pendiente para el RIPS"}>
        <Tag color="orange" style={{ marginInlineEnd: 0 }}>
          Sin código
        </Tag>
      </Tooltip>
    )
  }
  return <span style={monoStyle}>{value}</span>
}

function WithName({ name, code, hint }: { name?: string | null; code: string | null; hint?: string }) {
  return (
    <Space size={6} wrap>
      <span>{name || "-"}</span>
      <CodeCell value={code} hint={hint} />
    </Space>
  )
}

interface ServiceRow {
  key: string
  consecutivo: number
  codigo: string | null
  descripcion: string
  diagnostico: string | null
  profesional: string | null
  cantidad: number | null
  vrUnitario: number | null
  vrServicio: number | null
  extra: string | null
}

const GROUP_LABELS: Record<RipsServiceGroupKey, string> = {
  consultas: "Consultas",
  procedimientos: "Procedimientos",
  urgencias: "Urgencias",
  hospitalizacion: "Hospitalización",
  recienNacidos: "Recién nacidos",
  medicamentos: "Medicamentos",
  otrosServicios: "Otros servicios",
}

const GROUP_ORDER: RipsServiceGroupKey[] = [
  "consultas",
  "procedimientos",
  "medicamentos",
  "otrosServicios",
  "urgencias",
  "hospitalizacion",
  "recienNacidos",
]

function buildServiceRows(
  servicios: RipsServicios,
  movements: BillingMovementResponse[],
): Record<RipsServiceGroupKey, ServiceRow[]> {
  // Los nombres no viajan en el JSON de consultas, procedimientos y medicamentos; se toman
  // de los cargos en el mismo orden en que buildRips los recorrió.
  const namesByGroup: Record<RipsServiceGroupKey, string[]> = {
    consultas: [],
    procedimientos: [],
    urgencias: [],
    hospitalizacion: [],
    recienNacidos: [],
    medicamentos: [],
    otrosServicios: [],
  }
  for (const movement of movements.filter((item) => item.isActive !== false)) {
    namesByGroup[classifyMovement(movement)].push(movement.name)
  }

  return {
    consultas: servicios.consultas.map((item, index) => ({
      key: `c-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codConsulta,
      descripcion: namesByGroup.consultas[index] ?? "-",
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: item.numDocumentoIdentificacion,
      cantidad: 1,
      vrUnitario: item.vrServicio,
      vrServicio: item.vrServicio,
      extra: item.fechaInicioAtencion,
    })),
    procedimientos: servicios.procedimientos.map((item, index) => ({
      key: `p-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codProcedimiento,
      descripcion: namesByGroup.procedimientos[index] ?? "-",
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: item.numDocumentoIdentificacion,
      cantidad: 1,
      vrUnitario: item.vrServicio,
      vrServicio: item.vrServicio,
      extra: item.fechaInicioAtencion,
    })),
    medicamentos: servicios.medicamentos.map((item, index) => ({
      key: `m-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codTecnologiaSalud,
      descripcion: namesByGroup.medicamentos[index] ?? "-",
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: item.numDocumentoIdentificacion,
      cantidad: item.cantidadMedicamento,
      vrUnitario: item.vrUnitMedicamento,
      vrServicio: item.vrServicio,
      extra: item.fechaDispensAdmon,
    })),
    otrosServicios: servicios.otrosServicios.map((item) => ({
      key: `o-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codTecnologiaSalud,
      descripcion: item.nomTecnologiaSalud ?? "-",
      diagnostico: null,
      profesional: item.numDocumentoIdentificacion,
      cantidad: item.cantidadOS,
      vrUnitario: item.vrUnitOS,
      vrServicio: item.vrServicio,
      extra: item.tipoOS,
    })),
    urgencias: servicios.urgencias.map((item) => ({
      key: `u-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codDiagnosticoPrincipalE,
      descripcion: `Ingreso ${item.fechaInicioAtencion ?? "-"} · Egreso ${item.fechaEgreso ?? "-"}`,
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: null,
      cantidad: null,
      vrUnitario: null,
      vrServicio: null,
      extra: item.condicionDestinoUsuarioEgreso,
    })),
    hospitalizacion: servicios.hospitalizacion.map((item) => ({
      key: `h-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codDiagnosticoPrincipalE,
      descripcion: `Ingreso ${item.fechaInicioAtencion ?? "-"} · Egreso ${item.fechaEgreso ?? "-"}`,
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: null,
      cantidad: null,
      vrUnitario: null,
      vrServicio: null,
      extra: item.condicionDestinoUsuarioEgreso,
    })),
    recienNacidos: [],
  }
}

function columnsFor(group: RipsServiceGroupKey): ColumnsType<ServiceRow> {
  const isEpisode = group === "urgencias" || group === "hospitalizacion"

  if (isEpisode) {
    return [
      { title: "#", dataIndex: "consecutivo", width: 50 },
      { title: "Periodo", dataIndex: "descripcion" },
      {
        title: "Dx ingreso",
        dataIndex: "diagnostico",
        width: 110,
        render: (value) => <CodeCell value={value} />,
      },
      {
        title: "Dx egreso",
        dataIndex: "codigo",
        width: 110,
        render: (value) => <CodeCell value={value} hint="No hay egreso registrado" />,
      },
      {
        title: "Condición egreso",
        dataIndex: "extra",
        width: 140,
        render: (value) => <CodeCell value={value} />,
      },
    ]
  }

  const codeTitle =
    group === "medicamentos" ? "CUM" : group === "otrosServicios" ? "Código" : "CUPS"

  const columns: ColumnsType<ServiceRow> = [
    { title: "#", dataIndex: "consecutivo", width: 50 },
    {
      title: codeTitle,
      dataIndex: "codigo",
      width: 120,
      render: (value) => <CodeCell value={value} />,
    },
    { title: "Descripción", dataIndex: "descripcion", ellipsis: true },
  ]

  if (group === "otrosServicios") {
    columns.push({
      title: "Tipo OS",
      dataIndex: "extra",
      width: 90,
      render: (value) => <CodeCell value={value} />,
    })
  } else {
    columns.push({
      title: "Dx principal",
      dataIndex: "diagnostico",
      width: 110,
      render: (value) => <CodeCell value={value} />,
    })
  }

  columns.push(
    {
      title: "Profesional",
      dataIndex: "profesional",
      width: 120,
      render: (value) => <CodeCell value={value} hint="No se identificó el profesional" />,
    },
    { title: "Cant.", dataIndex: "cantidad", width: 60, align: "right" },
    {
      title: "Valor",
      dataIndex: "vrServicio",
      width: 120,
      align: "right",
      render: (value: number | null) => formatCurrency(value),
    },
  )

  return columns
}

const RipsDetail = ({ invoiceId }: RipsDetailProps) => {
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  const { data: invoice = null, isLoading: isLoadingInvoices } =
    useGetElectronicInvoiceById(invoiceId)
  const admissionId = invoice?.admissionId ?? null

  // XML (AttachedDocument) que viaja como xmlFevFile junto al RIPS.
  const {
    data: attachedDocument,
    isLoading: isLoadingAttached,
    isError: isAttachedError,
    error: attachedError,
  } = useGetElectronicInvoiceAttachedDocument(invoice?.id ?? null)
  const downloadXml = useDownloadAttachedDocument()

  const { data: admission, isLoading: isLoadingAdmission } = useGetAdmissionById(admissionId)
  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(
    admission?.patientId ?? null,
  )
  const { data: provider, isLoading: isLoadingProvider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const { data: movements = [], isLoading: isLoadingMovements } =
    useGetBillingMovementsByAdmission(admissionId)
  const { data: hcInicial, isLoading: isLoadingHc } = useGetHCInicialByAdmission(
    admissionId ?? undefined,
  )
  const { data: dischargeRecords = [], isLoading: isLoadingDischarge } =
    useGetDatosClinicosEgresoByAdmission(admissionId ?? undefined)

  const activeDischarge = useMemo(
    () => dischargeRecords.find((record) => record.isActive) ?? dischargeRecords[0] ?? null,
    [dischargeRecords],
  )
  const { data: diagnosticosEgresoData, isLoading: isLoadingDiagnosticosEgreso } =
    useGetDiagnosticosEgresoByIds([activeDischarge?.diagnosticoEgresoId])
  const diagnosticoEgreso = diagnosticosEgresoData[0] ?? null

  // Médico de la HC inicial: respaldo para los cargos sin profesional. La lista de
  // profesionales la ve cualquier rol; el detalle por id solo los administradores.
  const { data: professionals = [] } = useGetProfessionals()
  const { data: professionalUser } = useGetUserById(hcInicial?.userId ?? 0)
  const hcProfessional = useMemo(() => {
    const listed = professionals.find((item) => item.id === hcInicial?.userId)
    if (listed) {
      return {
        documentTypeCode: listed.documentTypeCode,
        documentNumber: listed.documentNumber,
        name: hcInicial?.nombreProfesional ?? listed.fullName,
      }
    }
    if (professionalUser) {
      return {
        documentTypeCode: professionalUser.documentTypeCode ?? null,
        documentNumber: professionalUser.documentNumber ?? null,
        name: hcInicial?.nombreProfesional ?? null,
      }
    }
    return null
  }, [professionals, professionalUser, hcInicial])

  // Factura leída del XML para cruzarla con el RIPS. Mientras carga queda undefined (no se
  // valida); si no hay XML o no se puede leer, null.
  const fev = useMemo(() => {
    if (isLoadingAttached) return undefined
    return parseFevXml(attachedDocument?.base64)
  }, [isLoadingAttached, attachedDocument])

  const isLoading =
    isLoadingInvoices ||
    isLoadingAdmission ||
    isLoadingPatient ||
    isLoadingProvider ||
    isLoadingMovements ||
    isLoadingHc ||
    isLoadingDischarge ||
    isLoadingDiagnosticosEgreso

  const result = useMemo(() => {
    if (!invoice || !admission) return null
    return buildRips({
      invoiceNum: invoice.invoiceNum,
      admission,
      patient,
      provider,
      movements,
      diagnosticosIngreso: hcInicial?.analisisDiagnosticosPlan?.diagnosticos ?? [],
      diagnosticoEgreso,
      professional: hcProfessional,
      fev,
    })
  }, [invoice, admission, patient, provider, movements, hcInicial, diagnosticoEgreso, hcProfessional, fev])

  const serviceRows = useMemo(
    () => (result ? buildServiceRows(result.rips.usuarios[0].servicios, movements) : null),
    [result, movements],
  )

  const json = useMemo(() => (result ? JSON.stringify(result.rips, null, 2) : ""), [result])

  // Cuerpo de POST /api/PaquetesFevRips/CargarFevRips. El Base64 del XML se recorta para
  // no llenar la pantalla; el envío real lleva el contenido completo.
  const muvPackagePreview = useMemo(() => {
    if (!result) return ""
    const base64 = attachedDocument?.base64
    const xmlFevFile = base64
      ? base64.length > 120
        ? `${base64.slice(0, 120)}… (${base64.length.toLocaleString("es-CO")} caracteres)`
        : base64
      : null
    return JSON.stringify({ rips: result.rips, xmlFevFile }, null, 2)
  }, [result, attachedDocument])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      messageApi.success("JSON copiado al portapapeles")
    } catch {
      messageApi.error("No se pudo copiar el JSON")
    }
  }

  const handleDownload = () => {
    if (!invoice) return
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `RIPS_${invoice.invoiceNum}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const usuario = result?.rips.usuarios[0]

  const missingByGroup = useMemo(() => {
    const groups = new Map<string, RipsMissingField[]>()
    for (const item of result?.missing ?? []) {
      const list = groups.get(item.group) ?? []
      list.push(item)
      groups.set(item.group, list)
    }
    return Array.from(groups.entries())
  }, [result])

  const errorCount = result?.missing.filter((item) => item.severity === "error").length ?? 0
  const warningCount = (result?.missing.length ?? 0) - errorCount

  const serviceTabs = serviceRows
    ? GROUP_ORDER.filter((group) => serviceRows[group].length > 0).map((group) => ({
        key: group,
        label: (
          <Space size={6}>
            {GROUP_LABELS[group]}
            <Badge count={serviceRows[group].length} color="var(--theme-primary, #0F6F5C)" />
          </Space>
        ),
        children: (
          <Table<ServiceRow>
            size="small"
            columns={columnsFor(group)}
            dataSource={serviceRows[group]}
            rowKey="key"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        ),
      }))
    : []

  const mainTabs = [
    {
      key: "servicios",
      label: "Servicios",
      children:
        serviceTabs.length > 0 ? (
          <Tabs size="small" items={serviceTabs} />
        ) : (
          <Empty description="La admisión no tiene servicios para reportar" />
        ),
    },
    {
      key: "json",
      label: "JSON",
      children: (
        <div>
          <Space style={{ marginBottom: 10 }}>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copiar
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              Descargar
            </Button>
          </Space>
          <pre
            style={{
              ...monoStyle,
              fontSize: 12,
              background: "var(--dash-surface-2, #fbfcfc)",
              color: "var(--dash-text-primary, #0f1f1b)",
              border: "1px solid var(--dash-border, #e5e7eb)",
              borderRadius: 8,
              padding: 14,
              maxHeight: "55vh",
              overflow: "auto",
              margin: 0,
            }}
          >
            {json}
          </pre>
        </div>
      ),
    },
    {
      key: "muv",
      label: "Validación MUV",
      children: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Alert
            type="info"
            showIcon
            title="Aún no se ha enviado al Mecanismo Único de Validación"
            description="Aquí aparecerán el CUV o los errores (RVC/RVG) que devuelva el Ministerio. Abajo está el paquete tal como se enviará a CargarFevRips: el RIPS más el XML de la factura en Base64."
          />
          {!attachedDocument && (
            <Alert
              type="warning"
              showIcon
              title="Falta el XML de la factura"
              description="Sin el AttachedDocument el MUV no puede validar el RIPS. Revise que Facturación Electrónica lo haya generado para esta factura."
            />
          )}
          <pre
            style={{
              ...monoStyle,
              fontSize: 12,
              background: "var(--dash-surface-2, #fbfcfc)",
              color: "var(--dash-text-primary, #0f1f1b)",
              border: "1px solid var(--dash-border, #e5e7eb)",
              borderRadius: 8,
              padding: 14,
              maxHeight: "55vh",
              overflow: "auto",
              margin: 0,
            }}
          >
            {muvPackagePreview}
          </pre>
        </div>
      ),
    },
  ]

  const goBack = () => router.push("/billing/electronicInvoices")

  if (!isLoadingInvoices && !invoice) {
    return (
      <Container fluid padding="md">
        <Empty description="No se encontró la factura electrónica.">
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            Volver a facturas
          </Button>
        </Empty>
      </Container>
    )
  }

  return (
    <Container fluid padding="md">
      {contextHolder}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} aria-label="Volver" />
          <SolutionOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>RIPS · Factura {invoice?.invoiceNum ?? ""}</Title>
          <RipsStatusTag status="pending" />
        </div>
        <Tooltip title="Disponible cuando el backend tenga la integración con el MUV">
          <Button type="primary" icon={<CloudUploadOutlined />} disabled>
            Enviar al MUV
          </Button>
        </Tooltip>
      </div>

      {isLoading || !result || !usuario ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title="Vista previa del RIPS"
            description="Se arma con los datos actuales de la admisión. Los campos marcados como “Sin código” son datos que MediNexus todavía no guarda con el código oficial de SISPRO."
          />

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} xl={10}>
              <div style={sectionCardStyle}>
                <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Factura</h6>
                <Descriptions
                  bordered
                  size="small"
                  column={1}
                  items={[
                    {
                      key: "factura",
                      label: "N° factura",
                      children: <span style={monoStyle}>{result.rips.numFactura}</span>,
                    },
                    {
                      key: "nit",
                      label: "NIT obligado",
                      children: <CodeCell value={result.rips.numDocumentoIdObligado} />,
                    },
                    {
                      key: "prestador",
                      label: "Código prestador (REPS)",
                      children: <CodeCell value={result.codPrestador} />,
                    },
                    { key: "eps", label: "EPS", children: invoice?.insurerName ?? "-" },
                    {
                      key: "xml",
                      label: "XML factura (AttachedDocument)",
                      children: isLoadingAttached ? (
                        <Skeleton.Button active size="small" />
                      ) : attachedDocument ? (
                        <Space size={8} wrap>
                          <Tag color="success" style={{ marginInlineEnd: 0 }}>
                            Disponible
                          </Tag>
                          <Button
                            size="small"
                            icon={<DownloadOutlined />}
                            loading={downloadXml.isPending}
                            onClick={() => invoice && downloadXml.mutate(invoice.id)}
                          >
                            Descargar
                          </Button>
                        </Space>
                      ) : (
                        <Tooltip title={isAttachedError ? attachedError?.message : undefined}>
                          <Tag color="error" style={{ marginInlineEnd: 0 }}>
                            No disponible
                          </Tag>
                        </Tooltip>
                      ),
                    },
                    {
                      key: "cuv",
                      label: "CUV",
                      children: (
                        <span style={{ color: "var(--dash-text-secondary, #6b7280)" }}>Pendiente</span>
                      ),
                    },
                    {
                      key: "total",
                      label: "Total servicios RIPS",
                      children: <strong>{formatCurrency(result.totalServicios)}</strong>,
                    },
                  ]}
                />
              </div>
            </Col>

            <Col xs={24} xl={14}>
              <div style={sectionCardStyle}>
                <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Usuario</h6>
                <Descriptions
                  bordered
                  size="small"
                  column={{ xs: 1, md: 2 }}
                  items={[
                    {
                      key: "doc",
                      label: "Documento",
                      children: (
                        <span style={monoStyle}>
                          {usuario.tipoDocumentoIdentificacion} {usuario.numDocumentoIdentificacion}
                        </span>
                      ),
                    },
                    { key: "nombre", label: "Nombre", children: invoice?.patientName ?? "-" },
                    {
                      key: "nacimiento",
                      label: "Fecha de nacimiento",
                      children: formatDate(patient?.birthDate),
                    },
                    {
                      key: "tipoUsuario",
                      label: "Tipo de usuario",
                      children: (
                        <CodeCell
                          value={usuario.tipoUsuario}
                          hint="El tipo de usuario del convenio no tiene código SISPRO"
                        />
                      ),
                    },
                    {
                      key: "sexo",
                      label: "Sexo",
                      children: <WithName name={patient?.sexName} code={usuario.codSexo} />,
                    },
                    {
                      key: "municipio",
                      label: "Municipio de residencia",
                      children: (
                        <WithName name={patient?.cityName} code={usuario.codMunicipioResidencia} />
                      ),
                    },
                    {
                      key: "zona",
                      label: "Zona",
                      children: (
                        <WithName
                          name={patient?.zoneName}
                          code={usuario.codZonaTerritorialResidencia}
                        />
                      ),
                    },
                    {
                      key: "incapacidad",
                      // Si la atención generó incapacidad (LstSiNo); no es la discapacidad del paciente.
                      label: "Incapacidad generada",
                      children: (
                        <Tooltip title="Aún no se registra en la atención; se reporta NO">
                          <span style={monoStyle}>{usuario.incapacidad}</span>
                        </Tooltip>
                      ),
                    },
                  ]}
                />
              </div>
            </Col>
          </Row>

          {result.missing.length > 0 && (
            <Collapse
              style={{ marginBottom: 16 }}
              items={[
                {
                  key: "missing",
                  label: (
                    <Space wrap>
                      <ExclamationCircleOutlined
                        style={{ color: errorCount > 0 ? "#dc2626" : "#d97706" }}
                      />
                      <span>
                        {errorCount > 0
                          ? `${errorCount} errores que el MUV rechazaría`
                          : "Sin errores de rechazo detectados"}
                        {warningCount > 0 && ` · ${warningCount} avisos`}
                      </span>
                    </Space>
                  ),
                  children: (
                    <Row gutter={[24, 16]}>
                      {missingByGroup.map(([group, items]) => (
                        <Col key={group} xs={24} md={12} xl={8}>
                          <strong>{group}</strong>
                          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                            {items.map((item) => (
                              <li key={`${item.field}-${item.reason}`}>
                                <Tag
                                  color={item.severity === "error" ? "error" : "warning"}
                                  style={{ marginInlineEnd: 6 }}
                                >
                                  {item.severity === "error" ? "Error" : "Aviso"}
                                </Tag>
                                <span style={monoStyle}>{item.field}</span>: {item.reason}
                              </li>
                            ))}
                          </ul>
                        </Col>
                      ))}
                    </Row>
                  ),
                },
              ]}
            />
          )}

          <div style={sectionCardStyle}>
            <Tabs items={mainTabs} />
          </div>
        </>
      )}
    </Container>
  )
}

export default RipsDetail
