type IdParam = string | number

export const CARE_ENDPOINTS = {
  ACTIVE_ADMISSIONS: {
    GET_ALL: "/api/auth/care/getAll?type=active-admissions",
  },
  ADMISSION_CATALOGS: {
    GET_ALL: "/api/auth/care/getAll?type=admission-catalogs",
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
}
