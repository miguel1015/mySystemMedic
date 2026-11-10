"use client"

import { formatCurrency, formatDate } from "@/app/container/billing/admissionIntegral/utils"
import { Container } from "@/components/container"
import Title from "@/components/title"
import {
  useDownloadAttachedDocument,
  useGetElectronicInvoiceAttachedDocument,
} from "@/core/hooks/care/billing/useElectronicInvoiceDocuments"
import { formatInstitutionName, formatPersonName } from "@/core/utils/displayText"
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CloudUploadOutlined,
  CodeOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Button, Empty, Segmented, Skeleton, Table, Tabs, Tag, Tooltip, message } from "antd"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { RipsMissingField, RipsServiceGroupKey, buildRips } from "./buildRips"
import { parseFevXml } from "./parseFevXml"
import { countRipsIssues } from "./RipsIssuesPanel"
import {
  CodeCell,
  GROUP_LABELS,
  GROUP_ORDER,
  ServiceRow,
  buildServiceRows,
  columnsFor,
} from "./ripsServiceTable"
import { RipsStatusTag } from "./RipsStatusTag"
import styles from "./rips.module.scss"
import { useRipsInvoiceData } from "./useRipsSources"

interface RipsDetailProps {
  invoiceId: number
}

type Tone = "default" | "error" | "warning" | "success" | "neutral"

const TONE_CLASS: Record<Tone, string | undefined> = {
  default: undefined,
  error: styles.toneError,
  warning: styles.toneWarning,
  success: styles.toneSuccess,
  neutral: styles.toneNeutral,
}

function StatTile({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  tone?: Tone
}) {
  return (
    <div className={[styles.stat, TONE_CLASS[tone]].filter(Boolean).join(" ")}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statBody}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        {hint && <div className={styles.statHint}>{hint}</div>}
      </div>
    </div>
  )
}

function Card({
  icon,
  title,
  extra,
  children,
  className,
  bodyless,
}: {
  icon: React.ReactNode
  title: string
  extra?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyless?: boolean
}) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(" ")}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          {icon}
          {title}
        </h2>
        {extra}
      </header>
      {bodyless ? children : <div className={styles.cardBody}>{children}</div>}
    </section>
  )
}

function Field({
  label,
  children,
  wide,
}: {
  label: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={[styles.field, wide && styles.fieldWide].filter(Boolean).join(" ")}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{children}</div>
    </div>
  )
}

// Nombre legible + el código que viaja en el JSON (o "Sin código" si falta).
function NamedCode({ name, code, hint }: { name?: string | null; code: string | null; hint?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span>{name || "-"}</span>
      {code ? <span className={styles.codeChip}>{code}</span> : <CodeCell value={null} hint={hint} />}
    </span>
  )
}

function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0]
  const last = parts.length > 2 ? parts[2][0] : parts.length > 1 ? parts[1][0] : ""
  return `${first}${last}`.toUpperCase()
}

function IssuesCard({ missing }: { missing: RipsMissingField[] }) {
  // Cerrado por defecto: el resumen de errores y avisos se ve en el encabezado.
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "error" | "warning">("all")
  const { errors, warnings } = countRipsIssues(missing)

  const groups = useMemo(() => {
    const map = new Map<string, RipsMissingField[]>()
    for (const item of missing) {
      if (filter !== "all" && item.severity !== filter) continue
      const list = map.get(item.group) ?? []
      list.push(item)
      map.set(item.group, list)
    }
    return Array.from(map.entries())
  }, [missing, filter])

  return (
    <section className={styles.card}>
      <header className={[styles.cardHeader, styles.accordionHeader, !open && styles.accordionClosed].filter(Boolean).join(" ")}>
        <button
          type="button"
          className={styles.accordionToggle}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="rips-validation-panel"
        >
          <RightOutlined className={[styles.chevron, open && styles.chevronOpen].filter(Boolean).join(" ")} />
          <span className={styles.cardTitle}>
            <SafetyCertificateOutlined />
            Validación previa al MUV
          </span>
          <span className={styles.issuesSummary}>
            {missing.length === 0 ? (
              <span className={[styles.pill, styles.pillSuccess].join(" ")}>
                <CheckCircleFilled /> Sin problemas
              </span>
            ) : (
              <>
                {errors > 0 && (
                  <span className={[styles.pill, styles.pillError].join(" ")}>
                    {errors} {errors === 1 ? "error" : "errores"}
                  </span>
                )}
                {warnings > 0 && (
                  <span className={[styles.pill, styles.pillWarning].join(" ")}>
                    {warnings} {warnings === 1 ? "aviso" : "avisos"}
                  </span>
                )}
              </>
            )}
          </span>
        </button>
        {open && missing.length > 0 && (
          <Segmented
            size="small"
            value={filter}
            onChange={(value) => setFilter(value as typeof filter)}
            options={[
              { label: `Todos (${missing.length})`, value: "all" },
              { label: `Errores (${errors})`, value: "error", disabled: errors === 0 },
              { label: `Avisos (${warnings})`, value: "warning", disabled: warnings === 0 },
            ]}
          />
        )}
      </header>
      <div
        id="rips-validation-panel"
        className={[styles.accordionPanel, open && styles.accordionPanelOpen].filter(Boolean).join(" ")}
      >
        <div className={styles.accordionInner}>
          <div className={styles.cardBody}>
      {missing.length === 0 ? (
        <div className={styles.allGood}>
          <CheckCircleFilled />
          No se detectaron datos faltantes ni valores que el MUV rechace.
        </div>
      ) : (
        <div className={styles.issueGroups}>
          {groups.map(([group, items]) => {
            const groupErrors = items.filter((item) => item.severity === "error").length
            return (
              <div key={group} className={styles.issueGroup}>
                <div className={styles.issueGroupTitle}>
                  <span>{group}</span>
                  <span
                    className={[
                      styles.pill,
                      groupErrors > 0 ? styles.pillError : styles.pillWarning,
                    ].join(" ")}
                  >
                    {items.length}
                  </span>
                </div>
                <ul className={styles.issueList}>
                  {items.map((item) => (
                    <li key={`${item.field}-${item.reason}`} className={styles.issue}>
                      <span
                        className={[
                          styles.issueDot,
                          item.severity === "error" ? styles.issueDotError : styles.issueDotWarning,
                        ].join(" ")}
                        title={item.severity === "error" ? "Error" : "Aviso"}
                      />
                      <span>
                        <span className={styles.issueField}>{item.field}</span>
                        {item.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CodeBlock({
  title,
  content,
  actions,
}: {
  title: string
  content: string
  actions?: React.ReactNode
}) {
  return (
    <div>
      <div className={styles.codeToolbar}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span className={styles.codeDots}>
            <i />
            <i />
            <i />
          </span>
          {title}
        </span>
        <span style={{ display: "inline-flex", gap: 6 }}>{actions}</span>
      </div>
      <pre className={styles.code}>{content}</pre>
    </div>
  )
}

function LoadingState() {
  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className={styles.stat}>
            <Skeleton active avatar={{ shape: "square" }} paragraph={{ rows: 1 }} title />
          </div>
        ))}
      </div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <Skeleton active avatar paragraph={{ rows: 6 }} />
          </div>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    </div>
  )
}

const RipsDetail = ({ invoiceId }: RipsDetailProps) => {
  const router = useRouter()
  const [messageApi, contextHolder] = message.useMessage()

  // Factura + datos de la admisión en una sola petición.
  const { data, isLoading, isError, error } = useRipsInvoiceData(invoiceId)
  const invoice = data?.invoice ?? null
  const sources = data?.sources

  // El XML (AttachedDocument) va aparte: puede pesar y, en facturas antiguas, el backend lo
  // pide a Facturación Electrónica. Se pide en paralelo con lo anterior.
  const {
    data: attachedDocument,
    isLoading: isLoadingAttached,
    isError: isAttachedError,
    error: attachedError,
  } = useGetElectronicInvoiceAttachedDocument(invoiceId)
  const downloadXml = useDownloadAttachedDocument()

  // Factura leída del XML para cruzarla con el RIPS. Mientras carga queda undefined (no se
  // valida); si no hay XML o no se puede leer, null.
  const fev = useMemo(() => {
    if (isLoadingAttached) return undefined
    return parseFevXml(attachedDocument?.base64)
  }, [isLoadingAttached, attachedDocument])

  const result = useMemo(() => {
    if (!invoice || !sources) return null
    return buildRips({
      invoiceNum: invoice.invoiceNum,
      admission: sources.admission,
      patient: sources.patient,
      provider: sources.provider,
      movements: sources.movements,
      diagnosticosIngreso: sources.diagnosticosIngreso,
      diagnosticoEgreso: sources.diagnosticoEgreso,
      professional: sources.hcProfessional,
      registroSiras: sources.registroSiras,
      fev,
    })
  }, [invoice, sources, fev])

  const serviceRows = useMemo(
    () =>
      result && sources
        ? buildServiceRows(result.rips.usuarios[0].servicios, sources.movements)
        : null,
    [result, sources],
  )

  const availableGroups = useMemo(
    () => (serviceRows ? GROUP_ORDER.filter((group) => serviceRows[group].length > 0) : []),
    [serviceRows],
  )
  const [selectedGroup, setSelectedGroup] = useState<RipsServiceGroupKey | null>(null)
  const activeGroup =
    selectedGroup && availableGroups.includes(selectedGroup) ? selectedGroup : availableGroups[0]

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

  const goBack = () => router.push("/billing/electronicInvoices")

  if (!isLoading && (isError || !invoice)) {
    return (
      <Container fluid padding="md">
        <Empty
          description={
            error?.message && isError ? error.message : "No se encontró la factura electrónica."
          }
        >
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
            Volver a facturas
          </Button>
        </Empty>
      </Container>
    )
  }

  const usuario = result?.rips.usuarios[0]
  const patient = sources?.patient
  const admission = sources?.admission
  const { errors: errorCount, warnings: warningCount } = countRipsIssues(result?.missing ?? [])
  const serviceCount = availableGroups.reduce(
    (total, group) => total + (serviceRows?.[group].length ?? 0),
    0,
  )
  const activeRows = activeGroup && serviceRows ? serviceRows[activeGroup] : []
  const activeGroupTotal = activeRows.reduce((total, row) => total + (row.vrServicio ?? 0), 0)

  const xmlTile = isLoadingAttached ? (
    <StatTile
      icon={<FileProtectOutlined />}
      label="XML de la factura"
      value={<Skeleton.Button active size="small" style={{ width: 110 }} />}
      hint="Consultando AttachedDocument…"
      tone="neutral"
    />
  ) : attachedDocument ? (
    <StatTile
      icon={<FileProtectOutlined />}
      label="XML de la factura"
      value="Disponible"
      tone="success"
      hint={
        <Button
          type="link"
          size="small"
          icon={<DownloadOutlined />}
          loading={downloadXml.isPending}
          onClick={() => downloadXml.mutate(invoiceId)}
          title="Descargar el AttachedDocument (XML firmado + respuesta DIAN)"
          style={{
            padding: 0,
            height: "auto",
            maxWidth: "100%",
            whiteSpace: "normal",
            textAlign: "left",
          }}
        >
          Descargar XML
        </Button>
      }
    />
  ) : (
    <StatTile
      icon={<FileProtectOutlined />}
      label="XML de la factura"
      value="No disponible"
      tone="error"
      hint={isAttachedError ? attachedError?.message : "Sin XML el MUV no puede validar"}
    />
  )

  const mainTabs = [
    {
      key: "servicios",
      label: (
        <span>
          <AppstoreOutlined /> Servicios
        </span>
      ),
      children: (
        <div className={styles.tabPane}>
          {availableGroups.length === 0 || !activeGroup ? (
            <Empty description="La admisión no tiene servicios para reportar" />
          ) : (
            <>
              <div className={styles.groupBar}>
                <Segmented
                  value={activeGroup}
                  onChange={(value) => setSelectedGroup(value as RipsServiceGroupKey)}
                  options={availableGroups.map((group) => ({
                    value: group,
                    label: (
                      <span>
                        {GROUP_LABELS[group]}
                        <span className={styles.groupCount}>{serviceRows![group].length}</span>
                      </span>
                    ),
                  }))}
                />
                {activeGroup !== "urgencias" && activeGroup !== "hospitalizacion" && (
                  <span className={styles.groupTotal}>
                    Subtotal {GROUP_LABELS[activeGroup].toLowerCase()}:{" "}
                    <strong>{formatCurrency(activeGroupTotal)}</strong>
                  </span>
                )}
              </div>
              <div className={styles.table}>
                <Table<ServiceRow>
                  size="middle"
                  columns={columnsFor(activeGroup)}
                  dataSource={activeRows}
                  rowKey="key"
                  pagination={activeRows.length > 15 ? { pageSize: 15, size: "small" } : false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: "json",
      label: (
        <span>
          <CodeOutlined /> JSON RIPS
        </span>
      ),
      children: (
        <div className={styles.tabPane}>
          <CodeBlock
            title={`RIPS_${invoice?.invoiceNum ?? ""}.json`}
            content={json}
            actions={
              <>
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
                  Copiar
                </Button>
                <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload}>
                  Descargar
                </Button>
              </>
            }
          />
        </div>
      ),
    },
    {
      key: "muv",
      label: (
        <span>
          <CloudUploadOutlined /> Paquete MUV
        </span>
      ),
      children: (
        <div className={styles.tabPane}>
          <div className={styles.muvSteps}>
            {[
              {
                title: "RIPS armado",
                text: errorCount > 0 ? `${errorCount} errores por corregir` : "Sin errores de rechazo",
                done: errorCount === 0,
              },
              {
                title: "XML de la factura",
                text: attachedDocument ? "AttachedDocument listo" : "Falta el AttachedDocument",
                done: !!attachedDocument,
              },
              { title: "Envío al MUV", text: "Integración pendiente", done: false },
              { title: "CUV", text: "Se mostrará al validar", done: false },
            ].map((step, index) => (
              <div key={step.title} className={styles.muvStep}>
                <span
                  className={[styles.muvStepNumber, step.done && styles.muvStepDone]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {step.done ? <CheckCircleFilled /> : index + 1}
                </span>
                <div>
                  <div className={styles.muvStepTitle}>{step.title}</div>
                  <div className={styles.muvStepText}>{step.text}</div>
                </div>
              </div>
            ))}
          </div>
          <CodeBlock title="POST /api/PaquetesFevRips/CargarFevRips" content={muvPackagePreview} />
        </div>
      ),
    },
  ]

  return (
    <Container fluid padding="md">
      {contextHolder}

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <Button
              className={styles.backButton}
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
              aria-label="Volver a facturas"
            />
            <div className={styles.headerIcon}>
              <SolutionOutlined />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.eyebrow}>Facturación · RIPS</div>
              <div className={styles.titleRow}>
                <Title level={3}>
                  Factura <span className={styles.invoiceNum}>{invoice?.invoiceNum ?? "…"}</span>
                </Title>
                <RipsStatusTag status="pending" />
              </div>
              {invoice && (
                <div className={styles.meta}>
                  <span>
                    <UserOutlined /> {formatPersonName(invoice.patientName)}
                  </span>
                  {invoice.insurerName && (
                    <span>
                      <BankOutlined /> {formatInstitutionName(invoice.insurerName)}
                    </span>
                  )}
                  <span>
                    <CalendarOutlined /> Emitida el {formatDate(invoice.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} disabled={!result}>
              JSON
            </Button>
            <Tooltip title="Disponible cuando el backend tenga la integración con el MUV">
              <Button type="primary" icon={<CloudUploadOutlined />} disabled>
                Enviar al MUV
              </Button>
            </Tooltip>
          </div>
        </header>

        {isLoading || !result || !usuario || !invoice ? (
          <LoadingState />
        ) : (
          <>
            <div className={styles.note}>
              <InfoCircleOutlined />
              <span>
                Vista previa armada con los datos actuales de la admisión. Lo marcado como{" "}
                <strong>“Sin código”</strong> es información que MediNexus aún no guarda con el
                código oficial de SISPRO.
              </span>
            </div>

            <div className={styles.stats}>
              <StatTile
                icon={<FileTextOutlined />}
                label="Total servicios RIPS"
                value={formatCurrency(result.totalServicios)}
                hint={admission?.convenioNombre}
              />
              <StatTile
                icon={<AppstoreOutlined />}
                label="Servicios reportados"
                value={serviceCount}
                hint={
                  availableGroups.length > 0
                    ? availableGroups
                        .map((group) => `${serviceRows![group].length} ${GROUP_LABELS[group].toLowerCase()}`)
                        .join(" · ")
                    : "Sin servicios"
                }
                tone={serviceCount > 0 ? "default" : "neutral"}
              />
              <StatTile
                icon={errorCount > 0 ? <ExclamationCircleOutlined /> : <CheckCircleFilled />}
                label="Validación previa"
                value={
                  errorCount > 0
                    ? `${errorCount} ${errorCount === 1 ? "error" : "errores"}`
                    : "Sin errores"
                }
                hint={
                  warningCount > 0
                    ? `${warningCount} ${warningCount === 1 ? "aviso" : "avisos"} por revisar`
                    : "Lista para enviar"
                }
                tone={errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "success"}
              />
              {xmlTile}
            </div>

            <div className={styles.grid}>
              <Card icon={<FileTextOutlined />} title="Factura">
                <div className={styles.fields}>
                  <Field label="N° factura">
                    <span className={styles.mono}>{result.rips.numFactura}</span>
                  </Field>
                  <Field label="NIT obligado">
                    <CodeCell value={result.rips.numDocumentoIdObligado} />
                  </Field>
                  <Field label="Código prestador (REPS)">
                    <CodeCell value={result.codPrestador} />
                  </Field>
                  <Field label="CUV">
                    <span style={{ color: "var(--dash-text-tertiary)" }}>Pendiente</span>
                  </Field>
                  <Field label="EPS" wide>
                    {invoice.insurerName ? formatInstitutionName(invoice.insurerName) : "-"}
                  </Field>
                  {invoice.cufe && (
                    <Field label="CUFE" wide>
                      <Tooltip title={invoice.cufe}>
                        <span className={styles.mono}>
                          {invoice.cufe.slice(0, 24)}…{invoice.cufe.slice(-8)}
                        </span>
                      </Tooltip>
                    </Field>
                  )}
                </div>
                <div className={styles.total}>
                  <span className={styles.totalLabel}>Total servicios RIPS</span>
                  <span className={styles.totalValue}>{formatCurrency(result.totalServicios)}</span>
                </div>
              </Card>

              <Card icon={<IdcardOutlined />} title="Usuario">
                <div className={styles.patientHead}>
                  <div className={styles.avatar}>{initials(formatPersonName(invoice.patientName))}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className={styles.patientName}>{formatPersonName(invoice.patientName)}</div>
                    <div className={styles.patientDoc}>
                      <span className={styles.codeChip}>{usuario.tipoDocumentoIdentificacion}</span>{" "}
                      <span className={styles.mono}>{usuario.numDocumentoIdentificacion}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.fields}>
                  <Field label="Fecha de nacimiento">{formatDate(patient?.birthDate)}</Field>
                  <Field label="Sexo">
                    <NamedCode name={patient?.sexName} code={usuario.codSexo} />
                  </Field>
                  <Field label="Tipo de usuario">
                    <CodeCell
                      value={usuario.tipoUsuario}
                      hint="El tipo de usuario del convenio no tiene código SISPRO"
                    />
                  </Field>
                  <Field label="Municipio de residencia">
                    <NamedCode name={patient?.cityName} code={usuario.codMunicipioResidencia} />
                  </Field>
                  <Field label="Zona">
                    <NamedCode name={patient?.zoneName} code={usuario.codZonaTerritorialResidencia} />
                  </Field>
                  {/* Si la atención generó incapacidad (LstSiNo); no es la discapacidad del paciente. */}
                  <Field label="Incapacidad generada">
                    <Tooltip title="Aún no se registra en la atención; se reporta NO">
                      <Tag style={{ marginInlineEnd: 0 }}>{usuario.incapacidad}</Tag>
                    </Tooltip>
                  </Field>
                </div>
              </Card>
            </div>

            <IssuesCard missing={result.missing} />

            <section className={[styles.card, styles.tabsCard].join(" ")}>
              <Tabs items={mainTabs} />
            </section>
          </>
        )}
      </div>
    </Container>
  )
}

export default RipsDetail
