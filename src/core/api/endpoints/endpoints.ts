export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  USERS: {
    GET_ALL: "/api/auth/users/users/getAll?type=users",
    CREATE: "/api/auth/users/users/register",
    GET_BY_ID: (id: string | number) => `/users/${id}`,
    ME: "/api/auth/users/users/me",
  },
  USERS_ROLES: {
    GET_ALL: "/api/auth/users/users/getAll?type=user-roles",
  },
  PROFILES: {
    GET_ALL: "/api/auth/users/users/getAll?type=user-profiles",
  },
  CREDIT: {
    GET_ALL: "/credits",
    CREATE: "/credits",
  },
};
