export interface PatientCatalog {
  id: number;
  name: string;
}

export interface PatientData {
  insurerId: number;
  contractId: number;
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate: string;
  sexId: number;
  birthCountryId: number;
  residenceCountryId: number;
  stateId: number;
  cityId: number;
  zoneId: number;
  address: string;
  phone: string;
  email: string;
  maritalStatusId: number;
  disabilityId: number;
  bloodGroupId: number;
  rhFactorId: number;
}

export interface GetPatient extends PatientData {
  id: number;
  insurerName: string;
  contractName: string;
  documentTypeCode: string;
  documentTypeName: string;
  sexName: string;
  birthCountryName: string;
  residenceCountryName: string;
  stateName: string;
  cityName: string;
  zoneName: string;
  maritalStatusName: string;
  disabilityName: string;
  bloodGroupName: string;
  rhFactorName: string;
  isActive: boolean;
}

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
