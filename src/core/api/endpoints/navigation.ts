export const NAVIGATION_ENDPOINTS = {
  NAVIGATION: {
    ME: (id: string | number) => `/api/auth/menu/${id}`,
    ACCESS: "/api/auth/navigation/access",
  },
}
