import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  PatientMiniResponse,
  TriageCreateRequest,
  TriagePriority,
  TriageResponse,
  TriageUpdateRequest,
  VitalSignsRequestDto,
} from "@/core/interfaces/care/types";
import { useCreateTriage } from "@/core/hooks/care/triage/useCreateTriage";
import { useUpdateTriage } from "@/core/hooks/care/triage/useUpdateTriage";
import {
  PatientNotFoundError,
  patientByDocumentService,
} from "@/core/hooks/care/triage/useSearchPatientByDocument";

export type SearchErrorType = "not-found" | "other";

export interface SearchErrorState {
  type: SearchErrorType;
  message: string;
}

export type TriageFormMode = "create" | "edit";

const PRIORITY_NUMBER_TO_ROMAN: Record<number, TriagePriority> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
};

const PRIORITY_ROMAN_TO_NUMBER: Record<TriagePriority, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
};

const triageSchema = z.object({
  dateTime: z.string().min(1, "La fecha y hora es obligatoria"),
  priority: z
    .number({ required_error: "La prioridad es obligatoria" })
    .min(1, "Seleccione una prioridad")
    .max(5, "La prioridad debe ser entre I y V"),
  consultationReason: z
    .string()
    .min(1, "El motivo de consulta es obligatorio")
    .max(500, "Máximo 500 caracteres"),
  bloodPressure: z
    .string()
    .max(30, "Máximo 30 caracteres")
    .optional()
    .or(z.literal("")),
  heartRate: z
    .number()
    .min(1, "Debe ser mayor a 0")
    .max(300, "Valor fuera de rango")
    .optional(),
  respiratoryRate: z
    .number()
    .min(1, "Debe ser mayor a 0")
    .max(100, "Valor fuera de rango")
    .optional(),
  weight: z
    .number()
    .min(0.1, "Debe ser mayor a 0")
    .max(500, "Valor fuera de rango")
    .optional(),
  height: z
    .number()
    .min(1, "Debe ser mayor a 0")
    .max(300, "Valor fuera de rango")
    .optional(),
  temperature: z
    .number()
    .min(25, "Temperatura fuera de rango")
    .max(45, "Temperatura fuera de rango")
    .optional(),
  glasgow: z
    .number()
    .min(3, "El Glasgow mínimo es 3")
    .max(15, "El Glasgow máximo es 15")
    .optional(),
});

export type TriageFormValues = z.infer<typeof triageSchema>;

function getCurrentDateTime(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function toLocalDateTimeInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildVitalSigns(values: TriageFormValues): VitalSignsRequestDto {
  return {
    TensionArterial: values.bloodPressure?.trim() ? values.bloodPressure : null,
    FrecuenciaCardiaca: values.heartRate ?? null,
    FrecuenciaRespiratoria: values.respiratoryRate ?? null,
    Peso: values.weight ?? null,
    Talla: values.height ?? null,
    Temperatura: values.temperature ?? null,
    Glasgow: values.glasgow ?? null,
  };
}

function defaultValues(): TriageFormValues {
  return {
    dateTime: getCurrentDateTime(),
    priority: undefined as unknown as number,
    consultationReason: "",
    bloodPressure: "",
    heartRate: undefined,
    respiratoryRate: undefined,
    weight: undefined,
    height: undefined,
    temperature: undefined,
    glasgow: undefined,
  };
}

interface UseTriageFormArgs {
  mode: TriageFormMode;
  initialTriage?: TriageResponse | null;
}

export function useTriageForm({ mode, initialTriage }: UseTriageFormArgs) {
  const router = useRouter();
  const createMutation = useCreateTriage();
  const updateMutation = useUpdateTriage();

  const [patient, setPatient] = useState<PatientMiniResponse | null>(null);
  const [searchDoc, setSearchDoc] = useState("");
  const [searchError, setSearchError] = useState<SearchErrorState | null>(null);
  const [searching, setSearching] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<TriageFormValues>({
    resolver: zodResolver(triageSchema),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (mode === "edit" && initialTriage) {
      reset({
        dateTime: toLocalDateTimeInputValue(initialTriage.fechaHora),
        priority:
          PRIORITY_ROMAN_TO_NUMBER[initialTriage.prioridad] ??
          (undefined as unknown as number),
        consultationReason: initialTriage.motivoConsulta ?? "",
        bloodPressure: initialTriage.signosVitales?.tensionArterial ?? "",
        heartRate: initialTriage.signosVitales?.frecuenciaCardiaca ?? undefined,
        respiratoryRate:
          initialTriage.signosVitales?.frecuenciaRespiratoria ?? undefined,
        weight: initialTriage.signosVitales?.peso ?? undefined,
        height: initialTriage.signosVitales?.talla ?? undefined,
        temperature: initialTriage.signosVitales?.temperatura ?? undefined,
        glasgow: initialTriage.signosVitales?.glasgow ?? undefined,
      });
      setSearchDoc(initialTriage.numeroDocumento);
    }
  }, [mode, initialTriage, reset]);

  const handleSearchPatient = async () => {
    const doc = searchDoc.trim();
    if (!doc) {
      setSearchError({
        type: "other",
        message: "Ingrese un número de documento para continuar.",
      });
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const found = await patientByDocumentService.getByDocument(doc);
      setPatient(found);
      setSearchError(null);
    } catch (err) {
      setPatient(null);
      if (err instanceof PatientNotFoundError) {
        setSearchError({ type: "not-found", message: err.message });
      } else {
        setSearchError({
          type: "other",
          message:
            err instanceof Error
              ? err.message
              : "No fue posible buscar al paciente. Intenta nuevamente.",
        });
      }
    } finally {
      setSearching(false);
    }
  };

  const onInvalid = (errors: FieldErrors<TriageFormValues>) => {
    // eslint-disable-next-line no-console
    console.warn("[TriageForm] validación fallida:", errors);

    const firstKey = Object.keys(errors)[0] as keyof TriageFormValues | undefined;
    const firstMessage = firstKey
      ? (errors[firstKey]?.message as string | undefined)
      : undefined;

    if (mode === "create" && !patient) {
      toast.error("Debe buscar un paciente antes de guardar");
      return;
    }

    toast.error(
      firstMessage ??
        "Revisa los campos obligatorios y vuelve a intentarlo.",
    );
  };

  const onSubmit = (data: TriageFormValues) => {
    const priorityRoman = PRIORITY_NUMBER_TO_ROMAN[data.priority];
    const fechaHora = new Date(data.dateTime).toISOString();
    const signosVitales = buildVitalSigns(data);

    if (mode === "create") {
      if (!patient) {
        toast.error("Debe buscar un paciente antes de guardar");
        return;
      }

      // eslint-disable-next-line no-console
      console.log(
        "[TriageForm] paciente seleccionado:\n" +
          JSON.stringify(patient, null, 2),
      );

      const numeroDocumento =
        patient.numeroDocumento?.trim() || searchDoc.trim();

      const payload: TriageCreateRequest = {
        NumeroDocumento: numeroDocumento,
        FechaHora: fechaHora,
        Prioridad: priorityRoman,
        MotivoConsulta: data.consultationReason,
        SignosVitales: signosVitales,
      };

      // eslint-disable-next-line no-console
      console.log(
        "[TriageForm] POST /api/triage payload:\n" +
          JSON.stringify(payload, null, 2),
      );

      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Triaje registrado correctamente");
          router.push("/care/triage");
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo registrar el triaje");
        },
      });
      return;
    }

    if (!initialTriage) return;

    const payload: TriageUpdateRequest = {
      FechaHora: fechaHora,
      Prioridad: priorityRoman,
      MotivoConsulta: data.consultationReason,
      SignosVitales: signosVitales,
      IsActive: initialTriage.isActive,
    };

    // eslint-disable-next-line no-console
    console.log(
      `[TriageForm] PUT /api/triage/${initialTriage.id} payload:\n` +
        JSON.stringify(payload, null, 2),
    );

    updateMutation.mutate(
      { id: initialTriage.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Triaje actualizado correctamente");
          router.push(`/care/triage/${initialTriage.id}`);
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo actualizar el triaje");
        },
      },
    );
  };

  const handleReset = () => {
    if (mode === "edit") {
      router.back();
      return;
    }
    reset(defaultValues());
    setPatient(null);
    setSearchDoc("");
    setSearchError(null);
  };
  const consultationReason = watch("consultationReason") ?? "";

  return {
    mode,
    control,
    handleSubmit,
    onSubmit,
    onInvalid,
    handleReset,
    patient,
    searchDoc,
    setSearchDoc,
    searchError,
    searching,
    handleSearchPatient,
    consultationReasonLength: consultationReason.length,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    editingTriage: mode === "edit" ? (initialTriage ?? null) : null,
  };
}
