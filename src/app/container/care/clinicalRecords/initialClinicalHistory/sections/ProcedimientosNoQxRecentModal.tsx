"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteProcedimientoNoQx } from "@/core/hooks/care/procedimientosNoQx/useSaveProcedimientoNoQx"
import { useGetProcedimientoNoQxById } from "@/core/hooks/care/procedimientosNoQx/useGetProcedimientoNoQxById"
import { useGetProcedimientosNoQxByAdmission } from "@/core/hooks/care/procedimientosNoQx/useGetProcedimientosNoQxByAdmission"
import type { ProcedimientoNoQxResponse } from "@/core/interfaces/care/hciInicial"
import { ProcedimientoNoQxDetailView } from "./ProcedimientoNoQxDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (procedimientoNoQx: ProcedimientoNoQxResponse) => void
  messageApi: MessageInstance
}

const formatDateTime = (fecha: string, hora: string) => {
  if (!fecha) return "—"
  return `${fecha} · ${hora ? hora.slice(0, 5) : "—"}`
}

const excerpt = (texto: string, max = 150) =>
  texto.length > max ? `${texto.slice(0, max)}…` : texto

export const ProcedimientosNoQxRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: procedimientosNoQx = [], isLoading } = useGetProcedimientosNoQxByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetProcedimientoNoQxById(
    open ? selectedId : null,
  )
  const deleteProcedimientoNoQx = useDeleteProcedimientoNoQx()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar procedimiento no quirúrgico",
      content: "Esta acción eliminará el procedimiento no quirúrgico seleccionado. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteProcedimientoNoQx.mutateAsync({ id: selected.id })
          messageApi.success("Procedimiento no quirúrgico eliminado correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar el procedimiento no quirúrgico.")
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
          Procedimientos No Quirúrgicos · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !procedimientosNoQx.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay procedimientos no quirúrgicos registrados para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {procedimientosNoQx.map((procedimientoNoQx) => (
                <li key={procedimientoNoQx.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === procedimientoNoQx.id ? " active" : ""}`}
                    onClick={() => setSelectedId(procedimientoNoQx.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(procedimientoNoQx.fechaProcedimiento, procedimientoNoQx.horaProcedimiento)}
                      </span>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {procedimientoNoQx.nombreProfesional}
                    </div>
                    <p className="chrm-item-excerpt">{excerpt(procedimientoNoQx.descripcion)}</p>
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
                    loading={deleteProcedimientoNoQx.isPending}
                    disabled={!selected}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selected ? (
                  <Skeleton active />
                ) : (
                  <ProcedimientoNoQxDetailView data={selected} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona un procedimiento no quirúrgico del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
