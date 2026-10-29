"use client"

import { FileTextOutlined, LockOutlined, PrinterOutlined, UnlockOutlined } from "@ant-design/icons"
import { Alert, Button, Card, Empty, Spin, Tag, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetUsersByIds } from "@/core/hooks/users/useGetByIdUser"
import { useGetClinicalRecordAudits } from "@/core/hooks/care/clinicalHistory/useClinicalHistory"
import type {
  ClinicalHistoryAdmission,
  ClinicalHistorySearchResult,
} from "@/core/interfaces/care/clinicalHistory"
import type { TipoHojaGastos } from "@/core/interfaces/care/hojaGastos"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import { formatDateTime } from "@/core/utils/date"
import ClinicalPrintPreviewModal from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import { ordenesConAplicaciones } from "@/app/container/care/medicationApplication/MedicationApplicationPrintDocument"
import {
  AdmissionRecordDocuments,
  recordSignerIds,
} from "@/app/container/care/admissionHistory/detail/AdmissionRecordDocuments"
import AdmissionRecordPrintModal from "@/app/container/care/admissionHistory/detail/AdmissionRecordPrintModal"
import type { RecordStageKey } from "@/app/container/care/admissionHistory/detail/admissionRecord.stages"
import { useAdmissionRecord } from "@/app/container/care/admissionHistory/detail/useAdmissionRecord"
import { ClinicalHistoryDocument, type ClinicalDocumentKind } from "./ClinicalHistoryDocuments"
import EvolutionEditModal from "./EvolutionEditModal"
import EvolutionList from "./EvolutionList"
import { groupBySpecialty, type EvolutionEntry } from "./clinicalHistory.utils"

// Todo lo clínico de la admisión; la facturación no hace parte de la HC.
const CLINICAL_STAGES: RecordStageKey[] = ["ingreso", "historia", "notas", "cirugia", "ordenes", "apoyo", "gastos"]

const STAGE_TITLES: Record<RecordStageKey, string> = {
  ingreso: "Ingreso",
  historia: "Historia clínica",
  notas: "Notas médicas",
  cirugia: "Cirugía",
  ordenes: "Órdenes y medicamentos",
  apoyo: "Laboratorio e imágenes",
  gastos: "Hojas de gastos",
  facturacion: "Facturación",
}

const HOJAS_GASTOS: { tipo: TipoHojaGastos; label: string }[] = [
  { tipo: "Hospitalizacion", label: "Hospitalización" },
  { tipo: "Cirugia", label: "Cirugía" },
  { tipo: "Urgencias", label: "Urgencias" },
]

const headerCellStyle = { backgroundColor: "rgba(var(--theme-primary-rgb, 15,111,92), 0.08)" }
const mutedText = { color: "var(--dash-text-secondary, #6b7280)", fontSize: 12 }

interface Props {
  admission: ClinicalHistoryAdmission
  patient: ClinicalHistorySearchResult
  messageApi: MessageInstance
}

interface OpenDocument {
  kind: ClinicalDocumentKind
  title: string
}

// HC de una admisión con la estructura de la vista de referencia: especialidades con
// su historia clínica y epicrisis, y debajo órdenes, medicamentos, apoyo diagnóstico
// y hojas de gastos. Solo carga registros de esta admisión.
export default function AdmissionClinicalRecord({ admission, patient, messageApi }: Props) {
  const queryClient = useQueryClient()
  const record = useAdmissionRecord(admission.id, CLINICAL_STAGES)
  const { data: provider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const { usersById, isLoading: loadingUsers } = useGetUsersByIds(recordSignerIds(record))
  const { data: audits = [] } = useGetClinicalRecordAudits(admission.id)
  const [printedAt] = useState(() => new Date())

  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null)
  const [editing, setEditing] = useState<EvolutionEntry | null>(null)
  const [openDocument, setOpenDocument] = useState<OpenDocument | null>(null)
  const [printOpen, setPrintOpen] = useState(false)

  const closed = admission.cerrada
  const groups = groupBySpecialty(record.evoluciones, record.evolucionEspecialistas)
  const selectedGroup = groups.find((g) => g.key === selectedGroupKey) ?? groups[0]

  const isLoading = CLINICAL_STAGES.some((s) => record.stageStatus[s].isLoading)
  const failedStages = CLINICAL_STAGES.filter((s) => record.stageStatus[s].isError)

  const refreshAudits = () =>
    queryClient.invalidateQueries({ queryKey: ["clinical-history", "audits", admission.id] })

  const aplicaciones = ordenesConAplicaciones(record.aplicaciones)
  const hasHistoria =
    !!record.hcInicial ||
    groups.length > 0 ||
    record.procedimientosMenores.length +
      record.procedimientosDiagnosticos.length +
      record.procedimientosNoQx.length +
      record.notasEnfermeria.length +
      record.datosClinicosEgreso.length >
      0
  const stageHasData: Record<RecordStageKey, boolean> = {
    ingreso: true,
    historia: hasHistoria,
    notas: record.notasMedicas.length > 0,
    cirugia: record.descripcionesQuirurgicas.length + record.recordsAnestesia.length > 0,
    ordenes: record.ordenesMedicas.length + record.medicamentosPos.length + aplicaciones.length > 0,
    apoyo: record.laboratorio.length + record.rayosX.length > 0,
    gastos: record.hojaGastos.length > 0,
    facturacion: false,
  }
  const printStages = CLINICAL_STAGES.filter((s) => stageHasData[s])

  const openDoc = (kind: ClinicalDocumentKind, title: string) => setOpenDocument({ kind, title })

  // Botón del documento, o un aviso cuando la admisión no tiene registros de ese tipo.
  const docButton = (kind: ClinicalDocumentKind, label: string, count: number, title = label) =>
    count > 0 ? (
      <Button size="small" icon={<FileTextOutlined />} onClick={() => openDoc(kind, title)}>
        {label} ({count})
      </Button>
    ) : (
      <span style={mutedText}>Sin registros</span>
    )

  const otherRecords = (
    [
    { kind: "notasMedicas", label: "Notas médicas", count: record.notasMedicas.length },
    { kind: "notasEnfermeria", label: "Notas de enfermería", count: record.notasEnfermeria.length },
    {
      kind: "procedimientos",
      label: "Procedimientos",
      count:
        record.procedimientosMenores.length +
        record.procedimientosDiagnosticos.length +
        record.procedimientosNoQx.length,
    },
    {
      kind: "cirugia",
      label: "Descripción quirúrgica y anestesia",
      count: record.descripcionesQuirurgicas.length + record.recordsAnestesia.length,
    },
    { kind: "formulasPos", label: "Fórmulas POS", count: record.medicamentosPos.length },
    ] satisfies { kind: ClinicalDocumentKind; label: string; count: number }[]
  ).filter((r) => r.count > 0)

  const egreso = record.datosClinicosEgreso[0]
  const hci = record.hcInicial

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
          <Button icon={<PrinterOutlined />} disabled={isLoading} onClick={() => setPrintOpen(true)}>
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
      {failedStages.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`No se pudo cargar toda la información de: ${failedStages.map((s) => STAGE_TITLES[s]).join(", ")}. Se muestra lo disponible.`}
        />
      )}

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
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
                  <td rowSpan={groups.length + 1} style={{ verticalAlign: "top" }}>
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
                  const selected = group.key === selectedGroup?.key
                  const last = group.entries[group.entries.length - 1]
                  return (
                    <tr key={group.key} style={selected ? { backgroundColor: "rgba(var(--theme-primary-rgb, 15,111,92), 0.05)" } : undefined}>
                      <td style={{ fontWeight: 600 }}>{group.nombre}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <Button
                            size="small"
                            type={selected ? "primary" : "default"}
                            onClick={() => setSelectedGroupKey(group.key)}
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
              </tbody>
            </table>
          </div>

          <Card
            size="small"
            style={{ marginBottom: 16 }}
            title={selectedGroup ? `Evoluciones · ${selectedGroup.nombre}` : "Evoluciones"}
          >
            {selectedGroup ? (
              <EvolutionList
                group={selectedGroup}
                admissionId={admission.id}
                closed={closed}
                audits={audits}
                onEdit={setEditing}
                onChanged={refreshAudits}
                messageApi={messageApi}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="La admisión no tiene evoluciones registradas" />
            )}
          </Card>

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
                  <td>{docButton("ordenes", "Órdenes", record.ordenesMedicas.length, "Órdenes médicas")}</td>
                  <td>{docButton("aplicaciones", "Aplicaciones", aplicaciones.length, "Aplicación de medicamentos")}</td>
                  <td>{docButton("laboratorio", "Laboratorio", record.laboratorio.length, "Resultados de laboratorio")}</td>
                  <td>{docButton("imagenes", "Imágenes", record.rayosX.length, "Imágenes diagnósticas")}</td>
                  {HOJAS_GASTOS.map(({ tipo, label }) => {
                    const count = record.hojaGastos.filter((r) => r.tipoHoja === tipo).length
                    return (
                      <td key={tipo}>
                        <div style={mutedText}>{label}</div>
                        {docButton(`gastos-${tipo}`, "Hoja", count, `Hoja de gastos de ${label.toLowerCase()}`)}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {otherRecords.length > 0 && (
            <Card size="small" title="Otros registros clínicos" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {otherRecords.map((r) => (
                  <Button key={r.kind} icon={<FileTextOutlined />} onClick={() => openDoc(r.kind, r.label)}>
                    {r.label} ({r.count})
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {audits.length > 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {audits.length} {audits.length === 1 ? "cambio registrado" : "cambios registrados"} en las evoluciones de
              esta admisión. Último: {audits[0].accion.toLowerCase()} por {audits[0].nombreUsuario},{" "}
              {formatDateTime(audits[0].fechaAccion)}.
            </Typography.Text>
          )}
        </>
      )}

      <EvolutionEditModal
        entry={editing}
        onClose={() => setEditing(null)}
        onSaved={refreshAudits}
        messageApi={messageApi}
      />

      {openDocument && (
        <ClinicalPrintPreviewModal
          open
          onClose={() => setOpenDocument(null)}
          title={openDocument.title}
          renderDocument={(p) => (
            <ClinicalHistoryDocument
              kind={openDocument.kind}
              record={record}
              provider={p}
              usersById={usersById}
              printedAt={printedAt}
            />
          )}
        />
      )}

      <AdmissionRecordPrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        ready={!isLoading && !loadingUsers}
        fileName={`HC_Admision_${admission.id}_${patient.documentoPaciente}`}
        progress={
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 12 }}>Preparando la historia clínica…</div>
          </div>
        }
        notice={
          failedStages.length > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message={`No se pudo cargar toda la información de: ${failedStages.map((s) => STAGE_TITLES[s]).join(", ")}.`}
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
