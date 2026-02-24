import { useQuery } from "@tanstack/react-query"
// import { getAll } from "../../../api/baseService"
// import { ENDPOINTS } from "../../../api/endpoints/endpoints"
import { ActiveAdmission } from "../../../interfaces/care/types"

const MOCK_ADMISSIONS: ActiveAdmission[] = [
  {
    id: 1,
    admissionDate: "2026-02-24T08:30:00",
    patientFullName: "JONATHAN RODRIGUEZ QUINTERO",
    documentNumber: "1098765432",
    careScope: "Urgencia",
    patientId: 101,
  },
  {
    id: 2,
    admissionDate: "2026-02-24T09:15:00",
    patientFullName: "MARIA FERNANDA LOPEZ GARCIA",
    documentNumber: "1045678901",
    careScope: "Hospitalización",
    patientId: 102,
  },
  {
    id: 3,
    admissionDate: "2026-02-23T14:00:00",
    patientFullName: "CARLOS ANDRES MARTINEZ RUIZ",
    documentNumber: "80234567",
    careScope: "Cirugía",
    patientId: 103,
  },
  {
    id: 4,
    admissionDate: "2026-02-24T07:45:00",
    patientFullName: "ANA PATRICIA GOMEZ HERRERA",
    documentNumber: "52987654",
    careScope: "Consulta externa",
    patientId: 104,
  },
  {
    id: 5,
    admissionDate: "2026-02-23T22:10:00",
    patientFullName: "DIEGO ALEJANDRO TORRES PEÑA",
    documentNumber: "1112345678",
    careScope: "Urgencia",
    patientId: 105,
  },
  {
    id: 6,
    admissionDate: "2026-02-24T10:30:00",
    patientFullName: "LAURA VALENTINA CASTRO DIAZ",
    documentNumber: "1098001234",
    careScope: "Hospitalización",
    patientId: 106,
  },
]

export function useActiveAdmissions() {
  return useQuery({
    queryKey: ["active-admissions"],
    queryFn: () => Promise.resolve(MOCK_ADMISSIONS),
  })
}
