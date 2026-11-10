"use client"

import { ENDPOINTS } from "@/core/api/endpoints"
import { INSTITUTION_PROVIDER_ID } from "@/core/constants/institution"
import { request } from "@/core/hooks/care/billing/useElectronicInvoiceDocuments"
import type { BillingMovementResponse, ElectronicInvoiceListItem } from "@/core/interfaces/care/billing"
import type { Cie10CodeResponse, DiagnosticoEgresoResponse } from "@/core/interfaces/care/hciInicial"
import type { AdmissionResponse, GetPatient } from "@/core/interfaces/care/types"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { ProfessionalOption } from "@/core/interfaces/user/users"
import { useQuery } from "@tanstack/react-query"
import type { RipsProfessional } from "./buildRips"

// Datos de la admisión con los que se arma el RIPS (todo menos la factura). El backend los
// arma en una sola respuesta (GET /admissions/{id}/rips-sources); antes eran ~10 peticiones
// en tres rondas encadenadas.
export interface RipsSources {
  admission: AdmissionResponse
  patient: GetPatient | null
  provider: TProvider | null
  movements: BillingMovementResponse[]
  diagnosticosIngreso: Cie10CodeResponse[]
  diagnosticoEgreso: DiagnosticoEgresoResponse | null
  hcProfessional: RipsProfessional | null
  professionals: ProfessionalOption[]
  // Código SIRAS del FURIPS activo de la admisión.
  registroSiras: string | null
}

export interface RipsInvoiceData {
  invoice: ElectronicInvoiceListItem
  sources: RipsSources
}

// La clave cuelga de ["billing-movements", "by-admission", id]: al agregar, editar o borrar
// cargos se invalida ese prefijo y el RIPS se vuelve a calcular solo.
const ripsSourcesKey = (admissionId: number | null) => [
  "billing-movements",
  "by-admission",
  admissionId,
  "rips-sources",
]

const EMPTY_SOURCES = {
  admission: undefined,
  patient: null,
  provider: null,
  movements: [] as BillingMovementResponse[],
  diagnosticosIngreso: [] as Cie10CodeResponse[],
  diagnosticoEgreso: null,
  hcProfessional: null,
  professionals: [] as ProfessionalOption[],
  registroSiras: null,
}

// Lo usan la pestaña de validación de Admisión integral y cualquier vista que parta de la
// admisión. Devuelve la misma forma que antes para no tocar a quienes lo consumen.
export function useRipsSources(admissionId: number | null) {
  const query = useQuery({
    queryKey: ripsSourcesKey(admissionId),
    queryFn: () =>
      request<RipsSources>(ENDPOINTS.ADMISSIONS.RIPS_SOURCES(admissionId!, INSTITUTION_PROVIDER_ID)),
    enabled: !!admissionId,
  })

  return {
    ...(query.data ?? EMPTY_SOURCES),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

// Vista RIPS de una factura: factura + datos de su admisión en una sola petición.
export function useRipsInvoiceData(invoiceId: number | null) {
  return useQuery({
    queryKey: ["electronic-invoices", "rips-data", invoiceId],
    queryFn: () =>
      request<RipsInvoiceData>(
        ENDPOINTS.ELECTRONIC_INVOICE.RIPS_DATA(invoiceId!, INSTITUTION_PROVIDER_ID),
      ),
    enabled: !!invoiceId,
  })
}
