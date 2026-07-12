"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteProcedimientoDiagnostico } from "@/core/hooks/care/procedimientosDiagnosticos/useDeleteProcedimientoDiagnostico"
import { useGetProcedimientoDiagnosticoById } from "@/core/hooks/care/procedimientosDiagnosticos/useGetProcedimientoDiagnosticoById"
import { useGetProcedimientosDiagnosticosByAdmission } from "@/core/hooks/care/procedimientosDiagnosticos/useGetProcedimientosDiagnosticosByAdmission"
import type { ProcedimientoDiagnosticoResponse } from "@/core/interfaces/care/hciInicial"
import { ProcedimientoDiagnosticoDetailView } from "./ProcedimientoDiagnosticoDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (procedimientoDiagnostico: ProcedimientoDiagnosticoResponse) => void
  messageApi: MessageInstance
}

const formatDateTime = (fecha: string, hora: string) => {
  if (!fecha) return "—"
  return `${fecha} · ${hora ? hora.slice(0, 5) : "—"}`
}

const excerpt = (texto: string, max = 150) =>
  texto.length > max ? `${texto.slice(0, max)}…` : texto

export const ProcedimientosDiagnosticosRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: procedimientosDiagnosticos = [], isLoading } = useGetProcedimientosDiagnosticosByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetProcedimientoDiagnosticoById(
    open ? selectedId : null,
  )
  const deleteProcedimientoDiagnostico = useDeleteProcedimientoDiagnostico()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar procedimiento diagnóstico",
      content: "Esta acción eliminará el procedimiento diagnóstico seleccionado. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteProcedimientoDiagnostico.mutateAsync({ id: selected.id, admissionId })
          messageApi.success("Procedimiento diagnóstico eliminado correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar el procedimiento diagnóstico.")
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
          Procedimientos Diagnósticos · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !procedimientosDiagnosticos.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay procedimientos diagnósticos registrados para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {procedimientosDiagnosticos.map((procedimientoDiagnostico) => (
                <li key={procedimientoDiagnostico.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === procedimientoDiagnostico.id ? " active" : ""}`}
                    onClick={() => setSelectedId(procedimientoDiagnostico.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(procedimientoDiagnostico.fechaProcedimiento, procedimientoDiagnostico.horaProcedimiento)}
                      </span>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {procedimientoDiagnostico.nombreProfesional}
                    </div>
                    <p className="chrm-item-excerpt">{excerpt(procedimientoDiagnostico.estudiosRealizados)}</p>
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
                  <Button icon={<EditOutlined />} onClick={() => selected && onEdit(selected)} disabled={!selected}>
                    Editar
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleteProcedimientoDiagnostico.isPending}
                    disabled={!selected}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selected ? (
                  <Skeleton active />
                ) : (
                  <ProcedimientoDiagnosticoDetailView data={selected} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona un procedimiento diagnóstico del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
