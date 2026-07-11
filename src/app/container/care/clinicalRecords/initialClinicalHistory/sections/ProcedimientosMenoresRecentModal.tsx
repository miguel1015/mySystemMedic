"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteProcedimientoMenor } from "@/core/hooks/care/procedimientosMenores/useDeleteProcedimientoMenor"
import { useGetProcedimientoMenorById } from "@/core/hooks/care/procedimientosMenores/useGetProcedimientoMenorById"
import { useGetProcedimientosMenoresByAdmission } from "@/core/hooks/care/procedimientosMenores/useGetProcedimientosMenoresByAdmission"
import type { ProcedimientoMenorResponse } from "@/core/interfaces/care/hciInicial"
import { ProcedimientoMenorDetailView } from "./ProcedimientoMenorDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (procedimientoMenor: ProcedimientoMenorResponse) => void
  messageApi: MessageInstance
}

const formatDateTime = (fecha: string, hora: string) => {
  if (!fecha) return "—"
  return `${fecha} · ${hora ? hora.slice(0, 5) : "—"}`
}

const excerpt = (texto: string, max = 150) =>
  texto.length > max ? `${texto.slice(0, max)}…` : texto

export const ProcedimientosMenoresRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: procedimientosMenores = [], isLoading } = useGetProcedimientosMenoresByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetProcedimientoMenorById(
    open ? selectedId : null,
  )
  const deleteProcedimientoMenor = useDeleteProcedimientoMenor()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar procedimiento menor",
      content: "Esta acción eliminará el procedimiento menor seleccionado. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteProcedimientoMenor.mutateAsync({ id: selected.id, admissionId })
          messageApi.success("Procedimiento menor eliminado correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar el procedimiento menor.")
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
          Procedimientos Menores · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !procedimientosMenores.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay procedimientos menores registrados para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {procedimientosMenores.map((procedimientoMenor) => (
                <li key={procedimientoMenor.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === procedimientoMenor.id ? " active" : ""}`}
                    onClick={() => setSelectedId(procedimientoMenor.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(procedimientoMenor.fechaProcedimiento, procedimientoMenor.horaProcedimiento)}
                      </span>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {procedimientoMenor.nombreProfesional}
                    </div>
                    <p className="chrm-item-excerpt">{excerpt(procedimientoMenor.descripcion)}</p>
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
                    loading={deleteProcedimientoMenor.isPending}
                    disabled={!selected}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selected ? (
                  <Skeleton active />
                ) : (
                  <ProcedimientoMenorDetailView data={selected} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona un procedimiento menor del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
