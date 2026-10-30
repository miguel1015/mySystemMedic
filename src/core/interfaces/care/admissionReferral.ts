// Remisión con la que llega el paciente desde otra IPS. Una por admisión; mismos
// campos que la sección VII del FURIPS, pero guardada aparte.

export interface AdmissionReferralRequest {
  ipsRemiteNombre: string
  ipsRemiteNit: string
  fechaRemision: string // YYYY-MM-DD
  ipsRemiteTelefono: string
  ipsRemiteCiudad: string
  ipsRemiteDireccion: string
  personaRemite: string
  ipsRecibeNombre: string
  ipsRecibeTelefono?: string | null
  ipsRecibeCiudad?: string | null
  ipsRecibeDireccion?: string | null
  medicoRecibeUserId: number
}

export interface AdmissionReferralResponse extends AdmissionReferralRequest {
  id: number
  admissionId: number
  medicoRecibeNombre: string
  registradoPorId: number
  registradoPorNombre: string
  createdAt: string
  updatedAt: string
}
