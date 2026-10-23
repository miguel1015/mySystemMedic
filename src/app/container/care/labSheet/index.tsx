"use client"

import { Container } from "@/components/container"
import Modal from "@/components/modal"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useCurrentDoctor } from "@/core/hooks/users/useCurrentDoctor"
import { formatDateTime } from "@/core/utils/date"
import { buildFullName } from "@/core/utils/user"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Badge,
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Skeleton,
  Table,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import dayjs, { type Dayjs } from "dayjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import ClinicalPrintPreviewModal from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import { buildPrintPatient } from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { calculateAgeLabel } from "../xray/xray.utils"
import { LabResultPrintDocument } from "./LabResultPrintDocument"
import { LAB_STUDIES, findLabStudy, formatReference, type LabField } from "./labStudies"
import type { LabRecord, LabResultValue } from "./types"
import "./labSheet.css"

const { TextArea } = Input

const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm"

interface LabFormValues {
  professionalId?: number
  studyId?: number
  fechaToma: Dayjs | null
  resultados: Record<string, LabResultValue>
}

const emptyFormValues = (): LabFormValues => ({
  professionalId: undefined,
  studyId: undefined,
  fechaToma: dayjs(),
  resultados: {},
})

const renderFieldInput = (field: LabField) => {
  switch (field.type) {
    case "number":
      return (
        <InputNumber
          min={field.min}
          max={field.max}
          suffix={field.unit}
          style={{ width: "100%" }}
          placeholder="0"
        />
      )
    case "select":
      return (
        <Select
          allowClear
          placeholder="Seleccione"
          options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
        />
      )
    case "textarea":
      return <TextArea rows={3} maxLength={4000} placeholder={field.placeholder} />
    default:
      return <Input maxLength={200} placeholder={field.placeholder} />
  }
}

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
  const { users } = useCurrentDoctor()

  // Vista de demostración: los registros viven en memoria hasta que exista el
  // backend de laboratorios.
  const [records, setRecords] = useState<LabRecord[]>([])
  const [editing, setEditing] = useState<LabRecord | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [printRecord, setPrintRecord] = useState<LabRecord | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const selectedStudyId = Form.useWatch("studyId", form)
  const selectedStudy = findLabStudy(selectedStudyId)

  const professionalOptions = useMemo(
    () =>
      users
        .filter((u) => u.isActive)
        .map((u) => ({
          value: u.id,
          label: [buildFullName(u), u.userProfileName].filter(Boolean).join(" — "),
        })),
    [users],
  )

  const studyOptions = LAB_STUDIES.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))

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

  /* ─────────────── Acciones ─────────────── */

  const resetForm = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue(emptyFormValues())
  }

  // Al cambiar de estudio se descartan los resultados del anterior.
  const handleStudyChange = () => {
    form.setFieldValue("resultados", {})
  }

  const loadForEdit = (record: LabRecord) => {
    setEditing(record)
    form.resetFields()
    form.setFieldsValue({
      professionalId: record.professionalId,
      studyId: record.studyId,
      fechaToma: dayjs(record.fechaToma),
      resultados: { ...record.resultados },
    })
    setHistoryOpen(false)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const persist = async (): Promise<LabRecord | null> => {
    if (isSaving) return null

    let values: LabFormValues
    try {
      values = await form.validateFields()
    } catch {
      messageApi.error("Complete los campos obligatorios del estudio de laboratorio.")
      return null
    }

    const study = findLabStudy(values.studyId)
    const professional = users.find((u) => u.id === values.professionalId)
    if (!study || !professional) {
      messageApi.error("Seleccione el personal de salud y el estudio de laboratorio.")
      return null
    }

    setIsSaving(true)
    try {
      const now = new Date().toISOString()
      // Solo se guardan los campos del estudio seleccionado.
      const resultados = Object.fromEntries(
        study.fields.map((f) => [f.key, values.resultados?.[f.key] ?? null]),
      )

      const saved: LabRecord = {
        id: editing?.id ?? Date.now(),
        studyId: study.id,
        studyCode: study.code,
        studyName: study.name,
        professionalId: professional.id,
        professionalName: buildFullName(professional),
        professionalProfile: professional.userProfileName,
        professionalLicense: professional.licenseCard,
        professionalSignature: professional.signature,
        fechaToma: values.fechaToma?.toISOString() ?? now,
        resultados,
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      }

      setRecords((prev) =>
        editing ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev],
      )
      // Se continúa sobre el registro guardado para que guardar de nuevo lo
      // actualice en lugar de duplicarlo.
      setEditing(saved)
      messageApi.success(
        editing ? "Registro de laboratorio actualizado." : "Registro de laboratorio guardado.",
      )
      return saved
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = async () => {
    const saved = await persist()
    if (saved) setPrintRecord(saved)
  }

  const handleDelete = (record: LabRecord) => {
    setRecords((prev) => prev.filter((r) => r.id !== record.id))
    if (editing?.id === record.id) resetForm()
    messageApi.success("Registro de laboratorio eliminado.")
  }

  /* ─────────────── Registros anteriores ─────────────── */

  const columns: ColumnsType<LabRecord> = [
    {
      title: "Fecha",
      dataIndex: "fechaToma",
      key: "fechaToma",
      width: 140,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Estudio",
      key: "estudio",
      render: (_, record) => `${record.studyCode} - ${record.studyName}`,
    },
    {
      title: "Personal de salud",
      dataIndex: "professionalName",
      key: "professionalName",
      width: 200,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 130,
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
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={() => loadForEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar este registro?"
            description="El registro dejará de aparecer en los registros anteriores del paciente."
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
            <Button icon={<HistoryOutlined />} onClick={() => setHistoryOpen(true)}>
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

  return (
    <Container>
      {contextHolder}
      {header}

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="Vista de demostración: el catálogo de estudios es de ejemplo y los registros se conservan solo mientras la página esté abierta."
      />

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
            {editing ? `Editando: ${editing.studyName}` : "Nuevo estudio de laboratorio"}
          </span>
          {editing && (
            <Button size="small" icon={<PlusOutlined />} onClick={resetForm}>
              Nuevo estudio
            </Button>
          )}
        </div>

        <Form<LabFormValues>
          form={form}
          layout="vertical"
          initialValues={emptyFormValues()}
          requiredMark
          disabled={isSaving}
        >
          <div className="lab-grid">
            <Form.Item
              label="Personal de salud"
              name="professionalId"
              rules={[{ required: true, message: "Seleccione el personal de salud responsable." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione el profesional"
                options={professionalOptions}
              />
            </Form.Item>

            <Form.Item
              label="Estudio de laboratorio"
              name="studyId"
              rules={[{ required: true, message: "Seleccione el estudio de laboratorio." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione el estudio"
                options={studyOptions}
                onChange={handleStudyChange}
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
          </div>

          {selectedStudy ? (
            <>
              <div className="lab-fields-title">Resultados — {selectedStudy.name}</div>
              <div className="lab-grid">
                {selectedStudy.fields.map((field) => (
                  <Form.Item
                    key={`${selectedStudy.id}-${field.key}`}
                    className={field.type === "textarea" ? "lab-field-full" : undefined}
                    label={field.label}
                    name={["resultados", field.key]}
                    extra={field.reference ? `Referencia: ${formatReference(field)}` : undefined}
                    rules={
                      field.required
                        ? [{ required: true, message: `Ingrese ${field.label.toLowerCase()}.` }]
                        : undefined
                    }
                  >
                    {renderFieldInput(field)}
                  </Form.Item>
                ))}
              </div>
            </>
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
          <Button icon={<SaveOutlined />} loading={isSaving} onClick={() => persist()}>
            {editing ? "Actualizar" : "Guardar"}
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            loading={isSaving}
            disabled={!selectedStudy}
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
        <Table<LabRecord>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
          scroll={{ x: 640 }}
          locale={{ emptyText: "Aún no hay estudios de laboratorio registrados para este paciente." }}
        />
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
            />
          ) : null
        }
      />
    </Container>
  )
}

export default LabSheetContainer
