"use client"

import {
  ClockCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Empty, Input, Skeleton, Tag, Tooltip, Typography } from "antd"
import { useMemo, useState } from "react"
import Modal from "@/components/modal"
import {
  CLINICAL_RECORD_MODULES,
  type ClinicalRecordModuleType,
} from "@/core/constants/clinicalRecordModules"
import { useClinicalRecordHistory } from "@/core/hooks/care/records/useClinicalRecordHistory"
import { HciInicialHistoryList } from "./HciInicialHistoryList"
import "./clinicalRecordHistoryModal.css"

export interface ClinicalRecordHistoryModalProps {
  open: boolean
  onClose: () => void
  moduleType: ClinicalRecordModuleType
  admissionId?: string | number
  patientId?: string | number
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "hace instantes"
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 30) return `hace ${days} d`
  const months = Math.round(days / 30)
  return `hace ${months} ${months === 1 ? "mes" : "meses"}`
}

const ClinicalRecordHistoryModal = ({
  open,
  onClose,
  moduleType,
  admissionId,
  patientId,
}: ClinicalRecordHistoryModalProps) => {
  const moduleInfo = useMemo(
    () => CLINICAL_RECORD_MODULES.find((module) => module.key === moduleType),
    [moduleType],
  )
  const isHciInicial = moduleType === "initial-clinical-history"
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const {
    data: records = [],
    isLoading,
    isError,
    refetch,
  } = useClinicalRecordHistory({ moduleType, admissionId, enabled: open && !isHciInicial })

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return records
    return records.filter(
      (record) =>
        record.author.fullName.toLowerCase().includes(term) ||
        record.excerpt.toLowerCase().includes(term),
    )
  }, [records, search])

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  )

  const handleClose = () => {
    onClose()
    setSearch("")
    setSelectedId(null)
  }

  if (isHciInicial) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        size="xl"
        title={
          <span className="chrm-title">
            <span style={{ color: moduleInfo?.color }}>{moduleInfo?.icon}</span>
            {moduleInfo?.label ?? "Historia clínica inicial"} · Histórico del paciente
          </span>
        }
      >
        <HciInicialHistoryList patientId={patientId} admissionId={admissionId} />
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="xl"
      title={
        <span className="chrm-title">
          <ClockCircleOutlined style={{ color: moduleInfo?.color }} />
          Historial partode {moduleInfo?.label ?? "Registros"}
          {!isLoading && !isError && <Tag className="chrm-count-tag">{records.length}</Tag>}
        </span>
      }
    >
      <div className="chrm-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Buscar por profesional o contenido del registro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={`chrm-body${selectedRecord ? " has-selection" : ""}`}>
        <div className="chrm-list">
          {isLoading ? (
            <div className="chrm-skeleton-wrap">
              {[1, 2, 3].map((key) => (
                <Skeleton key={key} active avatar paragraph={{ rows: 2 }} />
              ))}
            </div>
          ) : isError ? (
            <div className="chrm-state-message">
              <Empty description="No se pudo cargar el historial de este módulo." />
              <button type="button" className="chrm-retry-btn" onClick={() => refetch()}>
                <ReloadOutlined /> Reintentar
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="chrm-state-message">
              <Empty
                description={
                  records.length === 0
                    ? "Aún no hay registros creados para este módulo."
                    : "No se encontraron registros con ese criterio de búsqueda."
                }
              />
            </div>
          ) : (
            <ul className="chrm-timeline">
              {filteredRecords.map((record) => (
                <li key={record.id}>
                  <button
                    type="button"
                    className={`chrm-item${selectedId === record.id ? " active" : ""}`}
                    style={{ borderLeftColor: moduleInfo?.color }}
                    onClick={() => setSelectedId(record.id)}
                  >
                    <div className="chrm-item-top">
                      <Tooltip title={formatDateTime(record.createdAt)}>
                        <span className="chrm-item-date">{formatRelative(record.createdAt)}</span>
                      </Tooltip>
                    </div>
                    <div className="chrm-item-author">
                      <UserOutlined /> {record.author.fullName}
                      <span className="chrm-item-role">{record.author.role}</span>
                    </div>
                    <p className="chrm-item-excerpt">{record.excerpt}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="chrm-detail">
          {selectedRecord ? (
            <>
              <button type="button" className="chrm-back-btn" onClick={() => setSelectedId(null)}>
                ← Volver al listado
              </button>
              <div className="chrm-detail-header">
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {moduleInfo?.label}
                </Typography.Title>
                <div className="chrm-detail-meta">
                  <span>
                    <ClockCircleOutlined /> {formatDateTime(selectedRecord.createdAt)}
                  </span>
                  <span>
                    <UserOutlined /> {selectedRecord.author.fullName} · {selectedRecord.author.role}
                  </span>
                </div>
              </div>
              <div className="chrm-detail-fields">
                {selectedRecord.fields.map((field) => (
                  <div key={field.label} className="chrm-detail-field">
                    <span className="chrm-detail-field-label">{field.label}</span>
                    <p className="chrm-detail-field-value">{field.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="chrm-detail-empty">
              <Empty description="Selecciona un registro del historial para ver el detalle completo." />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ClinicalRecordHistoryModal
