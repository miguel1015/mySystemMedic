"use client"

import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { AdmissionResponse } from "@/core/interfaces/care/types"
import type { AdmissionReferralResponse } from "@/core/interfaces/care/admissionReferral"
import type { GetUser } from "@/core/interfaces/user/users"
import { formatDate, formatTime } from "@/core/utils/date"
import { GenericClinicalPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/GenericClinicalPrintDocument"
import type { PrintPatient } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admission: AdmissionResponse
  referral: AdmissionReferralResponse
  // Médico que recibe: firma el documento.
  doctorUser?: GetUser
}

// Remisión con la que llega el paciente. La firma el médico que la recibe.
export function ReferralPrintDocument({ provider, patient, admission, referral, doctorUser }: Props) {
  return (
    <GenericClinicalPrintDocument
      provider={provider}
      patient={patient}
      admissionId={admission.id}
      admissionDate={admission.admissionDate}
      contractName={admission.convenioNombre}
      documentTitle="Remisión del paciente"
      attentionLabel="Fecha y hora de admisión:"
      attentionDate={admission.admissionDate.slice(0, 10)}
      attentionTime={formatTime(admission.admissionDate, "")}
      doctorName={referral.medicoRecibeNombre}
      doctorUser={doctorUser}
      sections={[
        {
          title: "IPS que remite al paciente",
          rows: [
            { label: "Nombre IPS que remite", value: referral.ipsRemiteNombre },
            { label: "NIT", value: referral.ipsRemiteNit },
            { label: "Fecha de remisión", value: formatDate(referral.fechaRemision, "") },
            { label: "Teléfono", value: referral.ipsRemiteTelefono },
            { label: "Ciudad", value: referral.ipsRemiteCiudad },
            { label: "Dirección", value: referral.ipsRemiteDireccion },
            { label: "Persona que remite", value: referral.personaRemite },
          ],
        },
        {
          title: "Persona remitida a (IPS que recibe)",
          rows: [
            { label: "Nombre IPS que recibe", value: referral.ipsRecibeNombre },
            { label: "Teléfono", value: referral.ipsRecibeTelefono },
            { label: "Ciudad", value: referral.ipsRecibeCiudad },
            { label: "Dirección", value: referral.ipsRecibeDireccion },
            { label: "Persona que recibe (médico)", value: referral.medicoRecibeNombre },
          ],
        },
      ]}
    />
  )
}
