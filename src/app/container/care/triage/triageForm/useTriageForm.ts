import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import toast from "react-hot-toast"
import { TriagePatient } from "@/core/interfaces/care/types"

const MOCK_PATIENTS: Record<string, TriagePatient> = {
  "1001234567": {
    id: 1,
    firstName: "Juan",
    secondName: "Carlos",
    firstLastName: "Pérez",
    secondLastName: "López",
    birthDate: "1990-05-15",
    gender: "Masculino",
  },
  "1009876543": {
    id: 2,
    firstName: "María",
    secondName: "Fernanda",
    firstLastName: "Gómez",
    secondLastName: "Ríos",
    birthDate: "1985-11-22",
    gender: "Femenino",
  },
  "1052345678": {
    id: 3,
    firstName: "Andrés",
    secondName: "Felipe",
    firstLastName: "Martínez",
    secondLastName: "Díaz",
    birthDate: "2005-03-10",
    gender: "Masculino",
  },
}

const triageSchema = z.object({
  // Campos del paciente (solo lectura)
  firstName: z.string().optional(),
  secondName: z.string().optional(),
  firstLastName: z.string().optional(),
  secondLastName: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  // Campos del triage
  dateTime: z.string().min(1, "La fecha y hora es obligatoria"),
  priority: z
    .number({ required_error: "La prioridad es obligatoria" })
    .min(1, "Seleccione una prioridad")
    .max(5, "La prioridad debe ser entre I y V"),
  consultationReason: z
    .string()
    .min(1, "El motivo de consulta es obligatorio"),
  bloodPressure: z
    .string()
    .min(1, "La tensión arterial es obligatoria"),
  heartRate: z
    .number({ required_error: "La frecuencia cardiaca es obligatoria" })
    .min(1, "La frecuencia cardiaca debe ser mayor a 0"),
  respiratoryRate: z
    .number({ required_error: "La frecuencia respiratoria es obligatoria" })
    .min(1, "La frecuencia respiratoria debe ser mayor a 0"),
  weight: z
    .number({ required_error: "El peso es obligatorio" })
    .min(0.1, "El peso debe ser mayor a 0"),
  height: z
    .number({ required_error: "La talla es obligatoria" })
    .min(1, "La talla debe ser mayor a 0"),
  temperature: z
    .number({ required_error: "La temperatura es obligatoria" })
    .min(30, "Temperatura fuera de rango")
    .max(45, "Temperatura fuera de rango"),
  glasgow: z
    .number({ required_error: "El Glasgow es obligatorio" })
    .min(3, "El Glasgow mínimo es 3")
    .max(15, "El Glasgow máximo es 15"),
})

export type TriageFormValues = z.infer<typeof triageSchema>

function getCurrentDateTime(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function useTriageForm() {
  const [patient, setPatient] = useState<TriagePatient | null>(null)
  const [searchDoc, setSearchDoc] = useState("")
  const [searchError, setSearchError] = useState("")
  const [searching, setSearching] = useState(false)

  const { control, handleSubmit, reset, setValue } = useForm<TriageFormValues>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      firstName: "",
      secondName: "",
      firstLastName: "",
      secondLastName: "",
      birthDate: "",
      gender: "",
      dateTime: getCurrentDateTime(),
      priority: undefined,
      consultationReason: "",
      bloodPressure: "",
      heartRate: undefined,
      respiratoryRate: undefined,
      weight: undefined,
      height: undefined,
      temperature: undefined,
      glasgow: undefined,
    },
  })

  const handleSearchPatient = () => {
    if (!searchDoc.trim()) {
      setSearchError("Ingrese un número de documento")
      return
    }

    setSearching(true)
    setSearchError("")

    // TODO: Conectar con API real
    setTimeout(() => {
      const found = MOCK_PATIENTS[searchDoc.trim()]
      if (found) {
        setPatient(found)
        setValue("firstName", found.firstName)
        setValue("secondName", found.secondName)
        setValue("firstLastName", found.firstLastName)
        setValue("secondLastName", found.secondLastName)
        setValue("birthDate", found.birthDate)
        setValue("gender", found.gender)
        setSearchError("")
      } else {
        setPatient(null)
        setSearchError("Paciente no encontrado")
      }
      setSearching(false)
    }, 500)
  }

  const onSubmit = (data: TriageFormValues) => {
    if (!patient) {
      toast.error("Debe buscar un paciente antes de guardar")
      return
    }

    console.log("Triage data:", { patientId: patient.id, ...data })
    toast.success("Solo visual: registro de triage no disponible aún")
    handleReset()
  }

  const handleReset = () => {
    reset({
      firstName: "",
      secondName: "",
      firstLastName: "",
      secondLastName: "",
      birthDate: "",
      gender: "",
      dateTime: getCurrentDateTime(),
      priority: undefined,
      consultationReason: "",
      bloodPressure: "",
      heartRate: undefined,
      respiratoryRate: undefined,
      weight: undefined,
      height: undefined,
      temperature: undefined,
      glasgow: undefined,
    })
    setPatient(null)
    setSearchDoc("")
    setSearchError("")
  }

  return {
    control,
    handleSubmit,
    onSubmit,
    handleReset,
    patient,
    searchDoc,
    setSearchDoc,
    searchError,
    searching,
    handleSearchPatient,
  }
}
