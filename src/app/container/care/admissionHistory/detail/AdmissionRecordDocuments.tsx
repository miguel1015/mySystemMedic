"use client"

import { Fragment, type ReactNode } from "react"
import type { TProvider, Insurance } from "@/core/interfaces/parameterization/types"
import type { DataUser, GetUser, TCities, TStates } from "@/core/interfaces/user/users"
import type { TipoHojaGastos } from "@/core/interfaces/care/hojaGastos"
import { formatDateTime, formatTime } from "@/core/utils/date"
import {
  buildPrintPatient,
  type PrintPatient,
} from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { EpicrisisPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/EpicrisisPrintDocument"
import { GenericClinicalPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/GenericClinicalPrintDocument"
import { NotaMedicaPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/NotaMedicaPrintDocument"
import type { DiagnosisRow } from "@/app/container/care/clinicalRecords/initialClinicalHistory/types"
import { AnesthesiaRecordPrintDocument } from "@/app/container/care/anesthesiaRecord/AnesthesiaRecordPrintDocument"
import { MedicalOrderPrintDocument } from "@/app/container/care/medicalOrders/MedicalOrderPrintDocument"
import { MedicationPosPrintDocument } from "@/app/container/care/medicationPos/MedicationPosPrintDocument"
import {
  MedicationApplicationPrintDocument,
  ordenesConAplicaciones,
} from "@/app/container/care/medicationApplication/MedicationApplicationPrintDocument"
import { LabResultPrintDocument } from "@/app/container/care/labSheet/LabResultPrintDocument"
import { XrayPrintDocument } from "@/app/container/care/xray/XrayPrintDocument"
import { ExpenseSheetPrintDocument } from "@/app/container/care/expenseSheet/ExpenseSheetPrintDocument"
import { InvoicePrintDocument } from "@/app/container/billing/admissionIntegral/invoicingTab/printPreview/InvoicePrintDocument"
import { FuripsPrintDocument } from "@/app/container/billing/furips/FuripsPrintDocument"
import { ReferralPrintDocument } from "@/app/container/care/admissions/ReferralPrintDocument"
import type { AdmissionRecord } from "./useAdmissionRecord"
import type { RecordStageKey } from "./admissionRecord.stages"

const HOJAS_GASTOS: TipoHojaGastos[] = ["Urgencias", "Hospitalizacion", "Cirugia"]

// Ids de los profesionales que firman algún documento del expediente.
export const recordSignerIds = (record: AdmissionRecord) => {
  const ids = [
    record.hcInicial?.userId,
    ...[
      ...record.notasMedicas,
      ...record.evoluciones,
      ...record.evolucionEspecialistas,
      ...record.procedimientosMenores,
      ...record.procedimientosDiagnosticos,
      ...record.procedimientosNoQx,
      ...record.notasEnfermeria,
      ...record.datosClinicosEgreso,
    ].map((item) => (item as { userId?: number | null }).userId),
    ...record.descripcionesQuirurgicas.map((d) => d.cirujanoId),
    ...record.aplicaciones.flatMap((o) => o.aplicaciones?.map((a) => a.profesionalId) ?? []),
    ...record.hojaGastos.map((r) => r.asistencialId),
    record.referral?.medicoRecibeUserId,
  ]
  return [...new Set(ids.filter((id): id is number => !!id))]
}

interface Props {
  record: AdmissionRecord
  stages: RecordStageKey[]
  provider?: TProvider
  insurance?: Insurance
  usersById: Map<number, DataUser | undefined>
  cities: TCities[]
  states: TStates[]
  printedAt: Date
}

// Documentos del expediente de una admisión. Son los mismos que imprime cada
// módulo, así que la consulta y la impresión muestran exactamente lo registrado.
export function AdmissionRecordDocuments({
  record,
  stages,
  provider,
  insurance,
  usersById,
  cities,
  states,
  printedAt,
}: Props) {
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

  const sections: Record<RecordStageKey, () => ReactNode> = {
    ingreso: () => {
      const { triage, companion, referral } = record
      return (
        <>
          <GenericClinicalPrintDocument
            {...common}
            documentTitle="Ingreso: Triage y Admisión"
            attentionLabel="Fecha y hora de admisión:"
            attentionDate={admission.admissionDate.slice(0, 10)}
            attentionTime={formatTime(admission.admissionDate, "")}
            doctorName=""
            sections={[
              {
                title: "Triage",
                rows: [
                  { label: "Fecha y hora", value: formatDateTime(triage?.fechaHora ?? admission.triageFechaHora, "") },
                  { label: "Prioridad", value: triage?.prioridad ?? admission.triagePrioridad },
                  { label: "Motivo de consulta", value: triage?.motivoConsulta },
                  { label: "TA", value: triage?.signosVitales?.tensionArterial },
                  { label: "FC (lpm)", value: triage?.signosVitales?.frecuenciaCardiaca },
                  { label: "FR (rpm)", value: triage?.signosVitales?.frecuenciaRespiratoria },
                  { label: "Temperatura (°C)", value: triage?.signosVitales?.temperatura },
                  { label: "Glasgow", value: triage?.signosVitales?.glasgow },
                  { label: "Peso (kg)", value: triage?.signosVitales?.peso },
                  { label: "Talla", value: triage?.signosVitales?.talla },
                ],
              },
              {
                title: "Admisión",
                rows: [
                  { label: "N° de admisión", value: admission.id },
                  { label: "Fecha y hora", value: formatDateTime(admission.admissionDate, "") },
                  { label: "EPS", value: admission.epsNombre },
                  { label: "Convenio", value: admission.convenioNombre },
                  { label: "Modalidad de atención", value: admission.careModalityName },
                  { label: "Causa de atención", value: admission.careReasonName },
                  { label: "Clasificación del servicio", value: admission.serviceClassificationName },
                  { label: "Grupo de servicio", value: admission.serviceGroupName },
                  { label: "Tipo de admisión", value: admission.admissionTypeName },
                  { label: "Ámbito", value: admission.careScopeName },
                  { label: "Finalidad", value: admission.carePurposeName },
                  { label: "Tipo de factura", value: admission.invoiceOperationType },
                  { label: "N° de póliza", value: admission.policyNumber },
                  { label: "Copago", value: admission.copayValue },
                  { label: "Cuota moderadora", value: admission.moderatorFeeValue },
                  { label: "Pagos compartidos", value: admission.sharedPaymentsValue },
                  { label: "Anticipo", value: admission.advancePaymentValue },
                ],
              },
              ...(companion
                ? [
                    {
                      title: "Acompañante",
                      rows: [
                        { label: "Documento", value: `${companion.documentTypeCode} ${companion.documentNumber}` },
                        { label: "Nombre", value: companion.fullName },
                        { label: "Parentesco", value: companion.kinshipTypeName },
                        { label: "Teléfono", value: companion.phone },
                        { label: "Email", value: companion.email },
                        { label: "Dirección", value: companion.address },
                      ],
                    },
                  ]
                : []),
            ]}
          />
          {referral && (
            <ReferralPrintDocument
              provider={provider}
              patient={printPatient}
              admission={admission}
              referral={referral}
              doctorUser={findUser(referral.medicoRecibeUserId)}
            />
          )}
        </>
      )
    },

    historia: () => {
      const hci = record.hcInicial
      const diagnoses: DiagnosisRow[] = (hci?.analisisDiagnosticosPlan?.diagnosticos ?? []).map(
        (d, idx) => ({
          id: d.id,
          cie10Id: d.id,
          code: d.codigo,
          diagnosis: d.descripcion,
          main: idx === 0,
        }),
      )
      return (
        <EpicrisisPrintDocument
          {...common}
          attentionDate={hci?.admissionDate?.slice(0, 10) ?? ""}
          attentionTime={hci?.admissionTime?.slice(0, 5) ?? ""}
          doctorName={hci?.nombreProfesional ?? ""}
          doctorUser={findUser(hci?.userId)}
          users={users}
          hcInicial={hci}
          diagnoses={diagnoses}
          evoluciones={record.evoluciones}
          evolucionEspecialistas={record.evolucionEspecialistas}
          procedimientosMenores={record.procedimientosMenores}
          procedimientosDiagnosticos={record.procedimientosDiagnosticos}
          procedimientosNoQx={record.procedimientosNoQx}
          notasEnfermeria={record.notasEnfermeria}
          datosClinicosEgreso={record.datosClinicosEgreso}
          diagnosticosEgreso={record.diagnosticosEgreso}
        />
      )
    },

    notas: () =>
      record.notasMedicas.map((nota) => (
        <NotaMedicaPrintDocument
          key={`nota-${nota.id}`}
          {...common}
          fechaNota={nota.fechaNota}
          horaNota={nota.horaNota}
          doctorName={nota.nombreProfesional}
          doctorUser={findUser(nota.userId)}
          nota={nota.nota}
        />
      )),

    cirugia: () => (
      <>
        {record.descripcionesQuirurgicas.map((d) => {
          const procedimientos = [d.procedimiento1, d.procedimiento2, d.procedimiento3, d.procedimiento4]
          const diagnosticos = [d.diagnostico1, d.diagnostico2, d.diagnostico3, d.diagnostico4]
          return (
            <GenericClinicalPrintDocument
              key={`qx-${d.id}`}
              {...common}
              documentTitle="Descripción Quirúrgica"
              attentionLabel="Fecha y hora de inicio:"
              attentionDate={d.fechaHoraInicio.slice(0, 10)}
              attentionTime={formatTime(d.fechaHoraInicio, "")}
              doctorName={d.nombreCirujano}
              doctorUser={findUser(d.cirujanoId)}
              sections={[
                {
                  title: "Fechas de ejecución",
                  rows: [
                    { label: "Fecha inicial de ejecución", value: formatDateTime(d.fechaHoraInicio, "") },
                    { label: "Fecha final de ejecución", value: formatDateTime(d.fechaHoraFinalizacion, "") },
                  ],
                },
                {
                  title: "Equipo quirúrgico",
                  rows: [
                    { label: "Cirujano", value: d.nombreCirujano },
                    { label: "Anestesiólogo", value: d.nombreAnestesiologo },
                    { label: "Instrumentador", value: d.nombreInstrumentador },
                    { label: "Ayudante Qx", value: d.nombreAyudanteQx },
                    { label: "Tipo de anestesia", value: d.nombreTipoAnestesia },
                  ],
                },
                {
                  title: "Procedimientos (CUPS/SOAT)",
                  rows: procedimientos
                    .filter(Boolean)
                    .map((p, idx) => ({ label: idx === 0 ? "Principal" : `Procedimiento ${idx + 1}`, value: p })),
                },
                {
                  title: "Diagnósticos de ingreso (CIE-10)",
                  rows: diagnosticos
                    .filter(Boolean)
                    .map((dx, idx) => ({ label: idx === 0 ? "Principal" : `Diagnóstico ${idx + 1}`, value: dx })),
                },
                {
                  title: "Descripción del procedimiento",
                  rows: [{ label: "Descripción del procedimiento", value: d.descripcionProcedimiento }],
                },
              ].filter((section) => section.rows.length > 0)}
            />
          )
        })}
        {record.recordsAnestesia.map((r) => (
          <AnesthesiaRecordPrintDocument key={`anestesia-${r.id}`} {...common} record={r} />
        ))}
      </>
    ),

    ordenes: () => (
      <>
        {record.ordenesMedicas.map((orden) => (
          <MedicalOrderPrintDocument
            key={`orden-${orden.id}`}
            {...common}
            orden={orden}
            generatedAt={generatedAt}
          />
        ))}
        {record.medicamentosPos.map((formula) => (
          <MedicationPosPrintDocument
            key={`pos-${formula.id}`}
            {...common}
            formula={formula}
            generatedAt={generatedAt}
          />
        ))}
        {ordenesConAplicaciones(record.aplicaciones).length > 0 && (
          <MedicationApplicationPrintDocument
            {...common}
            ordenes={record.aplicaciones}
            profesionalesById={usersById}
            printedAt={printedAt}
          />
        )}
      </>
    ),

    apoyo: () => (
      <>
        {record.laboratorio.map((lab) => (
          <LabResultPrintDocument
            key={`lab-${lab.id}`}
            {...common}
            record={lab}
            study={record.catalogoLaboratorio.find((e) => e.codigo === lab.codigoEstudio)}
          />
        ))}
        {record.rayosX.map((estudio) => (
          <XrayPrintDocument
            key={`rx-${estudio.id}`}
            {...common}
            estudio={estudio}
            generatedAt={generatedAt}
          />
        ))}
      </>
    ),

    gastos: () =>
      HOJAS_GASTOS.map((tipoHoja) => {
        const registros = record.hojaGastos.filter((r) => r.tipoHoja === tipoHoja)
        if (registros.length === 0) return null
        return (
          <ExpenseSheetPrintDocument
            key={`hoja-${tipoHoja}`}
            {...common}
            tipoHoja={tipoHoja}
            registros={registros}
            firmantesById={usersById}
            printedAt={printedAt}
          />
        )
      }),

    facturacion: () => (
      <>
        {record.movimientos.length > 0 && (
          <InvoicePrintDocument
            provider={provider}
            admission={admission}
            patient={patient}
            insurance={insurance}
            movements={record.movimientos}
            invoiceNumber={record.factura?.invoiceNum ?? "Sin facturar"}
          />
        )}
        {record.furips && record.furipsDatos && (
          <FuripsPrintDocument
            provider={provider}
            furips={record.furips}
            datos={record.furipsDatos}
            cities={cities}
            states={states}
          />
        )}
      </>
    ),
  }

  return (
    <>
      {stages.map((stage) => (
        <Fragment key={stage}>{sections[stage]()}</Fragment>
      ))}
    </>
  )
}
