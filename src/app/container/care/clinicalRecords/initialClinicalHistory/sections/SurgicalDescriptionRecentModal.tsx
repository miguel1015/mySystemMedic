"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Modal as AntModal, Skeleton } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ModalShell from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import { useDeleteDescripcionQuirurgica } from "@/core/hooks/care/descripcionesQuirurgicas/useDeleteDescripcionQuirurgica"
import { useGetDescripcionQuirurgicaById } from "@/core/hooks/care/descripcionesQuirurgicas/useGetDescripcionQuirurgicaById"
import { useGetDescripcionQuirurgicaByAdmission } from "@/core/hooks/care/descripcionesQuirurgicas/useGetDescripcionQuirurgicaByAdmission"
import type { DescripcionQuirurgicaResponse } from "@/core/interfaces/care/hciInicial"
import { SurgicalDescriptionDetailView } from "./SurgicalDescriptionDetailView"

interface Props {
  open: boolean
  onClose: () => void
  admissionId?: string | number
  onEdit: (descripcionQuirurgica: DescripcionQuirurgicaResponse) => void
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

export const SurgicalDescriptionRecentModal = ({ open, onClose, admissionId, onEdit, messageApi }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: descripcionesQuirurgicas = [], isLoading } = useGetDescripcionQuirurgicaByAdmission(
    open ? admissionId : undefined,
  )
  const { data: selected, isLoading: isLoadingDetail } = useGetDescripcionQuirurgicaById(
    open ? selectedId : null,
  )
  const deleteDescripcionQuirurgica = useDeleteDescripcionQuirurgica()

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const handleDelete = () => {
    if (!selected || !admissionId) return
    AntModal.confirm({
      title: "Eliminar descripción quirúrgica",
      content: "Esta acción eliminará la descripción quirúrgica seleccionada. ¿Desea continuar?",
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteDescripcionQuirurgica.mutateAsync({ id: selected.id, admissionId })
          messageApi.success("Descripción quirúrgica eliminada correctamente")
          setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la descripción quirúrgica.")
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
          Descripción Quirúrgica · Histórico
        </span>
      }
    >
      {isLoading ? (
        <div className="chrm-skeleton-wrap">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : !descripcionesQuirurgicas.length ? (
        <div className="chrm-state-message">
          <Empty description="No hay descripciones quirúrgicas registradas para esta admisión." />
        </div>
      ) : (
        <div className={`chrm-body${selectedId ? " has-selection" : ""}`}>
          <div className="chrm-list">
            <ul className="chrm-timeline">
              {descripcionesQuirurgicas.map((descripcionQuirurgica) => (
                <li key={descripcionQuirurgica.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === descripcionQuirurgica.id ? " active" : ""}`}
                    onClick={() => setSelectedId(descripcionQuirurgica.id)}
                  >
                    <div className="chrm-item-top">
                      <span className="chrm-item-date">
                        <ClockCircleOutlined /> {formatDateTime(descripcionQuirurgica.fechaHoraInicio)}
                      </span>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {descripcionQuirurgica.nombreCirujano}
                    </div>
                    <p className="chrm-item-excerpt">{excerpt(descripcionQuirurgica.descripcionProcedimiento)}</p>
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
                    loading={deleteDescripcionQuirurgica.isPending}
                    disabled={!selected}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
                {isLoadingDetail || !selected ? (
                  <Skeleton active />
                ) : (
                  <SurgicalDescriptionDetailView data={selected} />
                )}
              </>
            ) : (
              <div className="chrm-detail-empty">
                <Empty description="Selecciona una descripción quirúrgica del listado para ver el detalle." />
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}
