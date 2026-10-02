"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import {
  useActualizarOrdenMedica,
  useAnularOrdenMedica,
  useBuscarConceptosOrden,
  useCrearOrdenMedica,
  useGetAsistencialesOrden,
  useGetOrdenesMedicasByAdmission,
  useGetUnidadesMedida,
  useGetViasAdministracion,
} from "@/core/hooks/care/ordenesMedicas/useOrdenesMedicas"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import {
  AMBITOS_ORDEN,
  TIPOS_ORDEN,
  type AmbitoOrden,
  type ConceptoOrden,
  type ConceptoOrdenTipo,
  type EstadoOrdenItem,
  type OrdenMedica,
  type OrdenMedicaItemRequest,
  type OrdenMedicaRequest,
  type TipoOrden,
} from "@/core/interfaces/care/ordenMedica"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  HistoryOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  AutoComplete,
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
import { MedicalOrderPrintDocument } from "./MedicalOrderPrintDocument"
import "./medicalOrders.css"

const { TextArea } = Input

const MAX_CANTIDAD = 10000
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000

interface OrderItem {
  key: string
  conceptoTipo: ConceptoOrdenTipo
  conceptoId: number
  codigo: string
  descripcion: string
  tipoOrden: TipoOrden
  cantidad: number
  indicaciones: string
  // Datos de administración (solo medicamentos)
  unidadMedida: string
  viaAdministracionCodigo?: string
  frecuenciaHoras: number | null
  duracionDias: number | null
}

export const ESTADO_COLORS: Record<EstadoOrdenItem, string> = {
  Pendiente: "gold",
  "En proceso": "blue",
  Aplicada: "green",
  Vencida: "red",
  Cancelada: "default",
}

// Presentaciones habituales que se ofrecen además del catálogo de unidades.
const UNIDADES_COMUNES = ["Tableta", "Cápsula", "Ampolla", "Frasco", "Sobre", "Gotas", "UI", "Unidad"]

const isMedicine = (item: { tipoOrden: TipoOrden }) => item.tipoOrden === "Medicamento"

const itemToRequest = (item: OrderItem): OrdenMedicaItemRequest => ({
  conceptoTipo: item.conceptoTipo,
  conceptoId: item.conceptoId,
  cantidad: item.cantidad,
  indicaciones: item.indicaciones.trim(),
  unidadMedida: isMedicine(item) ? item.unidadMedida.trim() : null,
  viaAdministracionCodigo: isMedicine(item) ? item.viaAdministracionCodigo ?? null : null,
  frecuenciaHoras: isMedicine(item) ? item.frecuenciaHoras : null,
  duracionDias: isMedicine(item) ? item.duracionDias : null,
})

const TIPO_COLORS: Record<TipoOrden, string> = {
  Medicamento: "green",
  Laboratorio: "cyan",
  "Rayos X": "orange",
  "Procedimiento diagnóstico": "purple",
  Procedimiento: "blue",
  "Otro servicio": "default",
}

const INDICACIONES_PLACEHOLDER: Record<TipoOrden, string> = {
  Medicamento: "Indicaciones adicionales (opcional)",
  Laboratorio: "Indicación clínica / observaciones",
  "Rayos X": "Proyecciones / indicación clínica",
  "Procedimiento diagnóstico": "Indicación clínica / observaciones",
  Procedimiento: "Indicación clínica / observaciones",
  "Otro servicio": "Observaciones",
}

// Ámbito de la admisión (catálogo CareScopes) -> ámbito sugerido de la orden.
const AMBITO_POR_CARE_SCOPE: Record<string, AmbitoOrden> = {
  URGENCIAS: "Urgencias",
  HOSPITALIZACION: "Hospitalización",
  QUIROFANOS: "Cirugía",
}

const pad = (n: number) => n.toString().padStart(2, "0")

const toLocalInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`

const nowLocalInput = () => toLocalInput(new Date())

const isoToLocalInput = (value?: string | null) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? toLocalInput(date) : nowLocalInput()
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "—"
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

const itemKey = (conceptoTipo: string, conceptoId: number) => `${conceptoTipo}-${conceptoId}`

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const isValidQuantity = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= MAX_CANTIDAD

const isOptionalIntInRange = (value: number | null, min: number, max: number) =>
  value === null || (Number.isInteger(value) && value >= min && value <= max)

const MedicalOrdersContainer = () => {
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
    data: ordenes,
    isLoading: loadingOrdenes,
    isError: ordenesError,
  } = useGetOrdenesMedicasByAdmission(admissionId)

  const { data: vias, isLoading: loadingVias } = useGetViasAdministracion()
  const { data: unidades } = useGetUnidadesMedida()

  const viaOptions = useMemo(
    () => (vias ?? []).map((v) => ({ value: v.codigo, label: v.descripcion })),
    [vias],
  )

  const unidadOptions = useMemo(() => {
    const seen = new Set<string>()
    return [...UNIDADES_COMUNES, ...(unidades ?? []).map((u) => u.codigo)]
      .filter((value) => {
        const key = value.trim().toLowerCase()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((value) => ({ value }))
  }, [unidades])

  const crearOrden = useCrearOrdenMedica()
  const actualizarOrden = useActualizarOrdenMedica()
  const anularOrden = useAnularOrdenMedica()
  const isSaving = crearOrden.isPending || actualizarOrden.isPending

  /* ─────────────── Formulario ─────────────── */

  const [editing, setEditing] = useState<OrdenMedica | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [asistencialId, setAsistencialId] = useState<number | undefined>()
  const [fechaOrden, setFechaOrden] = useState(nowLocalInput)
  const [ambito, setAmbito] = useState<AmbitoOrden | undefined>()
  const [ambitoTouched, setAmbitoTouched] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [tipoFiltro, setTipoFiltro] = useState<TipoOrden | undefined>()
  const [searchText, setSearchText] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [printOrden, setPrintOrden] = useState<OrdenMedica | null>(null)
  const [generatedAt, setGeneratedAt] = useState("")

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText), 300)
    return () => window.clearTimeout(timer)
  }, [searchText])

  // Sugiere el ámbito según el servicio actual de la admisión, sin pisar la
  // elección del usuario ni el de una orden en edición.
  useEffect(() => {
    if (ambitoTouched || editing || ambito) return
    const sugerido = AMBITO_POR_CARE_SCOPE[(admission?.careScopeName ?? "").trim().toUpperCase()]
    if (sugerido) setAmbito(sugerido)
  }, [admission?.careScopeName, ambitoTouched, editing, ambito])

  const {
    data: conceptos,
    isFetching: searchingConceptos,
    isError: conceptosError,
  } = useBuscarConceptosOrden(debouncedSearch, tipoFiltro)

  const asistencialOptions = useMemo(
    () =>
      (asistenciales ?? []).map((a) => ({
        value: a.id,
        label: a.especialidad ? `${a.nombreCompleto} - ${a.especialidad}` : a.nombreCompleto,
      })),
    [asistenciales],
  )

  const conceptoOptions = useMemo(
    () =>
      (conceptos ?? []).map((c) => ({
        value: itemKey(c.conceptoTipo, c.conceptoId),
        label: `${c.codigo} - ${c.descripcion}${c.detalle ? ` (${c.detalle})` : ""} · ${c.tipoOrden}`,
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

  /* ─────────────── Estado de la orden ─────────────── */

  const buildPayload = (): OrdenMedicaRequest | null => {
    if (!admissionId || !asistencialId || !ambito) return null
    const date = new Date(fechaOrden)
    if (!fechaOrden || Number.isNaN(date.getTime())) return null

    return {
      admissionId: Number(admissionId),
      asistencialId,
      fechaOrden: date.toISOString(),
      ambito,
      observaciones: observaciones.trim(),
      items: items.map(itemToRequest),
    }
  }

  const currentSnapshot = JSON.stringify(buildPayload())
  const hasUnsavedChanges = !editing || currentSnapshot !== savedSnapshot
  const canPrint = editing !== null && !hasUnsavedChanges

  const validate = () => {
    const errors: string[] = []
    if (!asistencialId) errors.push("Seleccione el asistencial que genera la orden.")
    if (!fechaOrden) {
      errors.push("Indique la fecha y hora de la orden.")
    } else {
      const date = new Date(fechaOrden)
      if (Number.isNaN(date.getTime())) errors.push("La fecha de la orden no es válida.")
      else if (date.getTime() > Date.now() + FUTURE_TOLERANCE_MS)
        errors.push("La fecha de la orden no puede ser futura.")
    }
    if (!ambito) errors.push("Seleccione el ámbito de la orden.")
    if (items.length === 0) errors.push("Cargue al menos un concepto en la orden.")
    if (items.some((item) => !isValidQuantity(item.cantidad)))
      errors.push("Todas las cantidades deben ser mayores a cero.")
    const medicamentos = items.filter(isMedicine)
    if (medicamentos.some((item) => !item.unidadMedida.trim()))
      errors.push("Indique la unidad de medida de cada medicamento.")
    if (medicamentos.some((item) => !item.viaAdministracionCodigo))
      errors.push("Seleccione la vía de administración de cada medicamento.")
    if (medicamentos.some((item) => !isOptionalIntInRange(item.frecuenciaHoras, 1, 168)))
      errors.push("La frecuencia debe estar entre 1 y 168 horas.")
    if (medicamentos.some((item) => !isOptionalIntInRange(item.duracionDias, 1, 365)))
      errors.push("La duración debe estar entre 1 y 365 días.")
    if (items.some((item) => item.indicaciones.length > 1000))
      errors.push("Las indicaciones no pueden superar 1000 caracteres.")
    return errors
  }

  /* ─────────────── Acciones ─────────────── */

  const resetForm = () => {
    setEditing(null)
    setSavedSnapshot(null)
    setAsistencialId(undefined)
    setFechaOrden(nowLocalInput())
    setAmbito(undefined)
    setAmbitoTouched(false)
    setObservaciones("")
    setItems([])
    setValidationErrors([])
    setSearchText("")
  }

  const loadOrden = (orden: OrdenMedica) => {
    const loadedItems: OrderItem[] = (orden.items ?? []).map((item) => ({
      key: itemKey(item.conceptoTipo, item.conceptoId),
      conceptoTipo: item.conceptoTipo,
      conceptoId: item.conceptoId,
      codigo: item.codigo,
      descripcion: item.descripcion,
      tipoOrden: item.tipoOrden,
      cantidad: item.cantidad,
      indicaciones: item.indicaciones ?? "",
      unidadMedida: item.unidadMedida ?? "",
      viaAdministracionCodigo: item.viaAdministracionCodigo ?? undefined,
      frecuenciaHoras: item.frecuenciaHoras ?? null,
      duracionDias: item.duracionDias ?? null,
    }))
    const fecha = isoToLocalInput(orden.fechaOrden)

    setEditing(orden)
    setAsistencialId(orden.asistencialId)
    setFechaOrden(fecha)
    setAmbito(orden.ambito)
    setAmbitoTouched(true)
    setObservaciones(orden.observaciones ?? "")
    setItems(loadedItems)
    setValidationErrors([])

    // Mismo formato que buildPayload para detectar cambios sin guardar.
    setSavedSnapshot(
      JSON.stringify({
        admissionId: Number(admissionId),
        asistencialId: orden.asistencialId,
        fechaOrden: new Date(fecha).toISOString(),
        ambito: orden.ambito,
        observaciones: (orden.observaciones ?? "").trim(),
        items: loadedItems.map(itemToRequest),
      }),
    )
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const addConcepto = (concepto: ConceptoOrden) => {
    if (!concepto.codigo?.trim() || !concepto.conceptoId) {
      messageApi.error("El concepto seleccionado no tiene código; no se puede cargar.")
      return
    }

    const key = itemKey(concepto.conceptoTipo, concepto.conceptoId)
    if (items.some((item) => item.key === key)) {
      messageApi.info("Ese concepto ya está en la orden; ajuste su cantidad en el listado.")
      return
    }

    setItems((current) => [
      ...current,
      {
        key,
        conceptoTipo: concepto.conceptoTipo,
        conceptoId: concepto.conceptoId,
        codigo: concepto.codigo.trim(),
        descripcion: concepto.descripcion,
        tipoOrden: concepto.tipoOrden,
        cantidad: 1,
        indicaciones: "",
        unidadMedida: concepto.unidadMedida?.trim() ?? "",
        viaAdministracionCodigo:
          concepto.viaAdministracionCodigo &&
          (vias ?? []).some((v) => v.codigo === concepto.viaAdministracionCodigo)
            ? concepto.viaAdministracionCodigo
            : undefined,
        frecuenciaHoras: null,
        duracionDias: null,
      },
    ])
    setSearchText("")
    setValidationErrors([])
    messageApi.success(`${concepto.descripcion} agregado a la orden.`)
  }

  const updateItem = (key: string, changes: Partial<OrderItem>) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...changes } : item)),
    )
  }

  const removeItem = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key))
    messageApi.success("Concepto retirado de la orden.")
  }

  const handleSave = async () => {
    const errors = validate()
    setValidationErrors(errors)
    if (errors.length > 0) {
      messageApi.error("Complete la información obligatoria antes de guardar la orden.")
      return
    }

    const payload = buildPayload()
    if (!payload) {
      messageApi.error("No se pudo construir la orden con los datos ingresados.")
      return
    }

    try {
      const saved = editing
        ? await actualizarOrden.mutateAsync({ id: editing.id, data: payload })
        : await crearOrden.mutateAsync(payload)

      if (!saved?.id) throw new Error("El servidor no devolvió la orden guardada.")

      // Se continúa sobre la orden guardada para poder imprimirla de inmediato.
      setEditing(saved)
      setSavedSnapshot(JSON.stringify(payload))
      messageApi.success(
        editing
          ? `Orden médica N° ${saved.id} actualizada correctamente.`
          : `Orden médica N° ${saved.id} guardada correctamente.`,
      )
    } catch (err) {
      messageApi.error(
        `${errorMessage(err, "No se pudo guardar la orden médica.")} La información diligenciada se conservó.`,
      )
    }
  }

  const openPrint = (orden: OrdenMedica) => {
    if (!orden?.id || !orden.items?.length) {
      messageApi.error("Solo se pueden imprimir órdenes guardadas con al menos un concepto.")
      return
    }
    setGeneratedAt(new Date().toISOString())
    setPrintOrden(orden)
  }

  const handlePrintCurrent = () => {
    if (!canPrint || !editing) {
      messageApi.warning("Guarde la orden antes de imprimirla.")
      return
    }
    openPrint(editing)
  }

  const handleAnular = async (orden: OrdenMedica) => {
    try {
      await anularOrden.mutateAsync({ id: orden.id })
      if (editing?.id === orden.id) resetForm()
      messageApi.success(`Orden médica N° ${orden.id} anulada.`)
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo anular la orden médica."))
    }
  }

  /* ─────────────── Columnas ─────────────── */

  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 100,
      render: (codigo: string) => <strong>{codigo}</strong>,
    },
    { title: "Nombre / descripción", dataIndex: "descripcion", key: "descripcion" },
    {
      title: "Tipo",
      dataIndex: "tipoOrden",
      key: "tipoOrden",
      width: 170,
      render: (tipo: TipoOrden) => <Tag color={TIPO_COLORS[tipo] ?? "default"}>{tipo}</Tag>,
    },
    {
      title: "Cant.",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 110,
      render: (cantidad: number, record) => (
        <InputNumber
          min={0.01}
          max={MAX_CANTIDAD}
          precision={2}
          value={cantidad}
          status={isValidQuantity(cantidad) ? undefined : "error"}
          onChange={(value) =>
            updateItem(record.key, { cantidad: typeof value === "number" ? value : 0 })
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Información adicional",
      dataIndex: "indicaciones",
      key: "indicaciones",
      width: 420,
      render: (indicaciones: string, record) => (
        <div style={{ display: "grid", gap: 6 }}>
          {isMedicine(record) && (
            <div className="mo-med-grid">
              <Select
                size="small"
                showSearch
                optionFilterProp="label"
                loading={loadingVias}
                value={record.viaAdministracionCodigo}
                options={viaOptions}
                placeholder="Vía *"
                status={validationErrors.length > 0 && !record.viaAdministracionCodigo ? "error" : undefined}
                onChange={(value) => updateItem(record.key, { viaAdministracionCodigo: value })}
                popupMatchSelectWidth={false}
              />
              <AutoComplete
                size="small"
                value={record.unidadMedida}
                options={unidadOptions}
                placeholder="Unidad *"
                status={validationErrors.length > 0 && !record.unidadMedida.trim() ? "error" : undefined}
                filterOption={(input, option) =>
                  String(option?.value ?? "").toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => updateItem(record.key, { unidadMedida: String(value ?? "").slice(0, 50) })}
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
                  updateItem(record.key, { frecuenciaHoras: typeof value === "number" ? value : null })
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
                  updateItem(record.key, { duracionDias: typeof value === "number" ? value : null })
                }
              />
            </div>
          )}
          <Input
            size={isMedicine(record) ? "small" : "middle"}
            value={indicaciones}
            maxLength={1000}
            placeholder={INDICACIONES_PLACEHOLDER[record.tipoOrden] ?? "Observaciones"}
            onChange={(event) => updateItem(record.key, { indicaciones: event.target.value })}
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
          title="¿Retirar este concepto de la orden?"
          okText="Retirar"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
          onConfirm={() => removeItem(record.key)}
        >
          <Tooltip title="Eliminar">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ]

  const ordenColumns: ColumnsType<OrdenMedica> = [
    { title: "N°", dataIndex: "id", key: "id", width: 70 },
    {
      title: "Fecha y hora",
      dataIndex: "fechaOrden",
      key: "fechaOrden",
      width: 150,
      render: (value: string) => formatDateTime(value),
    },
    { title: "Ámbito", dataIndex: "ambito", key: "ambito", width: 130 },
    {
      title: "Asistencial",
      key: "asistencial",
      render: (_, record) =>
        record.asistencialEspecialidad
          ? `${record.asistencialNombre} - ${record.asistencialEspecialidad}`
          : record.asistencialNombre,
    },
    {
      title: "Conceptos",
      key: "conceptos",
      width: 100,
      align: "center",
      render: (_, record) => record.items?.length ?? 0,
    },
    {
      title: "Registrado por",
      dataIndex: "usuarioNombre",
      key: "usuarioNombre",
      width: 170,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 130,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          <Tooltip title="Imprimir orden">
            <Button type="text" icon={<PrinterOutlined />} onClick={() => openPrint(record)} />
          </Tooltip>
          <Tooltip
            title={
              record.items?.some((item) => item.cantidadAplicada > 0)
                ? "La orden ya tiene aplicaciones; no se puede editar"
                : "Editar"
            }
          >
            <Button
              type="text"
              icon={<EditOutlined />}
              disabled={record.items?.some((item) => item.cantidadAplicada > 0)}
              onClick={() => loadOrden(record)}
            />
          </Tooltip>
          <Popconfirm
            title={`¿Anular la orden N° ${record.id}?`}
            description="La orden dejará de aparecer en el historial del paciente."
            okText="Anular"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, loading: anularOrden.isPending }}
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
        <FileAddOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Órdenes Médicas</Title>
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
        <Empty description="Selecciona un paciente desde Evolucionar HC para generar órdenes médicas.">
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

  const showErrors = validationErrors.length > 0

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

      {/* ════ Datos de la orden ════ */}
      <div className="mo-card">
        <div className="mo-card-title" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <span>{editing ? `Orden médica N° ${editing.id}` : "Nueva orden médica"}</span>
          {editing && (
            <Button size="small" icon={<PlusOutlined />} onClick={resetForm}>
              Nueva orden
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

        <div className="mo-form-grid">
          <div className="mo-field">
            <span>
              Asistencial <span className="mo-required">*</span>
            </span>
            <Select
              value={asistencialId}
              onChange={(value) => setAsistencialId(value)}
              options={asistencialOptions}
              loading={loadingAsistenciales}
              placeholder="Seleccione el profesional que ordena"
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
              Fecha orden <span className="mo-required">*</span>
            </span>
            <Input
              type="datetime-local"
              value={fechaOrden}
              max={nowLocalInput()}
              status={showErrors && !fechaOrden ? "error" : undefined}
              onChange={(event) => setFechaOrden(event.target.value)}
            />
          </div>

          <div className="mo-field">
            <span>
              Ámbito de la orden <span className="mo-required">*</span>
            </span>
            <Select
              value={ambito}
              onChange={(value: AmbitoOrden) => {
                setAmbito(value)
                setAmbitoTouched(true)
              }}
              options={AMBITOS_ORDEN.map((value) => ({ value, label: value }))}
              placeholder="Seleccione el ámbito"
              status={showErrors && !ambito ? "error" : undefined}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="mo-search-grid">
          <Select
            value={tipoFiltro}
            onChange={(value) => setTipoFiltro(value)}
            allowClear
            placeholder="Todos los tipos"
            options={TIPOS_ORDEN.map((value) => ({ value, label: value }))}
            style={{ width: "100%" }}
          />
          <Select
            showSearch
            value={null}
            searchValue={searchText}
            onSearch={setSearchText}
            filterOption={false}
            options={conceptoOptions}
            onSelect={(_value, option) => {
              const concepto = (option as { concepto?: ConceptoOrden }).concepto
              if (concepto) addConcepto(concepto)
            }}
            placeholder="Buscar medicamentos, laboratorios, rayos X, procedimientos... por código o nombre"
            suffixIcon={searchingConceptos ? <Spin size="small" /> : <SearchOutlined />}
            notFoundContent={
              searchingConceptos
                ? "Buscando..."
                : conceptosError
                  ? "No se pudo consultar el catálogo"
                  : debouncedSearch.trim() || tipoFiltro
                    ? "Sin resultados"
                    : "Escriba un código o nombre para buscar"
            }
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* ════ Órdenes cargadas ════ */}
      <div className="mo-card mo-card-flush">
        <div className="mo-table-header">
          <div>
            <div style={{ fontWeight: 700 }}>Órdenes cargadas</div>
            <div className="mo-muted">{items.length} concepto(s) en la orden</div>
          </div>
          {editing && hasUnsavedChanges && <Tag color="orange">Cambios sin guardar</Tag>}
          {editing && !hasUnsavedChanges && <Tag color="green">Guardada</Tag>}
        </div>

        <Table<OrderItem>
          rowKey="key"
          columns={itemColumns}
          dataSource={items}
          pagination={false}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: <Empty description="Busque y seleccione los conceptos a ordenar." />,
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
            placeholder="Observaciones de la orden (opcional)"
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
          <Tooltip title={canPrint ? "" : "Guarde la orden antes de imprimirla"}>
            <Button icon={<PrinterOutlined />} disabled={!canPrint} onClick={handlePrintCurrent}>
              Imprimir orden
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* ════ Historial ════ */}
      <div className="mo-card mo-card-flush">
        <div className="mo-table-header">
          <div style={{ fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
            <HistoryOutlined /> Órdenes médicas de esta admisión
          </div>
          <Tag color="green">{ordenes?.length ?? 0}</Tag>
        </div>
        {ordenesError ? (
          <Alert
            type="error"
            showIcon
            style={{ margin: 16 }}
            title="No se pudieron cargar las órdenes médicas."
          />
        ) : (
          <Table<OrdenMedica>
            rowKey="id"
            columns={ordenColumns}
            dataSource={ordenes ?? []}
            loading={loadingOrdenes}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 900 }}
            expandable={{
              expandedRowRender: (record) => (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {(record.items ?? []).map((item) => (
                    <li key={item.id} style={{ marginBottom: 4 }}>
                      <Tag color={TIPO_COLORS[item.tipoOrden] ?? "default"}>{item.tipoOrden}</Tag>
                      <Tag color={ESTADO_COLORS[item.estado] ?? "default"}>{item.estado}</Tag>
                      {item.codigo} - {item.descripcion} · {item.cantidadAplicada}/{item.cantidad}
                      {item.unidadMedida ? ` ${item.unidadMedida}` : ""}
                      {item.viaAdministracion ? ` · ${item.viaAdministracion}` : ""}
                      {item.frecuenciaHoras ? ` · c/${item.frecuenciaHoras} h` : ""}
                      {item.duracionDias ? ` · ${item.duracionDias} día(s)` : ""}
                      {item.indicaciones ? ` — ${item.indicaciones}` : ""}
                    </li>
                  ))}
                </ul>
              ),
            }}
            locale={{ emptyText: "Aún no hay órdenes médicas para esta admisión." }}
          />
        )}
      </div>

      <ClinicalPrintPreviewModal
        open={printOrden !== null}
        onClose={() => setPrintOrden(null)}
        title="Orden médica"
        renderDocument={(provider) =>
          printOrden ? (
            <MedicalOrderPrintDocument
              provider={provider}
              patient={printPatient}
              admissionId={admissionId}
              admissionDate={admissionDate}
              contractName={admission?.convenioNombre || patientRecord?.contractName || ""}
              orden={printOrden}
              generatedAt={generatedAt}
            />
          ) : null
        }
      />
    </Container>
  )
}

export default MedicalOrdersContainer
