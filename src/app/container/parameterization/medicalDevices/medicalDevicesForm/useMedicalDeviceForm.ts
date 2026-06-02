import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { TUtils } from "../../../../../types/utils";
import { useCreateMedicalDevice } from "@/core/hooks/parameterization/medicalDevices/useCreateMedicalDevice";
import { useGetMedicalDeviceById } from "@/core/hooks/parameterization/medicalDevices/useGetByIdMedicalDevice";
import { useUpdateMedicalDevice } from "@/core/hooks/parameterization/medicalDevices/useUpdateMedicalDevice";

const requiredSelect = (label: string) =>
  z
    .number({
      required_error: `Debe seleccionar ${label}`,
      invalid_type_error: `Debe seleccionar ${label}`,
    })
    .positive(`Debe seleccionar ${label}`);

const requiredBooleanSelect = (label: string) =>
  z.enum(["true", "false"], {
    required_error: `Debe seleccionar ${label}`,
    invalid_type_error: `Debe seleccionar ${label}`,
  });

const schema = z.object({
  elementName: z.string().min(1, "Nombre de elemento es obligatorio"),
  elementTypeId: requiredSelect("un tipo de elemento"),
  elementUsageId: requiredSelect("un uso del elemento"),
  ripsCode: z.string().min(1, "Código RIPS es obligatorio"),
  isReusable: requiredBooleanSelect("si es reintegrable"),
  isInvasive: requiredBooleanSelect("si es invasivo"),
});

export type TMedicalDeviceForm = z.infer<typeof schema>;

const defaultValues: Partial<TMedicalDeviceForm> = {
  elementName: "",
  elementTypeId: undefined,
  elementUsageId: undefined,
  ripsCode: "",
  isReusable: undefined,
  isInvasive: undefined,
};

export function useMedicalDeviceForm({
  setOpen,
  editUserId,
  setEditUserId,
}: Pick<TUtils, "setOpen" | "editUserId" | "setEditUserId">) {
  const createMedicalDevice = useCreateMedicalDevice();
  const updateMedicalDevice = useUpdateMedicalDevice();
  const { data: medicalDeviceData, isLoading: loadingMedicalDevice } =
    useGetMedicalDeviceById(Number(editUserId));

  const { control, handleSubmit, reset } = useForm<TMedicalDeviceForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (editUserId && medicalDeviceData) {
      reset({
        elementName: medicalDeviceData.elementName ?? "",
        elementTypeId: medicalDeviceData.elementTypeId,
        elementUsageId: medicalDeviceData.elementUsageId,
        ripsCode: medicalDeviceData.ripsCode ?? "",
        isReusable: String(Boolean(medicalDeviceData.isReusable)) as
          | "true"
          | "false",
        isInvasive: String(Boolean(medicalDeviceData.isInvasive)) as
          | "true"
          | "false",
      });
    }
  }, [editUserId, medicalDeviceData, reset]);

  const onSubmit = (data: TMedicalDeviceForm) => {
    const payload = {
      elementName: data.elementName,
      elementTypeId: data.elementTypeId,
      elementUsageId: data.elementUsageId,
      ripsCode: data.ripsCode,
      isReusable: data.isReusable === "true",
      isInvasive: data.isInvasive === "true",
      ...(editUserId ? { isActive: medicalDeviceData?.isActive ?? true } : {}),
    };

    if (editUserId) {
      updateMedicalDevice.mutate(
        { id: editUserId, data: payload },
        {
          onSuccess: () => {
            setOpen(false);
            setEditUserId(null);
            toast.success("Dispositivo médico actualizado correctamente");
          },
          onError: (err: Error) => {
            toast.error(err.message);
          },
        },
      );
      return;
    }

    createMedicalDevice.mutate(payload, {
      onSuccess: () => {
        reset(defaultValues);
        setOpen(false);
        toast.success("Dispositivo médico creado correctamente");
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    });
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    loadingMedicalDevice,
    isSubmitting: createMedicalDevice.isPending || updateMedicalDevice.isPending,
  };
}
