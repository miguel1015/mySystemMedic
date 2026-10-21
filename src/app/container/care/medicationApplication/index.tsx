"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import {
  useGetOrdenesParaAplicar,
  useGetProfesionalesAplicacion,
  useRegistrarAplicacion,
} from "@/core/hooks/care/aplicacionesOrdenes/useAplicacionesOrdenes"
import { useGetViasAdministracion } from "@/core/hooks/care/ordenesMedicas/useOrdenesMedicas"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useCurrentDoctor } from "@/core/hooks/users/useCurrentDoctor"
import type { AplicacionOrden, OrdenActiva } from "@/core/interfaces/care/aplicacionOrden"
import { AMBITOS_ORDEN, type AmbitoOrden, type EstadoOrdenItem } from "@/core/interfaces/care/ordenMedica"
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileAddOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  PrinterOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Input,
  InputNumber,
  Segmented,
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
import MedicationApplicationPrintPreviewModal from "./MedicationApplicationPrintPreviewModal"
import "./medicationApplication.css"

const { TextArea } = Input

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000
const MAX_DOSIS = 1000000
// Las vencidas siguen admitiendo aplicaciones (registro tardío); solo se advierte.
const APPLICABLE_STATES: EstadoOrdenItem[] = ["Pendiente", "En proceso", "Vencida"]

const ESTADO_COLORS: Record<EstadoOrdenItem, string> = {
  Pendiente: "gold",
  "En proceso": "blue",
  Aplicada: "green",
  Vencida: "red",
  Cancelada: "default",
}

const pad = (n: number) => n.toString().padStart(2, "0")
const todayInput = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const nowTimeInput = () => {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
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

const formatQty = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "")

const isMedicine = (orden: OrdenActiva) => orden.tipoOrden === "Medicamento"

// En medicamentos la cantidad de la orden son unidades (ampollas, viales...): lo
// que descuenta son las unidades consumidas. Una orden fraccionaria admite
// completar la última unidad.
const maxUnidades = (orden: OrdenActiva) => Math.ceil(orden.cantidadPendiente)

// En medicamentos la dosis es libre y la diligencia quien aplica; en estudios y
// procedimientos se sugiere 1 sin superar lo pendiente.
const suggestedQuantity = (orden: OrdenActiva) =>
  isMedicine(orden) || orden.cantidadPendiente <= 0 ? null : Math.min(1, orden.cantidadPendiente)

const suggestedUnidades = (orden: OrdenActiva) =>
  isMedicine(orden) && maxUnidades(orden) > 0 ? 1 : null

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const MedicationApplicationContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()

  const admissionId = searchParams.get("admissionId") || undefined

  /* ─────────────── Datos remotos ─────────────── */

  const { data: activeAdmissions, isLoading: loadingActiveAdmissions } = useActiveAdmissions()
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
    data: ordenes,
    isLoading: loadingOrdenes,
    isError: ordenesError,
  } = useGetOrdenesParaAplicar(admissionId)
  const { data: profesionales, isLoading: loadingProfesionales } = useGetProfesionalesAplicacion()
  const { data: vias, isLoading: loadingVias } = useGetViasAdministracion()
  const { me } = useCurrentDoctor()
  const registrar = useRegistrarAplicacion()

  /* ─────────────── Estado de la vista ─────────────── */

  const [filtro, setFiltro] = useState<"activas" | "todas">("activas")
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [fecha, setFecha] = useState(todayInput)
  const [hora, setHora] = useState(nowTimeInput)
  const [cantidad, setCantidad] = useState<number | null>(null)
  const [unidades, setUnidades] = useState<number | null>(null)
  const [viaCodigo, setViaCodigo] = useState<string | undefined>()
  const [ambito, setAmbito] = useState<AmbitoOrden | undefined>()
  const [profesionalId, setProfesionalId] = useState<number | undefined>()
  const [observaciones, setObservaciones] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const ordenesList = useMemo(() => ordenes ?? [], [ordenes])
  const activas = useMemo(
    () => ordenesList.filter((o) => APPLICABLE_STATES.includes(o.estado)),
    [ordenesList],
  )
  const visibles = filtro === "activas" ? activas : ordenesList
  const hayAplicaciones = ordenesList.some((o) => o.aplicaciones?.length)
  const [printOpen, setPrintOpen] = useState(false)
  const selected = ordenesList.find((o) => o.ordenMedicaItemId === selectedItemId) ?? null
  const canApply = selected !== null && APPLICABLE_STATES.includes(selected.estado)

  // Profesional por defecto: el usuario en sesión si es un profesional habilitado.
  useEffect(() => {
    if (profesionalId !== undefined || !profesionales?.length || !me?.id) return
    const currentId = Number(me.id)
    if (profesionales.some((p) => p.id === currentId)) setProfesionalId(currentId)
  }, [profesionales, me?.id, profesionalId])

  const selectOrden = (orden: OrdenActiva) => {
    setSelectedItemId(orden.ordenMedicaItemId)
    setFecha(todayInput())
    setHora(nowTimeInput())
    setCantidad(suggestedQuantity(orden))
    setUnidades(suggestedUnidades(orden))
    setViaCodigo(orden.viaAdministracionCodigo ?? undefined)
    // Por defecto el ámbito de la orden; se cambia si el paciente pasó a otro servicio.
    setAmbito(orden.ambito)
    setObservaciones("")
    setValidationErrors([])
  }

  const admissionOptions = useMemo(
    () =>
      (activeAdmissions ?? []).map((a) => ({
        value: String(a.id),
        label: `${a.patientFullName} · ${a.documentNumber} · Adm. ${a.id} · ${a.careScope}`,
      })),
    [activeAdmissions],
  )

  const profesionalOptions = useMemo(
    () =>
      (profesionales ?? []).map((p) => ({
        value: p.id,
        label: [p.nombreCompleto, p.cargo, p.identificacion].filter(Boolean).join(" · "),
      })),
    [profesionales],
  )

  const viaOptions = useMemo(
    () => (vias ?? []).map((v) => ({ value: v.codigo, label: v.descripcion })),
    [vias],
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
  const identification = [
    patientRecord?.documentTypeCode || admission?.documentTypeCode,
    patientRecord?.documentNumber || admission?.documentoPatiente || searchParams.get("documentNumber"),
  ]
    .filter(Boolean)
    .join(" ")

  /* ─────────────── Registrar ─────────────── */

  const validate = (orden: OrdenActiva) => {
    const errors: string[] = []
    const aplicacion = new Date(`${fecha}T${hora}`)

    if (!fecha || !hora) {
      errors.push("Indique la fecha y la hora de aplicación.")
    } else if (Number.isNaN(aplicacion.getTime())) {
      errors.push("La fecha u hora de aplicación no es válida.")
    } else {
      if (aplicacion.getTime() > Date.now() + FUTURE_TOLERANCE_MS)
        errors.push("La fecha y hora de aplicación no puede ser futura.")
      if (aplicacion.getTime() < new Date(orden.fechaOrden).getTime() - 60 * 1000)
        errors.push("La aplicación no puede ser anterior a la fecha de la orden.")
    }

    if (cantidad === null || !Number.isFinite(cantidad) || cantidad <= 0)
      errors.push("La cantidad administrada debe ser mayor a cero.")
    else if (!isMedicine(orden) && cantidad > orden.cantidadPendiente)
      errors.push(
        `La cantidad administrada (${formatQty(cantidad)}) supera la cantidad pendiente (${formatQty(orden.cantidadPendiente)}).`,
      )

    if (isMedicine(orden)) {
      if (unidades === null || !Number.isInteger(unidades) || unidades <= 0)
        errors.push("Las unidades consumidas deben ser un número entero mayor a cero.")
      else if (unidades > maxUnidades(orden))
        errors.push(
          `Las unidades consumidas (${unidades}) superan la cantidad pendiente (${formatQty(orden.cantidadPendiente)}).`,
        )
    }

    if (isMedicine(orden) && !viaCodigo) errors.push("Seleccione la vía de administración.")
    if (!ambito) errors.push("Seleccione el ámbito de la aplicación.")
    if (!profesionalId) errors.push("Seleccione el profesional que aplica.")

    return errors
  }

  const handleRegistrar = async () => {
    if (!selected) {
      messageApi.error("Seleccione una orden médica para registrar la aplicación.")
      return
    }
    if (!canApply) {
      messageApi.error(`La orden está ${selected.estado.toLowerCase()} y no admite aplicaciones.`)
      return
    }

    const errors = validate(selected)
    setValidationErrors(errors)
    if (errors.length > 0) {
      messageApi.error("Revise la información de la aplicación.")
      return
    }

    try {
      const actualizada = await registrar.mutateAsync({
        ordenMedicaItemId: selected.ordenMedicaItemId,
        fechaHoraAplicacion: new Date(`${fecha}T${hora}`).toISOString(),
        cantidad: cantidad!,
        unidadesConsumidas: isMedicine(selected) ? unidades : null,
        viaAdministracionCodigo: isMedicine(selected) ? viaCodigo : null,
        ambito: ambito!,
        profesionalId: profesionalId!,
        observaciones: observaciones.trim(),
      })

      const pendiente = actualizada?.cantidadPendiente ?? 0
      messageApi.success(
        pendiente > 0
          ? `${isMedicine(selected) ? "Aplicación" : "Realización"} registrada. Pendiente: ${formatQty(pendiente)} unidad(es).`
          : "Registro exitoso. La orden quedó completamente aplicada.",
      )
      setObservaciones("")
      setValidationErrors([])
      setHora(nowTimeInput())
      // La dosis se conserva: suele repetirse en la siguiente aplicación.
      if (actualizada && !isMedicine(actualizada)) setCantidad(suggestedQuantity(actualizada))
      setUnidades(actualizada ? suggestedUnidades(actualizada) : null)
    } catch (err) {
      messageApi.error(errorMessage(err, "No se pudo registrar la aplicación."))
    }
  }

  /* ─────────────── Historial de la orden ─────────────── */

  const historyColumns: ColumnsType<AplicacionOrden> = [
    {
      title: "Fecha y hora",
      dataIndex: "fechaHoraAplicacion",
      key: "fecha",
      width: 150,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Dosis / cantidad",
      key: "cantidad",
      width: 130,
      render: (_, r) =>
        r.tipoOrden === "Medicamento"
          ? `${formatQty(r.cantidad)}${r.unidadMedida ? ` ${r.unidadMedida}` : ""}`
          : formatQty(r.cantidad),
    },
    {
      title: "Unidades",
      dataIndex: "unidadesConsumidas",
      key: "unidades",
      width: 100,
    },
    {
      title: "Vía",
      dataIndex: "viaAdministracion",
      key: "via",
      width: 140,
      render: (value?: string | null) => value || "—",
    },
    {
      title: "Ámbito",
      dataIndex: "ambito",
      key: "ambito",
      width: 130,
    },
    {
      title: "Profesional",
      key: "profesional",
      render: (_, r) => (
        <div>
          <div>{r.profesionalNombre}</div>
          <small className="ma-muted">
            {[r.profesionalCargo, r.profesionalDocumento].filter(Boolean).join(" · ")}
          </small>
        </div>
      ),
    },
    {
      title: "Evento / observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (value?: string | null) => value || "—",
    },
    {
      title: "Registrado por",
      key: "registro",
      width: 160,
      render: (_, r) => (
        <div>
          <div>{r.usuarioNombre}</div>
          <small className="ma-muted">{formatDateTime(r.createdAt)}</small>
        </div>
      ),
    },
  ]

  /* ─────────────── Render ─────────────── */

  const header = (
    <div className="ma-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MedicineBoxOutlined style={{ fontSize: 22, color: "#389e0d" }} />
        <Title level={3}>Aplicación de Medicamentos</Title>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
        {admissionId && (
          <Tooltip title={hayAplicaciones ? undefined : "No hay aplicaciones registradas para imprimir."}>
            <Button
              icon={<PrinterOutlined />}
              disabled={!hayAplicaciones}
              onClick={() => setPrintOpen(true)}
            >
              Imprimir
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  )

  const patientSelector = (
    <div className="ma-card">
      <span className="ma-label">Paciente con admisión activa</span>
      <Select
        showSearch
        optionFilterProp="label"
        value={admissionId}
        options={admissionOptions}
        loading={loadingActiveAdmissions}
        placeholder="Busque por nombre, documento o número de admisión"
        onChange={(value: string) =>
          router.replace(`/care/medicationApplication?admissionId=${encodeURIComponent(value)}`)
        }
        notFoundContent={loadingActiveAdmissions ? "Cargando..." : "No hay admisiones activas"}
        style={{ width: "100%" }}
      />
    </div>
  )

  if (!admissionId) {
    return (
      <Container>
        {header}
        {patientSelector}
        <Empty description="Seleccione un paciente para consultar sus órdenes médicas." />
      </Container>
    )
  }

  const patientItems = [
    { label: "Paciente", value: patientName },
    { label: "Identificación", value: identification },
    { label: "N° Admisión", value: admissionId },
    { label: "Fecha de admisión", value: formatDateTime(admission?.admissionDate) },
    { label: "Servicio", value: admission?.serviceGroupName || admission?.serviceClassificationName },
    { label: "Ámbito de atención", value: admission?.careScopeName },
  ]

  const renderOrdenCard = (orden: OrdenActiva) => {
    const isSelected = orden.ordenMedicaItemId === selectedItemId
    const detalleMedicamento = [
      `Cant.: ${formatQty(orden.cantidad)} und.`,
      orden.unidadMedida ? `Dosis en ${orden.unidadMedida}` : "",
      orden.frecuenciaHoras ? `c/${orden.frecuenciaHoras} horas` : "",
      orden.duracionDias ? `${orden.duracionDias} día(s)` : "",
      orden.viaAdministracion ?? "",
    ]
      .filter(Boolean)
      .join(" – ")

    return (
      <button
        type="button"
        key={orden.ordenMedicaItemId}
        className={`ma-order-card${isSelected ? " ma-order-card--selected" : ""}`}
        onClick={() => selectOrden(orden)}
      >
        <div className="ma-order-card-top">
          <strong className="ma-order-name">{orden.descripcion}</strong>
          <Tag color={ESTADO_COLORS[orden.estado] ?? "default"}>{orden.estado}</Tag>
        </div>
        <div className="ma-muted">
          {orden.tipoOrden} · Código {orden.codigo}
        </div>
        <div className="ma-muted">
          Orden #{orden.ordenMedicaId} – {formatDateTime(orden.fechaOrden)}
        </div>
        <div>{isMedicine(orden) ? detalleMedicamento : `Cant.: ${formatQty(orden.cantidad)}`}</div>
        <div className="ma-order-progress">
          {isMedicine(orden) ? "Aplicadas" : "Realizadas"}: {formatQty(orden.cantidadAplicada)}/
          {formatQty(orden.cantidad)}
          {orden.cantidadPendiente > 0 && ` · Pendiente: ${formatQty(orden.cantidadPendiente)}`}
        </div>
      </button>
    )
  }

  const blockedReason: Record<string, string> = {
    Aplicada: "Esta orden ya fue aplicada/realizada en su totalidad.",
    Cancelada: "Esta orden fue cancelada y no admite aplicaciones.",
  }

  const showErrors = validationErrors.length > 0

  return (
    <Container>
      {contextHolder}
      {header}
      {patientSelector}

      <MedicationApplicationPrintPreviewModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        admission={admission}
        patient={patientRecord}
        ordenes={ordenesList}
      />

      {/* ════ Encabezado del paciente ════ */}
      <div className="ma-card">
        <div className="ma-card-title">
          <UserOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} /> Información del paciente
        </div>
        {admissionError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            title="No se pudo cargar la admisión seleccionada."
          />
        )}
        {loadingAdmission ? (
          <Skeleton active title={false} paragraph={{ rows: 2 }} />
        ) : (
          <div className="ma-patient-grid">
            {patientItems.map((item) => (
              <div key={item.label}>
                <span className="ma-label">{item.label}</span>
                <span className="ma-value">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {ordenesError ? (
        <Alert type="error" showIcon title="No se pudieron consultar las órdenes médicas del paciente." />
      ) : loadingOrdenes ? (
        <div className="ma-card" style={{ textAlign: "center" }}>
          <Spin />
        </div>
      ) : ordenesList.length === 0 ? (
        <div className="ma-card">
          <Empty description="No existen órdenes médicas disponibles para aplicación o realización. Solo se puede aplicar lo que haya sido ordenado.">
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => router.push(`/care/medicalOrders?admissionId=${encodeURIComponent(admissionId)}`)}
            >
              Ir a Órdenes Médicas
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="ma-layout">
          {/* ════ Órdenes activas ════ */}
          <aside className="ma-card ma-orders">
            <div className="ma-card-title" style={{ justifyContent: "space-between" }}>
              <span>Órdenes activas ({activas.length})</span>
              <Segmented
                size="small"
                value={filtro}
                onChange={(value) => setFiltro(value as "activas" | "todas")}
                options={[
                  { label: "Activas", value: "activas" },
                  { label: "Todas", value: "todas" },
                ]}
              />
            </div>
            {visibles.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay órdenes pendientes de aplicación. Consulte 'Todas' para ver el historial."
              />
            ) : (
              <div className="ma-order-list">{visibles.map(renderOrdenCard)}</div>
            )}
          </aside>

          {/* ════ Detalle y registro ════ */}
          <section className="ma-detail">
            {!selected ? (
              <div className="ma-card">
                <Empty description="Seleccione una orden del listado para registrar su aplicación o realización." />
              </div>
            ) : (
              <>
                <div className="ma-card">
                  <div className="ma-card-title" style={{ justifyContent: "space-between" }}>
                    <span>
                      {selected.descripcion}{" "}
                      <Tag color={ESTADO_COLORS[selected.estado] ?? "default"}>{selected.estado}</Tag>
                    </span>
                  </div>
                  <Descriptions
                    size="small"
                    bordered
                    column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                    items={[
                      { key: "orden", label: "Orden médica", children: `#${selected.ordenMedicaId}` },
                      { key: "fecha", label: "Fecha de la orden", children: formatDateTime(selected.fechaOrden) },
                      { key: "concepto", label: "Concepto", children: `${selected.codigo} - ${selected.descripcion}` },
                      { key: "tipo", label: "Tipo", children: selected.tipoOrden },
                      {
                        key: "asistencial",
                        label: "Ordenado por",
                        children: [selected.asistencialNombre, selected.asistencialEspecialidad]
                          .filter(Boolean)
                          .join(" - "),
                      },
                      { key: "ambito", label: "Ámbito de la orden", children: selected.ambito },
                      {
                        key: "ordenada",
                        label: "Cantidad ordenada",
                        children: isMedicine(selected)
                          ? `${formatQty(selected.cantidad)} unidad(es)`
                          : formatQty(selected.cantidad),
                      },
                      ...(isMedicine(selected)
                        ? [{ key: "unidad", label: "Unidad de la dosis", children: selected.unidadMedida || "—" }]
                        : []),
                      {
                        key: "pendiente",
                        label: "Aplicada / pendiente",
                        children: `${formatQty(selected.cantidadAplicada)} / ${formatQty(selected.cantidadPendiente)}`,
                      },
                      ...(isMedicine(selected)
                        ? [
                            {
                              key: "posologia",
                              label: "Posología",
                              children:
                                [
                                  selected.viaAdministracion,
                                  selected.frecuenciaHoras ? `c/${selected.frecuenciaHoras} h` : "",
                                  selected.duracionDias ? `${selected.duracionDias} día(s)` : "",
                                ]
                                  .filter(Boolean)
                                  .join(" · ") || "—",
                            },
                          ]
                        : []),
                      {
                        key: "vence",
                        label: "Vence",
                        children: selected.fechaVencimiento ? formatDateTime(selected.fechaVencimiento) : "Sin vencimiento",
                      },
                      ...(selected.indicaciones
                        ? [{ key: "indicaciones", label: "Indicaciones", children: selected.indicaciones }]
                        : []),
                    ]}
                  />
                </div>

                <div className="ma-card">
                  <div className="ma-card-title">
                    <CheckCircleOutlined style={{ color: "#389e0d" }} />
                    {isMedicine(selected) ? "Datos de la aplicación" : "Registro de realización"}
                  </div>

                  {!canApply ? (
                    <Alert
                      type={selected.estado === "Aplicada" ? "success" : "warning"}
                      showIcon
                      title={blockedReason[selected.estado] ?? "La orden no admite aplicaciones."}
                    />
                  ) : (
                    <>
                      {selected.estado === "Vencida" && (
                        <Alert
                          type="warning"
                          showIcon
                          style={{ marginBottom: 16 }}
                          title="Esta orden está vencida"
                          description={`Venció el ${formatDateTime(selected.fechaVencimiento)}. Puede registrar la aplicación, pero quedará constancia de que se hizo sobre una orden vencida.`}
                        />
                      )}
                      {showErrors && (
                        <Alert
                          type="error"
                          showIcon
                          style={{ marginBottom: 16 }}
                          title="No se puede registrar"
                          description={
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {validationErrors.map((error) => (
                                <li key={error}>{error}</li>
                              ))}
                            </ul>
                          }
                        />
                      )}

                      <div className="ma-form-grid">
                        <label className="ma-field">
                          <span>
                            Fecha de aplicación <span className="ma-required">*</span>
                          </span>
                          <Input
                            type="date"
                            value={fecha}
                            max={todayInput()}
                            status={showErrors && !fecha ? "error" : undefined}
                            onChange={(e) => setFecha(e.target.value)}
                          />
                        </label>
                        <label className="ma-field">
                          <span>
                            Hora de aplicación <span className="ma-required">*</span>
                          </span>
                          <Input
                            type="time"
                            value={hora}
                            status={showErrors && !hora ? "error" : undefined}
                            onChange={(e) => setHora(e.target.value)}
                          />
                        </label>
                        <label className="ma-field">
                          <span>
                            Cantidad administrada <span className="ma-required">*</span>
                          </span>
                          <InputNumber
                            min={0.01}
                            max={isMedicine(selected) ? MAX_DOSIS : selected.cantidadPendiente}
                            precision={2}
                            value={cantidad}
                            placeholder={isMedicine(selected) ? "Dosis, p. ej. 500" : undefined}
                            status={
                              showErrors &&
                              (cantidad === null ||
                                cantidad <= 0 ||
                                (!isMedicine(selected) && cantidad > selected.cantidadPendiente))
                                ? "error"
                                : undefined
                            }
                            onChange={(value) => setCantidad(typeof value === "number" ? value : null)}
                            style={{ width: "100%" }}
                          />
                          {!isMedicine(selected) && (
                            <small className="ma-muted">
                              Máximo pendiente: {formatQty(selected.cantidadPendiente)}
                            </small>
                          )}
                        </label>
                        <label className="ma-field">
                          <span>Unidad de medida</span>
                          <Input value={selected.unidadMedida || (isMedicine(selected) ? "—" : "Unidad")} disabled />
                        </label>
                        {isMedicine(selected) && (
                          <label className="ma-field">
                            <span>
                              Unidades consumidas <span className="ma-required">*</span>
                            </span>
                            <InputNumber
                              min={1}
                              max={maxUnidades(selected)}
                              precision={0}
                              value={unidades}
                              status={
                                showErrors &&
                                (unidades === null || unidades <= 0 || unidades > maxUnidades(selected))
                                  ? "error"
                                  : undefined
                              }
                              onChange={(value) => setUnidades(typeof value === "number" ? value : null)}
                              style={{ width: "100%" }}
                            />
                          </label>
                        )}
                        {isMedicine(selected) && (
                          <label className="ma-field">
                            <span>
                              Vía de administración <span className="ma-required">*</span>
                            </span>
                            <Select
                              showSearch
                              optionFilterProp="label"
                              value={viaCodigo}
                              options={viaOptions}
                              loading={loadingVias}
                              placeholder="Seleccione la vía"
                              status={showErrors && !viaCodigo ? "error" : undefined}
                              onChange={(value) => setViaCodigo(value)}
                              style={{ width: "100%" }}
                            />
                          </label>
                        )}
                        <label className="ma-field">
                          <span>
                            Ámbito <span className="ma-required">*</span>
                          </span>
                          <Select
                            value={ambito}
                            options={AMBITOS_ORDEN.map((value) => ({ value, label: value }))}
                            status={showErrors && !ambito ? "error" : undefined}
                            onChange={(value: AmbitoOrden) => setAmbito(value)}
                            style={{ width: "100%" }}
                          />
                          {ambito && ambito !== selected.ambito && (
                            <small className="ma-muted">
                              Distinto al de la orden ({selected.ambito}).
                            </small>
                          )}
                        </label>
                        <label className="ma-field ma-field--wide">
                          <span>
                            Profesional que {isMedicine(selected) ? "aplica" : "realiza"}{" "}
                            <span className="ma-required">*</span>
                          </span>
                          <Select
                            showSearch
                            optionFilterProp="label"
                            value={profesionalId}
                            options={profesionalOptions}
                            loading={loadingProfesionales}
                            placeholder="Seleccione el profesional"
                            status={showErrors && !profesionalId ? "error" : undefined}
                            onChange={(value) => setProfesionalId(value)}
                            style={{ width: "100%" }}
                          />
                        </label>
                        <label className="ma-field ma-field--full">
                          <span>
                            {isMedicine(selected) ? "Evento de la aplicación" : "Observaciones de la realización"}
                          </span>
                          <TextArea
                            rows={3}
                            maxLength={2000}
                            showCount
                            value={observaciones}
                            placeholder={
                              isMedicine(selected)
                                ? "Respuesta del paciente, reacciones adversas, eventos presentados u observaciones..."
                                : "Observaciones relevantes de la realización del estudio o procedimiento..."
                            }
                            onChange={(e) => setObservaciones(e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="ma-actions">
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          loading={registrar.isPending}
                          onClick={handleRegistrar}
                        >
                          {isMedicine(selected) ? "Registrar aplicación" : "Registrar realización"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                <div className="ma-card ma-card--flush">
                  <div className="ma-table-header">
                    <HistoryOutlined /> {isMedicine(selected) ? "Aplicaciones registradas" : "Realizaciones registradas"} (
                    {selected.aplicaciones?.length ?? 0})
                  </div>
                  <Table<AplicacionOrden>
                    rowKey="id"
                    size="small"
                    columns={historyColumns}
                    dataSource={selected.aplicaciones ?? []}
                    pagination={{ pageSize: 5, hideOnSinglePage: true }}
                    scroll={{ x: 900 }}
                    locale={{ emptyText: "Aún no hay registros para esta orden." }}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </Container>
  )
}

export default MedicationApplicationContainer
