import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  TTariffDetailUpdate,
  useUpdateTariffDetail,
} from "@/core/hooks/parameterization/tariffDetails/useUpdateTariffDetail";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";

const requiredNumber = (label: string) =>
  z.number({
    required_error: `${label} es obligatorio`,
    invalid_type_error: `${label} es obligatorio`,
  });

const requiredSelect = (label: string) =>
  z
    .number({
      required_error: `Debe seleccionar ${label}`,
      invalid_type_error: `Debe seleccionar ${label}`,
    })
    .positive(`Debe seleccionar ${label}`);

const schema = z.object({
  referenceCode: requiredNumber("El código de referencia").positive(
    "El código de referencia debe ser mayor a 0",
  ),
  description: z.string().min(1, "La descripción es obligatoria"),
  cups: z.object({ code: z.string(), name: z.string() }).nullable(),
  // CUPS que no está en el catálogo; si viene, reemplaza a `cups`.
  newCups: z
    .object({
      code: z
        .string()
        .trim()
        .min(1, "El código CUPS es obligatorio")
        .max(10, "El código CUPS tiene máximo 10 caracteres"),
      name: z.string().trim().min(1, "El nombre del CUPS es obligatorio"),
      ripsType: z
        .string()
        .trim()
        .min(1, "El tipo RIPS es obligatorio")
        .max(5, "El tipo RIPS tiene máximo 5 caracteres"),
    })
    .nullable(),
  value: requiredNumber("El valor").nonnegative("El valor no puede ser negativo"),
  factors: requiredNumber("El factor").nonnegative("El factor no puede ser negativo"),
  tariffId: requiredSelect("un tarifario"),
  // Opcional: solo aplica a procedimientos quirúrgicos.
  surgicalGroupId: z.number().nullable().optional(),
  isSurgicalProcedure: z.enum(["true", "false"], {
    required_error: "Debe indicar si es procedimiento quirúrgico",
    invalid_type_error: "Debe indicar si es procedimiento quirúrgico",
  }),
});

export type TTariffDetailForm = z.infer<typeof schema>;

const defaultValues: Partial<TTariffDetailForm> = {
  referenceCode: undefined,
  description: "",
  cups: null,
  newCups: null,
  value: undefined,
  factors: undefined,
  tariffId: undefined,
  surgicalGroupId: undefined,
  isSurgicalProcedure: undefined,
};

interface UseTariffDetailFormProps {
  record: TTariffDetail | null;
  onClose: () => void;
}

export function useTariffDetailForm({ record, onClose }: UseTariffDetailFormProps) {
  const updateTariffDetail = useUpdateTariffDetail();

  const { control, handleSubmit, reset, setValue, watch } = useForm<TTariffDetailForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (record) {
      reset({
        referenceCode: record.referenceCode,
        description: record.description,
        // El nombre del CUPS no viene en el detalle: el formulario lo resuelve del catálogo.
        cups: record.cupsCode ? { code: record.cupsCode, name: "" } : null,
        newCups: null,
        value: record.value,
        factors: record.factors,
        tariffId: record.tariffId,
        surgicalGroupId: record.surgicalGroupId,
        isSurgicalProcedure: String(Boolean(record.isSurgicalProcedure)) as
          | "true"
          | "false",
      });
    }
  }, [record, reset]);

  const onSubmit = (data: TTariffDetailForm) => {
    if (!record) return;

    const newCups = data.newCups
      ? {
          code: data.newCups.code.toUpperCase(),
          name: data.newCups.name,
          ripsType: data.newCups.ripsType.toUpperCase(),
        }
      : null;

    const payload: TTariffDetailUpdate = {
      referenceCode: data.referenceCode,
      description: data.description,
      // Con un CUPS nuevo, el backend lo agrega al catálogo y lo asigna en la misma operación.
      // Sin él, cadena vacía en cupsCode quita el CUPS.
      ...(newCups ? { newCups } : { cupsCode: data.cups?.code ?? "" }),
      value: data.value,
      factors: data.factors,
      tariffId: data.tariffId,
      surgicalGroupId: data.surgicalGroupId ?? null,
      isSurgicalProcedure: data.isSurgicalProcedure === "true",
    };

    updateTariffDetail.mutate(
      { id: record.id, data: payload },
      {
        onSuccess: () => {
          toast.success(
            newCups
              ? `CUPS ${newCups.code} agregado al catálogo y asignado al detalle`
              : "Tarifa de detalle actualizada correctamente",
          );
          onClose();
        },
        onError: (err: Error) => {
          toast.error(err.message);
        },
      },
    );
  };

  const startNewCups = () => setValue("newCups", { code: "", name: "", ripsType: "" });
  const cancelNewCups = () => setValue("newCups", null);

  return {
    control,
    handleSubmit,
    onSubmit,
    isAddingCups: watch("newCups") !== null,
    startNewCups,
    cancelNewCups,
    isSubmitting: updateTariffDetail.isPending,
  };
}
