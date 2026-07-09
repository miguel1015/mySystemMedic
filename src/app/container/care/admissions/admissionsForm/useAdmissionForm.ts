import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AdmissionCatalogItem,
  AdmissionCreateRequest,
  AdmissionResponse,
  AdmissionServiceGroup,
  AdmissionUpdateRequest,
  PatientMiniResponse,
} from "@/core/interfaces/care/types";
import { useAdmissionCatalogs } from "@/core/hooks/care/admissions/useAdmissionCatalogs";
import { useCreateAdmission } from "@/core/hooks/care/admissions/useCreateAdmission";
import { useUpdateAdmission } from "@/core/hooks/care/admissions/useUpdateAdmission";
import { useContractsByInsurer } from "@/core/hooks/parameterization/contracts/useGetAllContracts";
import { useInsurers } from "@/core/hooks/utils/useInsurer";
import {
  PatientNotFoundError,
  patientByDocumentService,
} from "@/core/hooks/care/triage/useSearchPatientByDocument";

type SearchErrorType = "not-found" | "other";

interface SearchErrorState {
  type: SearchErrorType;
  message: string;
}

const normalizeClearedSelectValues = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, fieldValue]) => [
      key,
      fieldValue === null ? undefined : fieldValue,
    ]),
  );
};

const admissionSchema = z.preprocess(normalizeClearedSelectValues, z.object({
  firstName: z.string().optional(),
  secondName: z.string().optional(),
  firstLastName: z.string().optional(),
  secondLastName: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  admissionDate: z
    .string({ required_error: "La fecha de admisión es obligatoria" })
    .min(1, "La fecha de admisión es obligatoria")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ingrese una fecha válida"),
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
}));

export type AdmissionFormValues = z.infer<typeof admissionSchema>;

interface UseAdmissionFormArgs {
  initialAdmission?: AdmissionResponse | null;
  onDone?: () => void;
}

function getCurrentDate(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const getEmptyValues = (): AdmissionFormValues => ({
  firstName: "",
  secondName: "",
  firstLastName: "",
  secondLastName: "",
  birthDate: "",
  gender: "",
  admissionDate: getCurrentDate(),
  careModality: undefined as unknown as number,
  careReason: undefined as unknown as number,
  serviceClassification: undefined as unknown as number,
  serviceGroup: undefined as unknown as number,
  admissionType: undefined as unknown as number,
  careScope: undefined as unknown as number,
  carePurpose: undefined as unknown as number,
  insurerId: undefined as unknown as number,
  agreementId: undefined as unknown as number,
});

const toOptions = (data: { id: number; name: string }[] | undefined) =>
  (data ?? []).map((x) => ({ value: x.id, label: x.name }));

export function useAdmissionForm({
  initialAdmission = null,
  onDone,
}: UseAdmissionFormArgs = {}) {
  const { data: catalogs, isLoading: loadingAdmissionCatalogs } =
    useAdmissionCatalogs();
  const { data: insurers, isLoading: loadingInsurers } = useInsurers();
  const createAdmission = useCreateAdmission();
  const updateAdmission = useUpdateAdmission();

  const [patient, setPatient] = useState<PatientMiniResponse | null>(null);
  const [searchDoc, setSearchDoc] = useState("");
  const [searchError, setSearchError] = useState<SearchErrorState | null>(null);
  const [searching, setSearching] = useState(false);
  const isEdit = !!initialAdmission;
  const [hasLoadedInitialEditData, setHasLoadedInitialEditData] =
    useState(!isEdit);

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<AdmissionFormValues>({
      resolver: zodResolver(admissionSchema),
      defaultValues: getEmptyValues(),
    });

  const selectedServiceClassification = watch("serviceClassification");
  const selectedInsurerId = watch("insurerId");
  const selectedAgreementId = watch("agreementId");
  const previousSelectedInsurerRef = useRef<number | undefined>(undefined);
  const hasInitializedInsurerRef = useRef(false);
  const initializedAdmissionIdRef = useRef<number | null>(null);
  const userTouchedAgreementRef = useRef(false);
  const { data: contracts, isLoading: loadingContracts } =
    useContractsByInsurer(selectedInsurerId);

  useEffect(() => {
    if (isEdit) return;
    if (!selectedServiceClassification) return;
    setValue("serviceGroup", undefined as unknown as number);
  }, [isEdit, selectedServiceClassification, setValue]);

  useEffect(() => {
    const previousSelectedInsurer = previousSelectedInsurerRef.current;

    if (!hasInitializedInsurerRef.current) {
      previousSelectedInsurerRef.current = selectedInsurerId;
      hasInitializedInsurerRef.current = true;
      return;
    }

    if (
      previousSelectedInsurer !== undefined &&
      previousSelectedInsurer !== selectedInsurerId
    ) {
      setValue("agreementId", null as unknown as number, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    previousSelectedInsurerRef.current = selectedInsurerId;
  }, [selectedInsurerId, setValue]);

  const catalogOptions = useMemo(() => {
    const admissionOptions = (data: AdmissionCatalogItem[] | undefined) =>
      toOptions(data);
    const withCurrentOption = (
      options: { value: number | string; label: string }[],
      value: number | undefined,
      label: string | undefined,
    ) => {
      if (!value || !label) return options;
      if (options.some((option) => Number(option.value) === value)) {
        return options;
      }
      return [...options, { value, label }];
    };

    const filteredServiceGroups = (catalogs?.serviceGroups ?? []).filter(
      (x: AdmissionServiceGroup) =>
        selectedServiceClassification
          ? x.serviceClassificationId === selectedServiceClassification
          : true,
    );

    const activeContracts = (contracts ?? []).filter((contract) => {
      const status =
        contract.contractStatusDescription ?? contract.status ?? "";
      return !status || status.toLowerCase() === "activo";
    });
    const shouldIncludeCurrentAgreement =
      !!initialAdmission && selectedInsurerId === initialAdmission.epsId;

    const careModalityOptions = admissionOptions(catalogs?.careModalities);
    const careReasonOptions = admissionOptions(catalogs?.careReasons);
    const serviceClassificationOptions = admissionOptions(
      catalogs?.serviceClassifications,
    );
    const serviceGroupOptions = toOptions(filteredServiceGroups);
    const admissionTypeOptions = admissionOptions(catalogs?.admissionTypes);
    const careScopeOptions = admissionOptions(catalogs?.careScopes);
    const carePurposeOptions = admissionOptions(catalogs?.carePurposes);
    const insurerOptions = toOptions(insurers);
    const agreementOptions = activeContracts.map((contract) => ({
      value: contract.id,
      label: contract.contractName
        ? `${contract.contractName} (${contract.contractNumber})`
        : contract.contractNumber,
    }));

    return {
      careModalityOptions: withCurrentOption(
        careModalityOptions,
        initialAdmission?.careModalityId,
        initialAdmission?.careModalityName,
      ),
      careReasonOptions: withCurrentOption(
        careReasonOptions,
        initialAdmission?.careReasonId,
        initialAdmission?.careReasonName,
      ),
      serviceClassificationOptions: withCurrentOption(
        serviceClassificationOptions,
        initialAdmission?.serviceClassificationId,
        initialAdmission?.serviceClassificationName,
      ),
      serviceGroupOptions: withCurrentOption(
        serviceGroupOptions,
        initialAdmission?.serviceGroupId,
        initialAdmission?.serviceGroupName,
      ),
      admissionTypeOptions: withCurrentOption(
        admissionTypeOptions,
        initialAdmission?.admissionTypeId,
        initialAdmission?.admissionTypeName,
      ),
      careScopeOptions: withCurrentOption(
        careScopeOptions,
        initialAdmission?.careScopeId,
        initialAdmission?.careScopeName,
      ),
      carePurposeOptions: withCurrentOption(
        carePurposeOptions,
        initialAdmission?.carePurposeId,
        initialAdmission?.carePurposeName,
      ),
      insurerOptions: withCurrentOption(
        insurerOptions,
        initialAdmission?.epsId,
        initialAdmission?.epsNombre,
      ),
      agreementOptions: shouldIncludeCurrentAgreement
        ? withCurrentOption(
            agreementOptions,
            initialAdmission?.convenioId,
            initialAdmission?.convenioNombre ??
              (initialAdmission?.convenioId
                ? `Convenio ${initialAdmission.convenioId}`
                : undefined),
          )
        : agreementOptions,
    };
  }, [
    catalogs,
    contracts,
    initialAdmission,
    insurers,
    selectedInsurerId,
    selectedServiceClassification,
  ]);

  useEffect(() => {
    if (!selectedAgreementId || loadingContracts) return;

    const isInitialAdmissionAgreement =
      !!initialAdmission &&
      Number(selectedInsurerId) === initialAdmission.epsId &&
      Number(selectedAgreementId) === initialAdmission.convenioId;

    if (isInitialAdmissionAgreement) return;

    const agreementBelongsToSelectedInsurer = catalogOptions.agreementOptions.some(
      (option) => Number(option.value) === Number(selectedAgreementId),
    );

    if (!agreementBelongsToSelectedInsurer) {
      setValue("agreementId", null as unknown as number, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [
    catalogOptions.agreementOptions,
    initialAdmission,
    loadingContracts,
    selectedAgreementId,
    selectedInsurerId,
    setValue,
  ]);

  useEffect(() => {
    if (!initialAdmission || loadingContracts || selectedAgreementId) return;
    if (userTouchedAgreementRef.current) return;
    if (Number(selectedInsurerId) !== initialAdmission.epsId) return;
    if (!initialAdmission.convenioId) return;

    const currentAgreementIsAvailable = catalogOptions.agreementOptions.some(
      (option) => Number(option.value) === initialAdmission.convenioId,
    );

    if (!currentAgreementIsAvailable) return;

    setValue("agreementId", initialAdmission.convenioId, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [
    catalogOptions.agreementOptions,
    initialAdmission,
    loadingContracts,
    selectedAgreementId,
    selectedInsurerId,
    setValue,
  ]);

  useEffect(() => {
    if (!initialAdmission) {
      initializedAdmissionIdRef.current = null;
      return;
    }

    if (initializedAdmissionIdRef.current === initialAdmission.id) return;

    const resetValues: AdmissionFormValues = {
      ...getEmptyValues(),
      admissionDate:
        initialAdmission.admissionDate?.split("T")[0] ?? getCurrentDate(),
      careModality: initialAdmission.careModalityId,
      careReason: initialAdmission.careReasonId,
      serviceClassification: initialAdmission.serviceClassificationId,
      serviceGroup: initialAdmission.serviceGroupId,
      admissionType: initialAdmission.admissionTypeId,
      careScope: initialAdmission.careScopeId,
      carePurpose: initialAdmission.carePurposeId,
      insurerId: initialAdmission.epsId,
      agreementId: initialAdmission.convenioId,
    };

    initializedAdmissionIdRef.current = initialAdmission.id;
    previousSelectedInsurerRef.current = initialAdmission.epsId;
    hasInitializedInsurerRef.current = true;
    userTouchedAgreementRef.current = false;
    reset(resetValues);
    setSearchDoc(String(initialAdmission.documentoPatiente));
    setPatient(null);
    setSearchError(null);
  }, [initialAdmission, reset]);

  const hasOptionValue = (
    options: { value: number | string; label: string }[],
    value: number,
  ) => options.some((option) => Number(option.value) === value);

  const canLoadInitialEditData =
    !isEdit ||
    (!loadingAdmissionCatalogs &&
      !loadingInsurers &&
      !loadingContracts &&
      !!initialAdmission &&
      hasOptionValue(
        catalogOptions.careModalityOptions,
        initialAdmission.careModalityId,
      ) &&
      hasOptionValue(
        catalogOptions.careReasonOptions,
        initialAdmission.careReasonId,
      ) &&
      hasOptionValue(
        catalogOptions.serviceClassificationOptions,
        initialAdmission.serviceClassificationId,
      ) &&
      hasOptionValue(
        catalogOptions.serviceGroupOptions,
        initialAdmission.serviceGroupId,
      ) &&
      hasOptionValue(
        catalogOptions.admissionTypeOptions,
        initialAdmission.admissionTypeId,
      ) &&
      hasOptionValue(
        catalogOptions.careScopeOptions,
        initialAdmission.careScopeId,
      ) &&
      hasOptionValue(
        catalogOptions.carePurposeOptions,
        initialAdmission.carePurposeId,
      ) &&
      hasOptionValue(catalogOptions.insurerOptions, initialAdmission.epsId) &&
      (!!initialAdmission.convenioId ||
        hasOptionValue(catalogOptions.agreementOptions, initialAdmission.convenioId)));

  useEffect(() => {
    setHasLoadedInitialEditData(!isEdit);
  }, [initialAdmission?.id, isEdit]);

  useEffect(() => {
    if (canLoadInitialEditData) {
      setHasLoadedInitialEditData(true);
    }
  }, [canLoadInitialEditData]);

  const isEditDataReady = !isEdit || hasLoadedInitialEditData;

  const buildPayload = (data: AdmissionFormValues): AdmissionUpdateRequest => ({
    admissionDate: data.admissionDate,
    careModalityId: data.careModality,
    careReasonId: data.careReason,
    serviceClassificationId: data.serviceClassification,
    serviceGroupId: data.serviceGroup,
    admissionTypeId: data.admissionType,
    careScopeId: data.careScope,
    carePurposeId: data.carePurpose,
    epsId: data.insurerId,
    convenioId: data.agreementId,
  });

  const handleSearchPatient = async () => {
    if (isEdit) return;

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
      setValue("firstName", found.primerNombre ?? "");
      setValue("secondName", found.segundoNombre ?? "");
      setValue("firstLastName", found.primerApellido ?? "");
      setValue("secondLastName", found.segundoApellido ?? "");
      setValue("birthDate", found.fechaNacimiento?.split("T")[0] ?? "");
      setValue("gender", found.sexo ?? "");
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

  const onSubmit = (data: AdmissionFormValues) => {
    if (!isEdit && !patient) {
      toast.error("Debe buscar un paciente antes de guardar");
      return;
    }

    let payload: AdmissionUpdateRequest;
    try {
      payload = buildPayload(data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No fue posible preparar la admisión.",
      );
      return;
    }

    if (isEdit && initialAdmission) {
      updateAdmission.mutate(
        { id: initialAdmission.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Admisión actualizada correctamente");
            onDone?.();
          },
          onError: (err: Error) => {
            toast.error(err.message || "No se pudo actualizar la admisión");
          },
        },
      );
      return;
    }

    const createPayload: AdmissionCreateRequest = {
      document: patient?.numeroDocumento?.trim() || searchDoc.trim(),
      ...payload,
    };

    createAdmission.mutate(createPayload, {
      onSuccess: () => {
        toast.success("Admisión registrada correctamente");
        handleReset();
        onDone?.();
      },
      onError: (err: Error) => {
        toast.error(err.message || "No se pudo registrar la admisión");
      },
    });
  };

  const handleReset = () => {
    userTouchedAgreementRef.current = false;
    reset(getEmptyValues());
    setPatient(null);
    setSearchDoc("");
    setSearchError(null);
  };

  const handleAgreementChange = () => {
    userTouchedAgreementRef.current = true;
  };

  const handleAgreementClear = () => {
    userTouchedAgreementRef.current = true;
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
    isEdit,
    initialAdmission,
    isSubmitting: createAdmission.isPending || updateAdmission.isPending,
    isLoadingCatalogs:
      loadingAdmissionCatalogs || loadingInsurers || loadingContracts,
    isEditDataReady,
    hasServiceClassification: !!selectedServiceClassification,
    hasSelectedInsurer: !!selectedInsurerId,
    handleAgreementChange,
    handleAgreementClear,
    ...catalogOptions,
  };
}
