"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { Modal } from "antd"
import {
  AlertOutlined,
  BellOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  InboxOutlined,
} from "@ant-design/icons"
import { AdmissionNotification } from "@/core/interfaces/care/admissionNotifications"
import AdmissionNotificationCard from "./AdmissionNotificationCard"
import { isPending } from "./admissionNotificationUtils"
import { useThemeVars } from "./useThemeVars"

type FolderKey = "urgent" | "pending" | "resolved"

interface Folder {
  key: FolderKey
  label: string
  hint: string
  icon: ReactNode
  tone: "danger" | "warning" | "success"
  items: AdmissionNotification[]
  empty: string
}

interface AdmissionNotificationCenterProps {
  open: boolean
  notifications: AdmissionNotification[]
  onAdmit: (notification: AdmissionNotification) => void
  onClose: () => void
}

// Centro de notificaciones con carpetas: urgentes (I a III), pendientes (IV y V) y atendidas
// en las últimas 24 horas.
export default function AdmissionNotificationCenter({
  open,
  notifications,
  onAdmit,
  onClose,
}: AdmissionNotificationCenterProps) {
  const themeVars = useThemeVars()
  const [active, setActive] = useState<FolderKey>("urgent")
  const [now, setNow] = useState(() => Date.now())

  const folders = useMemo<Folder[]>(() => {
    const pending = notifications.filter(isPending)
    return [
      {
        key: "urgent",
        label: "Urgentes",
        hint: "Prioridad I a III",
        icon: <AlertOutlined />,
        tone: "danger",
        items: pending.filter((n) => n.isUrgent),
        empty: "No hay urgencias pendientes de admisión.",
      },
      {
        key: "pending",
        label: "Pendientes",
        hint: "Prioridad IV y V",
        icon: <FolderOpenOutlined />,
        tone: "warning",
        items: pending.filter((n) => !n.isUrgent),
        empty: "No hay pacientes en espera de admisión.",
      },
      {
        key: "resolved",
        label: "Atendidas",
        hint: "Últimas 24 horas",
        icon: <CheckCircleOutlined />,
        tone: "success",
        items: notifications.filter((n) => !isPending(n)),
        empty: "Aún no se ha admisionado ningún paciente notificado.",
      },
    ]
  }, [notifications])

  // Al abrir, la primera carpeta con pendientes.
  useEffect(() => {
    if (!open) return
    setNow(Date.now())
    const firstWithItems = folders.find((f) => f.key !== "resolved" && f.items.length > 0)
    setActive(firstWithItems?.key ?? "urgent")
    // Solo al abrir: después el usuario elige la carpeta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Mantiene al día el "hace X min" mientras está abierto.
  useEffect(() => {
    if (!open) return
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [open])

  const current = folders.find((f) => f.key === active) ?? folders[0]
  const pendingTotal = folders[0].items.length + folders[1].items.length

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      centered
      footer={null}
      rootClassName="anc-root"
      styles={{ body: { padding: 0 } }}
      title={null}
    >
      <div className="anc-center" style={themeVars}>
        <header className="anc-center-header">
          <span className="anc-center-icon">
            <BellOutlined />
          </span>
          <div>
            <h3 className="anc-center-title">Centro de notificaciones</h3>
            <p className="anc-center-subtitle">
              {pendingTotal === 0
                ? "No hay pacientes pendientes de admisión."
                : `${pendingTotal} ${pendingTotal === 1 ? "paciente pendiente" : "pacientes pendientes"} de admisión`}
            </p>
          </div>
        </header>

        <div className="anc-folders" role="tablist">
          {folders.map((folder) => (
            <button
              key={folder.key}
              type="button"
              role="tab"
              aria-selected={folder.key === current.key}
              className={`anc-folder-tab tone-${folder.tone}${folder.key === current.key ? " is-active" : ""}`}
              onClick={() => setActive(folder.key)}
            >
              <span className="anc-folder-tab-icon">{folder.icon}</span>
              <span className="anc-folder-tab-text">
                <span className="anc-folder-tab-label">{folder.label}</span>
                <span className="anc-folder-tab-hint">{folder.hint}</span>
              </span>
              <span className="anc-folder-count">{folder.items.length}</span>
            </button>
          ))}
        </div>

        <div className={`anc-folder-panel tone-${current.tone}`} role="tabpanel">
          {current.items.length === 0 ? (
            <div className="anc-empty">
              <InboxOutlined />
              <span>{current.empty}</span>
            </div>
          ) : (
            <div className="anc-list">
              {current.items.map((notification) => (
                <AdmissionNotificationCard
                  key={notification.id}
                  notification={notification}
                  onAdmit={onAdmit}
                  now={now}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
