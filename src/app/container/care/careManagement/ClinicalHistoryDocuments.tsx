"use client"

import type { ReactNode } from "react"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { DataUser, GetUser } from "@/core/interfaces/user/users"
import type { TipoHojaGastos } from "@/core/interfaces/care/hojaGastos"
import {
  buildPrintPatient,
  type PrintPatient,
} from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { HciPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/HciPrintDocument"
import { EpicrisisPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/EpicrisisPrintDocument"
import { GenericClinicalPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/GenericClinicalPrintDocument"
import type { DiagnosisRow } from "@/app/container/care/clinicalRecords/initialClinicalHistory/types"
import { MedicalOrderPrintDocument } from "@/app/container/care/medicalOrders/MedicalOrderPrintDocument"
import { MedicationPosPrintDocument } from "@/app/container/care/medicationPos/MedicationPosPrintDocument"
import { MedicationApplicationPrintDocument } from "@/app/container/care/medicationApplication/MedicationApplicationPrintDocument"
import { LabResultPrintDocument } from "@/app/container/care/labSheet/LabResultPrintDocument"
import { XrayPrintDocument } from "@/app/container/care/xray/XrayPrintDocument"
import { ExpenseSheetPrintDocument } from "@/app/container/care/expenseSheet/ExpenseSheetPrintDocument"
import { AdmissionRecordDocuments } from "@/app/container/care/admissionHistory/detail/AdmissionRecordDocuments"
import type { AdmissionRecord } from "@/app/container/care/admissionHistory/detail/useAdmissionRecord"

export type ClinicalDocumentKind =
  | "hcInicial"
  | "epicrisis"
  | "ordenes"
  | "formulasPos"
  | "aplicaciones"
  | "laboratorio"
  | "imagenes"
  | `gastos-${TipoHojaGastos}`
  | "notasMedicas"
  | "cirugia"
  | "procedimientos"
  | "notasEnfermeria"

interface Props {
  kind: ClinicalDocumentKind
  record: AdmissionRecord
  provider?: TProvider
  usersById: Map<number, DataUser | undefined>
  printedAt: Date
}

export const hciDiagnoses = (record: AdmissionRecord): DiagnosisRow[] =>
  (record.hcInicial?.analisisDiagnosticosPlan?.diagnosticos ?? []).map((d, idx) => ({
    id: d.id,
    cie10Id: d.id,
    code: d.codigo,
    diagnosis: d.descripcion,
    main: idx === 0,
  }))

// Un documento (o grupo de documentos del mismo tipo) de la admisión, con el mismo
// formato con que lo imprime su módulo.
export function ClinicalHistoryDocument({ kind, record, provider, usersById, printedAt }: Props) {
  const { admission, patient } = record
  if (!admission) return null

  const printPatient: PrintPatient = buildPrintPatient(admission, patient)
  const common = {
    provider,
    patient: printPatient,
    admissionId: admission.id,
    admissionDate: admission.admissionDate,
    contractName: admission.convenioNombre || patient?.contractName || "",
  }
  const generatedAt = printedAt.toISOString()
  const users: GetUser[] = [...usersById.entries()]
    .filter((entry): entry is [number, DataUser] => !!entry[1])
    .map(([id, user]) => ({ ...user, id }) as GetUser)
  const findUser = (id?: number | null) => users.find((u) => u.id === id)

  if (kind.startsWith("gastos-")) {
    const tipoHoja = kind.replace("gastos-", "") as TipoHojaGastos
    return (
      <ExpenseSheetPrintDocument
        {...common}
        tipoHoja={tipoHoja}
        registros={record.hojaGastos.filter((r) => r.tipoHoja === tipoHoja)}
        firmantesById={usersById}
        printedAt={printedAt}
      />
    )
  }

  const hci = record.hcInicial
  const documents: Record<Exclude<ClinicalDocumentKind, `gastos-${string}`>, () => ReactNode> = {
    hcInicial: () => (
      <HciPrintDocument
        {...common}
        attentionDate={hci?.admissionDate?.slice(0, 10) ?? ""}
        attentionTime={hci?.admissionTime?.slice(0, 5) ?? ""}
        doctorName={hci?.nombreProfesional ?? ""}
        doctorUser={findUser(hci?.userId)}
        hcInicial={hci}
        diagnoses={hciDiagnoses(record)}
      />
    ),

    epicrisis: () => (
      <EpicrisisPrintDocument
        {...common}
        attentionDate={hci?.admissionDate?.slice(0, 10) ?? ""}
        attentionTime={hci?.admissionTime?.slice(0, 5) ?? ""}
        doctorName={hci?.nombreProfesional ?? ""}
        doctorUser={findUser(hci?.userId)}
        users={users}
        hcInicial={hci}
        diagnoses={hciDiagnoses(record)}
        evoluciones={record.evoluciones}
        evolucionEspecialistas={record.evolucionEspecialistas}
        procedimientosMenores={record.procedimientosMenores}
        procedimientosDiagnosticos={record.procedimientosDiagnosticos}
        procedimientosNoQx={record.procedimientosNoQx}
        notasEnfermeria={record.notasEnfermeria}
        datosClinicosEgreso={record.datosClinicosEgreso}
        diagnosticosEgreso={record.diagnosticosEgreso}
      />
    ),

    ordenes: () =>
      record.ordenesMedicas.map((orden) => (
        <MedicalOrderPrintDocument key={orden.id} {...common} orden={orden} generatedAt={generatedAt} />
      )),

    formulasPos: () =>
      record.medicamentosPos.map((formula) => (
        <MedicationPosPrintDocument key={formula.id} {...common} formula={formula} generatedAt={generatedAt} />
      )),

    aplicaciones: () => (
      <MedicationApplicationPrintDocument
        {...common}
        ordenes={record.aplicaciones}
        profesionalesById={usersById}
        printedAt={printedAt}
      />
    ),

    laboratorio: () =>
      record.laboratorio.map((lab) => (
        <LabResultPrintDocument
          key={lab.id}
          {...common}
          record={lab}
          study={record.catalogoLaboratorio.find((e) => e.codigo === lab.codigoEstudio)}
        />
      )),

    imagenes: () =>
      record.rayosX.map((estudio) => (
        <XrayPrintDocument key={estudio.id} {...common} estudio={estudio} generatedAt={generatedAt} />
      )),

    notasMedicas: () => (
      <AdmissionRecordDocuments
        record={record}
        stages={["notas"]}
        provider={provider}
        usersById={usersById}
        cities={[]}
        states={[]}
        printedAt={printedAt}
      />
    ),

    cirugia: () => (
      <AdmissionRecordDocuments
        record={record}
        stages={["cirugia"]}
        provider={provider}
        usersById={usersById}
        cities={[]}
        states={[]}
        printedAt={printedAt}
      />
    ),

    procedimientos: () => (
      <>
        {record.procedimientosMenores.map((proc) => (
          <GenericClinicalPrintDocument
            key={`menor-${proc.id}`}
            {...common}
            documentTitle="Procedimiento Menor"
            attentionLabel="Fecha y hora del procedimiento:"
            attentionDate={proc.fechaProcedimiento}
            attentionTime={proc.horaProcedimiento?.slice(0, 5)}
            doctorName={proc.nombreProfesional}
            doctorUser={findUser(proc.userId)}
            sections={[{ title: "Procedimiento menor", rows: [{ label: "Procedimiento menor", value: proc.descripcion }] }]}
          />
        ))}
        {record.procedimientosDiagnosticos.map((proc) => (
          <GenericClinicalPrintDocument
            key={`diagnostico-${proc.id}`}
            {...common}
            documentTitle="Procedimiento Diagnóstico"
            attentionLabel="Fecha y hora del procedimiento:"
            attentionDate={proc.fechaProcedimiento}
            attentionTime={proc.horaProcedimiento?.slice(0, 5)}
            doctorName={proc.nombreProfesional}
            doctorUser={findUser(proc.userId)}
            sections={[
              { title: "Estudios realizados", rows: [{ label: "Estudios realizados", value: proc.estudiosRealizados }] },
              { title: "Hallazgos", rows: [{ label: "Hallazgos", value: proc.hallazgos }] },
            ]}
          />
        ))}
        {record.procedimientosNoQx.map((proc) => (
          <GenericClinicalPrintDocument
            key={`noqx-${proc.id}`}
            {...common}
            documentTitle="Procedimiento No Quirúrgico"
            attentionLabel="Fecha y hora del procedimiento:"
            attentionDate={proc.fechaProcedimiento}
            attentionTime={proc.horaProcedimiento?.slice(0, 5)}
            doctorName={proc.nombreProfesional}
            doctorUser={findUser(proc.userId)}
            sections={[
              { title: "Procedimiento no quirúrgico", rows: [{ label: "Procedimiento no quirúrgico", value: proc.descripcion }] },
            ]}
          />
        ))}
      </>
    ),

    notasEnfermeria: () =>
      record.notasEnfermeria.map((nota) => (
        <GenericClinicalPrintDocument
          key={nota.id}
          {...common}
          documentTitle="Nota de Enfermería"
          attentionLabel="Fecha y hora de la nota:"
          attentionDate={nota.fechaNota}
          attentionTime={nota.horaNota?.slice(0, 5)}
          doctorName={nota.nombreProfesional}
          doctorUser={findUser(nota.userId)}
          sections={[{ title: "Nota de enfermería", rows: [{ label: "Nota de enfermería", value: nota.nota }] }]}
        />
      )),
  }

  return <>{documents[kind as keyof typeof documents]()}</>
}
