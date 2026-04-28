import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AdmissionCatalogItem,
  AdmissionServiceGroup,
  TriagePatient,
} from "@/core/interfaces/care/types";
import { useAdmissionCatalogs } from "@/core/hooks/care/admissions/useAdmissionCatalogs";
import { useInsurers } from "@/core/hooks/utils/useInsurer";
import { useBenefitPlans } from "@/core/hooks/utils/useBenefitPlans";
import {
  PatientNotFoundError,
  patientByDocumentService,
} from "@/core/hooks/care/triage/useSearchPatientByDocument";

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
});

export type AdmissionFormValues = z.infer<typeof admissionSchema>;

const toOptions = (data: { id: number; name: string }[] | undefined) =>
  (data ?? []).map((x) => ({ value: x.id, label: x.name }));

export function useAdmissionForm() {
  const { data: catalogs, isLoading: loadingAdmissionCatalogs } =
    useAdmissionCatalogs();
  const { data: insurers, isLoading: loadingInsurers } = useInsurers();
  const { data: benefitPlans, isLoading: loadingBenefitPlans } =
    useBenefitPlans();

  const [patient, setPatient] = useState<TriagePatient | null>(null);
  const [searchDoc, setSearchDoc] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<AdmissionFormValues>({
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
    });

  const selectedServiceClassification = watch("serviceClassification");

  useEffect(() => {
    setValue("serviceGroup", undefined as unknown as number);
  }, [selectedServiceClassification, setValue]);

  const catalogOptions = useMemo(() => {
    const admissionOptions = (data: AdmissionCatalogItem[] | undefined) =>
      toOptions(data);

    const filteredServiceGroups = (catalogs?.serviceGroups ?? []).filter(
      (x: AdmissionServiceGroup) =>
        selectedServiceClassification
          ? x.serviceClassificationId === selectedServiceClassification
          : true,
    );

    console.log("☠️☠️☠️", selectedServiceClassification);

    return {
      careModalityOptions: admissionOptions(catalogs?.careModalities),
      careReasonOptions: admissionOptions(catalogs?.careReasons),
      serviceClassificationOptions: admissionOptions(
        catalogs?.serviceClassifications,
      ),
      serviceGroupOptions: toOptions(filteredServiceGroups),
      admissionTypeOptions: admissionOptions(catalogs?.admissionTypes),
      careScopeOptions: admissionOptions(catalogs?.careScopes),
      carePurposeOptions: admissionOptions(catalogs?.carePurposes),
      insurerOptions: toOptions(insurers),
      agreementOptions: toOptions(benefitPlans),
    };
  }, [benefitPlans, catalogs, insurers, selectedServiceClassification]);

  const handleSearchPatient = async () => {
    const doc = searchDoc.trim();

    if (!doc) {
      setSearchError("Ingrese un número de documento");
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const found = await patientByDocumentService.getByDocument(doc);
      const patientData: TriagePatient = {
        id: found.id,
        firstName: found.primerNombre ?? "",
        secondName: found.segundoNombre ?? "",
        firstLastName: found.primerApellido ?? "",
        secondLastName: found.segundoApellido ?? "",
        birthDate: found.fechaNacimiento?.split("T")[0] ?? "",
        gender: found.sexo ?? "",
      };

      setPatient(patientData);
      setValue("firstName", patientData.firstName);
      setValue("secondName", patientData.secondName);
      setValue("firstLastName", patientData.firstLastName);
      setValue("secondLastName", patientData.secondLastName);
      setValue("birthDate", patientData.birthDate);
      setValue("gender", patientData.gender);
      setSearchError("");
    } catch (err) {
      setPatient(null);
      if (err instanceof PatientNotFoundError) {
        setSearchError(err.message);
      } else {
        setSearchError(
          err instanceof Error
            ? err.message
            : "No fue posible buscar al paciente. Intenta nuevamente.",
        );
      }
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = (data: AdmissionFormValues) => {
    if (!patient) {
      toast.error("Debe buscar un paciente antes de guardar");
      return;
    }

    console.log("Admission data:", { patientId: patient.id, ...data });
    toast.success("Solo visual: registro de admisión no disponible aún");
    handleReset();
  };

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
    });
    setPatient(null);
    setSearchDoc("");
    setSearchError("");
  };

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
    isLoadingCatalogs:
      loadingAdmissionCatalogs || loadingInsurers || loadingBenefitPlans,
    hasServiceClassification: !!selectedServiceClassification,
    ...catalogOptions,
  };
}
