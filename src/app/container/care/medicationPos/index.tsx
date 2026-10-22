"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import {
  useActualizarMedicamentoPos,
  useAnularMedicamentoPos,
  useCrearMedicamentoPos,
  useGetMedicamentosPosByAdmission,
} from "@/core/hooks/care/medicamentosPos/useMedicamentosPos"
import {
  useBuscarConceptosOrden,
  useGetAsistencialesOrden,
  useGetViasAdministracion,
} from "@/core/hooks/care/ordenesMedicas/useOrdenesMedicas"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import type {
  MedicamentoPos,
  MedicamentoPosItemRequest,
  MedicamentoPosRequest,
} from "@/core/interfaces/care/medicamentoPos"
import type { ConceptoOrden } from "@/core/interfaces/care/ordenMedica"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  HistoryOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Empty,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Skeleton,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import ClinicalPrintPreviewModal from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalPrintPreviewModal"
import type { PrintPatient } from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { calculateAgeLabel } from "../xray/xray.utils"
import { MedicationPosPrintDocument } from "./MedicationPosPrintDocument"
import "../medicalOrders/medicalOrders.css"
import "./medicationPos.css"
import { formatDateTime } from "@/core/utils/date"

const { TextArea } = Input

const MAX_CANTIDAD = 10000
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000
const MEDICAMENTO = "Medicamento" as const

interface PosItem {
  medicineId: number
  codigoCum: string | null
  nombre: string
  detalle: string
  cantidad: number
  dosis: string
  viaAdministracionCodigo?: string
  frecuenciaHoras: number | null
  duracionDias: number | null
  indicacion: string
}

const itemToRequest = (item: PosItem): MedicamentoPosItemRequest => ({
  medicineId: item.medicineId,
  cantidad: item.cantidad,
  dosis: item.dosis.trim() || null,
  viaAdministracionCodigo: item.viaAdministracionCodigo ?? "",
  frecuenciaHoras: item.frecuenciaHoras,
  duracionDias: item.duracionDias,
  indicacion: item.indicacion.trim() || null,
})

const pad = (n: number) => n.toString().padStart(2, "0")

const toLocalInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`

const nowLocalInput = () => toLocalInput(new Date())

const isoToLocalInput = (value?: string | null) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? toLocalInput(date) : nowLocalInput()
}

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const isValidQuantity = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= MAX_CANTIDAD

const isOptionalIntInRange = (value: number | null, min: number, max: number) =>
  value === null || (Number.isInteger(value) && value >= min && value <= max)

// El buscador de órdenes usa el Id del catálogo como código cuando el medicamento
// no tiene CUM; en ese caso no hay CUM que conservar.
const cumFromConcepto = (concepto: ConceptoOrden) => {
  const codigo = concepto.codigo?.trim()
  return codigo && codigo !== String(concepto.conceptoId) ? codigo : null
}

const MedicationPosContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()

  const admissionId = searchParams.get("admissionId") || undefined

  /* ─────────────── Datos remotos ─────────────── */

  const {
    data: admission,
    isLoading: loadingAdmission,
    isError: admissionError,
  } = useGetAdmissionById(admissionId)
  const patientId =
    (admission?.patientId ? String(admission.patientId) : null) ||
    searchParams.get("patientId")
  const { data: patientRecord } = useGetPatientById(patientId)

  const {
    data: asistenciales,
    isLoading: loadingAsistenciales,
    isError: asistencialesError,
  } = useGetAsistencialesOrden()
  const {
    data: formulas,
    isLoading: loadingFormulas,
    isError: formulasError,
  } = useGetMedicamentosPosByAdmission(admissionId)

  const { data: vias, isLoading: loadingVias } = useGetViasAdministracion()

  const viaOptions = useMemo(
    () => (vias ?? []).map((v) => ({ value: v.codigo, label: v.descripcion })),
    [vias],
  )

  const crearFormula = useCrearMedicamentoPos()
  const actualizarFormula = useActualizarMedicamentoPos()
  const anularFormula = useAnularMedicamentoPos()
  const isSaving = crearFormula.isPending || actualizarFormula.isPending

  /* ─────────────── Formulario ─────────────── */

  const [editing, setEditing] = useState<MedicamentoPos | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [asistencialId, setAsistencialId] = useState<number | undefined>()
  const [fechaFormula, setFechaFormula] = useState(nowLocalInput)
  const [observaciones, setObservaciones] = useState("")
  const [items, setItems] = useState<PosItem[]>([])
  const [searchText, setSearchText] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [printFormula, setPrintFormula] = useState<MedicamentoPos | null>(null)
  const [generatedAt, setGeneratedAt] = useState("")

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText), 300)
    return () => window.clearTimeout(timer)
  }, [searchText])

  // Mismo buscador de Órdenes Médicas, fijo en medicamentos: el backend solo consulta
  // el catálogo de medicamentos y nunca devuelve procedimientos, laboratorios ni imágenes.
  const {
    data: conceptos,
    isFetching: searchingConceptos,
    isError: conceptosError,
  } = useBuscarConceptosOrden(debouncedSearch, MEDICAMENTO)

  const asistencialOptions = useMemo(
    () =>
      (asistenciales ?? []).map((a) => ({
        value: a.id,
        label: a.especialidad ? `${a.nombreCompleto} - ${a.especialidad}` : a.nombreCompleto,
      })),
    [asistenciales],
  )

  const medicamentoOptions = useMemo(
    () =>
      (conceptos ?? [])
        .filter((c) => c.tipoOrden === MEDICAMENTO && c.conceptoTipo === "medicine")
        .map((c) => ({
          value: String(c.conceptoId),
          label: `${c.codigo} - ${c.descripcion}${c.detalle ? ` (${c.detalle})` : ""}`,
          concepto: c,
        })),
    [conceptos],
  )

  /* ─────────────── Paciente ─────────────── */

  const patientName =
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
  const documentType = patientRecord?.documentTypeCode || admission?.documentTypeCode || ""
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
    name: patientName,
    documentType,
    documentNumber,
    careScope,
    birthDate,
    sex,
    insurer,
    city: patientRecord?.cityName || "",
    phone: patientRecord?.phone || "",
  }

  /* ─────────────── Estado de la fórmula ─────────────── */

  const buildPayload = (): MedicamentoPosRequest | null => {
    if (!admissionId || !asistencialId) return null
    const date = new Date(fechaFormula)
    if (!fechaFormula || Number.isNaN(date.getTime())) return null

    return {
      admissionId: Number(admissionId),
      asistencialId,
      fechaFormula: date.toISOString(),
      observaciones: observaciones.trim(),
      items: items.map(itemToRequest),
    }
  }

  const currentSnapshot = JSON.stringify(buildPayload())
  const hasUnsavedChanges = !editing || currentSnapshot !== savedSnapshot
  const canPrint = editing !== null && !hasUnsavedChanges

  const validate = () => {
    const errors: string[] = []
    if (!asistencialId) errors.push("Seleccione el profesional que formula.")
    if (!fechaFormula) {
      errors.push("Indique la fecha y hora de la fórmula.")
    } else {
      const date = new Date(fechaFormula)
      if (Number.isNaN(date.getTime())) errors.push("La fecha de la fórmula no es válida.")
      else if (date.getTime() > Date.now() + FUTURE_TOLERANCE_MS)
        errors.push("La fecha de la fórmula no puede ser futura.")
    }
    if (items.length === 0) errors.push("Cargue al menos un medicamento.")
    if (items.some((item) => !isValidQuantity(item.cantidad)))
      errors.push("Todas las cantidades deben ser mayores a cero.")
    if (items.some((item) => !item.viaAdministracionCodigo))
      errors.push("Seleccione la vía de administración de cada medicamento.")
    if (items.some((item) => !isOptionalIntInRange(item.frecuenciaHoras, 1, 168)))
      errors.push("La frecuencia debe estar entre 1 y 168 horas.")
    if (items.some((item) => !isOptionalIntInRange(item.duracionDias, 1, 365)))
      errors.push("La duración debe estar entre 1 y 365 días.")
    if (items.some((item) => item.indicacion.length > 1000))
      errors.push("La indicación no puede superar 1000 caracteres.")
    return errors
  }

  /* ─────────────── Acciones ─────────────── */

  const resetForm = () => {
    setEditing(null)
    setSavedSnapshot(null)
    setAsistencialId(undefined)
    setFechaFormula(nowLocalInput())
    setObservaciones("")
    setItems([])
    setValidationErrors([])
    setSearchText("")
  }

  const loadFormula = (formula: MedicamentoPos) => {
    const loadedItems: PosItem[] = (formula.items ?? []).map((item) => ({
      medicineId: item.medicineId,
      codigoCum: item.codigoCum ?? null,
      nombre: item.nombre,
      detalle: [item.formaFarmaceutica, item.concentracion].filter(Boolean).join(" · "),
      cantidad: item.cantidad,
      dosis: item.dosis ?? "",
      viaAdministracionCodigo: item.viaAdministracionCodigo,
      frecuenciaHoras: item.frecuenciaHoras ?? null,
      duracionDias: item.duracionDias ?? null,
      indicacion: item.indicacion ?? "",
    }))
    const fecha = isoToLocalInput(formula.fechaFormula)

    setEditing(formula)
    setAsistencialId(formula.asistencialId)
    setFechaFormula(fecha)
    setObservaciones(formula.observaciones ?? "")
    setItems(loadedItems)
    setValidationErrors([])

    // Mismo formato que buildPayload para detectar cambios sin guardar.
    setSavedSnapshot(
      JSON.stringify({
        admissionId: Number(admissionId),
        asistencialId: formula.asistencialId,
        fechaFormula: new Date(fecha).toISOString(),
        observaciones: (formula.observaciones ?? "").trim(),
        items: loadedItems.map(itemToRequest),
      }),
    )
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const addMedicamento = (concepto: ConceptoOrden) => {
    if (concepto.tipoOrden !== MEDICAMENTO || concepto.conceptoTipo !== "medicine") {
      messageApi.error("Solo se pueden cargar medicamentos en esta fórmula.")
      return
    }

    if (items.some((item) => item.medicineId === concepto.conceptoId)) {
      messageApi.info("Ese medicamento ya está en la fórmula; ajuste su cantidad en el listado.")
      return
    }

    setItems((current) => [
      ...current,
      {
        medicineId: concepto.conceptoId,
        codigoCum: cumFromConcepto(concepto),
        nombre: concepto.descripcion,
        detalle: concepto.detalle ?? "",
        cantidad: 1,
        dosis: concepto.detalle?.trim().slice(0, 100) ?? "",
        viaAdministracionCodigo:
          concepto.viaAdministracionCodigo &&
          (vias ?? []).some((v) => v.codigo === concepto.viaAdministracionCodigo)
            ? concepto.viaAdministracionCodigo
            : undefined,
        frecuenciaHoras: null,
        duracionDias: null,
        indicacion: "",
      },
    ])
    setSearchText("")
    setValidationErrors([])
    messageApi.success(`${concepto.descripcion} agregado a la fórmula.`)
  }

  const updateItem = (medicineId: number, changes: Partial<PosItem>) => {
    setItems((current) =>
      current.map((item) => (item.medicineId === medicineId ? { ...item, ...changes } : item)),
    )
  }

  const removeItem = (medicineId: number) => {
    setItems((current) => current.filter((item) => item.medicineId !== medicineId))
    messageApi.success("Medicamento retirado de la fórmula.")
  }

  const handleSave = async () => {
    const errors = validate()
    setValidationErrors(errors)
    if (errors.length > 0) {
      messageApi.error("Complete la información obligatoria antes de guardar la fórmula.")
      return
    }

    const payload = buildPayload()
    if (!payload) {
      messageApi.error("No se pudo construir la fórmula con los datos ingresados.")
      return
    }

    try {
      const saved = editing
        ? await actualizarFormula.mutateAsync({ id: editing.id, data: payload })
        : await crearFormula.mutateAsync(payload)

      if (!saved?.id) throw new Error("El servidor no devolvió la fórmula guardada.")

      // Se continúa sobre la fórmula guardada para poder imprimirla de inmediato.
      setEditing(saved)
      setSavedSnapshot(JSON.stringify(payload))
      messageApi.success(
        editing
          ? `Medicamentos POS N° ${saved.id} actualizados correctamente.`
          : `Medicamentos POS N° ${saved.id} guardados correctamente.`,
      )
    } catch (err) {
      messageApi.error(
        `${errorMessage(err, "No se pudieron guardar los medicamentos POS.")} La información diligenciada se conservó.`,
      )
    }
  }

  const openPrint = (formula: MedicamentoPos) => {
    if (!formula?.id || !formula.items?.length) {
      messageApi.error("Solo se pueden imprimir fórmulas guardadas con al menos un medicamento.")
      return
    }
    setGeneratedAt(new Date().toISOString())
    setPrintFormula(formula)
  }

  const handlePrintCurrent = () => {
    if (!canPrint || !editing) {
      messageApi.warning("Guarde la fórmula antes de imprimirla.")
      return
    }
    openPrint(editing)
  }

  const handleAnular = async (formula: MedicamentoPos) => {
    try {
      await anularFormula.mutateAsync({ id: formula.id })
      if (editing?.id === formula.id) resetForm()
      messageApi.success(`Medicamentos POS N° ${formula.id} anulados.`)
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo anular la fórmula."))
    }
  }

  /* ─────────────── Columnas ─────────────── */

  const showErrors = validationErrors.length > 0

  const itemColumns: ColumnsType<PosItem> = [
    {
      title: "Código CUM",
      dataIndex: "codigoCum",
      key: "codigoCum",
      width: 120,
      render: (codigoCum: string | null) =>
        codigoCum ? <strong>{codigoCum}</strong> : <Tag color="orange">Sin CUM</Tag>,
    },
    {
      title: "Medicamento",
      dataIndex: "nombre",
      key: "nombre",
      render: (nombre: string, record) => (
        <div>
          <div>{nombre}</div>
          {record.detalle && <div className="mo-muted">{record.detalle}</div>}
        </div>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 120,
      render: (cantidad: number, record) => (
        <InputNumber
          min={0.01}
          max={MAX_CANTIDAD}
          precision={2}
          value={cantidad}
          status={isValidQuantity(cantidad) ? undefined : "error"}
          onChange={(value) =>
            updateItem(record.medicineId, { cantidad: typeof value === "number" ? value : 0 })
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Posología",
      key: "posologia",
      width: 460,
      render: (_, record) => (
        <div style={{ display: "grid", gap: 6 }}>
          <div className="mp-posologia-grid">
            <Input
              size="small"
              value={record.dosis}
              maxLength={100}
              placeholder="Dosis (ej. 500 mg)"
              onChange={(event) => updateItem(record.medicineId, { dosis: event.target.value })}
            />
            <Select
              size="small"
              showSearch
              optionFilterProp="label"
              loading={loadingVias}
              value={record.viaAdministracionCodigo}
              options={viaOptions}
              placeholder="Vía *"
              status={showErrors && !record.viaAdministracionCodigo ? "error" : undefined}
              onChange={(value) => updateItem(record.medicineId, { viaAdministracionCodigo: value })}
              popupMatchSelectWidth={false}
            />
            <InputNumber
              size="small"
              min={1}
              max={168}
              precision={0}
              value={record.frecuenciaHoras}
              placeholder="c/ horas"
              addonBefore="c/"
              onChange={(value) =>
                updateItem(record.medicineId, { frecuenciaHoras: typeof value === "number" ? value : null })
              }
            />
            <InputNumber
              size="small"
              min={1}
              max={365}
              precision={0}
              value={record.duracionDias}
              placeholder="días"
              addonAfter="días"
              onChange={(value) =>
                updateItem(record.medicineId, { duracionDias: typeof value === "number" ? value : null })
              }
            />
          </div>
          <Input
            size="small"
            value={record.indicacion}
            maxLength={1000}
            placeholder="Indicación (ej. Tomar 1 tab 500 mg V.O. c/12h por 7 días)"
            onChange={(event) => updateItem(record.medicineId, { indicacion: event.target.value })}
          />
        </div>
      ),
    },
    {
      title: "",
      key: "acciones",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="¿Retirar este medicamento de la fórmula?"
          okText="Retirar"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
          onConfirm={() => removeItem(record.medicineId)}
        >
          <Tooltip title="Eliminar">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ]

  const formulaColumns: ColumnsType<MedicamentoPos> = [
    { title: "N°", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Fecha y hora",
      dataIndex: "fechaFormula",
      key: "fechaFormula",
      width: 150,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Profesional que formula",
      key: "asistencial",
      render: (_, record) =>
        record.asistencialEspecialidad
          ? `${record.asistencialNombre} - ${record.asistencialEspecialidad}`
          : record.asistencialNombre,
    },
    {
      title: "Medicamentos",
      key: "medicamentos",
      width: 120,
      align: "center",
      render: (_, record) => record.items?.length ?? 0,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 130,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          <Tooltip title="Imprimir">
            <Button type="text" icon={<PrinterOutlined />} onClick={() => openPrint(record)} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={() => loadFormula(record)} />
          </Tooltip>
          <Popconfirm
            title={`¿Anular los medicamentos POS N° ${record.id}?`}
            description="La fórmula dejará de aparecer en el historial del paciente."
            okText="Anular"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, loading: anularFormula.isPending }}
            onConfirm={() => handleAnular(record)}
          >
            <Tooltip title="Anular">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ]

  /* ─────────────── Render ─────────────── */

  const header = (
    <div className="mo-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FormOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Medicamentos POS</Title>
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
        <Empty description="Selecciona un paciente desde Evolucionar HC para registrar medicamentos POS.">
          <Button type="primary" onClick={() => router.push("/care/evolveClinicalHistory")}>
            Ir a Evolucionar HC
          </Button>
        </Empty>
      </Container>
    )
  }

  const patientItems = [
    { label: "Nombre completo", value: patientName },
    { label: "Identificación", value: [documentType, documentNumber].filter(Boolean).join(" ") },
    { label: "Edad", value: calculateAgeLabel(birthDate) },
    { label: "Sexo", value: sex },
    { label: "N° Admisión", value: admissionId },
    { label: "Servicio actual", value: careScope },
    { label: "Fecha de admisión", value: formatDateTime(admissionDate) },
    { label: "Aseguradora", value: insurer },
  ]

  return (
    <Container>
      {contextHolder}
      {header}

      {/* ════ Información del paciente ════ */}
      <div className="mo-card">
        <div className="mo-card-title">
          <UserOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
          Información del paciente
        </div>
        {admissionError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            title="No se pudo cargar la admisión del paciente."
          />
        )}
        {loadingAdmission ? (
          <Skeleton active title={false} paragraph={{ rows: 2 }} />
        ) : (
          <div className="mo-patient-grid">
            {patientItems.map((item) => (
              <div key={item.label}>
                <span className="mo-label">{item.label}</span>
                <span className="mo-value">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ Datos de la fórmula ════ */}
      <div className="mo-card">
        <div className="mo-card-title" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <span>{editing ? `Medicamentos POS N° ${editing.id}` : "Nuevos medicamentos POS"}</span>
          {editing && (
            <Button size="small" icon={<PlusOutlined />} onClick={resetForm}>
              Nueva fórmula
            </Button>
          )}
        </div>

        {showErrors && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title="Falta información obligatoria"
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            }
          />
        )}

        <div className="mp-form-grid">
          <div className="mo-field">
            <span>
              Profesional que formula <span className="mo-required">*</span>
            </span>
            <Select
              value={asistencialId}
              onChange={(value) => setAsistencialId(value)}
              options={asistencialOptions}
              loading={loadingAsistenciales}
              placeholder="Seleccione el profesional que formula"
              showSearch
              optionFilterProp="label"
              allowClear
              status={showErrors && !asistencialId ? "error" : undefined}
              notFoundContent={
                loadingAsistenciales
                  ? "Cargando profesionales..."
                  : asistencialesError
                    ? "No se pudieron cargar los profesionales"
                    : "No hay profesionales habilitados"
              }
              style={{ width: "100%" }}
            />
          </div>

          <div className="mo-field">
            <span>
              Fecha fórmula <span className="mo-required">*</span>
            </span>
            <Input
              type="datetime-local"
              value={fechaFormula}
              max={nowLocalInput()}
              status={showErrors && !fechaFormula ? "error" : undefined}
              onChange={(event) => setFechaFormula(event.target.value)}
            />
          </div>
        </div>

        <div className="mp-search">
          <Select
            showSearch
            value={null}
            searchValue={searchText}
            onSearch={setSearchText}
            filterOption={false}
            options={medicamentoOptions}
            onSelect={(_value, option) => {
              const concepto = (option as { concepto?: ConceptoOrden }).concepto
              if (concepto) addMedicamento(concepto)
            }}
            placeholder="Buscar medicamento por código CUM o nombre"
            suffixIcon={searchingConceptos ? <Spin size="small" /> : <SearchOutlined />}
            notFoundContent={
              searchingConceptos
                ? "Buscando..."
                : conceptosError
                  ? "No se pudo consultar el catálogo"
                  : "Sin resultados"
            }
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* ════ Medicamentos cargados ════ */}
      <div className="mo-card mo-card-flush">
        <div className="mo-table-header">
          <div>
            <div style={{ fontWeight: 700 }}>Medicamentos cargados</div>
            <div className="mo-muted">{items.length} medicamento(s) en la fórmula</div>
          </div>
          {editing && hasUnsavedChanges && <Tag color="orange">Cambios sin guardar</Tag>}
          {editing && !hasUnsavedChanges && <Tag color="green">Guardada</Tag>}
        </div>

        <Table<PosItem>
          rowKey="medicineId"
          columns={itemColumns}
          dataSource={items}
          pagination={false}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: <Empty description="Busque y seleccione los medicamentos a formular." />,
          }}
        />

        <div style={{ padding: "12px 16px" }}>
          <span className="mo-label">Observaciones generales</span>
          <TextArea
            rows={2}
            maxLength={2000}
            showCount
            value={observaciones}
            onChange={(event) => setObservaciones(event.target.value)}
            placeholder="Observaciones de la fórmula (opcional)"
          />
        </div>

        <div className="mo-actions">
          <Button onClick={resetForm} disabled={isSaving}>
            Limpiar
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSave}
          >
            {editing ? "Guardar cambios" : "Guardar"}
          </Button>
          <Tooltip title={canPrint ? "" : "Guarde la fórmula antes de imprimirla"}>
            <Button icon={<PrinterOutlined />} disabled={!canPrint} onClick={handlePrintCurrent}>
              Imprimir
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ════ Historial ════ */}
      <div className="mo-card mo-card-flush">
        <div className="mo-table-header">
          <div style={{ fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
            <HistoryOutlined /> Medicamentos POS de esta admisión
          </div>
          <Tag color="green">{formulas?.length ?? 0}</Tag>
        </div>
        {formulasError ? (
          <Alert
            type="error"
            showIcon
            style={{ margin: 16 }}
            title="No se pudieron cargar los medicamentos POS."
          />
        ) : (
          <Table<MedicamentoPos>
            rowKey="id"
            columns={formulaColumns}
            dataSource={formulas ?? []}
            loading={loadingFormulas}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 800 }}
            expandable={{
              expandedRowRender: (record) => (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {(record.items ?? []).map((item) => (
                    <li key={item.id} style={{ marginBottom: 4 }}>
                      {item.codigoCum || "Sin CUM"} - {item.nombre} · Cant. {item.cantidad}
                      {item.dosis ? ` · ${item.dosis}` : ""}
                      {` · ${item.viaAdministracion}`}
                      {item.frecuenciaHoras ? ` · c/${item.frecuenciaHoras} h` : ""}
                      {item.duracionDias ? ` · ${item.duracionDias} día(s)` : ""}
                      {item.indicacion ? ` — ${item.indicacion}` : ""}
                    </li>
                  ))}
                </ul>
              ),
            }}
            locale={{ emptyText: "Aún no hay medicamentos POS para esta admisión." }}
          />
        )}
      </div>

      <ClinicalPrintPreviewModal
        open={printFormula !== null}
        onClose={() => setPrintFormula(null)}
        title="Medicamentos POS"
        renderDocument={(provider) =>
          printFormula ? (
            <MedicationPosPrintDocument
              provider={provider}
              patient={printPatient}
              admissionId={admissionId}
              admissionDate={admissionDate}
              contractName={admission?.convenioNombre || patientRecord?.contractName || ""}
              formula={printFormula}
              generatedAt={generatedAt}
            />
          ) : null
        }
      />
    </Container>
  )
}

export default MedicationPosContainer
