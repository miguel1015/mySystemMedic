import type { InvoiceOperationType } from "@/core/constants/invoiceOperationTypes";

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
  sexCode?: string | null;
  birthCountryName: string;
  birthCountryCode?: string | null;
  residenceCountryName: string;
  residenceCountryCode?: string | null;
  stateName: string;
  cityName: string;
  cityCode?: string | null;
  zoneName: string;
  zoneCode?: string | null;
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

export interface OngoingAttention {
  admissionId: number;
  patientId: number;
  admissionDate: string;
  patientFullName: string;
  documentTypeName: string;
  documentNumber: string;
  careScope: string;
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

export interface AdmissionCreateRequest {
  document: string;
  triageId?: number;
  admissionDate: string;
  careModalityId: number;
  careReasonId: number;
  serviceClassificationId: number;
  serviceGroupId: number;
  admissionTypeId: number;
  careScopeId: number;
  carePurposeId: number;
  epsId: number;
  convenioId: number;
  // Datos del sector salud para la factura electrónica (0 = no aplica).
  policyNumber?: string | null;
  copayValue: number;
  moderatorFeeValue: number;
  sharedPaymentsValue: number;
  advancePaymentValue: number;
  // Tipo de factura (SS-CUFE, SS-Recaudo, SS-SinAporte, SS-Reporte). Obligatorio al crear;
  // en la edición puede ir null en admisiones anteriores al campo.
  invoiceOperationType: InvoiceOperationType | null;
  // CUFE de la factura que comprueba el recaudo. Por ahora solo se registra.
  collectionCufe?: string | null;
}

export type AdmissionUpdateRequest = Omit<AdmissionCreateRequest, "document">;

export interface AdmissionResponse {
  id: number;
  patientId: number;
  documentTypeId: number;
  documentTypeCode: string;
  documentTypeName: string;
  documentoPatiente: string;
  nombrePaciente: string;
  admissionDate: string;
  triageId: number;
  triagePrioridad: string;
  triageFechaHora: string;
  careModalityId: number;
  careModalityName: string;
  careReasonId: number;
  careReasonName: string;
  serviceClassificationId: number;
  serviceClassificationName: string;
  serviceGroupId: number;
  serviceGroupName: string;
  admissionTypeId: number;
  admissionTypeName: string;
  careScopeId: number;
  careScopeName: string;
  carePurposeId: number;
  carePurposeName: string;
  // Códigos SISPRO para el RIPS (null si el catálogo aún no tiene código).
  careModalityCode?: string | null;
  careReasonCode?: string | null;
  serviceClassificationCode?: string | null;
  serviceGroupCode?: string | null;
  admissionTypeCode?: string | null;
  carePurposeCode?: string | null;
  epsId: number;
  epsNombre: string;
  convenioId: number;
  convenioNombre: string;
  healthUserTypeCode?: string | null;
  coverageCode?: string | null;
  paymentModalityCode?: string | null;
  policyNumber?: string | null;
  copayValue?: number;
  moderatorFeeValue?: number;
  sharedPaymentsValue?: number;
  advancePaymentValue?: number;
  invoiceOperationType?: InvoiceOperationType | null;
  collectionCufe?: string | null;
  // Acompañante del paciente (null si no se ha registrado).
  acompananteNombre?: string | null;
  acompananteParentesco?: string | null;
  // Remisión registrada en Admisiones (independiente de la del FURIPS).
  tieneRemision?: boolean;
  isActive: boolean;
  createdAt: string;
}

// Historial de admisiones: el estado se deriva del proceso (egreso / factura).
export type AdmissionHistoryStatus = "En atención" | "Egresada" | "Facturada";

export interface AdmissionHistoryPatient {
  patientId: number;
  documentTypeCode: string;
  documentoPatiente: string;
  nombrePaciente: string;
  epsNombre: string;
  // Solo cuenta admisiones cerradas (con factura electrónica exitosa).
  totalAdmisiones: number;
  ultimaAdmision: string;
}

export interface AdmissionHistoryItem {
  id: number;
  patientId: number;
  admissionDate: string;
  triagePrioridad: string;
  careScopeName: string;
  admissionTypeName: string;
  careModalityName: string;
  epsNombre: string;
  convenioNombre: string;
  tieneEgreso: boolean;
  numeroFactura?: string | null;
  estado: AdmissionHistoryStatus;
}

// Cantidad de registros activos por módulo de una admisión.
export interface AdmissionRecordSummary {
  admissionId: number;
  estado: AdmissionHistoryStatus;
  numeroFactura?: string | null;
  hcInicial: number;
  evoluciones: number;
  evolucionesEspecialista: number;
  procedimientosMenores: number;
  procedimientosDiagnosticos: number;
  procedimientosNoQx: number;
  notasEnfermeria: number;
  datosClinicosEgreso: number;
  notasMedicas: number;
  descripcionesQuirurgicas: number;
  recordsAnestesia: number;
  ordenesMedicas: number;
  medicamentosPos: number;
  aplicacionesMedicamentos: number;
  resultadosLaboratorio: number;
  estudiosRayosX: number;
  registrosHojaGastos: number;
  movimientosFacturacion: number;
  furips: number;
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
