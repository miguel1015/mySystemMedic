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
  userId: number | null;
  nombreProfesional: string | null;
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
  userId?: number;
  admissionDate: string;
  admissionTime: string;
  idSubjetivoHCInicial: number | null;
  idObjetivoHCInicial: number | null;
  idSignosVitalesHCInicial: number | null;
  idAnalisisDiagnosticosPlanHCInicial: number | null;
}

export interface HCInicialUpdateRequest {
  userId?: number;
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
  fechaEvolucion: string;
  horaEvolucion: string;
  userId: number;
  nombreProfesional: string;
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
  userId?: number;
  fechaEvolucion: string;
  horaEvolucion: string;
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

export interface EvolucionUpdateRequest {
  userId?: number;
  fechaEvolucion: string;
  horaEvolucion: string;
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
  isActive: boolean;
}

export interface EvolucionEspecialistaResponse {
  id: number;
  admissionId: number;
  fechaEvolucion: string;
  horaEvolucion: string;
  userId: number;
  nombreProfesional: string;
  motivoConsulta: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvolucionEspecialistaCreateRequest {
  admissionId: number;
  userId?: number;
  fechaEvolucion: string;
  horaEvolucion: string;
  motivoConsulta: string;
  plan: string;
}

export interface EvolucionEspecialistaUpdateRequest {
  userId?: number;
  fechaEvolucion: string;
  horaEvolucion: string;
  motivoConsulta: string;
  plan: string;
  isActive: boolean;
}

export interface NotaMedicaResponse {
  id: number;
  admissionId: number;
  fechaNota: string;
  horaNota: string;
  userId: number;
  nombreProfesional: string;
  nota: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotaMedicaCreateRequest {
  admissionId: number;
  userId?: number;
  fechaNota: string;
  horaNota: string;
  nota: string;
}

export interface NotaMedicaUpdateRequest {
  userId?: number;
  fechaNota: string;
  horaNota: string;
  nota: string;
  isActive: boolean;
}

export interface ProcedimientoMenorResponse {
  id: number;
  admissionId: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  userId: number;
  nombreProfesional: string;
  descripcion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedimientoMenorCreateRequest {
  admissionId: number;
  userId?: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  descripcion: string;
}

export interface ProcedimientoMenorUpdateRequest {
  userId?: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  descripcion: string;
  isActive: boolean;
}

export interface ProcedimientoNoQxResponse {
  id: number;
  admissionId: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  userId: number;
  nombreProfesional: string;
  descripcion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedimientoNoQxCreateRequest {
  admissionId: number;
  userId?: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  descripcion: string;
}

export interface ProcedimientoNoQxUpdateRequest {
  userId?: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  descripcion: string;
  isActive: boolean;
}

export interface ProcedimientoDiagnosticoResponse {
  id: number;
  admissionId: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  userId: number;
  nombreProfesional: string;
  estudiosRealizados: string;
  hallazgos: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedimientoDiagnosticoCreateRequest {
  admissionId: number;
  userId?: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  estudiosRealizados: string;
  hallazgos: string;
}

export interface ProcedimientoDiagnosticoUpdateRequest {
  userId?: number;
  fechaProcedimiento: string;
  horaProcedimiento: string;
  estudiosRealizados: string;
  hallazgos: string;
  isActive: boolean;
}

export interface NotaEnfermeriaResponse {
  id: number;
  admissionId: number;
  fechaNota: string;
  horaNota: string;
  userId: number;
  nombreProfesional: string;
  nota: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotaEnfermeriaCreateRequest {
  admissionId: number;
  userId?: number;
  fechaNota: string;
  horaNota: string;
  nota: string;
}

export interface NotaEnfermeriaUpdateRequest {
  userId?: number;
  fechaNota: string;
  horaNota: string;
  nota: string;
  isActive: boolean;
}

export interface DescripcionQuirurgicaResponse {
  id: number;
  admissionId: number;
  fechaHoraInicio: string;
  fechaHoraFinalizacion: string;
  cirujanoId: number;
  nombreCirujano: string;
  anestesiologoId: number;
  nombreAnestesiologo: string;
  instrumentadorId: number;
  nombreInstrumentador: string;
  ayudanteQxId: number;
  nombreAyudanteQx: string;
  tipoAnestesiaId: number;
  nombreTipoAnestesia: string;
  procedimiento1: string | null;
  procedimiento2: string | null;
  procedimiento3: string | null;
  procedimiento4: string | null;
  diagnostico1: string | null;
  diagnostico2: string | null;
  diagnostico3: string | null;
  diagnostico4: string | null;
  descripcionProcedimiento: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DescripcionQuirurgicaCreateRequest {
  admissionId: number;
  fechaHoraInicio: string;
  fechaHoraFinalizacion: string;
  cirujanoId: number;
  anestesiologoId: number;
  instrumentadorId: number;
  ayudanteQxId: number;
  tipoAnestesiaId: number;
  procedimiento1: string | null;
  procedimiento2: string | null;
  procedimiento3: string | null;
  procedimiento4: string | null;
  diagnostico1: string | null;
  diagnostico2: string | null;
  diagnostico3: string | null;
  diagnostico4: string | null;
  descripcionProcedimiento: string;
}

export type DescripcionQuirurgicaUpdateRequest = Omit<
  DescripcionQuirurgicaCreateRequest,
  "admissionId"
> & {
  isActive: boolean;
};

export interface DatosClinicosEgresoResponse {
  id: number;
  admissionId: number;
  tensionArterial: string | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  temperatura: number | null;
  saturacionOxigeno: number | null;
  peso: number | null;
  talla: number | null;
  imc: number | null;
  condicionesGeneralesSalida: string;
  cabezaCuello: string | null;
  torax: string | null;
  abdomen: string | null;
  extremidades: string | null;
  sistemaNervioso: string | null;
  genitourinario: string | null;
  evoluciones: string | null;
  justificacionHospitalizacion: string | null;
  ordenes: string | null;
  diagnosticoEgresoId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatosClinicosEgresoCreateRequest {
  admissionId: number;
  tensionArterial: string | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  temperatura: number | null;
  saturacionOxigeno: number | null;
  peso: number | null;
  talla: number | null;
  condicionesGeneralesSalida: string;
  cabezaCuello: string | null;
  torax: string | null;
  abdomen: string | null;
  extremidades: string | null;
  sistemaNervioso: string | null;
  genitourinario: string | null;
  evoluciones: string | null;
  justificacionHospitalizacion: string | null;
  ordenes: string | null;
}

export type DatosClinicosEgresoUpdateRequest = Omit<
  DatosClinicosEgresoCreateRequest,
  "admissionId"
> & {
  isActive: boolean;
};

export interface DiagnosticoEgresoResponse {
  id: number;
  datosClinicosEgresoId: number;
  ambitoEgresoId: number;
  nombreAmbitoEgreso: string;
  fechaEgreso: string;
  diagnosticoEgreso1Id: number;
  codigoDiagnosticoEgreso1: string;
  descripcionDiagnosticoEgreso1: string;
  diagnosticoEgreso2Id: number | null;
  codigoDiagnosticoEgreso2: string | null;
  descripcionDiagnosticoEgreso2: string | null;
  diagnosticoEgreso3Id: number | null;
  codigoDiagnosticoEgreso3: string | null;
  descripcionDiagnosticoEgreso3: string | null;
  finalidadConsultaId: number;
  nombreFinalidadConsulta: string;
  causaExternaId: number;
  nombreCausaExterna: string;
  condicionSalidaId: number;
  descripcionCondicionSalida: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticoEgresoCreateRequest {
  datosClinicosEgresoId: number;
  ambitoEgresoId: number;
  fechaEgreso: string;
  diagnosticoEgreso1Id: number;
  diagnosticoEgreso2Id: number | null;
  diagnosticoEgreso3Id: number | null;
  finalidadConsultaId: number;
  causaExternaId: number;
  condicionSalidaId: number;
}

export type DiagnosticoEgresoUpdateRequest = Omit<
  DiagnosticoEgresoCreateRequest,
  "datosClinicosEgresoId"
> & {
  isActive: boolean;
};

export interface CondicionSalidaResponse {
  id: number;
  descripcion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnesthesiaTypeResponse {
  id: number;
  name: string;
}

export interface SurgicalProcedureResponse {
  id: number;
  code: string;
  codeDescription: string;
  cups: string;
  cupsDescription: string;
  codificationType: string;
}
