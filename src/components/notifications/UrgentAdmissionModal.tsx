"use client"

import { Button, Modal, theme } from "antd"
import { AlertOutlined, SolutionOutlined } from "@ant-design/icons"
import { AdmissionNotification } from "@/core/interfaces/care/admissionNotifications"
import AdmissionNotificationCard from "./AdmissionNotificationCard"
import { useThemeVars } from "./useThemeVars"

interface UrgentAdmissionModalProps {
  open: boolean
  notifications: AdmissionNotification[]
  onAdmit: (notification: AdmissionNotification) => void
  onClose: () => void
}

// Aviso grande para triages I a III. Solo se cierra con sus botones (ni clic afuera ni Esc),
// para que no se descarte sin querer. Al cerrarlo sigue disponible en el centro de notificaciones.
export default function UrgentAdmissionModal({
  open,
  notifications,
  onAdmit,
  onClose,
}: UrgentAdmissionModalProps) {
  const { token } = theme.useToken()
  const themeVars = useThemeVars()
  const count = notifications.length

  return (
    <Modal
      open={open}
      width={640}
      centered
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      rootClassName="anc-root"
      styles={{ body: { padding: 0 } }}
    >
      <div className="anc-urgent" style={themeVars}>
        <div className="anc-urgent-header">
          <span className="anc-urgent-icon">
            <AlertOutlined />
          </span>
          <div>
            <div className="anc-urgent-kicker">Triage urgente</div>
            <h3 className="anc-urgent-title">
              {count === 1
                ? "Hay un paciente por admisionar"
                : `Hay ${count} pacientes por admisionar`}
            </h3>
            <p className="anc-urgent-subtitle">
              Se clasificaron con prioridad alta y quien hizo el triage no los admisionó.
            </p>
          </div>
        </div>

        <div className="anc-urgent-list">
          {notifications.map((notification) => (
            <AdmissionNotificationCard
              key={notification.id}
              notification={notification}
              onAdmit={onAdmit}
            />
          ))}
        </div>

        <div className="anc-urgent-footer" style={{ borderTopColor: token.colorBorderSecondary }}>
          <span className="anc-urgent-hint">
            Si cierras, seguirán en la campana de notificaciones.
          </span>
          <div className="anc-urgent-actions">
            <Button onClick={onClose}>Cerrar</Button>
            {count === 1 && (
              <Button
                type="primary"
                danger
                icon={<SolutionOutlined />}
                onClick={() => onAdmit(notifications[0])}
              >
                Admisionar ahora
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
