"use client"

import {
  CameraOutlined,
  ContainerOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FormOutlined,
  HistoryOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  PrinterOutlined,
  ProfileOutlined,
  RightOutlined,
  ScissorOutlined,
  SolutionOutlined,
  ToolOutlined,
  UnlockOutlined,
} from "@ant-design/icons"
import { Alert, Modal as AntModal, Button, Empty, Progress, Skeleton, Spin, Tag, Tooltip } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState, type ReactNode } from "react"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetUsersByIds } from "@/core/hooks/users/useGetByIdUser"
import { useGetAdmissionRecordSummary } from "@/core/hooks/care/admissions/useAdmissionHistory"
import { useGetClinicalRecordAudits } from "@/core/hooks/care/clinicalHistory/useClinicalHistory"
import type {
  ClinicalHistoryAdmission,
  ClinicalHistorySearchResult,
} from "@/core/interfaces/care/clinicalHistory"
import type { TipoHojaGastos } from "@/core/interfaces/care/hojaGastos"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import { formatDateTime } from "@/core/utils/date"
import ClinicalPrintPreviewModal from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import {
  AdmissionRecordDocuments,
  recordSignerIds,
} from "@/app/container/care/admissionHistory/detail/AdmissionRecordDocuments"
import AdmissionRecordPrintModal from "@/app/container/care/admissionHistory/detail/AdmissionRecordPrintModal"
import type { RecordStageKey } from "@/app/container/care/admissionHistory/detail/admissionRecord.stages"
import { useDeleteEvolucion } from "@/core/hooks/care/evoluciones/useDeleteEvolucion"
import { useDeleteEvolucionEspecialista } from "@/core/hooks/care/evolucionEspecialista/useDeleteEvolucionEspecialista"
import { EvolucionDetailView } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/EvolucionDetailView"
import { EvolucionEspecialistaDetailView } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/EvolucionEspecialistaDetailView"
import {
  ClinicalHistoryDocument,
  buildDocumentItems,
  evolutionPrintDocument,
  type ClinicalDocumentKind,
  type DocumentContext,
  type ListDocumentKind,
  type SingleDocumentKind,
} from "./ClinicalHistoryDocuments"
import EvolutionEditModal from "./EvolutionEditModal"
import RecordBrowserModal, { type BrowserItem } from "./RecordBrowserModal"
import { RECORD_TYPE_LABEL, groupBySpecialty, type EvolutionEntry } from "./clinicalHistory.utils"
import {
  DOCUMENT_MODULES,
  INITIAL_MODULES,
  STAGE_MODULES,
  moduleCount,
  useClinicalHistoryRecord,
  type ClinicalModule,
} from "./useClinicalHistoryRecord"

// Todo lo clínico de la admisión; la facturación no hace parte de la HC.
const CLINICAL_STAGES: RecordStageKey[] = ["ingreso", "historia", "notas", "cirugia", "ordenes", "apoyo", "gastos"]

const MODULE_TITLES: Record<ClinicalModule, string> = {
  ingreso: "Ingreso",
  hcInicial: "HC inicial",
  evoluciones: "Evoluciones",
  especialistas: "Evoluciones de especialista",
  procedimientos: "Procedimientos",
  notasEnfermeria: "Notas de enfermería",
  egreso: "Epicrisis",
  notasMedicas: "Notas médicas",
  cirugia: "Cirugía",
  ordenes: "Órdenes",
  formulasPos: "Fórmulas POS",
  aplicaciones: "Aplicación de medicamentos",
  laboratorio: "Laboratorio",
  imagenes: "Imágenes diagnósticas",
  gastos: "Hojas de gastos",
}

const HOJAS_GASTOS: { tipo: TipoHojaGastos; label: string }[] = [
  { tipo: "Hospitalizacion", label: "Hospitalización" },
  { tipo: "Cirugia", label: "Cirugía" },
  { tipo: "Urgencias", label: "Urgencias" },
]

const centeredSpin = (
  <div className="d-flex justify-content-center py-5">
    <Spin size="large" />
  </div>
)

type Tone = "emerald" | "blue" | "violet" | "amber" | "rose" | "cyan"

const SMALL_WORDS = new Set(["y", "e", "de", "del", "la", "las", "el", "los", "en", "con", "sin"])

// "ORTOPEDIA Y TRAUMATOLOGÍA" → "Ortopedia y Traumatología": las mayúsculas quedan para los títulos.
const titleCase = (text: string) =>
  text
    .toLocaleLowerCase("es")
    .split(" ")
    .map((word, i) =>
      i > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toLocaleUpperCase("es") + word.slice(1),
    )
    .join(" ")

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()

interface RecordRowProps {
  icon: ReactNode
  tone: Tone
  title: string
  subtitle?: ReactNode
  // Sin conteo la fila abre un documento único (HC inicial, epicrisis).
  count?: number
  onOpen: () => void
}

// Fila de la HC: toda la fila abre el registro.
function RecordRow({ icon, tone, title, subtitle, count, onOpen }: RecordRowProps) {
  return (
    <button type="button" className="chv-row" onClick={onOpen}>
      <span className={`chv-icon tone-${tone}`}>{icon}</span>
      <span className="chv-row-text">
        <span className="chv-row-title d-block">{title}</span>
        <span className="chv-row-subtitle d-block">{subtitle}</span>
      </span>
      {count !== undefined && <span className="chv-count">{count}</span>}
      <RightOutlined className="chv-chevron" />
    </button>
  )
}

// rows null: la sección aún carga y se muestra un esqueleto.
const hasRows = (rows: ReactNode[] | null) => rows === null || rows.some(Boolean)

function Section({ title, rows }: { title: string; rows: ReactNode[] | null }) {
  return (
    <section className="chv-section">
      <div className="chv-section-title">{title}</div>
      {rows ?? (
        <div className="chv-section-skeleton">
          <Skeleton active avatar={{ shape: "square" }} paragraph={{ rows: 1 }} />
        </div>
      )}
    </section>
  )
}

interface Props {
  admission: ClinicalHistoryAdmission
  patient: ClinicalHistorySearchResult
  messageApi: MessageInstance
}

interface OpenDocument {
  kind: SingleDocumentKind
  title: string
}

// Listado abierto: las evoluciones de una especialidad o los registros de un módulo.
type OpenBrowser =
  | { type: "evoluciones"; groupKey: string }
  | { type: "documentos"; kind: ListDocumentKind; title: string }

const LIST_KINDS: ClinicalDocumentKind[] = [
  "ordenes", "formulasPos", "laboratorio", "imagenes", "notasMedicas", "notasEnfermeria", "procedimientos", "cirugia",
]
const isListKind = (kind: ClinicalDocumentKind): kind is ListDocumentKind => LIST_KINDS.includes(kind)

const CLOSED_HINT = "La admisión está cerrada (facturada): no se pueden modificar ni eliminar evoluciones."

// HC de una admisión con la estructura de la vista de referencia: especialidades con
// su historia clínica y epicrisis, y debajo órdenes, medicamentos, apoyo diagnóstico
// y hojas de gastos. El resumen dice qué módulos tienen registros; de entrada solo se
// carga lo que se ve y cada documento se pide al abrirlo.
export default function AdmissionClinicalRecord({ admission, patient, messageApi }: Props) {
  const queryClient = useQueryClient()
  const summaryQuery = useGetAdmissionRecordSummary(admission.id)
  const summary = summaryQuery.data

  const [requested, setRequested] = useState<ClinicalModule[]>(INITIAL_MODULES)
  const hasData = (m: ClinicalModule) => !!summary && moduleCount(summary, m) > 0
  // Los módulos iniciales no dependen del resumen: al eliminar la última evolución el
  // conteo baja a 0 y la lista debe refrescarse igual.
  const { record, moduleStatus } = useClinicalHistoryRecord(
    admission.id,
    requested.filter((m) => INITIAL_MODULES.includes(m) || hasData(m)),
  )

  const { data: provider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const { usersById, isLoading: loadingUsers } = useGetUsersByIds(recordSignerIds(record))
  const { data: audits = [] } = useGetClinicalRecordAudits(admission.id)
  const [printedAt] = useState(() => new Date())

  const [editing, setEditing] = useState<EvolutionEntry | null>(null)
  const [openDocument, setOpenDocument] = useState<OpenDocument | null>(null)
  // El documento sigue montado mientras el modal anima su cierre, en vez de desaparecer de golpe.
  const lastDocument = useRef<OpenDocument | null>(null)
  if (openDocument) lastDocument.current = openDocument
  const shownDocument = openDocument ?? lastDocument.current
  const [browser, setBrowser] = useState<OpenBrowser | null>(null)
  const [printOpen, setPrintOpen] = useState(false)
  const deleteEvolucion = useDeleteEvolucion()
  const deleteEvolucionEspecialista = useDeleteEvolucionEspecialista()

  const request = (modules: ClinicalModule[]) =>
    setRequested((prev) => [...new Set([...prev, ...modules])])

  const closed = admission.cerrada
  const groups = groupBySpecialty(record.evoluciones, record.evolucionEspecialistas)
  const documentContext: DocumentContext = { record, provider, usersById, printedAt }

  // Tras modificar o eliminar cambian las trazas y los conteos del resumen.
  const refreshAfterChange = () => {
    queryClient.invalidateQueries({ queryKey: ["clinical-history", "audits", admission.id] })
    queryClient.invalidateQueries({ queryKey: ["admissions", "summary", admission.id] })
  }

  const loadingAny = (modules: ClinicalModule[]) => modules.some((m) => moduleStatus(m).isLoading)
  const loadingSpecialties = loadingAny(["hcInicial", "evoluciones", "especialistas", "egreso"])
  const failedModules = requested.filter((m) => hasData(m) && moduleStatus(m).isError)

  // Impresión: las etapas con registros; sus módulos se cargan al abrir la vista previa.
  const printStages = CLINICAL_STAGES.filter((s) => STAGE_MODULES[s].some(hasData))
  const printModules = printStages.flatMap((s) => STAGE_MODULES[s]).filter(hasData)
  const pendingPrintModules = printModules.filter(
    (m) => !requested.includes(m) || moduleStatus(m).isLoading,
  )

  const openPrint = () => {
    request(printModules)
    setPrintOpen(true)
  }

  const openDoc = (kind: ClinicalDocumentKind, title: string) => {
    request(DOCUMENT_MODULES(kind))
    if (isListKind(kind)) setBrowser({ type: "documentos", kind, title })
    else setOpenDocument({ kind, title })
  }

  const handleDelete = (entry: EvolutionEntry) => {
    const label = RECORD_TYPE_LABEL[entry.tipo]
    AntModal.confirm({
      title: `Eliminar ${label.toLowerCase()}`,
      content: `¿Confirma eliminar la ${label.toLowerCase()} del ${entry.data.fechaEvolucion} ${entry.data.horaEvolucion?.slice(0, 5)} registrada por ${entry.data.nombreProfesional}? Quedará registro de la eliminación.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      // Por encima del modal del listado.
      zIndex: 2000,
      onOk: async () => {
        try {
          const variables = { id: entry.data.id, admissionId: admission.id }
          if (entry.tipo === "Evolucion") await deleteEvolucion.mutateAsync(variables)
          else await deleteEvolucionEspecialista.mutateAsync(variables)
          messageApi.success(`${label} eliminada correctamente`)
          refreshAfterChange()
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la evolución.")
        }
      },
    })
  }

  // Evoluciones de una especialidad para el listado, con sus acciones y su impresión.
  const evolutionItems = (groupKey: string): BrowserItem[] =>
    (groups.find((g) => g.key === groupKey)?.entries ?? []).map((entry) => {
      const changes = audits.filter((a) => a.tipoRegistro === entry.tipo && a.registroId === entry.data.id)
      return {
        key: `${entry.tipo}-${entry.data.id}`,
        date: `${entry.data.fechaEvolucion} ${entry.data.horaEvolucion?.slice(0, 5) ?? ""}`,
        author: entry.data.nombreProfesional,
        excerpt: entry.data.motivoConsulta,
        tags: (
          <>
            <Tag>{RECORD_TYPE_LABEL[entry.tipo]}</Tag>
            {changes.length > 0 && (
              <Tooltip
                title={`Modificada ${changes.length} ${changes.length === 1 ? "vez" : "veces"}. Última: ${changes[0].nombreUsuario}, ${formatDateTime(changes[0].fechaAccion)}`}
              >
                <Tag icon={<HistoryOutlined />} color="gold">
                  Modificada
                </Tag>
              </Tooltip>
            )}
          </>
        ),
        actions: (
          <>
            <Tooltip title={closed ? CLOSED_HINT : undefined}>
              <Button icon={<EditOutlined />} disabled={closed} onClick={() => setEditing(entry)}>
                Modificar
              </Button>
            </Tooltip>
            <Tooltip title={closed ? CLOSED_HINT : undefined}>
              <Button danger type="text" icon={<DeleteOutlined />} disabled={closed} onClick={() => handleDelete(entry)}>
                Eliminar
              </Button>
            </Tooltip>
          </>
        ),
        renderDetail: () =>
          entry.tipo === "Evolucion" ? (
            <EvolucionDetailView data={entry.data} />
          ) : (
            <EvolucionEspecialistaDetailView data={entry.data} />
          ),
        renderPrint: () => evolutionPrintDocument(entry, documentContext),
      }
    })

  if (summaryQuery.isError || record.admissionError) {
    return <Alert type="error" showIcon message="No se pudo cargar la información de la admisión." />
  }
  if (!summary) return centeredSpin

  const count = (m: ClinicalModule) => moduleCount(summary, m)
  const otherRecords = [
    { kind: "notasMedicas", label: "Notas médicas", icon: <SolutionOutlined />, count: count("notasMedicas") },
    { kind: "notasEnfermeria", label: "Notas de enfermería", icon: <FormOutlined />, count: count("notasEnfermeria") },
    { kind: "procedimientos", label: "Procedimientos", icon: <ToolOutlined />, count: count("procedimientos") },
    { kind: "cirugia", label: "Descripción quirúrgica y anestesia", icon: <ScissorOutlined />, count: count("cirugia") },
    { kind: "formulasPos", label: "Fórmulas POS", icon: <ProfileOutlined />, count: count("formulasPos") },
  ] satisfies { kind: ClinicalDocumentKind; label: string; icon: ReactNode; count: number }[]

  const browserGroup = browser?.type === "evoluciones" ? groups.find((g) => g.key === browser.groupKey) : undefined
  const browserLoading =
    browser?.type === "documentos" ? loadingAny(DOCUMENT_MODULES(browser.kind)) || loadingUsers : false

  const egreso = record.datosClinicosEgreso[0]
  const hci = record.hcInicial
  const openDocumentLoading = !!openDocument && loadingAny(DOCUMENT_MODULES(openDocument.kind))

  // Fila de un módulo con listado o documento; sin registros no se muestra.
  const moduleRow = (kind: ClinicalDocumentKind, label: string, icon: ReactNode, tone: Tone, n: number, title = label) =>
    n > 0 && (
      <RecordRow
        key={kind}
        icon={icon}
        tone={tone}
        title={label}
        subtitle={`${n} ${n === 1 ? "registro" : "registros"}`}
        count={n}
        onOpen={() => openDoc(kind, title)}
      />
    )

  const patientFields = [
    { label: "Documento", value: `${patient.documentTypeCode} ${patient.documentoPaciente}` },
    { label: "Admisión", value: `N° ${admission.id}` },
    { label: "Ingreso", value: formatDateTime(admission.admissionDate) },
    { label: "Ámbito", value: admission.careScopeName },
    { label: "EPS", value: admission.epsNombre },
    { label: "Convenio", value: admission.convenioNombre },
  ].filter((f) => f.value)

  return (
    <>
      <div className="chv-patient">
        <div className="chv-patient-main">
          <div className="chv-avatar">{initials(patient.nombrePaciente)}</div>
          <div style={{ minWidth: 0 }}>
            <div className="chv-patient-name">{patient.nombrePaciente}</div>
            <div className="chv-patient-grid">
              {patientFields.map((f) => (
                <div className="chv-field" key={f.label}>
                  <span className="chv-field-label">{f.label}</span>
                  <span>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chv-patient-side">
          <div className="chv-patient-status">
            <Tag
              icon={closed ? <LockOutlined /> : <UnlockOutlined />}
              color={closed ? "red" : "green"}
              style={{ marginInlineEnd: 0, padding: "2px 10px", fontSize: 13 }}
            >
              {closed ? "Cerrada" : "Abierta"}
            </Tag>
            <Button type="primary" icon={<PrinterOutlined />} onClick={openPrint}>
              Imprimir HC
            </Button>
          </div>
          {closed && (
            <Tooltip title="La historia clínica se puede consultar e imprimir, pero sus evoluciones no se pueden modificar ni eliminar.">
              <span className="chv-readonly">
                <LockOutlined /> Solo lectura · facturada {admission.numeroFactura}
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {failedModules.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`No se pudo cargar toda la información de: ${failedModules.map((m) => MODULE_TITLES[m]).join(", ")}. Se muestra lo disponible.`}
        />
      )}

      {(() => {
        // Solo se muestra lo que tiene registros: filas vacías y secciones sin filas no aparecen.
        const historyRows = loadingSpecialties
          ? null
          : [
              hci && (
                <RecordRow
                  key="hcInicial"
                  icon={<FileTextOutlined />}
                  tone="emerald"
                  title="HC inicial"
                  subtitle={[
                    `${hci.admissionDate?.slice(0, 10) ?? ""} ${hci.admissionTime?.slice(0, 5) ?? ""}`.trim(),
                    hci.nombreProfesional,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  onOpen={() => openDoc("hcInicial", "Historia clínica inicial")}
                />
              ),
              egreso && (
                <RecordRow
                  key="epicrisis"
                  icon={<FileDoneOutlined />}
                  tone="emerald"
                  title="Epicrisis"
                  subtitle="Con nota de egreso"
                  onOpen={() => openDoc("epicrisis", "Epicrisis")}
                />
              ),
            ]
        const evolutionRows = loadingSpecialties
          ? null
          : groups.map((group) => {
              const last = group.entries[group.entries.length - 1]
              return (
                <RecordRow
                  key={group.key}
                  icon={<MedicineBoxOutlined />}
                  tone="blue"
                  title={titleCase(group.nombre)}
                  subtitle={`Última: ${last.data.fechaEvolucion} ${last.data.horaEvolucion?.slice(0, 5) ?? ""} · ${last.data.nombreProfesional}`}
                  count={group.entries.length}
                  onOpen={() => setBrowser({ type: "evoluciones", groupKey: group.key })}
                />
              )
            })
        const otherRows = otherRecords.map((r) => moduleRow(r.kind, r.label, r.icon, "violet", r.count))
        const orderRows = [
          moduleRow("ordenes", "Órdenes médicas", <ContainerOutlined />, "amber", count("ordenes")),
          moduleRow("aplicaciones", "Aplicación de medicamentos", <MedicineBoxOutlined />, "amber", count("aplicaciones")),
        ]
        const supportRows = [
          moduleRow("laboratorio", "Laboratorio", <ExperimentOutlined />, "cyan", count("laboratorio"), "Resultados de laboratorio"),
          moduleRow("imagenes", "Imágenes diagnósticas", <CameraOutlined />, "cyan", count("imagenes")),
        ]
        const expenseRows = moduleStatus("gastos").isLoading
          ? null
          : HOJAS_GASTOS.map(({ tipo, label }) =>
              moduleRow(
                `gastos-${tipo}`,
                label,
                <DollarOutlined />,
                "rose",
                record.hojaGastos.filter((r) => r.tipoHoja === tipo).length,
                `Hoja de gastos de ${label.toLowerCase()}`,
              ),
            )

        const left = [
          <Section key="historia" title="Historia clínica" rows={historyRows} />,
          <Section key="evoluciones" title="Evoluciones por especialidad" rows={evolutionRows} />,
          <Section key="otros" title="Otros registros clínicos" rows={otherRows} />,
        ].filter((s) => hasRows(s.props.rows))
        const right = [
          <Section key="ordenes" title="Órdenes y medicamentos" rows={orderRows} />,
          <Section key="apoyo" title="Apoyo diagnóstico" rows={supportRows} />,
          <Section key="gastos" title="Hojas de gastos" rows={expenseRows} />,
        ].filter((s) => hasRows(s.props.rows))

        if (left.length === 0 && right.length === 0) {
          return <Empty description="La admisión no tiene registros clínicos." style={{ padding: 40 }} />
        }
        return (
          <div className={`chv-layout${left.length === 0 || right.length === 0 ? " single" : ""}`}>
            {left.length > 0 && <div className="chv-column">{left}</div>}
            {right.length > 0 && <div className="chv-column">{right}</div>}
          </div>
        )
      })()}


      {audits.length > 0 && (
        <span className="chv-footnote">
          <HistoryOutlined /> {audits.length} {audits.length === 1 ? "cambio registrado" : "cambios registrados"} en
          las evoluciones de esta admisión. Último: {audits[0].accion.toLowerCase()} por {audits[0].nombreUsuario},{" "}
          {formatDateTime(audits[0].fechaAccion)}.
        </span>
      )}

      <RecordBrowserModal
        open={!!browser}
        onClose={() => setBrowser(null)}
        title={
          browser?.type === "documentos"
            ? browser.title
            : `Evoluciones · ${browserGroup?.nombre ?? ""}`
        }
        items={
          browser?.type === "documentos"
            ? browserLoading
              ? []
              : buildDocumentItems(browser.kind, documentContext)
            : browser
              ? evolutionItems(browser.groupKey)
              : []
        }
        loading={browserLoading}
        emptyText="No hay registros para mostrar."
      />

      {/* Después del listado para quedar por encima de él. */}
      <EvolutionEditModal
        entry={editing}
        onClose={() => setEditing(null)}
        onSaved={refreshAfterChange}
        messageApi={messageApi}
      />

      {shownDocument && (
        <ClinicalPrintPreviewModal
          open={!!openDocument}
          onClose={() => setOpenDocument(null)}
          title={shownDocument.title}
          renderDocument={(p) =>
            openDocumentLoading ? (
              centeredSpin
            ) : (
              <ClinicalHistoryDocument
                kind={shownDocument.kind}
                record={record}
                provider={p}
                usersById={usersById}
                printedAt={printedAt}
              />
            )
          }
        />
      )}

      <AdmissionRecordPrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        ready={pendingPrintModules.length === 0 && !loadingUsers}
        fileName={`HC_Admision_${admission.id}_${patient.documentoPaciente}`}
        progress={
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <Progress
              type="circle"
              percent={Math.round(
                ((printModules.length - pendingPrintModules.length) / Math.max(printModules.length, 1)) * 100,
              )}
            />
            <div style={{ marginTop: 12 }}>
              Cargando historia clínica: {printModules.length - pendingPrintModules.length} de {printModules.length} módulos
            </div>
          </div>
        }
        notice={
          failedModules.length > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message={`No se pudo cargar toda la información de: ${failedModules.map((m) => MODULE_TITLES[m]).join(", ")}.`}
            />
          )
        }
      >
        <AdmissionRecordDocuments
          record={record}
          stages={printStages}
          provider={provider}
          usersById={usersById}
          cities={[]}
          states={[]}
          printedAt={printedAt}
        />
      </AdmissionRecordPrintModal>
    </>
  )
}
