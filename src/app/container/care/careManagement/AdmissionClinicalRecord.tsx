"use client"

import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LockOutlined,
  PrinterOutlined,
  UnlockOutlined,
} from "@ant-design/icons"
import { Alert, Modal as AntModal, Button, Progress, Spin, Tag, Tooltip, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
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

const headerCellStyle = { backgroundColor: "rgba(var(--theme-primary-rgb, 15,111,92), 0.08)" }
const mutedText = { color: "var(--dash-text-secondary, #6b7280)", fontSize: 12 }

const centeredSpin = (
  <div className="d-flex justify-content-center py-5">
    <Spin size="large" />
  </div>
)

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
              <Button danger icon={<DeleteOutlined />} disabled={closed} onClick={() => handleDelete(entry)}>
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

  // Botón del documento, o un aviso cuando la admisión no tiene registros de ese tipo.
  const docButton = (kind: ClinicalDocumentKind, label: string, count: number, title = label) =>
    count > 0 ? (
      <Button size="small" icon={<FileTextOutlined />} onClick={() => openDoc(kind, title)}>
        {label} ({count})
      </Button>
    ) : (
      <span style={mutedText}>Sin registros</span>
    )

  if (summaryQuery.isError || record.admissionError) {
    return <Alert type="error" showIcon message="No se pudo cargar la información de la admisión." />
  }
  if (!summary) return centeredSpin

  const count = (m: ClinicalModule) => moduleCount(summary, m)
  const otherRecords = (
    [
      { kind: "notasMedicas", label: "Notas médicas", count: count("notasMedicas") },
      { kind: "notasEnfermeria", label: "Notas de enfermería", count: count("notasEnfermeria") },
      { kind: "procedimientos", label: "Procedimientos", count: count("procedimientos") },
      { kind: "cirugia", label: "Descripción quirúrgica y anestesia", count: count("cirugia") },
      { kind: "formulasPos", label: "Fórmulas POS", count: count("formulasPos") },
    ] satisfies { kind: ClinicalDocumentKind; label: string; count: number }[]
  ).filter((r) => r.count > 0)

  const browserGroup = browser?.type === "evoluciones" ? groups.find((g) => g.key === browser.groupKey) : undefined
  const browserLoading =
    browser?.type === "documentos" ? loadingAny(DOCUMENT_MODULES(browser.kind)) || loadingUsers : false

  const egreso = record.datosClinicosEgreso[0]
  const hci = record.hcInicial
  const openDocumentLoading = !!openDocument && loadingAny(DOCUMENT_MODULES(openDocument.kind))

  return (
    <>
      <div
        style={{
          backgroundColor: "var(--theme-primary, #0F6F5C)",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: 6,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>PACIENTE: {patient.nombrePaciente}</div>
          <div style={{ fontSize: 13, marginTop: 4, display: "flex", flexWrap: "wrap", columnGap: 16 }}>
            <span>
              Documento: {patient.documentTypeCode} {patient.documentoPaciente}
            </span>
            <span>Admisión N° {admission.id}</span>
            <span>Ingreso: {formatDateTime(admission.admissionDate)}</span>
            {admission.careScopeName && <span>Ámbito: {admission.careScopeName}</span>}
            <span>EPS: {admission.epsNombre}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag icon={closed ? <LockOutlined /> : <UnlockOutlined />} color={closed ? "red" : "green"}>
            {closed ? `Cerrada · ${admission.numeroFactura}` : "Abierta"}
          </Tag>
          <Button icon={<PrinterOutlined />} onClick={openPrint}>
            Imprimir HC
          </Button>
        </div>
      </div>

      {closed && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="La admisión está cerrada (facturada). La historia clínica se puede consultar e imprimir, pero sus evoluciones no se pueden modificar ni eliminar."
        />
      )}
      {failedModules.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`No se pudo cargar toda la información de: ${failedModules.map((m) => MODULE_TITLES[m]).join(", ")}. Se muestra lo disponible.`}
        />
      )}

      {loadingSpecialties ? (
        centeredSpin
      ) : (
        <>
          <div className="table-responsive" style={{ marginBottom: 16 }}>
            <table className="table table-bordered align-middle" style={{ backgroundColor: "var(--dash-surface, #ffffff)" }}>
              <thead>
                <tr style={headerCellStyle}>
                  <th style={{ width: "30%" }}>Especialidad de atención</th>
                  <th style={{ width: "40%" }}>Historia Clínica</th>
                  <th style={{ width: "30%" }}>Epicrisis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>HISTORIA CLÍNICA INICIAL</td>
                  <td>
                    {hci ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          icon={<FileTextOutlined />}
                          onClick={() => openDoc("hcInicial", "Historia clínica inicial")}
                        >
                          Ver HC inicial
                        </Button>
                        <span style={mutedText}>
                          {hci.admissionDate?.slice(0, 10)} {hci.admissionTime?.slice(0, 5)}
                          {hci.nombreProfesional ? ` · ${hci.nombreProfesional}` : ""}
                        </span>
                      </div>
                    ) : (
                      <span style={mutedText}>Sin historia clínica inicial</span>
                    )}
                  </td>
                  <td
                    rowSpan={Math.max(groups.length, 1) + otherRecords.length + 1}
                    style={{ verticalAlign: "top" }}
                  >
                    {egreso ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<FileTextOutlined />}
                          onClick={() => openDoc("epicrisis", "Epicrisis")}
                        >
                          Ver epicrisis
                        </Button>
                        <span style={mutedText}>Con nota de egreso</span>
                      </div>
                    ) : (
                      <span style={mutedText}>Sin epicrisis</span>
                    )}
                  </td>
                </tr>
                {groups.map((group) => {
                  const last = group.entries[group.entries.length - 1]
                  return (
                    <tr key={group.key}>
                      <td style={{ fontWeight: 600 }}>{group.nombre}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <Button
                            size="small"
                            icon={<FileTextOutlined />}
                            onClick={() => setBrowser({ type: "evoluciones", groupKey: group.key })}
                          >
                            Evoluciones ({group.entries.length})
                          </Button>
                          <span style={mutedText}>
                            Última: {last.data.fechaEvolucion} {last.data.horaEvolucion?.slice(0, 5)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {groups.length === 0 && (
                  <tr>
                    <td style={{ fontWeight: 600 }}>EVOLUCIONES</td>
                    <td>
                      <span style={mutedText}>Sin evoluciones registradas</span>
                    </td>
                  </tr>
                )}
                {/* Los demás registros clínicos van como filas, igual que las especialidades. */}
                {otherRecords.map((r) => (
                  <tr key={r.kind}>
                    <td style={{ fontWeight: 600 }}>{r.label.toUpperCase()}</td>
                    <td>
                      <Button size="small" icon={<FileTextOutlined />} onClick={() => openDoc(r.kind, r.label)}>
                        Ver registros ({r.count})
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="table-responsive" style={{ marginBottom: 16 }}>
        <table className="table table-bordered align-middle" style={{ backgroundColor: "var(--dash-surface, #ffffff)" }}>
          <thead>
            <tr style={headerCellStyle}>
              <th>Órdenes</th>
              <th>Aplicación de medicamentos</th>
              <th>Laboratorio</th>
              <th>Imágenes diagnósticas</th>
              <th colSpan={HOJAS_GASTOS.length}>Hoja de gastos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{docButton("ordenes", "Órdenes", count("ordenes"), "Órdenes médicas")}</td>
              <td>{docButton("aplicaciones", "Aplicaciones", count("aplicaciones"), "Aplicación de medicamentos")}</td>
              <td>{docButton("laboratorio", "Laboratorio", count("laboratorio"), "Resultados de laboratorio")}</td>
              <td>{docButton("imagenes", "Imágenes", count("imagenes"), "Imágenes diagnósticas")}</td>
              {HOJAS_GASTOS.map(({ tipo, label }) => (
                <td key={tipo}>
                  <div style={mutedText}>{label}</div>
                  {moduleStatus("gastos").isLoading ? (
                    <Spin size="small" />
                  ) : (
                    docButton(
                      `gastos-${tipo}`,
                      "Hoja",
                      record.hojaGastos.filter((r) => r.tipoHoja === tipo).length,
                      `Hoja de gastos de ${label.toLowerCase()}`,
                    )
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>


      {audits.length > 0 && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {audits.length} {audits.length === 1 ? "cambio registrado" : "cambios registrados"} en las evoluciones de
          esta admisión. Último: {audits[0].accion.toLowerCase()} por {audits[0].nombreUsuario},{" "}
          {formatDateTime(audits[0].fechaAccion)}.
        </Typography.Text>
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
