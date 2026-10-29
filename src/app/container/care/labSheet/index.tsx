"use client"

import { Container } from "@/components/container"
import Modal from "@/components/modal"
import Title from "@/components/title"
import { ENDPOINTS } from "@/core/api/endpoints"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import {
  descargarExcelLaboratorio,
  useCreateResultadoLaboratorio,
  useDeleteResultadoLaboratorio,
  useGetCatalogoLaboratorio,
  useGetResultadosLaboratorioByAdmission,
  useImportarExcelLaboratorio,
  useUpdateResultadoLaboratorio,
} from "@/core/hooks/care/laboratorio/useResultadosLaboratorio"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useCurrentDoctor } from "@/core/hooks/users/useCurrentDoctor"
import type {
  AnalitoCatalogo,
  ImportacionLaboratorioResponse,
  ResultadoLaboratorioResponse,
} from "@/core/interfaces/care/laboratorio"
import { formatDateTime } from "@/core/utils/date"
import {
  ArrowLeftOutlined,
  CalculatorOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileExcelOutlined,
  HistoryOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Badge,
  Button,
  DatePicker,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import dayjs, { type Dayjs } from "dayjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import ClinicalPrintPreviewModal from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import { buildPrintPatient } from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { calculateAgeLabel } from "../xray/xray.utils"
import { LabResultPrintDocument } from "./LabResultPrintDocument"
import {
  INDEX_KEYS,
  INDEX_SOURCES,
  STATUS_COLOR,
  STATUS_LABEL,
  absoluteCount,
  computeIndices,
  consistencyWarnings,
  criticalValues,
  formatNumber,
  fromResultRequests,
  labStatus,
  toResultRequests,
  type LabValues,
} from "./labResults.utils"
import "./labSheet.css"

const { TextArea } = Input

const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm"

interface LabFormValues {
  codigoEstudio?: string
  profesionalId?: number
  fechaToma: Dayjs | null
  observaciones?: string
  resultados: LabValues
}

const emptyFormValues = (codigoEstudio?: string, profesionalId?: number): LabFormValues => ({
  codigoEstudio,
  profesionalId,
  fechaToma: dayjs(),
  observaciones: "",
  resultados: {},
})

const errorText = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback

const renderResultInput = (analito: AnalitoCatalogo) =>
  analito.tipo === "opcion" ? (
    <Select
      allowClear
      placeholder="Seleccione"
      style={{ width: "100%" }}
      options={analito.opciones.map((o) => ({ value: o, label: o }))}
    />
  ) : (
    <InputNumber
      min={analito.minimoPosible ?? undefined}
      max={analito.maximoPosible ?? undefined}
      style={{ width: "100%" }}
      placeholder="—"
    />
  )

const LabSheetContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<LabFormValues>()

  const admissionId = searchParams.get("admissionId") || undefined

  const {
    data: admission,
    isLoading: loadingAdmission,
    isError: admissionError,
  } = useGetAdmissionById(admissionId)
  const patientId =
    (admission?.patientId ? String(admission.patientId) : null) ||
    searchParams.get("patientId")
  const { data: patientRecord, isLoading: loadingPatient } = useGetPatientById(patientId)
  const { doctorOptions, defaultDoctorId } = useCurrentDoctor()

  const {
    data: catalogo = [],
    isLoading: loadingCatalogo,
    isError: catalogoError,
  } = useGetCatalogoLaboratorio(admissionId)
  const { data: records = [], isLoading: loadingRecords } =
    useGetResultadosLaboratorioByAdmission(admissionId)

  const createMutation = useCreateResultadoLaboratorio()
  const updateMutation = useUpdateResultadoLaboratorio()
  const deleteMutation = useDeleteResultadoLaboratorio()
  const importMutation = useImportarExcelLaboratorio()

  const [editing, setEditing] = useState<ResultadoLaboratorioResponse | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [printRecord, setPrintRecord] = useState<ResultadoLaboratorioResponse | null>(null)
  const [importPreview, setImportPreview] = useState<ImportacionLaboratorioResponse | null>(null)
  // Archivo del que se cargaron los resultados que están en el formulario.
  const [importedFile, setImportedFile] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  // Índices que el usuario corrigió a mano: ya no se recalculan solos.
  const manualIndices = useRef(new Set<string>())

  const isSaving = createMutation.isPending || updateMutation.isPending

  const codigoEstudio = Form.useWatch("codigoEstudio", form)
  const watchedResults = Form.useWatch("resultados", form)
  const resultados = useMemo<LabValues>(() => watchedResults ?? {}, [watchedResults])
  const estudio = catalogo.find((e) => e.codigo === codigoEstudio)

  // Con un solo estudio en el catálogo se selecciona de una vez.
  useEffect(() => {
    if (catalogo.length === 1 && !form.getFieldValue("codigoEstudio")) {
      form.setFieldValue("codigoEstudio", catalogo[0].codigo)
    }
  }, [catalogo, form])

  // El usuario actual queda como profesional responsable mientras no se elija otro.
  useEffect(() => {
    if (defaultDoctorId !== undefined && !form.getFieldValue("profesionalId")) {
      form.setFieldValue("profesionalId", defaultDoctorId)
    }
  }, [defaultDoctorId, form])

  const studyOptions = catalogo.map((e) => ({ value: e.codigo, label: `${e.codigo} - ${e.nombre}` }))

  // Al editar, el profesional del registro se conserva aunque ya no esté en la lista.
  const professionalOptions = useMemo(() => {
    const options = doctorOptions.map((d) => ({ value: d.value, label: d.label }))
    if (editing && !options.some((o) => o.value === editing.userId)) {
      options.unshift({ value: editing.userId, label: editing.nombreProfesional })
    }
    return options
  }, [doctorOptions, editing])

  const warnings = useMemo(() => consistencyWarnings(resultados), [resultados])
  const criticals = useMemo(() => criticalValues(estudio, resultados), [estudio, resultados])

  /* ─────────────── Paciente ─────────────── */

  const printPatient = useMemo(() => {
    const built = buildPrintPatient(admission, patientRecord)
    return {
      ...built,
      name: built.name || searchParams.get("patientName") || "",
      documentNumber: built.documentNumber || searchParams.get("documentNumber") || "",
      careScope: built.careScope || searchParams.get("careScope") || "",
      birthDate: built.birthDate?.slice(0, 10) ?? "",
    }
  }, [admission, patientRecord, searchParams])

  const admissionDate = admission?.admissionDate || searchParams.get("admissionDate") || ""

  /* ─────────────── Índices eritrocitarios ─────────────── */

  const applyIndices = (values: LabValues) => {
    const computed = computeIndices(values)
    INDEX_KEYS.forEach((key) => {
      if (!manualIndices.current.has(key)) form.setFieldValue(["resultados", key], computed[key])
    })
  }

  const handleValuesChange = (changed: Partial<LabFormValues>, all: LabFormValues) => {
    const changedKeys = Object.keys(changed.resultados ?? {})
    changedKeys
      .filter((key) => (INDEX_KEYS as readonly string[]).includes(key))
      .forEach((key) => manualIndices.current.add(key))
    if (changedKeys.some((key) => INDEX_SOURCES.includes(key))) applyIndices(all.resultados ?? {})
  }

  const recalculateIndices = () => {
    manualIndices.current.clear()
    applyIndices(form.getFieldValue("resultados") ?? {})
  }

  // Al cargar valores de un registro o un Excel, los índices que traen un valor distinto
  // al calculado se respetan como corregidos a mano.
  const loadValues = (values: LabValues) => {
    const computed = computeIndices(values)
    manualIndices.current = new Set(
      INDEX_KEYS.filter((key) => {
        const value = values[key]
        return value !== null && value !== undefined && Number(value) !== computed[key]
      }),
    )
    form.setFieldValue("resultados", values)
    applyIndices(values)
  }

  /* ─────────────── Acciones ─────────────── */

  const resetForm = () => {
    setEditing(null)
    setImportedFile(null)
    manualIndices.current.clear()
    form.resetFields()
    form.setFieldsValue(
      emptyFormValues(catalogo.length === 1 ? catalogo[0].codigo : undefined, defaultDoctorId),
    )
  }

  const loadForEdit = (record: ResultadoLaboratorioResponse) => {
    setEditing(record)
    setImportedFile(null)
    form.resetFields()
    form.setFieldsValue({
      codigoEstudio: record.codigoEstudio,
      profesionalId: record.userId,
      fechaToma: dayjs(record.fechaToma),
      observaciones: record.observaciones,
    })
    loadValues(fromResultRequests(record.resultados))
    setHistoryOpen(false)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const persist = async (): Promise<ResultadoLaboratorioResponse | null> => {
    if (isSaving || !admissionId) return null

    let values: LabFormValues
    try {
      values = await form.validateFields()
    } catch {
      messageApi.error("Complete los campos obligatorios del resultado de laboratorio.")
      return null
    }

    const study = catalogo.find((e) => e.codigo === values.codigoEstudio)
    if (!study) {
      messageApi.error("Seleccione el estudio de laboratorio.")
      return null
    }

    const items = toResultRequests(study, values.resultados ?? {})
    if (items.length === 0) {
      messageApi.error("Registre al menos un resultado.")
      return null
    }

    const data = {
      profesionalId: values.profesionalId!,
      fechaToma: (values.fechaToma ?? dayjs()).toISOString(),
      resultados: items,
      observaciones: values.observaciones?.trim() ?? "",
      // Un registro existente conserva su origen salvo que se le cargue un Excel nuevo.
      ...(importedFile
        ? { origen: "EXCEL" as const, archivoOrigen: importedFile }
        : editing
          ? {}
          : { origen: "MANUAL" as const }),
    }

    try {
      const saved = editing
        ? await updateMutation.mutateAsync({ id: editing.id, data })
        : await createMutation.mutateAsync({
            ...data,
            admissionId: Number(admissionId),
            codigoEstudio: study.codigo,
          })
      // Se continúa sobre el registro guardado para que guardar de nuevo lo actualice.
      setEditing(saved)
      setImportedFile(null)
      messageApi.success(
        editing ? "Resultado de laboratorio actualizado." : "Resultado de laboratorio guardado.",
      )
      return saved
    } catch (e) {
      messageApi.error(errorText(e, "No se pudo guardar el resultado de laboratorio."))
      return null
    }
  }

  const handlePrint = async () => {
    const saved = await persist()
    if (saved) setPrintRecord(saved)
  }

  const handleDelete = async (record: ResultadoLaboratorioResponse) => {
    try {
      await deleteMutation.mutateAsync({ id: record.id, admissionId: record.admissionId })
      if (editing?.id === record.id) resetForm()
      messageApi.success("Resultado de laboratorio eliminado.")
    } catch (e) {
      messageApi.error(errorText(e, "No se pudo eliminar el resultado de laboratorio."))
    }
  }

  /* ─────────────── Excel ─────────────── */

  const download = async (endpoint: string) => {
    setDownloading(true)
    try {
      await descargarExcelLaboratorio(endpoint, "Resultado_Laboratorio.xlsx")
    } catch (e) {
      messageApi.error(errorText(e, "No se pudo descargar el Excel."))
    } finally {
      setDownloading(false)
    }
  }

  const downloadTemplate = () => {
    const codigo = codigoEstudio ?? catalogo[0]?.codigo
    if (!admissionId || !codigo) return
    download(ENDPOINTS.RESULTADOS_LABORATORIO.PLANTILLA(admissionId, codigo, INSTITUTION_PROVIDER_ID))
  }

  const downloadRecord = (record: ResultadoLaboratorioResponse) =>
    download(ENDPOINTS.RESULTADOS_LABORATORIO.EXCEL(record.id, INSTITUTION_PROVIDER_ID))

  const handleImport = async (file: File) => {
    if (!admissionId) return
    try {
      const preview = await importMutation.mutateAsync({ admissionId, archivo: file })
      setImportPreview(preview)
    } catch (e) {
      messageApi.error(errorText(e, "No se pudo leer el archivo de Excel."))
    }
  }

  const applyImport = () => {
    if (!importPreview) return
    form.setFieldValue("codigoEstudio", importPreview.codigoEstudio)
    if (importPreview.fechaToma) form.setFieldValue("fechaToma", dayjs(importPreview.fechaToma))
    if (importPreview.observaciones) form.setFieldValue("observaciones", importPreview.observaciones)
    loadValues(fromResultRequests(importPreview.resultados))
    setImportedFile(importPreview.archivo)
    setImportPreview(null)
    messageApi.info("Resultados cargados en el formulario. Revíselos y guarde para registrarlos.")
  }

  const previewStudy = catalogo.find((e) => e.codigo === importPreview?.codigoEstudio)

  /* ─────────────── Registros anteriores ─────────────── */

  const columns: ColumnsType<ResultadoLaboratorioResponse> = [
    {
      title: "Fecha de toma",
      dataIndex: "fechaToma",
      key: "fechaToma",
      width: 140,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Estudio",
      key: "estudio",
      render: (_, record) => `${record.codigoEstudio} - ${record.nombreEstudio}`,
    },
    {
      title: "Origen",
      dataIndex: "origen",
      key: "origen",
      width: 100,
      render: (value: string, record) =>
        value === "EXCEL" ? (
          <Tooltip title={record.archivoOrigen}>
            <Tag color="green" icon={<FileExcelOutlined />}>
              Excel
            </Tag>
          </Tooltip>
        ) : (
          <Tag>Manual</Tag>
        ),
    },
    {
      title: "Profesional",
      dataIndex: "nombreProfesional",
      key: "nombreProfesional",
      width: 180,
      render: (value: string, record) =>
        record.nombreRegistradoPor && record.registradoPorId !== record.userId ? (
          <Tooltip title={`Registrado por ${record.nombreRegistradoPor}`}>{value}</Tooltip>
        ) : (
          value
        ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 170,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          <Tooltip title="Imprimir">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => {
                setHistoryOpen(false)
                setPrintRecord(record)
              }}
            />
          </Tooltip>
          <Tooltip title="Descargar Excel">
            <Button
              type="text"
              icon={<FileExcelOutlined />}
              disabled={downloading}
              onClick={() => downloadRecord(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={() => loadForEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar este resultado?"
            description="El resultado dejará de aparecer en los registros anteriores del paciente."
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            zIndex={1100}
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title="Eliminar">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ]

  /* ─────────────── Render ─────────────── */

  const header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ExperimentOutlined style={{ fontSize: 22, color: "#08979c" }} />
        <Title level={3}>Laboratorios</Title>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {admissionId && (
          <Badge count={records.length} size="small" color="#08979c">
            <Button
              icon={<HistoryOutlined />}
              loading={loadingRecords}
              onClick={() => setHistoryOpen(true)}
            >
              Registros anteriores
            </Button>
          </Badge>
        )}
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    </div>
  )

  if (!admissionId) {
    return (
      <Container>
        {header}
        <Empty description="Selecciona un paciente desde Evolucionar HC para registrar un estudio de laboratorio.">
          <Button type="primary" onClick={() => router.push("/care/evolveClinicalHistory")}>
            Ir a Evolucionar HC
          </Button>
        </Empty>
      </Container>
    )
  }

  const patientItems = [
    { label: "Paciente", value: printPatient.name },
    {
      label: "Identificación",
      value: [printPatient.documentType, printPatient.documentNumber].filter(Boolean).join(" "),
    },
    { label: "Edad", value: calculateAgeLabel(printPatient.birthDate) },
    { label: "Sexo", value: printPatient.sex },
    { label: "N° Admisión / Historia clínica", value: admissionId },
    { label: "Fecha de admisión", value: formatDateTime(admissionDate, "") },
    { label: "Ámbito de atención", value: printPatient.careScope },
    { label: "Aseguradora", value: printPatient.insurer },
  ]

  const renderAnalitoRow = (analito: AnalitoCatalogo) => {
    const value = resultados[analito.clave]
    const status = analito.tipo === "numero" ? labStatus(analito, value) : null
    const absolute = absoluteCount(resultados, analito.clave)

    return (
      <tr key={analito.clave}>
        <td className="lab-results-name">
          {analito.nombre}
          {analito.calculado && (
            <Tooltip title="Se calcula con glóbulos rojos, hemoglobina y hematocrito. Puede corregirlo si el equipo reporta otro valor.">
              <Tag className="lab-results-calc">calculado</Tag>
            </Tooltip>
          )}
        </td>
        <td className="lab-results-input">
          <Form.Item name={["resultados", analito.clave]} noStyle>
            {renderResultInput(analito)}
          </Form.Item>
        </td>
        <td>{analito.unidad || "—"}</td>
        <td>{analito.referencia || "—"}</td>
        <td>
          {status && <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>}
          {absolute !== null && (
            <span className="lab-results-absolute">≈ {formatNumber(absolute, 0)} /mm³</span>
          )}
        </td>
      </tr>
    )
  }

  const excelMenu = {
    items: [
      { key: "plantilla", icon: <DownloadOutlined />, label: "Plantilla en blanco" },
      {
        key: "resultado",
        icon: <FileExcelOutlined />,
        label: "Resultado guardado",
        disabled: !editing,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "resultado" && editing) downloadRecord(editing)
      else downloadTemplate()
    },
  }

  return (
    <Container>
      {contextHolder}
      {header}

      {/* ════ Información del paciente ════ */}
      <div className="lab-card">
        <div className="lab-card-title">
          <UserOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
          Información del paciente
        </div>
        {admissionError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            title="No se pudo cargar la admisión del paciente. Verifique la conexión e intente de nuevo."
          />
        )}
        {loadingAdmission || (loadingPatient && !patientRecord) ? (
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
        ) : (
          <div className="lab-patient-grid">
            {patientItems.map((item) => (
              <div key={item.label}>
                <span className="lab-patient-label">{item.label}</span>
                <span className="lab-patient-value">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ Registro del estudio ════ */}
      <div className="lab-card">
        <div className="lab-card-title" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExperimentOutlined style={{ color: "#08979c" }} />
            {editing ? `Editando: ${editing.nombreEstudio}` : "Nuevo resultado de laboratorio"}
          </span>
          {editing && (
            <Button size="small" icon={<PlusOutlined />} onClick={resetForm}>
              Nuevo resultado
            </Button>
          )}
        </div>

        {catalogoError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            title="No se pudo cargar el catálogo de laboratorio. Verifique la conexión e intente de nuevo."
          />
        )}

        <Form<LabFormValues>
          form={form}
          layout="vertical"
          initialValues={emptyFormValues()}
          requiredMark
          disabled={isSaving}
          onValuesChange={handleValuesChange}
        >
          <div className="lab-grid">
            <Form.Item
              label="Estudio de laboratorio"
              name="codigoEstudio"
              rules={[{ required: true, message: "Seleccione el estudio de laboratorio." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione el estudio"
                loading={loadingCatalogo}
                options={studyOptions}
                disabled={!!editing}
              />
            </Form.Item>

            <Form.Item
              label="Fecha y hora de toma"
              name="fechaToma"
              rules={[{ required: true, message: "La fecha de toma es obligatoria." }]}
            >
              <DatePicker
                showTime
                format={DATE_TIME_FORMAT}
                style={{ width: "100%" }}
                disabledDate={(current) => current && current.isAfter(dayjs(), "day")}
              />
            </Form.Item>

            <Form.Item
              label="Profesional responsable"
              name="profesionalId"
              tooltip="Quien firma el resultado impreso"
              rules={[{ required: true, message: "Seleccione el profesional responsable." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione el profesional"
                options={professionalOptions}
                notFoundContent="Sin profesionales"
              />
            </Form.Item>
          </div>

          {estudio ? (
            <>
              <div className="lab-results-toolbar">
                <div className="lab-fields-title" style={{ margin: 0, border: "none" }}>
                  Resultados — {estudio.nombre}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Dropdown menu={excelMenu} trigger={["click"]} disabled={downloading}>
                    <Button icon={<DownloadOutlined />} loading={downloading}>
                      Descargar Excel <DownOutlined />
                    </Button>
                  </Dropdown>
                  <Upload
                    accept=".xlsx"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImport(file)
                      return false
                    }}
                  >
                    <Button icon={<UploadOutlined />} loading={importMutation.isPending}>
                      Subir Excel
                    </Button>
                  </Upload>
                  <Tooltip title="Vuelve a calcular HCM, CHCM y VCM con los valores medidos">
                    <Button icon={<CalculatorOutlined />} onClick={recalculateIndices}>
                      Recalcular índices
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {importedFile && (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                  title={`Resultados cargados desde "${importedFile}". Revíselos y guarde para registrarlos.`}
                />
              )}
              {!estudio.sexo && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 12 }}
                  title="El paciente no tiene sexo registrado: se muestran los rangos de mujer (M) y hombre (H) y no se marca bajo/alto en los analitos que dependen del sexo."
                />
              )}
              {criticals.length > 0 && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginBottom: 12 }}
                  title="Valores críticos: notifique de inmediato al médico tratante."
                  description={criticals.join(" · ")}
                />
              )}
              {warnings.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 12 }}
                  title="Revise posibles errores de digitación"
                  description={
                    <ul className="lab-warning-list">
                      {warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  }
                />
              )}

              <div className="lab-results-scroll">
                <table className="lab-results-table">
                  <thead>
                    <tr>
                      <th style={{ width: "28%" }}>Analito</th>
                      <th style={{ width: "18%" }}>Resultado</th>
                      <th style={{ width: "13%" }}>Unidad</th>
                      <th style={{ width: "21%" }}>
                        Valores de referencia{estudio.sexo ? ` (${estudio.sexo.toLowerCase()})` : ""}
                      </th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudio.secciones.map((seccion) => (
                      <SectionRows key={seccion} title={seccion}>
                        {estudio.analitos.filter((a) => a.seccion === seccion).map(renderAnalitoRow)}
                      </SectionRows>
                    ))}
                  </tbody>
                </table>
              </div>

              <Form.Item label="Observaciones" name="observaciones" style={{ marginTop: 16 }}>
                <TextArea
                  rows={3}
                  maxLength={4000}
                  placeholder="Morfología, calidad de la muestra, equipo utilizado..."
                />
              </Form.Item>
            </>
          ) : loadingCatalogo ? (
            <Skeleton active paragraph={{ rows: 6 }} title={false} />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Seleccione un estudio de laboratorio para diligenciar sus resultados."
              style={{ margin: "8px 0 20px" }}
            />
          )}
        </Form>

        <div className="lab-actions">
          <Button onClick={resetForm} disabled={isSaving}>
            Limpiar formulario
          </Button>
          <Button icon={<SaveOutlined />} loading={isSaving} disabled={!estudio} onClick={() => persist()}>
            {editing ? "Actualizar" : "Guardar"}
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            loading={isSaving}
            disabled={!estudio}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
        </div>
      </div>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Registros anteriores"
        size="lg"
      >
        <Table<ResultadoLaboratorioResponse>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={records}
          loading={loadingRecords}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          scroll={{ x: 760 }}
          locale={{ emptyText: "Aún no hay resultados de laboratorio registrados para este paciente." }}
        />
      </Modal>

      <Modal
        open={importPreview !== null}
        onClose={() => setImportPreview(null)}
        title={`Vista previa: ${importPreview?.archivo ?? ""}`}
        size="lg"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setImportPreview(null)}>Cancelar</Button>
            <Button
              type="primary"
              disabled={!importPreview?.resultados.length}
              onClick={applyImport}
            >
              Cargar en el formulario
            </Button>
          </div>
        }
      >
        {importPreview && (
          <>
            {importPreview.advertencias.length > 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                title="Advertencias de la importación"
                description={
                  <ul className="lab-warning-list">
                    {importPreview.advertencias.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                }
              />
            )}
            <p style={{ marginBottom: 8 }}>
              Se reconocieron <strong>{importPreview.resultados.length}</strong> resultado(s)
              {importPreview.fechaToma
                ? ` · fecha de toma ${dayjs(importPreview.fechaToma).format(DATE_TIME_FORMAT)}`
                : ""}
              . Al cargarlos se reemplazan los resultados que haya en el formulario; nada se guarda
              hasta que pulse Guardar.
            </p>
            <Table
              rowKey="clave"
              size="small"
              pagination={false}
              scroll={{ y: 320 }}
              dataSource={importPreview.resultados}
              columns={[
                {
                  title: "Analito",
                  key: "analito",
                  render: (_, r) =>
                    previewStudy?.analitos.find((a) => a.clave === r.clave)?.nombre ?? r.clave,
                },
                {
                  title: "Resultado",
                  key: "valor",
                  render: (_, r) => {
                    const analito = previewStudy?.analitos.find((a) => a.clave === r.clave)
                    if (r.texto) return r.texto
                    if (r.valor === null || r.valor === undefined) return "—"
                    return `${formatNumber(r.valor, analito?.decimales)}${analito?.unidad ? ` ${analito.unidad}` : ""}`
                  },
                },
                {
                  title: "Estado",
                  key: "estado",
                  render: (_, r) => {
                    const analito = previewStudy?.analitos.find((a) => a.clave === r.clave)
                    const status = analito && analito.tipo === "numero" ? labStatus(analito, r.valor) : null
                    return status ? <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag> : null
                  },
                },
              ]}
            />
          </>
        )}
      </Modal>

      <ClinicalPrintPreviewModal
        open={printRecord !== null}
        onClose={() => setPrintRecord(null)}
        title="Resultado de laboratorio"
        renderDocument={(provider) =>
          printRecord ? (
            <LabResultPrintDocument
              provider={provider}
              patient={printPatient}
              admissionId={admissionId}
              admissionDate={admissionDate}
              contractName={admission?.convenioNombre || patientRecord?.contractName || ""}
              record={printRecord}
              study={catalogo.find((e) => e.codigo === printRecord.codigoEstudio)}
            />
          ) : null
        }
      />
    </Container>
  )
}

const SectionRows = ({ title, children }: { title: string; children: ReactNode }) => (
  <>
    <tr className="lab-results-section">
      <td colSpan={5}>{title}</td>
    </tr>
    {children}
  </>
)

export default LabSheetContainer
