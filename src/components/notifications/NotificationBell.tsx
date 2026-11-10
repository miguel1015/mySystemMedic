"use client"

import { faBell } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAdmissionNotificationsContext } from "./AdmissionNotificationsProvider"

// Campana del sidebar: el número suma los pacientes pendientes de admisión (admisionistas) y
// los que esperan triage (médico general, enfermero, auxiliar de enfermería). Se pone roja y
// pulsa si alguna admisión es urgente. Solo la ve quien recibe algún tipo de aviso.
export default function NotificationBell() {
  const { canReceive, pendingCount, urgentPendingCount, openCenter } =
    useAdmissionNotificationsContext()

  if (!canReceive) return null

  const label =
    pendingCount === 0
      ? "Notificaciones: sin pacientes pendientes"
      : `Notificaciones: ${pendingCount} ${pendingCount === 1 ? "paciente pendiente" : "pacientes pendientes"}`

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
