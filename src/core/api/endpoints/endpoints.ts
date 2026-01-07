export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  USERS: {
    GET_ALL: "/api/auth/users/users/getAll?type=users",
    CREATE: "/api/auth/users/users/register",
    UPDATE: (id: string | number) => `/api/auth/users/users/${id}`,
    DELETE: (id: string | number) => `/api/auth/users/users/${id}`,
    GET_BY_ID: (id: string | number) => `/api/auth/users/users/${id}`,
    ME: "/api/auth/users/users/me",
  },
  USERS_ROLES: {
    GET_ALL: "/api/auth/users/users/getAll?type=user-roles",
  },
  DOCUMENT_TYPES: {
    GET_ALL: "/api/auth/users/users/getAll?type=document-types",
  },
  STATUSES: {
    GET_ALL: "/api/auth/users/users/getAll?type=UserStatuses",
  },
  PROFILES: {
    GET_ALL: "/api/auth/users/users/getAll?type=user-profiles",
  },
  COUNTRIES: {
    GET_ALL: "/api/auth/users/users/getAll?type=countries",
  },
  STATES: {
    GET_ALL: "/api/auth/utils/getAll?type=states",
  },
  CITIES: {
    GET_ALL: "/api/auth/utils/getAll?type=cities",
  },
  ADMINISTRADOR_TYPES: {
    GET_ALL: "/api/auth/utils/getAll?type=administrator-types",
  },
  INSURERS: {
    GET_ALL: "/api/auth/utils/getAll?type=insurers",
    CREATE: "/api/auth/parameterization/register?type=insurers",
    UPDATE: (id: string | number) => `/api/auth/parameterization/${id}`,
    DELETE: (id: string | number) => `/api/auth/parameterization/${id}`,
    GET_BY_ID: (id: string | number) => `/api/auth/parameterization/${id}`,
  },
  CREDIT: {
    GET_ALL: "/credits",
    CREATE: "/credits",
  },
  NAVIGATION: {
    ME: (id: string | number) => `/api/auth/menu/${id}`,
  },
};
