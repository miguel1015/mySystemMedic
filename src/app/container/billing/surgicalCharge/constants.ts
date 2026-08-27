import { SURGICAL_WAY_TYPES } from "@/core/interfaces/care/surgicalCharge"

export const surgicalWayTypeOptions = SURGICAL_WAY_TYPES.map((value) => ({
  value,
  label: value,
}))
