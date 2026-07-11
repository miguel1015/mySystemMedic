"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteEvolucionEspecialista } from "@/core/hooks/care/evolucionEspecialista/useDeleteEvolucionEspecialista"
import { useGetEvolucionEspecialistaById } from "@/core/hooks/care/evolucionEspecialista/useGetEvolucionEspecialistaById"
import { useGetEvolucionEspecialistasByAdmission } from "@/core/hooks/care/evolucionEspecialista/useGetEvolucionEspecialistasByAdmission"
import type { EvolucionEspecialistaResponse } from "@/core/interfaces/care/hciInicial"
import { EvolucionEspecialistaDetailView } from "./EvolucionEspecialistaDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (evolucion: EvolucionEspecialistaResponse) => void
  messageApi: MessageInstance
}

const formatDateTime = (fecha: string, hora: string) => {
  if (!fecha) return "—"
  return `${fecha} · ${hora ? hora.slice(0, 5) : "—"}`
}

export const EvolucionesEspecialistaRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: evoluciones = [], isLoading } = useGetEvolucionEspecialistasByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetEvolucionEspecialistaById(
    open ? selectedId : null,
  )
  const deleteEvolucion = useDeleteEvolucionEspecialista()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar evolución",
      content: "¿Confirma eliminar esta evolución?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteEvolucion.mutateAsync({ id: selected.id, admissionId })
          messageApi.success("Evolución de especialista eliminada correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la evolución.")
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
          <SolutionOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
          Evolución de especialista · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !evoluciones.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay evoluciones de especialista registradas para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {evoluciones.map((evolucion) => (
                <li key={evolucion.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === evolucion.id ? " active" : ""}`}
                    onClick={() => setSelectedId(evolucion.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(evolucion.fechaEvolucion, evolucion.horaEvolucion)}
                      </span>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {evolucion.nombreProfesional}
                    </div>
                    <p className="chrm-item-excerpt">{evolucion.motivoConsulta}</p>
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
                    loading={deleteEvolucion.isPending}
                    disabled={!selected}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selected ? (
                  <Skeleton active />
                ) : (
                  <EvolucionEspecialistaDetailView data={selected} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona una evolución del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
