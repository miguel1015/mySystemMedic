"use client"

import { faBell } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAdmissionNotificationsContext } from "./AdmissionNotificationsProvider"

// Campana del sidebar: el número es la cantidad de pacientes pendientes de admisión. Se pone
// roja y pulsa si alguno es urgente. Solo la ven los admisionistas.
export default function NotificationBell() {
  const { canReceive, pendingCount, urgentPendingCount, openCenter } =
    useAdmissionNotificationsContext()

  if (!canReceive) return null

  const label =
    pendingCount === 0
      ? "Notificaciones: sin pacientes pendientes"
      : `Notificaciones: ${pendingCount} ${pendingCount === 1 ? "paciente pendiente" : "pacientes pendientes"} de admisión`

  return (
    <button
      type="button"
      className={`sidebar-notification-bell${urgentPendingCount > 0 ? " is-urgent" : ""}`}
      onClick={openCenter}
      aria-label={label}
      title={label}
    >
      <FontAwesomeIcon icon={faBell} />
      {pendingCount > 0 && (
        <span className="sidebar-notification-badge">
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}
    </button>
  )
}
