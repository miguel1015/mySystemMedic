"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import {
  useCreateEstudioRayosX,
  useDeleteEstudioRayosX,
  useGetEstudiosRadiologicosDisponibles,
  useGetEstudiosRayosXByAdmission,
  useUpdateEstudioRayosX,
} from "@/core/hooks/care/rayosX/useEstudiosRayosX"
import { useCurrentDoctor } from "@/core/hooks/users/useCurrentDoctor"
import {
  RESULTADOS_RAYOS_X,
  type EstudioRayosXResponse,
  type EstudioRayosXUpdateRequest,
  type ResultadoRayosX,
} from "@/core/interfaces/care/rayosX"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusOutlined,
  PrinterOutlined,
  RadarChartOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Popconfirm,
  Radio,
  Select,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import ClinicalPrintPreviewModal from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import {
  formatDateTime,
  type PrintPatient,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { XrayPrintDocument } from "./XrayPrintDocument"
import {
  RESULTADO_COLORS,
  calculateAgeLabel,
  formatStudyDate,
  todayIsoDate,
} from "./xray.utils"
import "./xray.css"

const { TextArea } = Input

interface XrayFormValues {
  fechaEstudio: string
  tariffDetailId?: number
  resultado?: ResultadoRayosX
  descripcion?: string
  conclusion?: string
}

const emptyFormValues = (): XrayFormValues => ({
  fechaEstudio: todayIsoDate(),
  tariffDetailId: undefined,
  resultado: undefined,
  descripcion: "",
  conclusion: "",
})

const toPayload = (values: XrayFormValues): EstudioRayosXUpdateRequest => ({
  tariffDetailId: Number(values.tariffDetailId),
  fechaEstudio: values.fechaEstudio,
  resultado: values.resultado as ResultadoRayosX,
  descripcion: (values.descripcion ?? "").trim(),
  conclusion: (values.conclusion ?? "").trim(),
})

const formatAdmissionDate = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const XrayContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<XrayFormValues>()

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

  const { me, currentDoctor, currentDoctorUser } = useCurrentDoctor()
  const currentUserId = me?.id ? Number(me.id) : undefined

  const {
    data: estudiosDisponibles,
    isLoading: loadingEstudios,
    isError: estudiosError,
  } = useGetEstudiosRadiologicosDisponibles()
  const {
    data: historial,
    isLoading: loadingHistorial,
    isError: historialError,
  } = useGetEstudiosRayosXByAdmission(admissionId)

  const createEstudio = useCreateEstudioRayosX()
  const updateEstudio = useUpdateEstudioRayosX()
  const deleteEstudio = useDeleteEstudioRayosX()
  const isSaving = createEstudio.isPending || updateEstudio.isPending

  const [editing, setEditing] = useState<EstudioRayosXResponse | null>(null)
  // Contenido del último guardado: si el formulario no cambió, imprimir no
  // vuelve a llamar al backend.
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [printEstudio, setPrintEstudio] = useState<EstudioRayosXResponse | null>(null)
  const [generatedAt, setGeneratedAt] = useState("")

  const watchedEstudio = Form.useWatch("tariffDetailId", form)
  const watchedResultado = Form.useWatch("resultado", form)
  const requiredFilled = Boolean(watchedEstudio) && Boolean(watchedResultado)

  /* ─────────────── Paciente ─────────────── */

  const patientFullName =
    [
      patientRecord?.firstName,
      patientRecord?.middleName,
      patientRecord?.lastName,
      patientRecord?.secondLastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    admission?.nombrePaciente ||
    searchParams.get("patientName") ||
    ""

  const documentType =
    patientRecord?.documentTypeCode || admission?.documentTypeCode || ""
  const documentNumber =
    patientRecord?.documentNumber ||
    admission?.documentoPatiente ||
    searchParams.get("documentNumber") ||
    ""
  const birthDate = patientRecord?.birthDate?.slice(0, 10) ?? ""
  const sex = patientRecord?.sexName || ""
  const admissionDate = admission?.admissionDate || searchParams.get("admissionDate") || ""
  const careScope = admission?.careScopeName || searchParams.get("careScope") || ""
  const insurer = admission?.epsNombre || patientRecord?.insurerName || ""

  const printPatient: PrintPatient = {
    name: patientFullName,
    documentType,
    documentNumber,
    careScope,
    birthDate,
    sex,
    insurer,
    city: patientRecord?.cityName || "",
    phone: patientRecord?.phone || "",
  }

  /* ─────────────── Estudios del Manual Tarifario ─────────────── */

  const estudioOptions = useMemo(() => {
    const options = (estudiosDisponibles ?? []).map((estudio) => ({
      value: estudio.tariffDetailId,
      label: `${estudio.codigo} - ${estudio.nombre}`,
    }))

    // Si se edita un estudio cuyo ítem ya no aparece en el listado, se conserva
    // como opción para que el selector muestre el valor guardado.
    if (
      editing?.tariffDetailId &&
      !options.some((option) => option.value === editing.tariffDetailId)
    ) {
      options.unshift({
        value: editing.tariffDetailId,
        label: `${editing.codigoEstudio} - ${editing.nombreEstudio}`,
      })
    }

    return options
  }, [estudiosDisponibles, editing])

  /* ─────────────── Acciones ─────────────── */

  const resetForm = () => {
    setEditing(null)
    setSavedSnapshot(null)
    form.resetFields()
    form.setFieldsValue(emptyFormValues())
  }

  const loadForEdit = (estudio: EstudioRayosXResponse) => {
    const values: XrayFormValues = {
      fechaEstudio: estudio.fechaEstudio?.slice(0, 10) || todayIsoDate(),
      tariffDetailId: estudio.tariffDetailId ?? undefined,
      resultado: estudio.resultado,
      descripcion: estudio.descripcion ?? "",
      conclusion: estudio.conclusion ?? "",
    }
    setEditing(estudio)
    form.resetFields()
    form.setFieldsValue(values)
    setSavedSnapshot(estudio.tariffDetailId ? JSON.stringify(toPayload(values)) : null)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const validateForm = async (): Promise<XrayFormValues | null> => {
    try {
      return await form.validateFields()
    } catch {
      messageApi.error("Complete los campos obligatorios: Estudio y Resultado.")
      return null
    }
  }

  const persist = async (): Promise<EstudioRayosXResponse | null> => {
    if (!admissionId) {
      messageApi.error("No se encontró la admisión del paciente.")
      return null
    }

    const values = await validateForm()
    if (!values) return null

    const payload = toPayload(values)
    const snapshot = JSON.stringify(payload)

    if (editing && savedSnapshot === snapshot) return editing

    try {
      const saved = editing
        ? await updateEstudio.mutateAsync({ id: editing.id, data: payload })
        : await createEstudio.mutateAsync({ admissionId: Number(admissionId), ...payload })

      if (!saved?.id) throw new Error("El servidor no devolvió el estudio guardado.")

      // Se continúa sobre el registro guardado para que imprimir o guardar de
      // nuevo actualice ese mismo estudio en lugar de duplicarlo.
      setEditing(saved)
      setSavedSnapshot(snapshot)
      messageApi.success(
        editing ? "Estudio de rayos X actualizado." : "Estudio de rayos X registrado.",
      )
      return saved
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo guardar el estudio de rayos X."))
      return null
    }
  }

  const openPrint = (estudio: EstudioRayosXResponse) => {
    if (!estudio.codigoEstudio || !estudio.resultado) {
      messageApi.error("El estudio no tiene diligenciados los campos obligatorios.")
      return
    }
    setGeneratedAt(new Date().toISOString())
    setPrintEstudio(estudio)
  }

  const handleSave = async () => {
    await persist()
  }

  const handlePrint = async () => {
    const saved = await persist()
    if (saved) openPrint(saved)
  }

  const handleDelete = async (estudio: EstudioRayosXResponse) => {
    try {
      await deleteEstudio.mutateAsync({ id: estudio.id, admissionId: estudio.admissionId })
      if (editing?.id === estudio.id) resetForm()
      messageApi.success("Estudio de rayos X eliminado.")
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo eliminar el estudio de rayos X."))
    }
  }

  /* ─────────────── Historial ─────────────── */

  const columns: ColumnsType<EstudioRayosXResponse> = [
    {
      title: "Fecha",
      dataIndex: "fechaEstudio",
      key: "fechaEstudio",
      width: 110,
      render: (value: string) => formatStudyDate(value),
    },
    {
      title: "Estudio",
      key: "estudio",
      render: (_, record) => `${record.codigoEstudio} - ${record.nombreEstudio}`,
    },
    {
      title: "Resultado",
      dataIndex: "resultado",
      key: "resultado",
      width: 120,
      render: (value: ResultadoRayosX) => (
        <Tag color={RESULTADO_COLORS[value] ?? "default"}>{value}</Tag>
      ),
    },
    {
      title: "Radiólogo",
      dataIndex: "nombreProfesional",
      key: "nombreProfesional",
    },
    {
      title: "Registrado",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 140,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 130,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          <Tooltip title="Imprimir resultado">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => openPrint(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={() => loadForEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar este estudio?"
            description="El estudio dejará de aparecer en el historial del paciente."
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
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
        <RadarChartOutlined style={{ fontSize: 22, color: "#d46b08" }} />
        <Title level={3}>Rayos X</Title>
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
        <Empty description="Selecciona un paciente desde Evolucionar HC para registrar un estudio de rayos X.">
          <Button type="primary" onClick={() => router.push("/care/evolveClinicalHistory")}>
            Ir a Evolucionar HC
          </Button>
        </Empty>
      </Container>
    )
  }

  const editingByAnotherUser =
    editing !== null && currentUserId !== undefined && editing.userId !== currentUserId
  const missingProfessionalData =
    currentDoctorUser !== undefined &&
    (!currentDoctorUser.licenseCard || !currentDoctorUser.signature)

  const patientItems = [
    { label: "Nombre completo", value: patientFullName },
    {
      label: "Identificación",
      value: [documentType, documentNumber].filter(Boolean).join(" "),
    },
    { label: "Edad", value: calculateAgeLabel(birthDate) },
    { label: "Sexo", value: sex },
    { label: "N° Admisión / Historia clínica", value: admissionId },
    { label: "Fecha de admisión", value: formatAdmissionDate(admissionDate) },
    { label: "Ámbito de atención", value: careScope },
    { label: "Aseguradora", value: insurer },
  ]

  return (
    <Container>
      {contextHolder}
      {header}

      {/* ════ Información del paciente ════ */}
      <div className="xray-card">
        <div className="xray-card-title">
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
          <div className="xray-patient-grid">
            {patientItems.map((item) => (
              <div key={item.label}>
                <span className="xray-patient-label">{item.label}</span>
                <span className="xray-patient-value">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ Registro del estudio ════ */}
      <div className="xray-card">
        <div className="xray-card-title" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadarChartOutlined style={{ color: "#d46b08" }} />
            {editing ? `Estudio radiológico #${editing.id}` : "Nuevo estudio radiológico"}
          </span>
          {editing && (
            <Button size="small" icon={<PlusOutlined />} onClick={resetForm}>
              Nuevo estudio
            </Button>
          )}
        </div>

        <div style={{ marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: "var(--dash-text-secondary, #6b7280)" }}>
            Radiólogo responsable:{" "}
          </span>
          <strong>{currentDoctor || "—"}</strong>
          <span style={{ color: "var(--dash-text-secondary, #6b7280)", marginLeft: 12 }}>
            T.P. {currentDoctorUser?.licenseCard || "no registrada"}
          </span>
        </div>

        {missingProfessionalData && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="Su usuario no tiene parametrizada la tarjeta profesional y/o la firma. El informe se generará sin esos datos hasta que se registren en el módulo de Usuarios."
          />
        )}

        {editingByAnotherUser && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            title={`Este estudio fue registrado por ${editing?.nombreProfesional}. Si lo actualiza, usted quedará como radiólogo responsable del informe.`}
          />
        )}

        {estudiosError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title="No se pudo cargar el listado de estudios del Manual Tarifario."
          />
        )}

        <Form<XrayFormValues>
          form={form}
          layout="vertical"
          initialValues={emptyFormValues()}
          requiredMark
          disabled={isSaving}
        >
          <div className="xray-form-row">
            <Form.Item
              label="Fecha del estudio"
              name="fechaEstudio"
              rules={[{ required: true, message: "La fecha del estudio es obligatoria." }]}
            >
              <Input type="date" max={todayIsoDate()} />
            </Form.Item>

            <Form.Item
              label="Estudio"
              name="tariffDetailId"
              rules={[{ required: true, message: "Seleccione el estudio realizado." }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                loading={loadingEstudios}
                options={estudioOptions}
                placeholder="Seleccione la radiografía o impresión diagnóstica"
                notFoundContent={
                  loadingEstudios ? "Cargando estudios..." : "No hay estudios radiológicos en el Manual Tarifario"
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Resultado"
            name="resultado"
            rules={[{ required: true, message: "Seleccione el resultado del estudio." }]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={RESULTADOS_RAYOS_X.map((resultado) => ({
                label: resultado,
                value: resultado,
              }))}
            />
          </Form.Item>

          <Form.Item label="Descripción" name="descripcion">
            <TextArea
              rows={10}
              maxLength={8000}
              showCount
              placeholder="Registre los hallazgos y la descripción detallada del estudio radiológico..."
            />
          </Form.Item>

          <Form.Item label="Conclusión" name="conclusion">
            <TextArea
              rows={5}
              maxLength={4000}
              showCount
              placeholder="Registre la conclusión o impresión diagnóstica del estudio..."
            />
          </Form.Item>
        </Form>

        <div className="xray-actions">
          <Button onClick={resetForm} disabled={isSaving}>
            Limpiar formulario
          </Button>
          <Button icon={<SaveOutlined />} loading={isSaving} onClick={handleSave}>
            {editing ? "Actualizar estudio" : "Guardar estudio"}
          </Button>
          <Tooltip title={requiredFilled ? "" : "Seleccione el estudio y el resultado para imprimir"}>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              loading={isSaving}
              disabled={!requiredFilled}
              onClick={handlePrint}
            >
              Imprimir resultado
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ════ Historial ════ */}
      <div className="xray-card">
        <div className="xray-card-title">
          <HistoryOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
          Estudios registrados en esta admisión
        </div>
        {historialError ? (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el historial de estudios de rayos X."
          />
        ) : (
          <Table<EstudioRayosXResponse>
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={historial ?? []}
            loading={loadingHistorial}
            pagination={{ pageSize: 5, hideOnSinglePage: true }}
            scroll={{ x: 760 }}
            locale={{ emptyText: "Aún no hay estudios de rayos X registrados para esta admisión." }}
          />
        )}
      </div>

      <ClinicalPrintPreviewModal
        open={printEstudio !== null}
        onClose={() => setPrintEstudio(null)}
        title="Informe radiológico"
        renderDocument={(provider) =>
          printEstudio ? (
            <XrayPrintDocument
              provider={provider}
              patient={printPatient}
              admissionId={admissionId}
              admissionDate={admissionDate}
              contractName={admission?.convenioNombre || patientRecord?.contractName || ""}
              estudio={printEstudio}
              generatedAt={generatedAt}
            />
          ) : null
        }
      />
    </Container>
  )
}

export default XrayContainer
