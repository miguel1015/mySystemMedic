"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteNotaMedica } from "@/core/hooks/care/notasMedicas/useDeleteNotaMedica"
import { useGetNotaMedicaById } from "@/core/hooks/care/notasMedicas/useGetNotaMedicaById"
import { useGetNotasMedicasByAdmission } from "@/core/hooks/care/notasMedicas/useGetNotasMedicasByAdmission"
import type { NotaMedicaResponse } from "@/core/interfaces/care/hciInicial"
import { NotaMedicaDetailView } from "./NotaMedicaDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (notaMedica: NotaMedicaResponse) => void
  messageApi: MessageInstance
}

const formatDateTime = (fecha: string, hora: string) => {
  if (!fecha) return "—"
  return `${fecha} · ${hora ? hora.slice(0, 5) : "—"}`
}

const excerpt = (texto: string, max = 150) =>
  texto.length > max ? `${texto.slice(0, max)}…` : texto

export const NotasMedicasRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: notasMedicas = [], isLoading } = useGetNotasMedicasByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetNotaMedicaById(
    open ? selectedId : null,
  )
  const deleteNotaMedica = useDeleteNotaMedica()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar nota médica",
      content: "Esta acción eliminará la nota médica seleccionada. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteNotaMedica.mutateAsync({ id: selected.id, admissionId })
          messageApi.success("Nota médica eliminada correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la nota médica.")
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
          Notas Médicas · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !notasMedicas.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay notas médicas registradas para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {notasMedicas.map((notaMedica) => (
                <li key={notaMedica.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === notaMedica.id ? " active" : ""}`}
                    onClick={() => setSelectedId(notaMedica.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(notaMedica.fechaNota, notaMedica.horaNota)}
                      </span>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {notaMedica.nombreProfesional}
                    </div>
                    <p className="chrm-item-excerpt">{excerpt(notaMedica.nota)}</p>
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
                    loading={deleteNotaMedica.isPending}
                    disabled={!selected}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selected ? (
                  <Skeleton active />
                ) : (
                  <NotaMedicaDetailView data={selected} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona una nota médica del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
