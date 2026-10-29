import type { AdmissionHistoryStatus } from "@/core/interfaces/care/types"

export const ADMISSION_STATUS_COLOR: Record<AdmissionHistoryStatus, string> = {
  "En atención": "gold",
  Egresada: "blue",
  Facturada: "green",
}
