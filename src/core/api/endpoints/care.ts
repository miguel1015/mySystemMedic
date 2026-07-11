type IdParam = string | number

export const CARE_ENDPOINTS = {
  ACTIVE_ADMISSIONS: {
    GET_ALL: "/api/auth/care/getAll?type=active-admissions",
  },
  ADMISSION_CATALOGS: {
    GET_ALL: "/api/auth/care/getAll?type=admission-catalogs",
  },
  ADMISSIONS: {
    GET_ALL: "/api/auth/care/admissions",
    CREATE: "/api/auth/care/admissions",
    GET_BY_ID: (id: IdParam) => `/api/auth/care/admissions/${id}`,
    UPDATE: (id: IdParam) => `/api/auth/care/admissions/${id}`,
    DELETE: (id: IdParam) => `/api/auth/care/admissions/${id}`,
  },
  TRIAGE: {
    GET_ALL: "/api/auth/care/triage",
    CREATE: "/api/auth/care/triage",
    GET_BY_ID: (id: IdParam) => `/api/auth/care/triage/${id}`,
    UPDATE: (id: IdParam) => `/api/auth/care/triage/${id}`,
    DELETE: (id: IdParam) => `/api/auth/care/triage/${id}`,
  },
  PATIENTS: {
    GET_ALL: "/api/auth/care/patients",
    CREATE: "/api/auth/care/patients",
    GET_BY_ID: (id: IdParam) => `/api/auth/care/patients/${id}`,
    UPDATE: (id: IdParam) => `/api/auth/care/patients/${id}`,
    DELETE: (id: IdParam) => `/api/auth/care/patients/${id}`,
    BY_DOCUMENT: (doc: string) =>
      `/api/auth/care/patients/by-document/${encodeURIComponent(doc)}`,
  },
  PATIENT_CATALOGS: {
    SEXES: "/api/auth/care/getAll?type=sexes",
    DISABILITIES: "/api/auth/care/getAll?type=disabilities",
    ZONES: "/api/auth/care/getAll?type=zones",
    BLOOD_GROUPS: "/api/auth/care/getAll?type=blood-groups",
    RH_FACTORS: "/api/auth/care/getAll?type=rh-factors",
    MARITAL_STATUSES: "/api/auth/care/getAll?type=marital-statuses",
  },
  CIE10: {
    SEARCH: "/api/auth/care/cie10",
  },
  HCINICIAL: {
    GET_BY_ADMISSION: (admissionId: IdParam) =>
      `/api/auth/care/hci-inicial/by-admission/${admissionId}`,
    CREATE: "/api/auth/care/hci-inicial",
    UPDATE: (id: IdParam) => `/api/auth/care/hci-inicial/${id}`,
    DELETE: (id: IdParam) => `/api/auth/care/hci-inicial/${id}`,
  },
  SUBJETIVO_HCINICIAL: {
    CREATE: "/api/auth/care/subjetivo-hcinicial",
    UPDATE: (id: IdParam) => `/api/auth/care/subjetivo-hcinicial/${id}`,
  },
  OBJETIVO_HCINICIAL: {
    CREATE: "/api/auth/care/objetivo-hcinicial",
    UPDATE: (id: IdParam) => `/api/auth/care/objetivo-hcinicial/${id}`,
  },
  SIGNOS_VITALES_HCINICIAL: {
    CREATE: "/api/auth/care/signos-vitales-hcinicial",
    UPDATE: (id: IdParam) => `/api/auth/care/signos-vitales-hcinicial/${id}`,
  },
  ANALISIS_DIAGNOSTICOS_PLAN_HCINICIAL: {
    CREATE: "/api/auth/care/analisis-diagnosticos-plan-hcinicial",
    UPDATE: (id: IdParam) =>
      `/api/auth/care/analisis-diagnosticos-plan-hcinicial/${id}`,
  },
  EVOLUCIONES: {
    GET_BY_ADMISSION: (admissionId: IdParam) =>
      `/api/auth/care/evoluciones/by-admission/${admissionId}`,
    CREATE: "/api/auth/care/evoluciones",
  },
  EVOLUCION_ESPECIALISTAS: {
    GET_BY_ADMISSION: (admissionId: IdParam) =>
      `/api/auth/care/evolucion-especialistas/by-admission/${admissionId}`,
    CREATE: "/api/auth/care/evolucion-especialistas",
  },
  PROCEDIMIENTOS_NO_QX: {
    GET_BY_ADMISSION: (admissionId: IdParam) =>
      `/api/auth/care/procedimientos-no-qx/by-admission/${admissionId}`,
    CREATE: "/api/auth/care/procedimientos-no-qx",
    UPDATE: (id: IdParam) => `/api/auth/care/procedimientos-no-qx/${id}`,
    DELETE: (id: IdParam) => `/api/auth/care/procedimientos-no-qx/${id}`,
  },
  NOTAS_ENFERMERIA: {
    GET_BY_ADMISSION: (admissionId: IdParam) =>
      `/api/auth/care/notas-enfermeria/by-admission/${admissionId}`,
    CREATE: "/api/auth/care/notas-enfermeria",
    UPDATE: (id: IdParam) => `/api/auth/care/notas-enfermeria/${id}`,
    DELETE: (id: IdParam) => `/api/auth/care/notas-enfermeria/${id}`,
  },
}
