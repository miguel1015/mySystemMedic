"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetAnesthesiaTypes } from "@/core/hooks/care/anesthesiaTypes/useGetAnesthesiaTypes"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import {
  useCreateRecordAnestesia,
  useDeleteRecordAnestesia,
  useGetRecordsAnestesiaByAdmission,
  useUpdateRecordAnestesia,
} from "@/core/hooks/care/recordAnestesia/useRecordsAnestesia"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useCurrentDoctor } from "@/core/hooks/users/useCurrentDoctor"
import {
  ACTOS_ANESTESICOS,
  ASA_OPCIONES,
  ESTADOS_RECORD_ANESTESIA,
  TIPOS_CIRUGIA_SUGERIDOS,
  type ActoAnestesico,
  type AsaOpcion,
  type EstadoRecordAnestesia,
  type RecordAnestesiaDiagnostico,
  type RecordAnestesiaResponse,
  type RecordAnestesiaUpdateRequest,
} from "@/core/interfaces/care/recordAnestesia"
import { formatDateTime } from "@/core/utils/date"
import { buildFullName } from "@/core/utils/user"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HeartOutlined,
  HistoryOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  AutoComplete,
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import dayjs, { type Dayjs } from "dayjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ClinicalPrintPreviewModal from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import {
  INSTITUTION_PROVIDER_ID,
  buildPrintPatient,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { calculateAgeLabel } from "../xray/xray.utils"
import { AnesthesiaRecordPrintDocument } from "./AnesthesiaRecordPrintDocument"
import { Cie10CodeSelect } from "./Cie10CodeSelect"
import {
  ACTO_ANESTESICO_LABELS,
  ESTADO_COLORS,
  QX_TEAM_PROFILES,
  formatDiagnostico,
} from "./anesthesiaRecord.utils"
import "./anesthesiaRecord.css"

const { TextArea } = Input

const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm"

type Diagnostico = RecordAnestesiaDiagnostico | null

interface AnesthesiaFormValues {
  estado: EstadoRecordAnestesia
  fechaInicio: Dayjs | null
  fechaTerminacion: Dayjs | null
  fechaRealizacion: Dayjs | null
  cirujanoId?: number
  responsableId?: number
  idx1Ingreso: Diagnostico
  idx2Ingreso: Diagnostico
  idx3Ingreso: Diagnostico
  idx1Egreso: Diagnostico
  idx2Egreso: Diagnostico
  idx3Egreso: Diagnostico
  dxLibre?: string
  tipoAnestesiaId?: number
  asa?: AsaOpcion
  tipoCirugia?: string
  procedimientoARealizar?: string
  procedimientoRealizado?: string
  posicionPaciente?: string
  monitoreoEcg?: string
  observaciones?: string
  condicionesIngreso?: string
  observacion?: string
  actoAnestesico?: ActoAnestesico
  drogasAnestesicas?: string
  liquidos?: string
}

const DIAGNOSTICO_FIELDS = [
  { ingreso: "idx1Ingreso", egreso: "idx1Egreso", label: "IDX1" },
  { ingreso: "idx2Ingreso", egreso: "idx2Egreso", label: "IDX2" },
  { ingreso: "idx3Ingreso", egreso: "idx3Egreso", label: "IDX3" },
] as const

const emptyFormValues = (): AnesthesiaFormValues => ({
  estado: "ABIERTA",
  fechaInicio: dayjs(),
  fechaTerminacion: null,
  fechaRealizacion: null,
  cirujanoId: undefined,
  responsableId: undefined,
  idx1Ingreso: null,
  idx2Ingreso: null,
  idx3Ingreso: null,
  idx1Egreso: null,
  idx2Egreso: null,
  idx3Egreso: null,
  dxLibre: "",
  tipoAnestesiaId: undefined,
  asa: undefined,
  tipoCirugia: "",
  procedimientoARealizar: "",
  procedimientoRealizado: "",
  posicionPaciente: "",
  monitoreoEcg: "",
  observaciones: "",
  condicionesIngreso: "",
  observacion: "",
  actoAnestesico: undefined,
  drogasAnestesicas: "",
  liquidos: "",
})

const toFormValues = (record: RecordAnestesiaResponse): AnesthesiaFormValues => ({
  estado: record.estado,
  fechaInicio: record.fechaInicio ? dayjs(record.fechaInicio) : null,
  fechaTerminacion: record.fechaTerminacion ? dayjs(record.fechaTerminacion) : null,
  fechaRealizacion: record.fechaRealizacion ? dayjs(record.fechaRealizacion) : null,
  cirujanoId: record.cirujanoId,
  responsableId: record.responsableId,
  idx1Ingreso: record.idx1Ingreso,
  idx2Ingreso: record.idx2Ingreso,
  idx3Ingreso: record.idx3Ingreso,
  idx1Egreso: record.idx1Egreso,
  idx2Egreso: record.idx2Egreso,
  idx3Egreso: record.idx3Egreso,
  dxLibre: record.dxLibre ?? "",
  tipoAnestesiaId: record.tipoAnestesiaId,
  asa: record.asa ?? undefined,
  tipoCirugia: record.tipoCirugia ?? "",
  procedimientoARealizar: record.procedimientoARealizar ?? "",
  procedimientoRealizado: record.procedimientoRealizado ?? "",
  posicionPaciente: record.posicionPaciente ?? "",
  monitoreoEcg: record.monitoreoEcg ?? "",
  observaciones: record.observaciones ?? "",
  condicionesIngreso: record.condicionesIngreso ?? "",
  observacion: record.observacion ?? "",
  actoAnestesico: record.actoAnestesico ?? undefined,
  drogasAnestesicas: record.drogasAnestesicas ?? "",
  liquidos: record.liquidos ?? "",
})

const text = (value?: string) => (value ?? "").trim()

const toPayload = (values: AnesthesiaFormValues): RecordAnestesiaUpdateRequest => ({
  estado: values.estado,
  fechaInicio: values.fechaInicio?.toISOString() ?? "",
  fechaTerminacion: values.fechaTerminacion?.toISOString() ?? null,
  fechaRealizacion: values.fechaRealizacion?.toISOString() ?? null,
  cirujanoId: values.cirujanoId as number,
  responsableId: values.responsableId as number,
  idx1Ingreso: values.idx1Ingreso?.codigo ?? null,
  idx2Ingreso: values.idx2Ingreso?.codigo ?? null,
  idx3Ingreso: values.idx3Ingreso?.codigo ?? null,
  idx1Egreso: values.idx1Egreso?.codigo ?? null,
  idx2Egreso: values.idx2Egreso?.codigo ?? null,
  idx3Egreso: values.idx3Egreso?.codigo ?? null,
  dxLibre: text(values.dxLibre),
  tipoAnestesiaId: values.tipoAnestesiaId as number,
  asa: values.asa ?? null,
  tipoCirugia: text(values.tipoCirugia).toUpperCase(),
  procedimientoARealizar: text(values.procedimientoARealizar),
  procedimientoRealizado: text(values.procedimientoRealizado),
  posicionPaciente: text(values.posicionPaciente),
  monitoreoEcg: text(values.monitoreoEcg),
  observaciones: text(values.observaciones),
  condicionesIngreso: text(values.condicionesIngreso),
  observacion: text(values.observacion),
  actoAnestesico: values.actoAnestesico ?? null,
  drogasAnestesicas: text(values.drogasAnestesicas),
  liquidos: text(values.liquidos),
})

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const AnesthesiaRecordContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<AnesthesiaFormValues>()

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
  const { data: provider } = useGetProvider(INSTITUTION_PROVIDER_ID)

  const { me, users } = useCurrentDoctor()
  const currentUserId = me?.id ? Number(me.id) : undefined
  const { data: anesthesiaTypes = [] } = useGetAnesthesiaTypes()

  const {
    data: historial,
    isLoading: loadingHistorial,
    isError: historialError,
  } = useGetRecordsAnestesiaByAdmission(admissionId)

  const createRecord = useCreateRecordAnestesia()
  const updateRecord = useUpdateRecordAnestesia()
  const deleteRecord = useDeleteRecordAnestesia()
  const isSaving = createRecord.isPending || updateRecord.isPending

  const [editing, setEditing] = useState<RecordAnestesiaResponse | null>(null)
  // Contenido del último guardado: si el formulario no cambió, imprimir no
  // vuelve a llamar al backend.
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [printRecord, setPrintRecord] = useState<RecordAnestesiaResponse | null>(null)

  const watchedEstado = Form.useWatch("estado", form)
  const isClosed = editing?.estado === "CERRADA"

  /* ─────────────── Opciones ─────────────── */

  const usersByProfile = (profileIds: readonly number[]) =>
    users
      .filter((u) => u.isActive && profileIds.includes(u.userProfileId))
      .map((u) => ({ value: u.id, label: buildFullName(u) }))

  const surgeonOptions = usersByProfile(QX_TEAM_PROFILES.cirujano)
  const anesthesiologistOptions = usersByProfile(QX_TEAM_PROFILES.anestesiologo)
  const anesthesiaTypeOptions = anesthesiaTypes.map((a) => ({ value: a.id, label: a.name }))

  // Si quien registra es anestesiólogo, se propone como responsable.
  const defaultResponsableId = anesthesiologistOptions.some((o) => o.value === currentUserId)
    ? currentUserId
    : undefined

  useEffect(() => {
    if (editing || !defaultResponsableId) return
    if (form.getFieldValue("responsableId") === undefined) {
      form.setFieldValue("responsableId", defaultResponsableId)
    }
  }, [defaultResponsableId, editing, form])

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
    setSavedSnapshot(null)
    form.resetFields()
    form.setFieldsValue({ ...emptyFormValues(), responsableId: defaultResponsableId })
  }

  const loadForEdit = (record: RecordAnestesiaResponse) => {
    const values = toFormValues(record)
    setEditing(record)
    form.resetFields()
    form.setFieldsValue(values)
    setSavedSnapshot(JSON.stringify(toPayload(values)))
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const validateForm = async (): Promise<AnesthesiaFormValues | null> => {
    try {
      return await form.validateFields()
    } catch {
      messageApi.error("Complete los campos obligatorios del record de anestesia.")
      return null
    }
  }

  const persist = async (): Promise<RecordAnestesiaResponse | null> => {
    if (!admissionId) {
      messageApi.error("No se encontró la admisión del paciente.")
      return null
    }

    // Un record cerrado ya no se modifica; solo se consulta e imprime.
    if (editing && isClosed) return editing

    const values = await validateForm()
    if (!values) return null

    const payload = toPayload(values)
    const snapshot = JSON.stringify(payload)

    if (editing && savedSnapshot === snapshot) return editing

    try {
      const saved = editing
        ? await updateRecord.mutateAsync({ id: editing.id, data: payload })
        : await createRecord.mutateAsync({ admissionId: Number(admissionId), ...payload })

      if (!saved?.id) throw new Error("El servidor no devolvió el record guardado.")

      // Se continúa sobre el registro guardado para que imprimir o guardar de
      // nuevo actualice ese mismo record en lugar de duplicarlo.
      setEditing(saved)
      setSavedSnapshot(snapshot)
      messageApi.success(
        editing ? "Record de anestesia actualizado." : "Record de anestesia registrado.",
      )
      return saved
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo guardar el record de anestesia."))
      return null
    }
  }

  const handleSave = async () => {
    await persist()
  }

  const handlePrint = async () => {
    const saved = await persist()
    if (saved) setPrintRecord(saved)
  }

  const handleDelete = async (record: RecordAnestesiaResponse) => {
    try {
      await deleteRecord.mutateAsync({ id: record.id, admissionId: record.admissionId })
      if (editing?.id === record.id) resetForm()
      messageApi.success("Record de anestesia eliminado.")
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo eliminar el record de anestesia."))
    }
  }

  /* ─────────────── Historial ─────────────── */

  const columns: ColumnsType<RecordAnestesiaResponse> = [
    {
      title: "Fecha inicio",
      dataIndex: "fechaInicio",
      key: "fechaInicio",
      width: 140,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Procedimiento",
      key: "procedimiento",
      render: (_, record) =>
        record.procedimientoRealizado ||
        record.procedimientoARealizar ||
        formatDiagnostico(record.idx1Ingreso) ||
        "—",
    },
    {
      title: "Anestesia",
      dataIndex: "nombreTipoAnestesia",
      key: "nombreTipoAnestesia",
      width: 140,
    },
    {
      title: "Responsable",
      dataIndex: "nombreResponsable",
      key: "nombreResponsable",
      width: 180,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 100,
      render: (value: EstadoRecordAnestesia) => (
        <Tag color={ESTADO_COLORS[value] ?? "default"}>{value}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 130,
      align: "center",
      render: (_, record) => {
        const closed = record.estado === "CERRADA"
        return (
          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
            <Tooltip title="Imprimir record">
              <Button
                type="text"
                icon={<PrinterOutlined />}
                onClick={() => setPrintRecord(record)}
              />
            </Tooltip>
            <Tooltip title={closed ? "Ver" : "Editar"}>
              <Button
                type="text"
                icon={closed ? <EyeOutlined /> : <EditOutlined />}
                onClick={() => loadForEdit(record)}
              />
            </Tooltip>
            {!closed && (
              <Popconfirm
                title="¿Eliminar este record?"
                description="El record dejará de aparecer en el historial del paciente."
                okText="Eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(record)}
              >
                <Tooltip title="Eliminar">
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        )
      },
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
        <HeartOutlined style={{ fontSize: 22, color: "#cf1322" }} />
        <Title level={3}>Record de Anestesia</Title>
      </div>

      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
        Volver
      </Button>
    </div>
  )

  if (!admissionId) {
    return (
      <Container>
        {header}
        <Empty description="Selecciona un paciente desde Evolucionar HC para registrar un record de anestesia.">
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
      label: "No. documento",
      value: [printPatient.documentType, printPatient.documentNumber].filter(Boolean).join(" "),
    },
    { label: "Edad", value: calculateAgeLabel(printPatient.birthDate) },
    { label: "Sexo", value: printPatient.sex },
    { label: "ID Historia / Admisión", value: admissionId },
    { label: "Fecha de admisión", value: formatDateTime(admissionDate, "") },
    { label: "Servicio", value: printPatient.careScope },
    { label: "Aseguradora", value: printPatient.insurer },
    { label: "Prestador", value: provider?.name },
  ]

  return (
    <Container>
      {contextHolder}
      {header}

      {/* ════ Información del paciente ════ */}
      <div className="anesthesia-card">
        <div className="anesthesia-card-title">
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
          <div className="anesthesia-patient-grid">
            {patientItems.map((item) => (
              <div key={item.label}>
                <span className="anesthesia-patient-label">{item.label}</span>
                <span className="anesthesia-patient-value">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ Record de anestesia ════ */}
      <div className="anesthesia-card">
        <div
          className="anesthesia-card-title"
          style={{ justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HeartOutlined style={{ color: "#cf1322" }} />
            {editing ? `Record de anestesia #${editing.id}` : "Nuevo record de anestesia"}
          </span>
          {editing && (
            <Button size="small" icon={<PlusOutlined />} onClick={resetForm}>
              Nuevo record
            </Button>
          )}
        </div>

        {isClosed && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title="Este record está cerrado: solo se puede consultar e imprimir."
          />
        )}

        <Form<AnesthesiaFormValues>
          form={form}
          layout="vertical"
          initialValues={emptyFormValues()}
          requiredMark
          disabled={isSaving || isClosed}
        >
          <div className="anesthesia-group-title">Datos generales</div>
          <div className="anesthesia-grid">
            <Form.Item
              label="Estado"
              name="estado"
              rules={[{ required: true, message: "Seleccione el estado." }]}
              extra={
                watchedEstado === "CERRADA" && !isClosed
                  ? "Al guardar como CERRADA el record ya no se podrá modificar."
                  : undefined
              }
            >
              <Select options={ESTADOS_RECORD_ANESTESIA.map((e) => ({ value: e, label: e }))} />
            </Form.Item>

            <Form.Item
              label="Fecha inicio"
              name="fechaInicio"
              rules={[{ required: true, message: "La fecha de inicio es obligatoria." }]}
            >
              <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Fecha terminación"
              name="fechaTerminacion"
              dependencies={["fechaInicio"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator: (_, value: Dayjs | null) => {
                    const inicio: Dayjs | null = getFieldValue("fechaInicio")
                    if (!value || !inicio || !value.isBefore(inicio)) return Promise.resolve()
                    return Promise.reject(
                      new Error("No puede ser anterior a la fecha de inicio."),
                    )
                  },
                }),
              ]}
            >
              <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Fecha realización" name="fechaRealizacion">
              <DatePicker showTime format={DATE_TIME_FORMAT} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div className="anesthesia-grid-2">
            <Form.Item
              label="Cirujano"
              name="cirujanoId"
              rules={[{ required: true, message: "Seleccione el cirujano." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione el cirujano"
                options={surgeonOptions}
              />
            </Form.Item>

            <Form.Item
              label="Responsable (anestesiólogo)"
              name="responsableId"
              rules={[{ required: true, message: "Seleccione el anestesiólogo responsable." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione el anestesiólogo"
                options={anesthesiologistOptions}
              />
            </Form.Item>
          </div>

          <div className="anesthesia-group-title">Diagnósticos</div>
          {DIAGNOSTICO_FIELDS.map((field) => (
            <div className="anesthesia-grid-2" key={field.label}>
              <Form.Item label={`${field.label} ingreso`} name={field.ingreso}>
                <Cie10CodeSelect />
              </Form.Item>
              <Form.Item label={`${field.label} egreso`} name={field.egreso}>
                <Cie10CodeSelect />
              </Form.Item>
            </div>
          ))}

          <Form.Item label="DX libre" name="dxLibre">
            <TextArea rows={2} maxLength={2000} placeholder="Diagnóstico en texto libre..." />
          </Form.Item>

          <div className="anesthesia-group-title">Procedimiento</div>
          <div className="anesthesia-grid">
            <Form.Item
              label="Tipo de anestesia"
              name="tipoAnestesiaId"
              rules={[{ required: true, message: "Seleccione el tipo de anestesia." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Seleccione"
                options={anesthesiaTypeOptions}
              />
            </Form.Item>

            <Form.Item label="ASA" name="asa">
              <Select
                allowClear
                placeholder="Seleccione"
                options={ASA_OPCIONES.map((a) => ({ value: a, label: a }))}
              />
            </Form.Item>

            <Form.Item
              label="Tipo de cirugía"
              name="tipoCirugia"
              normalize={(value?: string) => value?.toUpperCase()}
            >
              <AutoComplete
                maxLength={100}
                placeholder="Ej: CRUENTA"
                options={TIPOS_CIRUGIA_SUGERIDOS.map((t) => ({ value: t }))}
              />
            </Form.Item>
          </div>

          <div className="anesthesia-grid-2">
            <Form.Item label="Procedimiento a realizar" name="procedimientoARealizar">
              <TextArea rows={3} maxLength={4000} />
            </Form.Item>
            <Form.Item label="Procedimiento realizado" name="procedimientoRealizado">
              <TextArea rows={3} maxLength={4000} />
            </Form.Item>
          </div>

          <div className="anesthesia-grid-2">
            <Form.Item label="Posición del paciente" name="posicionPaciente">
              <Input maxLength={500} placeholder="Ej: DECÚBITO LATERAL" />
            </Form.Item>
            <Form.Item label="Monitoreo ECG" name="monitoreoEcg">
              <Input maxLength={500} placeholder="Ej: RITMO SINUSAL" />
            </Form.Item>
          </div>

          <div className="anesthesia-grid">
            <Form.Item label="Observaciones" name="observaciones">
              <TextArea rows={2} maxLength={2000} />
            </Form.Item>
            <Form.Item label="Condiciones del paciente al ingreso" name="condicionesIngreso">
              <TextArea rows={2} maxLength={2000} />
            </Form.Item>
            <Form.Item label="Observación" name="observacion">
              <TextArea rows={2} maxLength={2000} />
            </Form.Item>
          </div>

          <div className="anesthesia-group-title">Acto anestésico</div>
          <div className="anesthesia-grid">
            <Form.Item label="Acto anestésico" name="actoAnestesico">
              <Select
                allowClear
                placeholder="Seleccione"
                options={ACTOS_ANESTESICOS.map((a) => ({
                  value: a,
                  label: ACTO_ANESTESICO_LABELS[a],
                }))}
              />
            </Form.Item>
          </div>

          <div className="anesthesia-grid-2">
            <Form.Item label="Drogas anestésicas" name="drogasAnestesicas">
              <TextArea rows={3} maxLength={4000} placeholder="Ej: PROPOFOL, MIDAZOLAM..." />
            </Form.Item>
            <Form.Item label="Líquidos" name="liquidos">
              <TextArea rows={3} maxLength={4000} placeholder="Ej: HARTMAN 1000 CC" />
            </Form.Item>
          </div>
        </Form>

        <div className="anesthesia-actions">
          <Button onClick={resetForm} disabled={isSaving}>
            {isClosed ? "Nuevo record" : "Limpiar formulario"}
          </Button>
          {!isClosed && (
            <Button icon={<SaveOutlined />} loading={isSaving} onClick={handleSave}>
              {editing ? "Actualizar record" : "Guardar record"}
            </Button>
          )}
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            loading={isSaving}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
        </div>
      </div>

      {/* ════ Historial ════ */}
      <div className="anesthesia-card">
        <div className="anesthesia-card-title">
          <HistoryOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
          Historial de records de esta admisión
        </div>
        {historialError ? (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el historial de records de anestesia."
          />
        ) : (
          <Table<RecordAnestesiaResponse>
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={historial ?? []}
            loading={loadingHistorial}
            pagination={{ pageSize: 5, hideOnSinglePage: true }}
            scroll={{ x: 820 }}
            locale={{ emptyText: "Aún no hay records de anestesia registrados para esta admisión." }}
          />
        )}
      </div>

      <ClinicalPrintPreviewModal
        open={printRecord !== null}
        onClose={() => setPrintRecord(null)}
        title="Record de anestesia"
        renderDocument={(printProvider) =>
          printRecord ? (
            <AnesthesiaRecordPrintDocument
              provider={printProvider}
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

export default AnesthesiaRecordContainer
