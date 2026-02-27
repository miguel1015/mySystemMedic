import { AUTH_ENDPOINTS } from "./auth"
import { CARE_ENDPOINTS } from "./care"
import { CREDIT_ENDPOINTS } from "./credit"
import { NAVIGATION_ENDPOINTS } from "./navigation"
import { PARAMETERIZATION_ENDPOINTS } from "./parameterization"
import { USERS_ENDPOINTS } from "./users"
import { UTILS_ENDPOINTS } from "./utils"

export const ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...USERS_ENDPOINTS,
  ...UTILS_ENDPOINTS,
  ...PARAMETERIZATION_ENDPOINTS,
  ...CARE_ENDPOINTS,
  ...NAVIGATION_ENDPOINTS,
  ...CREDIT_ENDPOINTS,
}
