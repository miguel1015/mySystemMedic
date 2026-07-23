"use client";

import dayjs from "dayjs";
import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import type {
  HCInicialResponse,
  EvolucionResponse,
  EvolucionEspecialistaResponse,
  NotaMedicaResponse,
  ProcedimientoMenorResponse,
  ProcedimientoDiagnosticoResponse,
  ProcedimientoNoQxResponse,
  NotaEnfermeriaResponse,
  DescripcionQuirurgicaResponse,
} from "@/core/interfaces/care/hciInicial";
import type { DiagnosisRow } from "../types";
import { HciPrintDocument } from "./HciPrintDocument";
import { NotaMedicaPrintDocument } from "./NotaMedicaPrintDocument";
import { GenericClinicalPrintDocument } from "./GenericClinicalPrintDocument";
import type { PrintPatient } from "./printDocument.utils";

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionDate: string;
  attentionDate: string;
  attentionTime: string;
  contractName: string;
  doctorName: string;
  doctorUser?: GetUser;
  hcInicial?: HCInicialResponse | null;
  diagnoses: DiagnosisRow[];
  users: GetUser[];
  descripcionesQuirurgicas: DescripcionQuirurgicaResponse[];
  notasMedicas: NotaMedicaResponse[];
  evoluciones: EvolucionResponse[];
  evolucionEspecialistas: EvolucionEspecialistaResponse[];
  procedimientosMenores: ProcedimientoMenorResponse[];
  procedimientosDiagnosticos: ProcedimientoDiagnosticoResponse[];
  procedimientosNoQx: ProcedimientoNoQxResponse[];
  notasEnfermeria: NotaEnfermeriaResponse[];
}

export const EpicrisisPrintDocument = ({
  provider,
  patient,
  admissionDate,
  attentionDate,
  attentionTime,
  contractName,
  doctorName,
  doctorUser,
  hcInicial,
  diagnoses,
  users,
  descripcionesQuirurgicas,
  notasMedicas,
  evoluciones,
  evolucionEspecialistas,
  procedimientosMenores,
  procedimientosDiagnosticos,
  procedimientosNoQx,
  notasEnfermeria,
}: Props) => {
  const findUser = (userId: number) => users.find((u) => u.id === userId);

  return (
    <>
      <HciPrintDocument
        provider={provider}
        patient={patient}
        admissionDate={admissionDate}
        attentionDate={attentionDate}
        attentionTime={attentionTime}
        contractName={contractName}
        doctorName={doctorName}
        doctorUser={doctorUser}
        hcInicial={hcInicial}
        diagnoses={diagnoses}
      />

      {descripcionesQuirurgicas.map((record) => (
        <GenericClinicalPrintDocument
          key={`qx-${record.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          documentTitle="Descripción Quirúrgica"
          attentionLabel="Fecha y hora de inicio:"
          attentionDate={dayjs(record.fechaHoraInicio).format("DD/MM/YYYY")}
          attentionTime={dayjs(record.fechaHoraInicio).format("HH:mm")}
          doctorName={record.nombreCirujano}
          doctorUser={findUser(record.cirujanoId)}
          sections={[
            {
              title: "Fechas de ejecución",
              rows: [
                {
                  label: "Fecha inicial de ejecución",
                  value: dayjs(record.fechaHoraInicio).format("DD/MM/YYYY HH:mm"),
                },
                {
                  label: "Fecha final de ejecución",
                  value: dayjs(record.fechaHoraFinalizacion).format("DD/MM/YYYY HH:mm"),
                },
              ],
            },
            {
              title: "Equipo quirúrgico",
              rows: [
                { label: "Cirujano", value: record.nombreCirujano },
                { label: "Anestesiólogo", value: record.nombreAnestesiologo },
                { label: "Instrumentador", value: record.nombreInstrumentador },
                { label: "Ayudante Qx", value: record.nombreAyudanteQx },
                { label: "Tipo de anestesia", value: record.nombreTipoAnestesia },
              ],
            },
            {
              title: "Procedimientos (CUPS/SOAT)",
              rows: [record.procedimiento1, record.procedimiento2, record.procedimiento3, record.procedimiento4]
                .map((code, idx) =>
                  code
                    ? { label: idx === 0 ? "Principal" : `Procedimiento ${idx + 1}`, value: code }
                    : null,
                )
                .filter((row): row is { label: string; value: string } => row !== null),
            },
            {
              title: "Diagnósticos de ingreso (CIE-10)",
              rows: [record.diagnostico1, record.diagnostico2, record.diagnostico3, record.diagnostico4]
                .map((code, idx) =>
                  code
                    ? { label: idx === 0 ? "Principal" : `Diagnóstico ${idx + 1}`, value: code }
                    : null,
                )
                .filter((row): row is { label: string; value: string } => row !== null),
            },
            {
              title: "Descripción del procedimiento",
              rows: [{ label: "Descripción del procedimiento", value: record.descripcionProcedimiento }],
            },
          ]}
        />
      ))}

      {notasMedicas.map((nota) => (
        <NotaMedicaPrintDocument
          key={`nota-medica-${nota.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          fechaNota={nota.fechaNota}
          horaNota={nota.horaNota}
          doctorName={nota.nombreProfesional}
          doctorUser={findUser(nota.userId)}
          nota={nota.nota}
        />
      ))}

      {evoluciones.map((evo) => (
        <GenericClinicalPrintDocument
          key={`evolucion-${evo.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          documentTitle="Evolución"
          attentionLabel="Fecha y hora de evolución:"
          attentionDate={evo.fechaEvolucion}
          attentionTime={evo.horaEvolucion?.slice(0, 5)}
          doctorName={evo.nombreProfesional}
          doctorUser={findUser(evo.userId)}
          sections={[
            {
              title: "Motivo de consulta",
              rows: [{ label: "Motivo de consulta", value: evo.motivoConsulta }],
            },
            {
              title: "Signos vitales",
              rows: [
                { label: "TA", value: evo.tensionArterial },
                { label: "FC (lpm)", value: evo.frecuenciaCardiaca },
                { label: "FR (rpm)", value: evo.frecuenciaRespiratoria },
                { label: "Temperatura (°C)", value: evo.temperatura },
                { label: "Sat. O₂ (%)", value: evo.saturacionOxigeno },
                { label: "Glasgow", value: evo.glasgow },
                { label: "Peso (kg)", value: evo.peso },
                { label: "Talla (m)", value: evo.talla },
                { label: "IMC", value: evo.imc != null ? `${evo.imc} kg/m²` : null },
              ],
            },
            {
              title: "Plan",
              rows: [{ label: "Plan", value: evo.plan }],
            },
          ]}
        />
      ))}

      {evolucionEspecialistas.map((evo) => (
        <GenericClinicalPrintDocument
          key={`evolucion-especialista-${evo.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          documentTitle="Evolución de Especialista"
          attentionLabel="Fecha y hora de evolución:"
          attentionDate={evo.fechaEvolucion}
          attentionTime={evo.horaEvolucion?.slice(0, 5)}
          doctorName={evo.nombreProfesional}
          doctorUser={findUser(evo.userId)}
          sections={[
            {
              title: "Motivo de consulta",
              rows: [{ label: "Motivo de consulta", value: evo.motivoConsulta }],
            },
            {
              title: "Plan",
              rows: [{ label: "Plan", value: evo.plan }],
            },
          ]}
        />
      ))}

      {procedimientosMenores.map((proc) => (
        <GenericClinicalPrintDocument
          key={`procedimiento-menor-${proc.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          documentTitle="Procedimiento Menor"
          attentionLabel="Fecha y hora del procedimiento:"
          attentionDate={proc.fechaProcedimiento}
          attentionTime={proc.horaProcedimiento?.slice(0, 5)}
          doctorName={proc.nombreProfesional}
          doctorUser={findUser(proc.userId)}
          sections={[
            {
              title: "Procedimiento menor",
              rows: [{ label: "Procedimiento menor", value: proc.descripcion }],
            },
          ]}
        />
      ))}

      {procedimientosDiagnosticos.map((proc) => (
        <GenericClinicalPrintDocument
          key={`procedimiento-diagnostico-${proc.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          documentTitle="Procedimiento Diagnóstico"
          attentionLabel="Fecha y hora del procedimiento:"
          attentionDate={proc.fechaProcedimiento}
          attentionTime={proc.horaProcedimiento?.slice(0, 5)}
          doctorName={proc.nombreProfesional}
          doctorUser={findUser(proc.userId)}
          sections={[
            {
              title: "Estudios realizados",
              rows: [{ label: "Estudios realizados", value: proc.estudiosRealizados }],
            },
            {
              title: "Hallazgos",
              rows: [{ label: "Hallazgos", value: proc.hallazgos }],
            },
          ]}
        />
      ))}

      {procedimientosNoQx.map((proc) => (
        <GenericClinicalPrintDocument
          key={`procedimiento-noqx-${proc.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          documentTitle="Procedimiento No Quirúrgico"
          attentionLabel="Fecha y hora del procedimiento:"
          attentionDate={proc.fechaProcedimiento}
          attentionTime={proc.horaProcedimiento?.slice(0, 5)}
          doctorName={proc.nombreProfesional}
          doctorUser={findUser(proc.userId)}
          sections={[
            {
              title: "Procedimiento no quirúrgico",
              rows: [{ label: "Procedimiento no quirúrgico", value: proc.descripcion }],
            },
          ]}
        />
      ))}

      {notasEnfermeria.map((nota) => (
        <GenericClinicalPrintDocument
          key={`nota-enfermeria-${nota.id}`}
          provider={provider}
          patient={patient}
          admissionDate={admissionDate}
          contractName={contractName}
          documentTitle="Nota de Enfermería"
          attentionLabel="Fecha y hora de la nota:"
          attentionDate={nota.fechaNota}
          attentionTime={nota.horaNota?.slice(0, 5)}
          doctorName={nota.nombreProfesional}
          doctorUser={findUser(nota.userId)}
          sections={[
            {
              title: "Nota de enfermería",
              rows: [{ label: "Nota de enfermería", value: nota.nota }],
            },
          ]}
        />
      ))}
    </>
  );
};
