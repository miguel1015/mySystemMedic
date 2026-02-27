export const USERS_ENDPOINTS = {
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
}
