"use client";

import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import type { GetUser } from "@/core/interfaces/user/users";
import { buildFullName } from "@/core/utils/user";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import type {
  HCInicialResponse,
  EvolucionResponse,
  EvolucionEspecialistaResponse,
  ProcedimientoMenorResponse,
  ProcedimientoDiagnosticoResponse,
  ProcedimientoNoQxResponse,
  NotaEnfermeriaResponse,
  DatosClinicosEgresoResponse,
  DiagnosticoEgresoResponse,
} from "@/core/interfaces/care/hciInicial";
import type { DiagnosisRow } from "../types";
import { HciPrintDocument } from "./HciPrintDocument";
import { GenericClinicalPrintDocument } from "./GenericClinicalPrintDocument";
import type { PrintPatient } from "./printDocument.utils";
import "./epicrisisPrint.css";

/** Pie de cada hoja: el número de página lo pone el CSS (contador de hojas). */
const pageFooter = (
  <div className="epicrisis-page-footer">
    <span className="epicrisis-page-number" />
    <span className="epicrisis-page-legal">
      La historia clínica electrónica y medios automatizados que manejen historias
      clínicas, no llevan firmas o sellos, teniendo en cuenta el Art. 18 de la
      resolución 1995 de julio de 1999
    </span>
  </div>
);

interface Props {
  provider?: TProvider;
  patient: PrintPatient;
  admissionId?: string | number;
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
  datosClinicosEgreso: DatosClinicosEgresoResponse[];
  diagnosticosEgreso: DiagnosticoEgresoResponse[];
}

const toSortKey = (fecha?: string, hora?: string) => {
  if (!fecha) return Number.POSITIVE_INFINITY;
  const datePart = fecha.slice(0, 10);
  const timePart = (hora || "00:00").slice(0, 5);
  const time = new Date(`${datePart}T${timePart}`).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
};

type EpicrisisEntry =
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
  | { type: "notaEnfermeria"; data: NotaEnfermeriaResponse; sortKey: number }
  | {
      type: "notaEgreso";
      data: DatosClinicosEgresoResponse;
      diagnostico?: DiagnosticoEgresoResponse;
      sortKey: number;
    };

export const EpicrisisPrintDocument = ({
  provider,
  patient,
  admissionId,
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
  datosClinicosEgreso,
  diagnosticosEgreso,
}: Props) => {
  const docRef = useRef<HTMLDivElement>(null);

  // Cada parte de la epicrisis pagina por su cuenta, así que el total de hojas
  // se cuenta en el DOM cuando cambian las páginas y se pasa al CSS
  // (--epi-total), que pinta "Página N/Total" con un contador.
  useEffect(() => {
    const doc = docRef.current;
    if (!doc) return;
    const updateTotal = () => {
      const total = doc.querySelectorAll(":scope > .hci-print-page:not([aria-hidden])").length;
      doc.style.setProperty("--epi-total", `"${total}"`);
    };
    updateTotal();
    const observer = new MutationObserver(updateTotal);
    observer.observe(doc, { childList: true });
    return () => observer.disconnect();
  }, []);

  const findUser =(userId: number) => users.find((u) => u.id === userId);
  const findDiagnostico = (diagnosticoEgresoId: number | null) =>
    diagnosticoEgresoId
      ? diagnosticosEgreso.find((d) => d.id === diagnosticoEgresoId)
      : undefined;

  // La HCI inicial va siempre de primera; el resto se ordena por fecha.
  const entries: EpicrisisEntry[] = [
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
    ...datosClinicosEgreso.map((data): EpicrisisEntry => {
      const diagnostico = findDiagnostico(data.diagnosticoEgresoId);
      const sortSource = diagnostico?.fechaEgreso ?? data.createdAt;
      const sortTime = sortSource ? new Date(sortSource).getTime() : NaN;
      return {
        type: "notaEgreso",
        data,
        diagnostico,
        sortKey: Number.isNaN(sortTime) ? Number.POSITIVE_INFINITY : sortTime,
      };
    }),
  ].sort((a, b) => a.sortKey - b.sortKey);

  // .epicrisis-doc activa el diseño de epicrisisPrint.css solo en este documento.
  return (
    <div className="epicrisis-doc" ref={docRef}>
      <HciPrintDocument
        provider={provider}
        patient={patient}
        admissionId={admissionId}
        admissionDate={admissionDate}
        attentionDate={attentionDate}
        attentionTime={attentionTime}
        contractName={contractName}
        showProcessDates
        pageFooter={pageFooter}
        doctorName={doctorName}
        doctorUser={doctorUser}
        hcInicial={hcInicial}
        diagnoses={diagnoses}
      />
      {entries.map((entry) => {
        switch (entry.type) {
          case "evolucion": {
            const evo = entry.data;
            return (
              <GenericClinicalPrintDocument
                key={`evolucion-${evo.id}`}
                provider={provider}
                patient={patient}
                admissionId={admissionId}
                admissionDate={admissionDate}
                contractName={contractName}
                showProcessDates
                pageFooter={pageFooter}
                documentTitle={evo.especialidadNombre ? `Evolución - ${evo.especialidadNombre}` : "Evolución"}
                attentionLabel="Fecha y hora de evolución:"
                attentionDate={evo.fechaEvolucion}
                attentionTime={evo.horaEvolucion?.slice(0, 5)}
                doctorName={evo.nombreProfesional}
                doctorUser={findUser(evo.userId)}
                doctorSpecialty={evo.especialidadNombre}
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
                admissionId={admissionId}
                admissionDate={admissionDate}
                contractName={contractName}
                showProcessDates
                pageFooter={pageFooter}
                documentTitle={
                  evo.especialidadNombre
                    ? `Evolución de Especialista - ${evo.especialidadNombre}`
                    : "Evolución de Especialista"
                }
                attentionLabel="Fecha y hora de evolución:"
                attentionDate={evo.fechaEvolucion}
                attentionTime={evo.horaEvolucion?.slice(0, 5)}
                doctorName={evo.nombreProfesional}
                doctorUser={findUser(evo.userId)}
                doctorSpecialty={evo.especialidadNombre}
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
                admissionId={admissionId}
                admissionDate={admissionDate}
                contractName={contractName}
                showProcessDates
                pageFooter={pageFooter}
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
                admissionId={admissionId}
                admissionDate={admissionDate}
                contractName={contractName}
                showProcessDates
                pageFooter={pageFooter}
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
                admissionId={admissionId}
                admissionDate={admissionDate}
                contractName={contractName}
                showProcessDates
                pageFooter={pageFooter}
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
                admissionId={admissionId}
                admissionDate={admissionDate}
                contractName={contractName}
                showProcessDates
                pageFooter={pageFooter}
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
          case "notaEgreso": {
            const nota = entry.data;
            const diagnostico = entry.diagnostico;
            // Médico que firmó la nota; las notas anteriores a este dato usan el de la vista.
            const egresoDoctorUser = nota.userId ? findUser(nota.userId) : undefined;
            // fechaEgreso llega en UTC: se muestra en hora local.
            const fechaEgreso = diagnostico?.fechaEgreso ? dayjs(diagnostico.fechaEgreso) : null;
            return (
              <GenericClinicalPrintDocument
                key={`nota-egreso-${nota.id}`}
                provider={provider}
                patient={patient}
                admissionId={admissionId}
                admissionDate={admissionDate}
                contractName={contractName}
                showProcessDates
                pageFooter={pageFooter}
                documentTitle="Nota de Egreso"
                attentionLabel="Fecha y hora de egreso:"
                attentionDate={fechaEgreso?.format("YYYY-MM-DD") ?? ""}
                attentionTime={fechaEgreso?.format("HH:mm") ?? ""}
                doctorName={egresoDoctorUser ? buildFullName(egresoDoctorUser) : doctorName}
                doctorUser={egresoDoctorUser ?? doctorUser}
                sections={[
                  {
                    title: "Signos vitales",
                    rows: [
                      { label: "TA", value: nota.tensionArterial },
                      { label: "FC (lpm)", value: nota.frecuenciaCardiaca },
                      { label: "FR (rpm)", value: nota.frecuenciaRespiratoria },
                      { label: "Temperatura (°C)", value: nota.temperatura },
                      { label: "Sat. O₂ (%)", value: nota.saturacionOxigeno },
                      { label: "Peso (kg)", value: nota.peso },
                      { label: "Talla (m)", value: nota.talla },
                      { label: "IMC", value: nota.imc != null ? `${nota.imc} kg/m²` : null },
                    ],
                  },
                  {
                    title: "Datos Clínicos de Egreso",
                    rows: [
                      { label: "Condiciones generales de salida", value: nota.condicionesGeneralesSalida },
                      { label: "Cabeza y cuello", value: nota.cabezaCuello },
                      { label: "Tórax", value: nota.torax },
                      { label: "Abdomen", value: nota.abdomen },
                      { label: "Extremidades", value: nota.extremidades },
                      { label: "Sistema nervioso", value: nota.sistemaNervioso },
                      { label: "Genitourinario", value: nota.genitourinario },
                      { label: "Evoluciones", value: nota.evoluciones },
                      { label: "Justificación de hospitalización", value: nota.justificacionHospitalizacion },
                      { label: "Órdenes", value: nota.ordenes },
                    ],
                  },
                  {
                    title: "Diagnósticos de Egreso",
                    rows: [
                      { label: "Ámbito de egreso", value: diagnostico?.nombreAmbitoEgreso },
                      { label: "Fecha de egreso", value: diagnostico?.fechaEgreso },
                      {
                        label: "Diagnóstico 1",
                        value: diagnostico
                          ? `${diagnostico.codigoDiagnosticoEgreso1} - ${diagnostico.descripcionDiagnosticoEgreso1}`
                          : null,
                      },
                      {
                        label: "Diagnóstico 2",
                        value:
                          diagnostico?.codigoDiagnosticoEgreso2 && diagnostico?.descripcionDiagnosticoEgreso2
                            ? `${diagnostico.codigoDiagnosticoEgreso2} - ${diagnostico.descripcionDiagnosticoEgreso2}`
                            : null,
                      },
                      {
                        label: "Diagnóstico 3",
                        value:
                          diagnostico?.codigoDiagnosticoEgreso3 && diagnostico?.descripcionDiagnosticoEgreso3
                            ? `${diagnostico.codigoDiagnosticoEgreso3} - ${diagnostico.descripcionDiagnosticoEgreso3}`
                            : null,
                      },
                      { label: "Finalidad de consulta", value: diagnostico?.nombreFinalidadConsulta },
                      { label: "Causa externa", value: diagnostico?.nombreCausaExterna },
                      { label: "Condición de salida", value: diagnostico?.descripcionCondicionSalida },
                    ],
                  },
                ]}
              />
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};
