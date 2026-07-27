"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteDatosClinicosEgreso } from "@/core/hooks/care/dischargeNote/useSaveDatosClinicosEgreso"
import { useDeleteDiagnosticoEgreso } from "@/core/hooks/care/dischargeNote/useSaveDiagnosticoEgreso"
import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission"
import { useGetDatosClinicosEgresoById } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoById"
import { useGetDiagnosticoEgresoById } from "@/core/hooks/care/dischargeNote/useGetDiagnosticoEgresoById"
import type { DatosClinicosEgresoResponse, DiagnosticoEgresoResponse } from "@/core/interfaces/care/hciInicial"
import { NotaEgresoDetailView, type NotaEgresoViewData } from "./NotaEgresoDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (datosClinicos: DatosClinicosEgresoResponse, diagnostico: DiagnosticoEgresoResponse | null) => void
  messageApi: MessageInstance
}

const formatDateTime = (value: string) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const excerpt = (texto: string, max = 150) =>
  texto.length > max ? `${texto.slice(0, max)}…` : texto

const buildViewData = (
  datosClinicos: DatosClinicosEgresoResponse,
  diagnostico: DiagnosticoEgresoResponse | null,
): NotaEgresoViewData => ({
  vitals: {
    ta: datosClinicos.tensionArterial ?? "",
    fc: datosClinicos.frecuenciaCardiaca ?? 0,
    fr: datosClinicos.frecuenciaRespiratoria ?? 0,
    temperature: datosClinicos.temperatura ?? 0,
    saturation: datosClinicos.saturacionOxigeno ?? 0,
    weight: datosClinicos.peso ?? 0,
    height: datosClinicos.talla ? datosClinicos.talla * 100 : 0,
  },
  bmi: datosClinicos.imc ? String(datosClinicos.imc) : "",
  condicionesGenerales: datosClinicos.condicionesGeneralesSalida,
  cabezaCuello: datosClinicos.cabezaCuello ?? "",
  torax: datosClinicos.torax ?? "",
  abdomen: datosClinicos.abdomen ?? "",
  extremidades: datosClinicos.extremidades ?? "",
  sistemaNervioso: datosClinicos.sistemaNervioso ?? "",
  genitourinario: datosClinicos.genitourinario ?? "",
  evolucionesTxt: datosClinicos.evoluciones ?? "",
  justificacion: datosClinicos.justificacionHospitalizacion ?? "",
  ordenes: datosClinicos.ordenes ?? "",
  ambitoEgreso: diagnostico?.nombreAmbitoEgreso,
  fechaEgreso: diagnostico ? formatDateTime(diagnostico.fechaEgreso) : "",
  diag1: diagnostico ? `${diagnostico.codigoDiagnosticoEgreso1} - ${diagnostico.descripcionDiagnosticoEgreso1}` : undefined,
  diag2:
    diagnostico?.codigoDiagnosticoEgreso2 && diagnostico?.descripcionDiagnosticoEgreso2
      ? `${diagnostico.codigoDiagnosticoEgreso2} - ${diagnostico.descripcionDiagnosticoEgreso2}`
      : undefined,
  diag3:
    diagnostico?.codigoDiagnosticoEgreso3 && diagnostico?.descripcionDiagnosticoEgreso3
      ? `${diagnostico.codigoDiagnosticoEgreso3} - ${diagnostico.descripcionDiagnosticoEgreso3}`
      : undefined,
  finalidadConsulta: diagnostico?.nombreFinalidadConsulta,
  causaExterna: diagnostico?.nombreCausaExterna,
  condicionSalida: diagnostico?.descripcionCondicionSalida,
  diagnosticoMuerte: "",
  fechaMuerte: "",
})

export const DischargeNoteRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: notasEgreso = [], isLoading } = useGetDatosClinicosEgresoByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selectedDatosClinicos, isLoading: isLoadingDatosClinicos } = useGetDatosClinicosEgresoById(
    open ? selectedId : null,
  )
  const { data: selectedDiagnostico, isLoading: isLoadingDiagnostico } = useGetDiagnosticoEgresoById(
    open ? selectedDatosClinicos?.diagnosticoEgresoId : null,
  )
  const deleteDatosClinicos = useDeleteDatosClinicosEgreso()
  const deleteDiagnostico = useDeleteDiagnosticoEgreso()

  const isLoadingDetail =
    isLoadingDatosClinicos || (!!selectedDatosClinicos?.diagnosticoEgresoId && isLoadingDiagnostico)
  const isDeleting = deleteDatosClinicos.isPending || deleteDiagnostico.isPending

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selectedDatosClinicos || !admissionId) return
    AntModal.confirm({
      title: "Eliminar nota de egreso",
      content: "Esta acción eliminará la nota de egreso seleccionada. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          if (selectedDatosClinicos.diagnosticoEgresoId) {
            await deleteDiagnostico.mutateAsync({ id: selectedDatosClinicos.diagnosticoEgresoId })
          }
          await deleteDatosClinicos.mutateAsync({ id: selectedDatosClinicos.id, admissionId })
          messageApi.success("Nota de egreso eliminada correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la nota de egreso.")
        }
      },
    })
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <span className="chrm-title">
          <HistoryOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
          Nota de Egreso · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !notasEgreso.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay notas de egreso registradas para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {notasEgreso.map((nota) => (
                <li key={nota.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === nota.id ? " active" : ""}`}
                    onClick={() => setSelectedId(nota.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(nota.createdAt)}
                      </span>
                    </div>
                    <p className="chrm-item-excerpt">{excerpt(nota.condicionesGeneralesSalida)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="chrm-detail">
            {selectedId ? (
              <>
                <button type="button" className="chrm-back-btn" onClick={() => setSelectedId(null)}>
                  ← Volver al listado
                </button>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
                  <Button
                    icon={<EditOutlined />}
                    disabled={!selectedDatosClinicos}
                    onClick={() =>
                      selectedDatosClinicos && onEdit(selectedDatosClinicos, selectedDiagnostico ?? null)
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                    disabled={!selectedDatosClinicos}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selectedDatosClinicos ? (
                  <Skeleton active />
                ) : (
                  <NotaEgresoDetailView data={buildViewData(selectedDatosClinicos, selectedDiagnostico ?? null)} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona una nota de egreso del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
