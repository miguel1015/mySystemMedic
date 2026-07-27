"use client";

import type { GetUser } from "@/core/interfaces/user/users";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import type {
  HCInicialResponse,
  EvolucionResponse,
  EvolucionEspecialistaResponse,
  ProcedimientoMenorResponse,
  ProcedimientoDiagnosticoResponse,
  ProcedimientoNoQxResponse,
  NotaEnfermeriaResponse,
} from "@/core/interfaces/care/hciInicial";
import type { DiagnosisRow } from "../types";
import { HciPrintDocument } from "./HciPrintDocument";
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
  evoluciones: EvolucionResponse[];
  evolucionEspecialistas: EvolucionEspecialistaResponse[];
  procedimientosMenores: ProcedimientoMenorResponse[];
  procedimientosDiagnosticos: ProcedimientoDiagnosticoResponse[];
  procedimientosNoQx: ProcedimientoNoQxResponse[];
  notasEnfermeria: NotaEnfermeriaResponse[];
}

const toSortKey = (fecha?: string, hora?: string) => {
  if (!fecha) return Number.POSITIVE_INFINITY;
  const datePart = fecha.slice(0, 10);
  const timePart = (hora || "00:00").slice(0, 5);
  const time = new Date(`${datePart}T${timePart}`).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
};

type EpicrisisEntry =
  | { type: "hci"; sortKey: number }
  | { type: "evolucion"; data: EvolucionResponse; sortKey: number }
  | {
      type: "evolucionEspecialista";
      data: EvolucionEspecialistaResponse;
      sortKey: number;
    }
  | {
      type: "procedimientoMenor";
      data: ProcedimientoMenorResponse;
      sortKey: number;
    }
  | {
      type: "procedimientoDiagnostico";
      data: ProcedimientoDiagnosticoResponse;
      sortKey: number;
    }
  | {
      type: "procedimientoNoQx";
      data: ProcedimientoNoQxResponse;
      sortKey: number;
    }
  | { type: "notaEnfermeria"; data: NotaEnfermeriaResponse; sortKey: number };

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
  evoluciones,
  evolucionEspecialistas,
  procedimientosMenores,
  procedimientosDiagnosticos,
  procedimientosNoQx,
  notasEnfermeria,
}: Props) => {
  const findUser = (userId: number) => users.find((u) => u.id === userId);

  const entries: EpicrisisEntry[] = [
    { type: "hci" as const, sortKey: toSortKey(attentionDate, attentionTime) },
    ...evoluciones.map((data): EpicrisisEntry => ({
      type: "evolucion",
      data,
      sortKey: toSortKey(data.fechaEvolucion, data.horaEvolucion),
    })),
    ...evolucionEspecialistas.map((data): EpicrisisEntry => ({
      type: "evolucionEspecialista",
      data,
      sortKey: toSortKey(data.fechaEvolucion, data.horaEvolucion),
    })),
    ...procedimientosMenores.map((data): EpicrisisEntry => ({
      type: "procedimientoMenor",
      data,
      sortKey: toSortKey(data.fechaProcedimiento, data.horaProcedimiento),
    })),
    ...procedimientosDiagnosticos.map((data): EpicrisisEntry => ({
      type: "procedimientoDiagnostico",
      data,
      sortKey: toSortKey(data.fechaProcedimiento, data.horaProcedimiento),
    })),
    ...procedimientosNoQx.map((data): EpicrisisEntry => ({
      type: "procedimientoNoQx",
      data,
      sortKey: toSortKey(data.fechaProcedimiento, data.horaProcedimiento),
    })),
    ...notasEnfermeria.map((data): EpicrisisEntry => ({
      type: "notaEnfermeria",
      data,
      sortKey: toSortKey(data.fechaNota, data.horaNota),
    })),
  ].sort((a, b) => a.sortKey - b.sortKey);

  return (
    <>
      {entries.map((entry) => {
        switch (entry.type) {
          case "hci":
            return (
              <HciPrintDocument
                key="hci-inicial"
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
            );
          case "evolucion": {
            const evo = entry.data;
            return (
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
            );
          }
          case "evolucionEspecialista": {
            const evo = entry.data;
            return (
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
            );
          }
          case "procedimientoMenor": {
            const proc = entry.data;
            return (
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
            );
          }
          case "procedimientoDiagnostico": {
            const proc = entry.data;
            return (
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
            );
          }
          case "procedimientoNoQx": {
            const proc = entry.data;
            return (
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
            );
          }
          case "notaEnfermeria": {
            const nota = entry.data;
            return (
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
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
};
