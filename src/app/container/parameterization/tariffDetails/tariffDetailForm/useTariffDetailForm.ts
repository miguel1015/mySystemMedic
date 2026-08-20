import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useUpdateTariffDetail } from "@/core/hooks/parameterization/tariffDetails/useUpdateTariffDetail";
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
  value: requiredNumber("El valor").nonnegative("El valor no puede ser negativo"),
  factors: requiredNumber("El factor").nonnegative("El factor no puede ser negativo"),
  tariffId: requiredSelect("un tarifario"),
  surgicalGroupId: requiredSelect("un grupo quirúrgico"),
  isSurgicalProcedure: z.enum(["true", "false"], {
    required_error: "Debe indicar si es procedimiento quirúrgico",
    invalid_type_error: "Debe indicar si es procedimiento quirúrgico",
  }),
});

export type TTariffDetailForm = z.infer<typeof schema>;

const defaultValues: Partial<TTariffDetailForm> = {
  referenceCode: undefined,
  description: "",
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

  const { control, handleSubmit, reset } = useForm<TTariffDetailForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (record) {
      reset({
        referenceCode: record.referenceCode,
        description: record.description,
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

    const payload: Partial<TTariffDetail> = {
      referenceCode: data.referenceCode,
      description: data.description,
      value: data.value,
      factors: data.factors,
      tariffId: data.tariffId,
      surgicalGroupId: data.surgicalGroupId,
      isSurgicalProcedure: data.isSurgicalProcedure === "true",
    };

    updateTariffDetail.mutate(
      { id: record.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Tarifa de detalle actualizada correctamente");
          onClose();
        },
        onError: (err: Error) => {
          toast.error(err.message);
        },
      },
    );
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    isSubmitting: updateTariffDetail.isPending,
  };
}
