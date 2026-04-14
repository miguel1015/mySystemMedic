type IdParam = string | number

export const CARE_ENDPOINTS = {
  ACTIVE_ADMISSIONS: {
    GET_ALL: "/api/auth/care/getAll?type=active-admissions",
  },
  TRIAGE: {
    SEARCH_PATIENT: "/api/auth/care/getAll?type=triage-patient",
    CREATE: "/api/auth/care/triage/create",
  },
  PATIENTS: {
    GET_ALL: "/api/auth/care/patients",
    CREATE: "/api/auth/care/patients",
    GET_BY_ID: (id: IdParam) => `/api/auth/care/patients/${id}`,
    UPDATE: (id: IdParam) => `/api/auth/care/patients/${id}`,
    DELETE: (id: IdParam) => `/api/auth/care/patients/${id}`,
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
