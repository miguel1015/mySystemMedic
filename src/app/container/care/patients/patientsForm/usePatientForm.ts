import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useCreatePatient } from "@/core/hooks/care/patients/useCreatePatient";
import { useUpdatePatient } from "@/core/hooks/care/patients/useUpdatePatient";
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient";
import { useSelectOptions } from "./useSelectOptions";
import {
  patientSchema,
  TPatientForm,
  patientDefaultValues,
} from "@/zod/patientSchema";

interface UsePatientFormProps {
  setOpen: (open: boolean) => void;
  editPatientId: number | null;
  setEditPatientId: (id: number | null) => void;
}

export function usePatientForm({
  setOpen,
  editPatientId,
  setEditPatientId,
}: UsePatientFormProps) {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const { data: patientData, isLoading: loadingPatient } =
    useGetPatientById(editPatientId);

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<TPatientForm>({
      resolver: zodResolver(patientSchema),
      defaultValues: patientDefaultValues,
    });

  const residenceCountryId = watch("residenceCountryId");
  const stateId = watch("stateId");

  const selectOptions = useSelectOptions({ residenceCountryId, stateId });

  // Limpiar departamento y ciudad cuando cambia el país de residencia
  useEffect(() => {
    if (!editPatientId) {
      setValue("stateId", undefined as unknown as number);
      setValue("cityId", undefined as unknown as number);
    }
  }, [residenceCountryId, setValue, editPatientId]);

  // Limpiar ciudad cuando cambia el departamento
  useEffect(() => {
    if (!editPatientId) {
      setValue("cityId", undefined as unknown as number);
    }
  }, [stateId, setValue, editPatientId]);

  useEffect(() => {
    if (editPatientId && patientData) {
      reset({
        insurerId: patientData.insurerId ?? undefined,
        documentTypeId: patientData.documentTypeId ?? undefined,
        documentNumber: patientData.documentNumber ?? "",
        firstName: patientData.firstName ?? "",
        middleName: patientData.middleName ?? "",
        lastName: patientData.lastName ?? "",
        secondLastName: patientData.secondLastName ?? "",
        birthDate: patientData.birthDate?.split("T")[0] ?? "",
        sexId: patientData.sexId ?? undefined,
        birthCountryId: patientData.birthCountryId ?? undefined,
        residenceCountryId: patientData.residenceCountryId ?? undefined,
        stateId: patientData.stateId ?? undefined,
        cityId: patientData.cityId ?? undefined,
        zoneId: patientData.zoneId ?? undefined,
        address: patientData.address ?? "",
        phone: patientData.phone ?? "",
        email: patientData.email ?? "",
        maritalStatusId: patientData.maritalStatusId ?? undefined,
        disabilityId: patientData.disabilityId ?? undefined,
        bloodGroupId: patientData.bloodGroupId ?? undefined,
        rhFactorId: patientData.rhFactorId ?? undefined,
      });
    }
  }, [editPatientId, patientData, reset]);

  const onSubmit = (formData: TPatientForm) => {
    const data = {
      ...formData,
      birthDate: formData.birthDate.includes("T")
        ? formData.birthDate
        : `${formData.birthDate}T00:00:00Z`,
    };

    if (editPatientId) {
      updatePatient.mutate(
        { id: editPatientId, data: { ...data, isActive: true } },
        {
          onSuccess: () => {
            setOpen(false);
            setEditPatientId(null);
            toast.success("Paciente actualizado correctamente");
          },
          onError: (err: Error) => {
            toast.error(err.message);
          },
        },
      );
      return;
    }

    createPatient.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success("Paciente creado correctamente");
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    });
  };

  const handleCancel = () => {
    reset();
    setOpen(false);
    setEditPatientId(null);
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    handleCancel,
    isEditing: !!editPatientId,
    loadingPatient,
    isSubmitting: createPatient.isPending || updatePatient.isPending,
    hasCountry: !!residenceCountryId,
    hasState: !!stateId,
    ...selectOptions,
  };
}
