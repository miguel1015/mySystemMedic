import { makeParamCrud } from "./helpers"

export const PARAMETERIZATION_ENDPOINTS = {
  INSURERS: {
    GET_ALL: "/api/auth/utils/getAll?type=insurers",
    CREATE: "/api/auth/parameterization/register?type=insurers",
    UPDATE: (id: string | number) => `/api/auth/parameterization/${id}`,
    DELETE: (id: string | number) => `/api/auth/parameterization/${id}`,
    GET_BY_ID: (id: string | number) => `/api/auth/parameterization/${id}`,
  },
  BENEFIT_PLANS: {
    GET_ALL: "/api/auth/parameterization/getAll?type=benefit-plans",
  },
  TARIFFS: makeParamCrud("tariffs"),
  TARIFF_DETAILS: {
    ...makeParamCrud("tariffdetails"),
    GET_ALL_PAGED: (page: number, pageSize: number, search?: string) =>
      `/api/auth/parameterization/getAll?type=tariffdetails-paged&page=${page}&pageSize=${pageSize}${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`,
  },
  SURGICAL_GROUPS: {
    GET_ALL: "/api/auth/parameterization/getAll?type=surgical-groups",
  },
  SURGICAL_ACCESS_ROUTES: {
    GET_ALL: "/api/auth/parameterization/getAll?type=surgical-access-routes",
  },
  SURGICAL_GROUP_CONCEPTS: {
    GET_ALL: "/api/auth/parameterization/getAll?type=surgical-group-concepts",
  },
  CONTRACTS: {
    ...makeParamCrud("contracts"),
    BY_INSURER: (insurerId: string | number) =>
      `/api/auth/parameterization/getAll?type=contracts-by-insurer&insurerId=${insurerId}`,
  },
  CONTRACT_CATALOGS: {
    GET_ALL: "/api/auth/parameterization/getAll?type=contract-catalogs",
  },
  CONTRACT_DETAILS: makeParamCrud("contract-details"),
  PROVIDERS: {
    GET_BY_ID: (id: string | number) =>
      `/api/auth/parameterization/${id}?type=providers`,
    UPDATE: (id: string | number) =>
      `/api/auth/parameterization/${id}?type=providers`,
  },
  MEDICINES: makeParamCrud("medicines"),
  MEDICAL_DEVICES: makeParamCrud("medical-devices"),
}
