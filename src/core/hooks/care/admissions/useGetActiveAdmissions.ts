import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { ElectronicInvoiceListItem } from "@/core/interfaces/care/billing"
import {
  ActiveAdmission,
  AdmissionResponse,
} from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

const mapAdmissionToActiveAdmission = (
  admission: AdmissionResponse,
): ActiveAdmission => ({
  id: admission.id,
  admissionDate: admission.createdAt,
  patientFullName: admission.nombrePaciente,
  documentNumber: admission.documentoPatiente,
  careScope: admission.careScopeName,
  patientId: admission.patientId,
})

export function useActiveAdmissions() {
  return useQuery({
    queryKey: ["active-admissions"],
    queryFn: async () => {
      const [admissions, invoices] = await Promise.all([
        getAll<AdmissionResponse[]>(ENDPOINTS.ADMISSIONS.GET_ALL),
        getAll<ElectronicInvoiceListItem[]>(ENDPOINTS.ELECTRONIC_INVOICE.GET_ALL),
      ])

      // Una admisión ya facturada electrónicamente queda cerrada para el resto del
      // módulo de facturación: no debe aparecer para cargar más movimientos ni para
      // iniciar liquidación quirúrgica de nuevo.
      const invoicedAdmissionIds = new Set(invoices.map((invoice) => invoice.admissionId))

      return admissions
        .filter((admission) => admission.isActive && !invoicedAdmissionIds.has(admission.id))
        .map(mapAdmissionToActiveAdmission)
    },
  })
}
