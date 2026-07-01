"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getClinicalRecordModule,
  type ClinicalRecordModuleType,
} from "@/core/constants/clinicalRecordModules"
import type { ClinicalRecordSummary } from "@/core/interfaces/care/clinicalRecordHistory"

const isoDaysAgo = (days: number, hour = 8, minute = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

const doctor = (fullName: string) => ({ id: 1, fullName, role: "Médico" })
const nurse = (fullName: string) => ({ id: 2, fullName, role: "Enfermería" })
const specialist = (fullName: string) => ({ id: 3, fullName, role: "Especialista" })

const buildMockClinicalRecords = (
  moduleType: ClinicalRecordModuleType,
): ClinicalRecordSummary[] => {
  switch (moduleType) {
    case "evolutions":
      return [
        {
          id: 301,
          moduleType,
          createdAt: isoDaysAgo(0, 9, 15),
          author: doctor("Dr. Martin Martinez Perez"),
          excerpt: "Paciente afebril, hemodinámicamente estable. Continúa manejo médico según plan establecido.",
          fields: [
            { label: "Motivo de consulta", value: "Control de evolución post-ingreso por dolor abdominal." },
            { label: "Signos vitales", value: "TA 118/76 · FC 78 lpm · FR 17 rpm · Temp 36.6°C · Sat 98%" },
            { label: "Plan", value: "Continuar manejo médico instaurado, control de signos vitales cada 4 horas y reevaluación en próxima ronda." },
          ],
        },
        {
          id: 302,
          moduleType,
          createdAt: isoDaysAgo(1, 20, 40),
          author: doctor("Dra. Camila Rojas Suarez"),
          excerpt: "Persiste dolor leve en fosa iliaca derecha, tolera vía oral, sin signos de alarma.",
          fields: [
            { label: "Motivo de consulta", value: "Evolución nocturna, paciente refiere dolor leve en fosa iliaca derecha." },
            { label: "Signos vitales", value: "TA 122/80 · FC 82 lpm · FR 18 rpm · Temp 36.8°C · Sat 97%" },
            { label: "Plan", value: "Analgesia de rescate si dolor > 4/10, vigilar tolerancia a la vía oral." },
          ],
        },
        {
          id: 303,
          moduleType,
          createdAt: isoDaysAgo(2, 7, 5),
          author: doctor("Dr. Martin Martinez Perez"),
          excerpt: "Ingreso a hospitalización, se instaura manejo médico inicial y solicitud de paraclínicos.",
          fields: [
            { label: "Motivo de consulta", value: "Dolor abdominal agudo de 12 horas de evolución." },
            { label: "Signos vitales", value: "TA 130/85 · FC 90 lpm · FR 20 rpm · Temp 37.2°C · Sat 96%" },
            { label: "Plan", value: "Hidratación IV, analgesia, solicitud de laboratorios e imágenes diagnósticas." },
          ],
        },
      ]

    case "nursing-notes":
      return [
        {
          id: 401,
          moduleType,
          createdAt: isoDaysAgo(0, 6, 0),
          author: nurse("Enf. Maria Gonzalez"),
          excerpt: "Paciente descansa, signos vitales estables, se administran medicamentos según orden médica.",
          fields: [
            { label: "Nota de enfermería", value: "Paciente descansa, refiere leve molestia abdominal. Se administran medicamentos según orden médica. Signos vitales dentro de parámetros normales. Se deja cómodo en cama, se educa sobre signos de alarma." },
          ],
        },
        {
          id: 402,
          moduleType,
          createdAt: isoDaysAgo(1, 14, 30),
          author: nurse("Enf. Laura Torres"),
          excerpt: "Se realiza curación de sitio de venopunción, sin signos de flebitis. Tolera dieta líquida.",
          fields: [
            { label: "Nota de enfermería", value: "Se realiza curación de sitio de venopunción, sin signos de flebitis ni infección. Paciente tolera dieta líquida sin náuseas. Se registra balance hídrico. Familiar acompañante presente." },
          ],
        },
      ]

    case "surgical-description":
      return [
        {
          id: 501,
          moduleType,
          createdAt: isoDaysAgo(3, 11, 0),
          author: doctor("Dr. Andres Felipe Salazar"),
          excerpt: "Colecistectomía laparoscópica sin complicaciones, hallazgos de colecistitis crónica litiásica.",
          fields: [
            { label: "Equipo quirúrgico", value: "Cirujano: Dr. Andres Felipe Salazar · Anestesiólogo: Dra. Paula Jimenez · Instrumentador: Carlos Ruiz · Ayudante: Dr. Felipe Nino" },
            { label: "Tipo de anestesia", value: "Anestesia general" },
            { label: "Procedimientos (CUPS)", value: "47600 - Colecistectomía laparoscópica" },
            { label: "Diagnósticos (CIE-10)", value: "K80.1 - Colecistitis crónica con colelitiasis" },
            { label: "Descripción del procedimiento", value: "Se realiza colecistectomía laparoscópica bajo anestesia general, neumoperitoneo con aguja de Veress, colocación de trócares, disección del triángulo de Calot, clipaje de conducto y arteria cística, extracción de vesícula en bolsa endoscópica. Sin complicaciones intraoperatorias." },
          ],
        },
      ]

    case "diagnostic-procedures":
      return [
        {
          id: 601,
          moduleType,
          createdAt: isoDaysAgo(1, 10, 15),
          author: doctor("Dr. Martin Martinez Perez"),
          excerpt: "Ecografía abdominal: colelitiasis sin signos de complicación aguda.",
          fields: [
            { label: "Estudios realizados", value: "Ecografía abdominal total, hemograma completo, PCR." },
            { label: "Hallazgos", value: "Vesícula biliar con múltiples cálculos, pared de espesor normal, sin líquido perivesicular. Hemograma sin leucocitosis significativa. PCR levemente elevada." },
          ],
        },
        {
          id: 602,
          moduleType,
          createdAt: isoDaysAgo(2, 16, 45),
          author: doctor("Dra. Camila Rojas Suarez"),
          excerpt: "Radiografía de abdomen simple sin hallazgos de obstrucción intestinal.",
          fields: [
            { label: "Estudios realizados", value: "Radiografía de abdomen simple de pie y decúbito." },
            { label: "Hallazgos", value: "Patrón gaseoso intestinal conservado, sin niveles hidroaéreos ni signos de obstrucción. No se observan calcificaciones patológicas." },
          ],
        },
      ]

    case "minor-procedures":
      return [
        {
          id: 701,
          moduleType,
          createdAt: isoDaysAgo(0, 13, 20),
          author: doctor("Dr. Felipe Nino Castro"),
          excerpt: "Retiro de sutura de herida quirúrgica, cicatrización adecuada sin signos de infección.",
          fields: [
            { label: "Procedimiento menor", value: "Retiro de sutura de herida quirúrgica en fosa iliaca derecha. Cicatrización de primera intención, sin signos de infección ni dehiscencia. Se cubre con apósito estéril y se dan indicaciones de cuidado." },
          ],
        },
      ]

    case "medical-note":
      return [
        {
          id: 801,
          moduleType,
          createdAt: isoDaysAgo(4, 8, 0),
          author: doctor("Dr. Martin Martinez Perez"),
          excerpt: "Consulta inicial por dolor abdominal, se decide manejo intrahospitalario.",
          fields: [
            { label: "Nota médica", value: "Paciente masculino que consulta por cuadro de 12 horas de dolor abdominal tipo cólico localizado en fosa iliaca derecha, asociado a náuseas y un episodio de vómito. Al examen físico con dolor a la palpación profunda sin signos de irritación peritoneal. Se decide manejo intrahospitalario y estudios complementarios." },
          ],
        },
      ]

    case "non-surgical-procedures":
      return [
        {
          id: 901,
          moduleType,
          createdAt: isoDaysAgo(2, 9, 50),
          author: doctor("Dra. Paula Jimenez"),
          excerpt: "Colocación de catéter venoso central guiado por ecografía, sin complicaciones.",
          fields: [
            { label: "Procedimiento no quirúrgico", value: "Colocación de catéter venoso central en vena yugular interna derecha guiada por ecografía, técnica de Seldinger. Sin complicaciones inmediatas, se confirma posición con radiografía de tórax." },
          ],
        },
      ]

    case "specialist-evolution":
      return [
        {
          id: 1001,
          moduleType,
          createdAt: isoDaysAgo(1, 17, 10),
          author: specialist("Dr. Ricardo Peña - Cirugía General"),
          excerpt: "Evaluación por cirugía general, se confirma indicación quirúrgica.",
          fields: [
            { label: "Consulta", value: "Se realiza valoración por cirugía general dado hallazgos ecográficos de colelitiasis sintomática. Paciente con dolor persistente y datos clínicos compatibles con colecistitis." },
            { label: "Plan", value: "Se programa colecistectomía laparoscópica, se solicitan exámenes prequirúrgicos y valoración por anestesiología." },
          ],
        },
      ]

    default:
      return [
        {
          id: 1101,
          moduleType,
          createdAt: isoDaysAgo(5, 8, 0),
          author: doctor("Dr. Martin Martinez Perez"),
          excerpt: `Registro de ${getClinicalRecordModule(moduleType)?.label ?? "historia clínica"} correspondiente a la atención actual.`,
          fields: [
            { label: "Detalle", value: `Contenido de ejemplo para ${getClinicalRecordModule(moduleType)?.label ?? "este módulo"}.` },
          ],
        },
      ]
  }
}

interface UseClinicalRecordHistoryParams {
  moduleType: ClinicalRecordModuleType
  admissionId?: string | number
  enabled?: boolean
}

export function useClinicalRecordHistory({
  moduleType,
  admissionId,
  enabled = true,
}: UseClinicalRecordHistoryParams) {
  return useQuery({
    queryKey: ["clinical-record-history", admissionId ?? "demo", moduleType],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 450))
      const records = buildMockClinicalRecords(moduleType)
      return [...records].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    },
    enabled,
    staleTime: 60_000,
  })
}
