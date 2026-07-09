export interface Cie10CodeResponse {
  id: number;
  codigo: string;
  descripcion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjetivoHCInicialResponse {
  id: number;
  motivoConsulta: string;
  enfermedadActual: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjetivoHCInicialRequest {
  motivoConsulta: string;
  enfermedadActual: string;
}

export interface ObjetivoHCInicialResponse {
  id: number;
  cabezaCuello: string | null;
  torax: string | null;
  abdomen: string | null;
  extremidades: string | null;
  sistemaNervioso: string | null;
  organosSentidos: string | null;
  genitourinario: string | null;
  padres: string | null;
  personalesMedicos: string | null;
  otrosFamiliares: string | null;
  alergicos: string | null;
  quirurgicos: string | null;
  toxicos: string | null;
  transfusiones: string | null;
  habitos: string | null;
  traumas: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ObjetivoHCInicialRequest = Omit<
  ObjetivoHCInicialResponse,
  "id" | "isActive" | "createdAt" | "updatedAt"
>;

export interface SignosVitalesHCInicialResponse {
  id: number;
  tensionArterial: string | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  temperatura: number | null;
  saturacionOxigeno: number | null;
  glasgow: number | null;
  peso: number | null;
  talla: number | null;
  imc: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SignosVitalesHCInicialRequest = Omit<
  SignosVitalesHCInicialResponse,
  "id" | "imc" | "isActive" | "createdAt" | "updatedAt"
>;

export interface AnalisisDiagnosticosPlanHCInicialResponse {
  id: number;
  analisis: string | null;
  plan: string | null;
  diagnosticos: Cie10CodeResponse[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalisisDiagnosticosPlanHCInicialRequest {
  analisis: string | null;
  plan: string | null;
  idsCie10: number[];
}

export interface HCInicialResponse {
  id: number;
  admissionId: number;
  nombrePaciente: string;
  documentoPaciente: string;
  admissionDate: string;
  admissionTime: string;
  idSubjetivoHCInicial: number | null;
  subjetivo: SubjetivoHCInicialResponse | null;
  idObjetivoHCInicial: number | null;
  objetivo: ObjetivoHCInicialResponse | null;
  idSignosVitalesHCInicial: number | null;
  signosVitales: SignosVitalesHCInicialResponse | null;
  idAnalisisDiagnosticosPlanHCInicial: number | null;
  analisisDiagnosticosPlan: AnalisisDiagnosticosPlanHCInicialResponse | null;
  isActive: boolean;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HCInicialCreateRequest {
  admissionId: number;
  admissionDate: string;
  admissionTime: string;
  idSubjetivoHCInicial: number | null;
  idObjetivoHCInicial: number | null;
  idSignosVitalesHCInicial: number | null;
  idAnalisisDiagnosticosPlanHCInicial: number | null;
}

export interface HCInicialUpdateRequest {
  admissionDate: string;
  admissionTime: string;
  idSubjetivoHCInicial: number | null;
  idObjetivoHCInicial: number | null;
  idSignosVitalesHCInicial: number | null;
  idAnalisisDiagnosticosPlanHCInicial: number | null;
  isActive: boolean;
  isClosed: boolean;
}

export interface EvolucionResponse {
  id: number;
  admissionId: number;
  motivoConsulta: string;
  tensionArterial: string | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  temperatura: number | null;
  saturacionOxigeno: number | null;
  glasgow: number | null;
  peso: number | null;
  talla: number | null;
  imc: number | null;
  plan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvolucionCreateRequest {
  admissionId: number;
  motivoConsulta: string;
  tensionArterial: string | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  temperatura: number | null;
  saturacionOxigeno: number | null;
  glasgow: number | null;
  peso: number | null;
  talla: number | null;
  plan: string;
}

export interface EvolucionEspecialistaResponse {
  id: number;
  admissionId: number;
  motivoConsulta: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvolucionEspecialistaCreateRequest {
  admissionId: number;
  motivoConsulta: string;
  plan: string;
}
