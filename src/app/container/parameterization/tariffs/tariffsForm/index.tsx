import Input from "@/components/input";
import Select from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import GridContainer from "../../../../../components/componentLayout";
import { useCreateTariffs } from "../../../../../core/hooks/parameterization/tariffs/useCreateTariffs";
import { useGetTariffById } from "../../../../../core/hooks/parameterization/tariffs/useGetByIdTariffs";
import { useUpdateTariffs } from "../../../../../core/hooks/parameterization/tariffs/useUpdateTariffs";
import { useValueMethods } from "../../../../../core/hooks/utils/useValueMethods";
import { TUtils } from "../../../../../types/utils";
import TariffsFormSkeleton from "./tariffsSkeleton";

const TariffsForm: React.FC<TUtils> = ({
  setOpen,
  setEditUserId,
  editUserId,
}) => {
  const createTariffs = useCreateTariffs();
  const updateTariffs = useUpdateTariffs();
  const { data: getTariff, isLoading: loadingTariff } = useGetTariffById(
    Number(editUserId),
  );
  const { data: valueMethods = [] } = useValueMethods();

  const statusOptions = [
    { value: 1, label: "Activo" },
    { value: 2, label: "Inactivo" },
  ];

  const valueMethodsOptions = useMemo(
    () =>
      (valueMethods ?? []).map((v) => ({
        value: v.id,
        label: v.description,
      })),
    [valueMethods],
  );

  const schema = z.object({
    name: z
      .string({ required_error: "Nombre del tarifario es obligatorio" })
      .min(1, "Nombre del tarifario es obligatorio"),
    valueMethodId: z
      .number({
        required_error: "Método de valoración es obligatorio",
        invalid_type_error: "Método de valoración es obligatorio",
      })
      .positive("Método de valoración es obligatorio"),
    isActive: z.number().optional(),
  });
  type TTariffsForm = z.infer<typeof schema>;

  const { control, handleSubmit, reset } = useForm<TTariffsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      valueMethodId: undefined,
      isActive: 1,
    },
  });

  const onSubmit = (data: TTariffsForm) => {
    if (editUserId) {
      const payload = {
        name: data.name,
        valueMethodId: data.valueMethodId,
        isActive: data.isActive === 1,
      };
      updateTariffs.mutate(
        { id: editUserId, data: payload },
        {
          onSuccess: () => {
            setOpen(false);
            setEditUserId(null);
            toast.success("Tarifario actualizado correctamente");
          },
          onError: (err: Error) => {
            toast.error(err.message);
          },
        },
      );
      return;
    }

    const payload = {
      name: data.name,
      valueMethodId: data.valueMethodId,
    };
    createTariffs.mutate(payload, {
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success("Tarifario creado correctamente");
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    });
  };

  useEffect(() => {
    if (editUserId && getTariff) {
      reset({
        name: getTariff.name,
        valueMethodId: getTariff.valueMethodId,
        isActive: getTariff.isActive ? 1 : 2,
      });
    }
  }, [editUserId, getTariff]);

  if (loadingTariff && editUserId) {
    return <TariffsFormSkeleton />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer columns="col-4" gap="g-3" container>
          <Input
            name="name"
            label="Nombre del tarifario"
            placeholder="Nombre del tarifario"
            control={control}
          />
          <Select
            name="valueMethodId"
            label="Método de valoración"
            placeholder="Seleccione un método"
            control={control}
            options={valueMethodsOptions}
            getPopupContainer={() => document.body}
          />
          {editUserId && (
            <Select
              name="isActive"
              label="Estado"
              placeholder="Seleccione un estado"
              control={control}
              options={statusOptions}
              getPopupContainer={() => document.body}
            />
          )}
        </GridContainer>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button
            type="default"
            htmlType="button"
            onClick={() => {
              setOpen(false);
              setEditUserId(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createTariffs.isPending || updateTariffs.isPending}
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TariffsForm;
