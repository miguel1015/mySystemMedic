type IdParam = string | number

export const NOTIFICATIONS_ENDPOINTS = {
  ADMISSION_NOTIFICATIONS: {
    GET_MINE: "/api/auth/notifications/admissions",
    MARK_SEEN: "/api/auth/notifications/admissions/seen",
    // Triage I a III: quien lo registró no admisiona enseguida y avisa al admisionista.
    NOTIFY: (triageId: IdParam) => `/api/auth/care/triage/${triageId}/notify-admission`,
  },
  // Pacientes nuevos que esperan triage (médico general, enfermero, auxiliar de enfermería).
  TRIAGE_NOTIFICATIONS: {
    GET_MINE: "/api/auth/notifications/triage",
    MARK_SEEN: "/api/auth/notifications/triage/seen",
  },
}
