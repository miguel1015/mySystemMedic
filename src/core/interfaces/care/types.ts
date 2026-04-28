export interface PatientCatalog {
  id: number;
  name: string;
}

export interface PatientData {
  insurerId: number;
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
  isActive?: boolean;
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

export interface AdmissionCatalogItem {
  id: number;
  name: string;
  isActive: boolean;
}

export interface AdmissionServiceGroup extends AdmissionCatalogItem {
  serviceClassificationId: number;
  serviceClassificationName: string;
}

export interface AdmissionCatalogs {
  careModalities: AdmissionCatalogItem[];
  careScopes: AdmissionCatalogItem[];
  careReasons: AdmissionCatalogItem[];
  admissionTypes: AdmissionCatalogItem[];
  carePurposes: AdmissionCatalogItem[];
  serviceClassifications: AdmissionCatalogItem[];
  serviceGroups: AdmissionServiceGroup[];
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

export interface PatientMiniResponse {
  id: number;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  fechaNacimiento?: string | null;
  sexo?: string | null;
}

export type TriagePriority = "I" | "II" | "III" | "IV" | "V";

export interface VitalSignsDto {
  tensionArterial?: string | null;
  frecuenciaCardiaca?: number | null;
  frecuenciaRespiratoria?: number | null;
  peso?: number | null;
  talla?: number | null;
  temperatura?: number | null;
  glasgow?: number | null;
}

export interface TriageResponse {
  id: number;
  pacienteId: number;
  numeroDocumento: string;
  nombrePaciente: string;
  fechaHora: string;
  prioridad: TriagePriority;
  motivoConsulta: string;
  signosVitales: VitalSignsDto;
  isActive: boolean;
}

export interface VitalSignsRequestDto {
  TensionArterial?: string | null;
  FrecuenciaCardiaca?: number | null;
  FrecuenciaRespiratoria?: number | null;
  Peso?: number | null;
  Talla?: number | null;
  Temperatura?: number | null;
  Glasgow?: number | null;
}

export interface TriageCreateRequest {
  NumeroDocumento: string;
  FechaHora: string;
  Prioridad: TriagePriority;
  MotivoConsulta: string;
  SignosVitales: VitalSignsRequestDto;
}

export interface TriageUpdateRequest {
  FechaHora: string;
  Prioridad: TriagePriority;
  MotivoConsulta: string;
  SignosVitales: VitalSignsRequestDto;
  IsActive: boolean;
}
