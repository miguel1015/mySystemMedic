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
  CONTRACTS: makeParamCrud("contracts"),
  CONTRACT_DETAILS: makeParamCrud("contract-details"),
  PROVIDERS: {
    GET_BY_ID: (id: string | number) =>
      `/api/auth/parameterization/${id}?type=providers`,
    UPDATE: (id: string | number) =>
      `/api/auth/parameterization/${id}?type=providers`,
  },
  MEDICINES: makeParamCrud("medicines"),
}
