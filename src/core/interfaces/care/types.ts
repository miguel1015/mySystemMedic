export interface ActiveAdmission {
  id: number;
  admissionDate: string;
  patientFullName: string;
  documentNumber: string;
  careScope: string;
  patientId: number;
}

export interface TriagePatient {
  id: number;
  firstName: string;
  secondName: string;
  firstLastName: string;
  secondLastName: string;
  birthDate: string;
  gender: string;
}

export interface TriageVitalSigns {
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  weight: number;
  height: number;
  temperature: number;
  glasgow: number;
}

export interface TriageFormData {
  documentNumber: string;
  dateTime: string;
  priority: number;
  consultationReason: string;
  vitalSigns: TriageVitalSigns;
}

export interface TriageRecord {
  id: number;
  patientId: number;
  dateTime: string;
  priority: number;
  consultationReason: string;
  vitalSigns: TriageVitalSigns;
}
