"use client"

import type { ReactNode } from "react"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { DataUser, GetUser } from "@/core/interfaces/user/users"
import type { TipoHojaGastos } from "@/core/interfaces/care/hojaGastos"
import { formatDate, formatDateTime, formatTime } from "@/core/utils/date"
import {
  buildPrintPatient,
  type PrintPatient,
} from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { HciPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/HciPrintDocument"
import { EpicrisisPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/EpicrisisPrintDocument"
import { GenericClinicalPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/GenericClinicalPrintDocument"
import { NotaMedicaPrintDocument } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/NotaMedicaPrintDocument"
import type { DiagnosisRow } from "@/app/container/care/clinicalRecords/initialClinicalHistory/types"
import { AnesthesiaRecordPrintDocument } from "@/app/container/care/anesthesiaRecord/AnesthesiaRecordPrintDocument"
import { MedicalOrderPrintDocument } from "@/app/container/care/medicalOrders/MedicalOrderPrintDocument"
import { MedicationPosPrintDocument } from "@/app/container/care/medicationPos/MedicationPosPrintDocument"
import { MedicationApplicationPrintDocument } from "@/app/container/care/medicationApplication/MedicationApplicationPrintDocument"
import { LabResultPrintDocument } from "@/app/container/care/labSheet/LabResultPrintDocument"
import { XrayPrintDocument } from "@/app/container/care/xray/XrayPrintDocument"
import { ExpenseSheetPrintDocument } from "@/app/container/care/expenseSheet/ExpenseSheetPrintDocument"
import type { AdmissionRecord } from "@/app/container/care/admissionHistory/detail/useAdmissionRecord"
import type { BrowserItem } from "./RecordBrowserModal"
import type { EvolutionEntry } from "./clinicalHistory.utils"

// Documentos de un solo registro (o consolidados): se abren directamente.
export type SingleDocumentKind = "hcInicial" | "epicrisis" | "aplicaciones" | `gastos-${TipoHojaGastos}`

// Módulos con varios registros: se abren como listado con el detalle de cada uno.
export type ListDocumentKind =
  | "ordenes"
  | "formulasPos"
  | "laboratorio"
  | "imagenes"
  | "notasMedicas"
  | "notasEnfermeria"
  | "procedimientos"
  | "cirugia"

export type ClinicalDocumentKind = SingleDocumentKind | ListDocumentKind

export interface DocumentContext {
  record: AdmissionRecord
  provider?: TProvider
  usersById: Map<number, DataUser | undefined>
  printedAt: Date
}

const hciDiagnoses = (record: AdmissionRecord): DiagnosisRow[] =>
  (record.hcInicial?.analisisDiagnosticosPlan?.diagnosticos ?? []).map((d, idx) => ({
    id: d.id,
    cie10Id: d.id,
    code: d.codigo,
    diagnosis: d.descripcion,
    main: idx === 0,
  }))

// Datos comunes a todos los documentos: encabezado del paciente y firmantes.
const documentBase = ({ record, provider, usersById, printedAt }: DocumentContext) => {
  const { admission, patient } = record
  const printPatient: PrintPatient = buildPrintPatient(admission!, patient)
  const users: GetUser[] = [...usersById.entries()]
    .filter((entry): entry is [number, DataUser] => !!entry[1])
    .map(([id, user]) => ({ ...user, id }) as GetUser)
  return {
    common: {
      provider,
      patient: printPatient,
      admissionId: admission!.id,
      admissionDate: admission!.admissionDate,
      contractName: admission!.convenioNombre || patient?.contractName || "",
    },
    users,
    findUser: (id?: number | null) => users.find((u) => u.id === id),
    generatedAt: printedAt.toISOString(),
  }
}

const dateTime = (fecha: string, hora?: string | null) => `${formatDate(fecha)} ${hora?.slice(0, 5) ?? ""}`.trim()

export function ClinicalHistoryDocument({ kind, ...ctx }: DocumentContext & { kind: SingleDocumentKind }) {
  const { record, usersById, printedAt } = ctx
  if (!record.admission) return null
  const { common, users, findUser } = documentBase(ctx)
  const hci = record.hcInicial

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

  if (kind === "aplicaciones") {
    return (
      <MedicationApplicationPrintDocument
        {...common}
        ordenes={record.aplicaciones}
        profesionalesById={usersById}
        printedAt={printedAt}
      />
    )
  }

  const hciProps = {
    ...common,
    attentionDate: hci?.admissionDate?.slice(0, 10) ?? "",
    attentionTime: hci?.admissionTime?.slice(0, 5) ?? "",
    doctorName: hci?.nombreProfesional ?? "",
    doctorUser: findUser(hci?.userId),
    hcInicial: hci,
    diagnoses: hciDiagnoses(record),
  }

  if (kind === "hcInicial") return <HciPrintDocument {...hciProps} />

  return (
    <EpicrisisPrintDocument
      {...hciProps}
      users={users}
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
}

// Documento imprimible de una evolución, con su especialidad en el título.
export function evolutionPrintDocument(entry: EvolutionEntry, ctx: DocumentContext): ReactNode {
  const { common, findUser } = documentBase(ctx)
  const evo = entry.data
  const base = entry.tipo === "Evolucion" ? "Evolución" : "Evolución de Especialista"
  const sections =
    entry.tipo === "Evolucion"
      ? [
          { title: "Motivo de consulta", rows: [{ label: "Motivo de consulta", value: entry.data.motivoConsulta }] },
          {
            title: "Signos vitales",
            rows: [
              { label: "TA", value: entry.data.tensionArterial },
              { label: "FC (lpm)", value: entry.data.frecuenciaCardiaca },
              { label: "FR (rpm)", value: entry.data.frecuenciaRespiratoria },
              { label: "Temperatura (°C)", value: entry.data.temperatura },
              { label: "Sat. O₂ (%)", value: entry.data.saturacionOxigeno },
              { label: "Glasgow", value: entry.data.glasgow },
              { label: "Peso (kg)", value: entry.data.peso },
              { label: "Talla (m)", value: entry.data.talla },
              { label: "IMC", value: entry.data.imc != null ? `${entry.data.imc} kg/m²` : null },
            ],
          },
          { title: "Plan", rows: [{ label: "Plan", value: entry.data.plan }] },
        ]
      : [
          { title: "Motivo de consulta", rows: [{ label: "Motivo de consulta", value: evo.motivoConsulta }] },
          { title: "Plan", rows: [{ label: "Plan", value: evo.plan }] },
        ]

  return (
    <GenericClinicalPrintDocument
      {...common}
      documentTitle={evo.especialidadNombre ? `${base} - ${evo.especialidadNombre}` : base}
      attentionLabel="Fecha y hora de evolución:"
      attentionDate={evo.fechaEvolucion}
      attentionTime={evo.horaEvolucion?.slice(0, 5)}
      doctorName={evo.nombreProfesional}
      doctorUser={findUser(evo.userId)}
      sections={sections}
    />
  )
}

// Un elemento del listado cuyo detalle es su documento imprimible.
const documentItem = (item: Omit<BrowserItem, "renderDetail" | "renderPrint">, render: () => ReactNode): BrowserItem => ({
  ...item,
  renderPrint: render,
  renderDetail: () => <div className="hci-print-screen-wrap">{render()}</div>,
})

const byDate = (a: BrowserItem & { sort: string }, b: BrowserItem & { sort: string }) => a.sort.localeCompare(b.sort)

// Registros de un módulo para el listado, en orden cronológico.
export function buildDocumentItems(kind: ListDocumentKind, ctx: DocumentContext): BrowserItem[] {
  const { record } = ctx
  if (!record.admission) return []
  const { common, findUser, generatedAt } = documentBase(ctx)

  const items: (BrowserItem & { sort: string })[] = (() => {
    switch (kind) {
      case "ordenes":
        return record.ordenesMedicas.map((orden) => ({
          sort: orden.fechaOrden,
          ...documentItem(
            {
              key: `orden-${orden.id}`,
              date: formatDateTime(orden.fechaOrden),
              author: orden.asistencialNombre,
              excerpt: orden.items.map((i) => i.descripcion).join(" · "),
            },
            () => <MedicalOrderPrintDocument {...common} orden={orden} generatedAt={generatedAt} />,
          ),
        }))

      case "formulasPos":
        return record.medicamentosPos.map((formula) => ({
          sort: formula.fechaFormula,
          ...documentItem(
            {
              key: `pos-${formula.id}`,
              date: formatDateTime(formula.fechaFormula),
              author: formula.asistencialNombre,
              excerpt: formula.items.map((i) => i.nombre).join(" · "),
            },
            () => <MedicationPosPrintDocument {...common} formula={formula} generatedAt={generatedAt} />,
          ),
        }))

      case "laboratorio":
        return record.laboratorio.map((lab) => ({
          sort: lab.fechaToma,
          ...documentItem(
            {
              key: `lab-${lab.id}`,
              date: formatDateTime(lab.fechaToma),
              author: lab.nombreProfesional,
              excerpt: lab.nombreEstudio,
            },
            () => (
              <LabResultPrintDocument
                {...common}
                record={lab}
                study={record.catalogoLaboratorio.find((e) => e.codigo === lab.codigoEstudio)}
              />
            ),
          ),
        }))

      case "imagenes":
        return record.rayosX.map((estudio) => ({
          sort: estudio.fechaEstudio,
          ...documentItem(
            {
              key: `rx-${estudio.id}`,
              date: formatDateTime(estudio.fechaEstudio),
              author: estudio.nombreProfesional,
              excerpt: estudio.nombreEstudio,
            },
            () => <XrayPrintDocument {...common} estudio={estudio} generatedAt={generatedAt} />,
          ),
        }))

      case "notasMedicas":
        return record.notasMedicas.map((nota) => ({
          sort: `${nota.fechaNota}T${nota.horaNota}`,
          ...documentItem(
            {
              key: `nota-${nota.id}`,
              date: dateTime(nota.fechaNota, nota.horaNota),
              author: nota.nombreProfesional,
              excerpt: nota.nota,
            },
            () => (
              <NotaMedicaPrintDocument
                {...common}
                fechaNota={nota.fechaNota}
                horaNota={nota.horaNota}
                doctorName={nota.nombreProfesional}
                doctorUser={findUser(nota.userId)}
                nota={nota.nota}
              />
            ),
          ),
        }))

      case "notasEnfermeria":
        return record.notasEnfermeria.map((nota) => ({
          sort: `${nota.fechaNota}T${nota.horaNota}`,
          ...documentItem(
            {
              key: `enfermeria-${nota.id}`,
              date: dateTime(nota.fechaNota, nota.horaNota),
              author: nota.nombreProfesional,
              excerpt: nota.nota,
            },
            () => (
              <GenericClinicalPrintDocument
                {...common}
                documentTitle="Nota de Enfermería"
                attentionLabel="Fecha y hora de la nota:"
                attentionDate={nota.fechaNota}
                attentionTime={nota.horaNota?.slice(0, 5)}
                doctorName={nota.nombreProfesional}
                doctorUser={findUser(nota.userId)}
                sections={[{ title: "Nota de enfermería", rows: [{ label: "Nota de enfermería", value: nota.nota }] }]}
              />
            ),
          ),
        }))

      case "procedimientos": {
        const procedure = (
          tipo: string,
          proc: { id: number; fechaProcedimiento: string; horaProcedimiento: string; nombreProfesional: string; userId: number },
          excerpt: string,
          sections: { title: string; rows: { label: string; value: string }[] }[],
        ) => ({
          sort: `${proc.fechaProcedimiento}T${proc.horaProcedimiento}`,
          ...documentItem(
            {
              key: `${tipo}-${proc.id}`,
              date: dateTime(proc.fechaProcedimiento, proc.horaProcedimiento),
              author: proc.nombreProfesional,
              excerpt: `${tipo}: ${excerpt}`,
            },
            () => (
              <GenericClinicalPrintDocument
                {...common}
                documentTitle={tipo}
                attentionLabel="Fecha y hora del procedimiento:"
                attentionDate={proc.fechaProcedimiento}
                attentionTime={proc.horaProcedimiento?.slice(0, 5)}
                doctorName={proc.nombreProfesional}
                doctorUser={findUser(proc.userId)}
                sections={sections}
              />
            ),
          ),
        })
        return [
          ...record.procedimientosMenores.map((p) =>
            procedure("Procedimiento Menor", p, p.descripcion, [
              { title: "Procedimiento menor", rows: [{ label: "Procedimiento menor", value: p.descripcion }] },
            ]),
          ),
          ...record.procedimientosDiagnosticos.map((p) =>
            procedure("Procedimiento Diagnóstico", p, p.estudiosRealizados, [
              { title: "Estudios realizados", rows: [{ label: "Estudios realizados", value: p.estudiosRealizados }] },
              { title: "Hallazgos", rows: [{ label: "Hallazgos", value: p.hallazgos }] },
            ]),
          ),
          ...record.procedimientosNoQx.map((p) =>
            procedure("Procedimiento No Quirúrgico", p, p.descripcion, [
              { title: "Procedimiento no quirúrgico", rows: [{ label: "Procedimiento no quirúrgico", value: p.descripcion }] },
            ]),
          ),
        ]
      }

      case "cirugia":
        return [
          ...record.descripcionesQuirurgicas.map((d) => {
            const procedimientos = [d.procedimiento1, d.procedimiento2, d.procedimiento3, d.procedimiento4]
            const diagnosticos = [d.diagnostico1, d.diagnostico2, d.diagnostico3, d.diagnostico4]
            return {
              sort: d.fechaHoraInicio,
              ...documentItem(
                {
                  key: `qx-${d.id}`,
                  date: formatDateTime(d.fechaHoraInicio),
                  author: d.nombreCirujano,
                  excerpt: `Descripción quirúrgica: ${procedimientos.filter(Boolean).join(" · ")}`,
                },
                () => (
                  <GenericClinicalPrintDocument
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
                ),
              ),
            }
          }),
          ...record.recordsAnestesia.map((r) => ({
            sort: r.fechaInicio,
            ...documentItem(
              {
                key: `anestesia-${r.id}`,
                date: formatDateTime(r.fechaInicio),
                author: r.nombreResponsable,
                excerpt: "Record de anestesia",
              },
              () => <AnesthesiaRecordPrintDocument {...common} record={r} />,
            ),
          })),
        ]
    }
  })()

  return items.sort(byDate).map(({ sort: _sort, ...item }) => item)
}
