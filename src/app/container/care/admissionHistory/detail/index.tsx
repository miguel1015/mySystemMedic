"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { Alert, Badge, Button, Descriptions, Empty, Progress, Spin, Tabs, Tag } from "antd"
import { ArrowLeftOutlined, FileSearchOutlined, PrinterOutlined } from "@ant-design/icons"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetInsuranceCompanyById } from "@/core/hooks/parameterization/insuranceCompany/useGetByIdInsuranceCompany"
import { useGetAdmissionRecordSummary } from "@/core/hooks/care/admissions/useAdmissionHistory"
import { useGetUsersByIds } from "@/core/hooks/users/useGetByIdUser"
import { useCities } from "@/core/hooks/utils/useCities"
import { useStates } from "@/core/hooks/utils/useStates"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import { formatDate, formatDateTime } from "@/core/utils/date"
import { calculateAge } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { ADMISSION_STATUS_COLOR } from "../admissionHistory.utils"
import { AdmissionRecordDocuments, recordSignerIds } from "./AdmissionRecordDocuments"
import AdmissionRecordPrintModal from "./AdmissionRecordPrintModal"
import { RECORD_STAGES, type RecordStageKey } from "./admissionRecord.stages"
import { useAdmissionRecord } from "./useAdmissionRecord"

interface Props {
  admissionId: number
}

// El expediente es de solo lectura y pide muchos módulos: usa su propia caché con un
// solo reintento (una consulta que falla no deja la pestaña cargando varios segundos)
// y sin recargar al volver a la ventana.
export default function AdmissionRecordContainer(props: Props) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <AdmissionRecordView {...props} />
    </QueryClientProvider>
  )
}

// Expediente de una admisión: todo su proceso, de triage a facturación. Cada pestaña
// carga sus datos al abrirla; la impresión carga las etapas que tienen registros.
function AdmissionRecordView({ admissionId }: Props) {
  const router = useRouter()
  const summaryQuery = useGetAdmissionRecordSummary(admissionId)
  const summary = summaryQuery.data

  const [activeStage, setActiveStage] = useState<RecordStageKey>("ingreso")
  const [visitedStages, setVisitedStages] = useState<RecordStageKey[]>(["ingreso"])
  const [printOpen, setPrintOpen] = useState(false)

  const stagesWithData = summary
    ? RECORD_STAGES.filter((s) => s.count(summary) > 0).map((s) => s.key)
    : []
  const enabledStages = printOpen
    ? stagesWithData
    : visitedStages.filter((s) => stagesWithData.includes(s))

  const record = useAdmissionRecord(admissionId, enabledStages)
  const { admission, patient } = record

  const { data: provider, isLoading: loadingProvider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const facturacionEnabled = enabledStages.includes("facturacion")
  const { data: insurance } = useGetInsuranceCompanyById(
    facturacionEnabled ? admission?.epsId ?? 0 : 0,
  )
  const { data: cities = [] } = useCities()
  const { data: states = [] } = useStates()
  const { usersById, isLoading: loadingUsers } = useGetUsersByIds(recordSignerIds(record))
  // Se fija al abrir para que la consulta y la impresión muestren la misma hora.
  const [printedAt] = useState(() => new Date())

  if (record.admissionError || summaryQuery.error) {
    return (
      <Container>
        <Alert type="error" showIcon message="No se encontró la admisión solicitada." />
      </Container>
    )
  }

  if (record.isLoadingAdmission || summaryQuery.isLoading || loadingProvider || !admission || !summary) {
    return (
      <Container>
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      </Container>
    )
  }

  const handleStageChange = (key: string) => {
    const stage = key as RecordStageKey
    setActiveStage(stage)
    setVisitedStages((prev) => (prev.includes(stage) ? prev : [...prev, stage]))
  }

  const renderDocuments = (stages: RecordStageKey[]) => (
    <AdmissionRecordDocuments
      record={record}
      stages={stages}
      provider={provider}
      insurance={insurance}
      usersById={usersById}
      cities={cities}
      states={states}
      printedAt={printedAt}
    />
  )

  const renderStage = (stage: RecordStageKey, description: string, count: number) => {
    if (count === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`Sin registros de ${description.toLowerCase()}`}
          style={{ padding: 40 }}
        />
      )
    }
    const status = record.stageStatus[stage]
    if (status.isLoading) {
      return (
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      )
    }
    return (
      <>
        {status.isError && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="Parte de la información de esta etapa no se pudo cargar. Se muestra lo disponible."
          />
        )}
        {/* En la página el documento crece con su contenido: el límite de alto y el
            scroll propio de hci-print-screen-wrap son para los modales. */}
        <div className="hci-print-screen-wrap" style={{ maxHeight: "none", overflowY: "visible" }}>
          {renderDocuments([stage])}
        </div>
      </>
    )
  }

  const pendingPrintStages = stagesWithData.filter((s) => record.stageStatus[s].isLoading)
  const failedPrintStages = RECORD_STAGES.filter(
    (s) => stagesWithData.includes(s.key) && record.stageStatus[s.key].isError,
  )
  const printReady = pendingPrintStages.length === 0 && !loadingUsers
  const loadedPrintStages = stagesWithData.length - pendingPrintStages.length

  const patientName = patient
    ? [patient.firstName, patient.middleName, patient.lastName, patient.secondLastName]
        .filter(Boolean)
        .join(" ")
    : admission.nombrePaciente

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileSearchOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>Admisión N° {admission.id}</Title>
          <Tag color={ADMISSION_STATUS_COLOR[summary.estado]}>
            {summary.estado}
            {summary.numeroFactura ? ` · ${summary.numeroFactura}` : ""}
          </Tag>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="primary" icon={<PrinterOutlined />} onClick={() => setPrintOpen(true)}>
            Imprimir / PDF
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/care/admissionHistory")}>
            Volver
          </Button>
        </div>
      </div>

      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2, lg: 3 }}
        style={{ marginBottom: 16 }}
        items={[
          { key: "paciente", label: "Paciente", children: patientName },
          {
            key: "documento",
            label: "Documento",
            children: `${admission.documentTypeCode} ${admission.documentoPatiente}`,
          },
          {
            key: "nacimiento",
            label: "Nacimiento",
            children: patient?.birthDate
              ? `${formatDate(patient.birthDate)} (${calculateAge(patient.birthDate)})`
              : "—",
          },
          { key: "sexo", label: "Sexo", children: patient?.sexName || "—" },
          { key: "fecha", label: "Fecha de admisión", children: formatDateTime(admission.admissionDate) },
          { key: "ambito", label: "Ámbito", children: admission.careScopeName },
          { key: "eps", label: "EPS", children: admission.epsNombre },
          { key: "convenio", label: "Convenio", children: admission.convenioNombre },
          { key: "triage", label: "Triage", children: admission.triagePrioridad },
        ]}
      />

      <Tabs
        activeKey={activeStage}
        onChange={handleStageChange}
        items={RECORD_STAGES.map((stage) => {
          const count = stage.count(summary)
          return {
            key: stage.key,
            label: (
              <span>
                {stage.title}{" "}
                <Badge
                  count={count}
                  showZero
                  color={count > 0 ? "var(--theme-primary, #0F6F5C)" : "#bfbfbf"}
                />
              </span>
            ),
            children: renderStage(stage.key, stage.description, count),
          }
        })}
      />

      <AdmissionRecordPrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        ready={printReady}
        fileName={`Expediente_Admision_${admission.id}_${admission.documentoPatiente}`}
        progress={
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <Progress
              type="circle"
              percent={Math.round((loadedPrintStages / Math.max(stagesWithData.length, 1)) * 100)}
            />
            <div style={{ marginTop: 12 }}>
              Cargando expediente: {loadedPrintStages} de {stagesWithData.length} etapas
            </div>
          </div>
        }
        notice={
          failedPrintStages.length > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message={`No se pudo cargar toda la información de: ${failedPrintStages
                .map((s) => s.title)
                .join(", ")}.`}
            />
          )
        }
      >
        {renderDocuments(stagesWithData)}
      </AdmissionRecordPrintModal>
    </Container>
  )
}
