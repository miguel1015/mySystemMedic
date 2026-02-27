type IdParam = string | number

export const makeParamCrud = (type: string) => ({
  GET_ALL: `/api/auth/parameterization/getAll?type=${type}`,
  CREATE: `/api/auth/parameterization/register?type=${type}`,
  UPDATE: (id: IdParam) => `/api/auth/parameterization/${id}?type=${type}`,
  DELETE: (id: IdParam) => `/api/auth/parameterization/${id}?type=${type}`,
  GET_BY_ID: (id: IdParam) => `/api/auth/parameterization/${id}?type=${type}`,
})
