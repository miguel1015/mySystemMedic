export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  USERS: {
    GET_ALL: "/api/users/me",
    GET_BY_ID: (id: string | number) => `/users/${id}`,
  },
  CREDIT: {
    GET_ALL: "/credits",
    CREATE: "/credits",
  },
};
