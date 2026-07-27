"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteNotaEnfermeria } from "@/core/hooks/care/notasEnfermeria/useSaveNotaEnfermeria"
import { useGetNotaEnfermeriaById } from "@/core/hooks/care/notasEnfermeria/useGetNotaEnfermeriaById"
import { useGetNotasEnfermeriaByAdmission } from "@/core/hooks/care/notasEnfermeria/useGetNotasEnfermeriaByAdmission"
import type { NotaEnfermeriaResponse } from "@/core/interfaces/care/hciInicial"
import { NotaEnfermeriaDetailView } from "./NotaEnfermeriaDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (notaEnfermeria: NotaEnfermeriaResponse) => void
  messageApi: MessageInstance
}

const formatDateTime = (fecha: string, hora: string) => {
  if (!fecha) return "—"
  return `${fecha} · ${hora ? hora.slice(0, 5) : "—"}`
}

const excerpt = (texto: string, max = 150) =>
  texto.length > max ? `${texto.slice(0, max)}…` : texto

export const NotasEnfermeriaRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: notasEnfermeria = [], isLoading } = useGetNotasEnfermeriaByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetNotaEnfermeriaById(
    open ? selectedId : null,
  )
  const deleteNotaEnfermeria = useDeleteNotaEnfermeria()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar nota de enfermería",
      content: "Esta acción eliminará la nota de enfermería seleccionada. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteNotaEnfermeria.mutateAsync({ id: selected.id })
          messageApi.success("Nota de enfermería eliminada correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la nota de enfermería.")
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
          Notas de Enfermería · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !notasEnfermeria.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay notas de enfermería registradas para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {notasEnfermeria.map((notaEnfermeria) => (
                <li key={notaEnfermeria.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === notaEnfermeria.id ? " active" : ""}`}
                    onClick={() => setSelectedId(notaEnfermeria.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(notaEnfermeria.fechaNota, notaEnfermeria.horaNota)}
                      </span>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {notaEnfermeria.nombreProfesional}
                    </div>
                    <p className="chrm-item-excerpt">{excerpt(notaEnfermeria.nota)}</p>
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
                    loading={deleteNotaEnfermeria.isPending}
                    disabled={!selected}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selected ? (
                  <Skeleton active />
                ) : (
                  <NotaEnfermeriaDetailView data={selected} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona una nota de enfermería del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
