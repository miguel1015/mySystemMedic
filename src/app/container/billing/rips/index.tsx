"use client"

import { formatCurrency, formatDate } from "@/app/container/billing/admissionIntegral/utils"
import { Container } from "@/components/container"
import Title from "@/components/title"
import { INSTITUTION_PROVIDER_ID } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetAllElectronicInvoices } from "@/core/hooks/care/billing/useGetAllElectronicInvoices"
import { useGetBillingMovementsByAdmission } from "@/core/hooks/care/billing/useGetBillingMovementsByAdmission"
import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission"
import { useGetDiagnosticosEgresoByIds } from "@/core/hooks/care/dischargeNote/useGetDiagnosticosEgresoByIds"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetUserById } from "@/core/hooks/users/useGetByIdUser"
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
import { RipsStatusTag } from "./RipsStatusTag"
import {
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
  // Los nombres no viajan en el JSON de consultas y procedimientos; se toman de los
  // cargos en el mismo orden en que buildRips los recorrió.
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
    medicamentos: servicios.medicamentos.map((item) => ({
      key: `m-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codTecnologiaSalud,
      descripcion: item.nomTecnologiaSalud,
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
      descripcion: item.nomTecnologiaSalud,
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

  // No existe endpoint de factura por id; se toma del listado (queda en caché cuando
  // se llega desde "Visualización de factura").
  const { data: invoices, isLoading: isLoadingInvoices } = useGetAllElectronicInvoices()
  const invoice = useMemo(
    () => invoices?.find((item) => item.id === invoiceId) ?? null,
    [invoices, invoiceId],
  )
  const admissionId = invoice?.admissionId ?? null

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

  const { data: professionalUser } = useGetUserById(hcInicial?.userId ?? 0)

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
      professional: professionalUser
        ? {
            // El catálogo de tipos de documento de usuarios no expone el código (CC, TI...).
            documentTypeCode: null,
            documentNumber: professionalUser.documentNumber ?? null,
            name: hcInicial?.nombreProfesional ?? null,
          }
        : null,
    })
  }, [invoice, admission, patient, provider, movements, hcInicial, diagnosticoEgreso, professionalUser])

  const serviceRows = useMemo(
    () => (result ? buildServiceRows(result.rips.usuarios[0].servicios, movements) : null),
    [result, movements],
  )

  const json = useMemo(() => (result ? JSON.stringify(result.rips, null, 2) : ""), [result])

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
    const groups = new Map<string, { field: string; reason: string }[]>()
    for (const item of result?.missing ?? []) {
      const list = groups.get(item.group) ?? []
      list.push({ field: item.field, reason: item.reason })
      groups.set(item.group, list)
    }
    return Array.from(groups.entries())
  }, [result])

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
              background: "var(--dash-surface-muted, #f8fafc)",
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
        <Empty
          description="Aún no se ha enviado al Mecanismo Único de Validación. Aquí aparecerán el CUV o los errores (RVC/RVG) que devuelva el Ministerio."
        />
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
                      children: <CodeCell value={provider?.enableCode} />,
                    },
                    { key: "eps", label: "EPS", children: invoice?.insurerName ?? "-" },
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
                          hint="Se define por paciente; hoy solo existe en el contrato"
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
                      label: "Incapacidad",
                      children: (
                        <WithName name={patient?.disabilityName} code={usuario.incapacidad} />
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
                    <Space>
                      <ExclamationCircleOutlined style={{ color: "#d97706" }} />
                      <span>
                        {result.missing.length} datos pendientes para que el RIPS sea válido
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
