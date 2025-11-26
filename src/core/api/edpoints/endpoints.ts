export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  USERS: {
    GET_ALL: "/api/auth/users/users/getAll",
    CREATE: "/api/auth/users/users/register",
    GET_BY_ID: (id: string | number) => `/users/${id}`,
  },
  USERS_ROLES: {
    GET_ALL: "/api/auth/users/user-roles",
  },
  PROFILES: {
    GET_ALL: "/api/auth/users/user-profiles",
  },
  CREDIT: {
    GET_ALL: "/credits",
    CREATE: "/credits",
  },
};
