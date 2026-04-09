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

const admissionSchema = z.object({
  // Campos del paciente (solo lectura)
  firstName: z.string().optional(),
  secondName: z.string().optional(),
  firstLastName: z.string().optional(),
  secondLastName: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  // Campos de admisión
  careModality: z
    .number({ required_error: "La modalidad de atención es obligatoria" })
    .min(1, "Seleccione una modalidad de atención"),
  careReason: z
    .number({ required_error: "El motivo de atención es obligatorio" })
    .min(1, "Seleccione un motivo de atención"),
  serviceClassification: z
    .number({ required_error: "La clasificación del servicio es obligatoria" })
    .min(1, "Seleccione una clasificación del servicio"),
  serviceGroup: z
    .number({ required_error: "El grupo servicio es obligatorio" })
    .min(1, "Seleccione un grupo de servicio"),
  admissionType: z
    .number({ required_error: "El ingreso es obligatorio" })
    .min(1, "Seleccione un tipo de ingreso"),
  careScope: z
    .number({ required_error: "El ámbito de la atención es obligatorio" })
    .min(1, "Seleccione un ámbito de atención"),
  carePurpose: z
    .number({ required_error: "La finalidad de la atención es obligatoria" })
    .min(1, "Seleccione una finalidad de atención"),
  insurerId: z
    .number({ required_error: "La EPS / Aseguradora es obligatoria" })
    .min(1, "Seleccione una EPS / Aseguradora"),
  agreementId: z
    .number({ required_error: "El convenio es obligatorio" })
    .min(1, "Seleccione un convenio"),
})

export type AdmissionFormValues = z.infer<typeof admissionSchema>

export function useAdmissionForm() {
  const [patient, setPatient] = useState<TriagePatient | null>(null)
  const [searchDoc, setSearchDoc] = useState("")
  const [searchError, setSearchError] = useState("")
  const [searching, setSearching] = useState(false)

  const { control, handleSubmit, reset, setValue } = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      firstName: "",
      secondName: "",
      firstLastName: "",
      secondLastName: "",
      birthDate: "",
      gender: "",
      careModality: undefined,
      careReason: undefined,
      serviceClassification: undefined,
      serviceGroup: undefined,
      admissionType: undefined,
      careScope: undefined,
      carePurpose: undefined,
      insurerId: undefined,
      agreementId: undefined,
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

  const onSubmit = (data: AdmissionFormValues) => {
    if (!patient) {
      toast.error("Debe buscar un paciente antes de guardar")
      return
    }

    console.log("Admission data:", { patientId: patient.id, ...data })
    toast.success("Solo visual: registro de admisión no disponible aún")
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
      careModality: undefined,
      careReason: undefined,
      serviceClassification: undefined,
      serviceGroup: undefined,
      admissionType: undefined,
      careScope: undefined,
      carePurpose: undefined,
      insurerId: undefined,
      agreementId: undefined,
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
