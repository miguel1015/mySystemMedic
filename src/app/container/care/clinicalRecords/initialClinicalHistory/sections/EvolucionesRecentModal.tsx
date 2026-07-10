"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton, Tag } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteEvolucion } from "@/core/hooks/care/evoluciones/useDeleteEvolucion"
import { useGetEvolucionById } from "@/core/hooks/care/evoluciones/useGetEvolucionById"
import { useGetEvolucionesByAdmission } from "@/core/hooks/care/evoluciones/useGetEvolucionesByAdmission"
import type { EvolucionResponse } from "@/core/interfaces/care/hciInicial"
import { EvolucionDetailView } from "./EvolucionDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (evolucion: EvolucionResponse) => void
  messageApi: MessageInstance
}

const formatDateTime = (fecha: string, hora: string) => {
  if (!fecha) return "—"
  return `${fecha} · ${hora ? hora.slice(0, 5) : "—"}`
}

export const EvolucionesRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: evoluciones = [], isLoading } = useGetEvolucionesByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetEvolucionById(
    open ? selectedId : null,
  )
  const deleteEvolucion = useDeleteEvolucion()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar evolución",
      content: "Esta acción eliminará la evolución seleccionada. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteEvolucion.mutateAsync({ id: selected.id, admissionId })
          messageApi.success("Evolución eliminada correctamente")
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
          <HistoryOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />
          Evoluciones · Histórico
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
          <Empty description="No hay evoluciones registradas para esta admisión." />
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
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {evolucion.tensionArterial && <Tag>TA {evolucion.tensionArterial}</Tag>}
                      {evolucion.frecuenciaCardiaca != null && <Tag>FC {evolucion.frecuenciaCardiaca}</Tag>}
                    </div>
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
                  <EvolucionDetailView data={selected} />
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
