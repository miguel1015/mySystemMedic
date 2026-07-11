"use client"

import { ClockCircleOutlined, DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Input, message, Modal, Skeleton, Tooltip } from "antd"
import { useMemo, useState } from "react"
import { useGetNotasEnfermeriaByAdmission } from "@/core/hooks/care/notasEnfermeria/useGetNotasEnfermeriaByAdmission"
import {
  useDeleteNotaEnfermeria,
  useUpdateNotaEnfermeria,
} from "@/core/hooks/care/notasEnfermeria/useSaveNotaEnfermeria"
import type { NotaEnfermeriaResponse } from "@/core/interfaces/care/hciInicial"

interface Props {
  admissionId?: string | number
}

const { TextArea } = Input

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

const formatTime = (value: string) =>
  new Date(`1970-01-01T${value}`).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })

const excerptOf = (text: string, length = 120) =>
  text.length > length ? `${text.slice(0, length).trim()}…` : text

export const NursingNoteHistoryList = ({ admissionId }: Props) => {
  const { data: records = [], isLoading } = useGetNotasEnfermeriaByAdmission(admissionId)
  const [messageApi, contextHolder] = message.useMessage()
  const updateNota = useUpdateNotaEnfermeria()
  const deleteNota = useDeleteNotaEnfermeria()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) =>
          new Date(`${b.fechaNota}T${b.horaNota}`).getTime() -
          new Date(`${a.fechaNota}T${a.horaNota}`).getTime(),
      ),
    [records],
  )

  const selected = sortedRecords.find((record) => record.id === selectedId) ?? null

  const handleSelect = (record: NotaEnfermeriaResponse) => {
    setSelectedId(record.id)
    setIsEditing(false)
  }

  const handleEdit = () => {
    if (!selected) return
    setEditValue(selected.nota)
    setIsEditing(true)
  }

  const handleCancelEdit = () => setIsEditing(false)

  const handleSaveEdit = async () => {
    if (!selected) return
    if (!editValue.trim()) {
      messageApi.error("La nota de enfermería es obligatoria.")
      return
    }

    try {
      await updateNota.mutateAsync({
        id: selected.id,
        data: { nota: editValue.trim(), isActive: true },
      })
      messageApi.success("Nota de enfermería actualizada.")
      setIsEditing(false)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo actualizar la nota de enfermería.")
    }
  }

  const handleDelete = (record: NotaEnfermeriaResponse) => {
    Modal.confirm({
      title: "Eliminar nota de enfermería",
      content: `Esta acción eliminará del histórico la nota de enfermería registrada el ${formatDate(record.fechaNota)} a las ${formatTime(record.horaNota)}. Esta acción no se puede deshacer. ¿Desea continuar?`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteNota.mutateAsync({ id: record.id })
          messageApi.success("Nota de enfermería eliminada del histórico.")
          if (selectedId === record.id) setSelectedId(null)
        } catch (err) {
          messageApi.error(err instanceof Error ? err.message : "No se pudo eliminar la nota de enfermería.")
        }
      },
    })
  }

  if (isLoading) {
    return (
      <div className="chrm-skeleton-wrap">
        {contextHolder}
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
        ))}
      </div>
    )
  }

  if (!sortedRecords.length) {
    return (
      <div className="chrm-state-message">
        {contextHolder}
        <Empty description="Aún no hay notas de enfermería registradas para esta admisión." />
      </div>
    )
  }

  return (
    <div className={`chrm-body${selected ? " has-selection" : ""}`}>
      {contextHolder}
      <div className="chrm-list">
        <ul className="chrm-timeline">
          {sortedRecords.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                className={`chrm-item${selectedId === record.id ? " active" : ""}`}
                onClick={() => handleSelect(record)}
              >
                <div className="chrm-item-top">
                  <Tooltip title={`${formatDate(record.fechaNota)} ${formatTime(record.horaNota)}`}>
                    <span className="chrm-item-date">
                      <ClockCircleOutlined /> {formatDate(record.fechaNota)} · {formatTime(record.horaNota)}
                    </span>
                  </Tooltip>
                </div>
                <div className="chrm-item-author">
                  <UserOutlined /> {record.nombreProfesional}
                </div>
                <p className="chrm-item-excerpt">{excerptOf(record.nota)}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="chrm-detail">
        {selected ? (
          <>
            <button
              type="button"
              className="chrm-back-btn"
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit()
                  return
                }
                setSelectedId(null)
              }}
            >
              ← {isEditing ? "Volver al detalle" : "Volver al listado"}
            </button>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
              {isEditing ? (
                <>
                  <Button onClick={handleCancelEdit}>Cancelar</Button>
                  <Button type="primary" loading={updateNota.isPending} onClick={handleSaveEdit}>
                    Guardar cambios
                  </Button>
                </>
              ) : (
                <>
                  <Button icon={<EditOutlined />} onClick={handleEdit}>
                    Editar
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    loading={deleteNota.isPending}
                    onClick={() => handleDelete(selected)}
                  >
                    Eliminar
                  </Button>
                </>
              )}
            </div>

            <div className="chrm-detail-header">
              <div className="chrm-detail-meta">
                <span>
                  <ClockCircleOutlined /> {formatDate(selected.fechaNota)} · {formatTime(selected.horaNota)}
                </span>
                <span>
                  <UserOutlined /> {selected.nombreProfesional}
                </span>
              </div>
            </div>

            {isEditing ? (
              <TextArea
                rows={14}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                maxLength={10000}
                showCount
              />
            ) : (
              <div className="chrm-detail-fields">
                <div className="chrm-detail-field">
                  <span className="chrm-detail-field-label">Nota de enfermería</span>
                  <p className="chrm-detail-field-value">{selected.nota}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="chrm-detail-empty">
            <Empty description="Selecciona un registro del historial para ver el detalle completo." />
          </div>
        )}
      </div>
    </div>
  )
}
