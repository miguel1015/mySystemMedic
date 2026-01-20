import Input from "@/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import GridContainer from "../../../../../components/componentLayout";
import { useCreateTariffs } from "../../../../../core/hooks/parameterization/tariffs/useCreateTariffs";
import { useGetTariffById } from "../../../../../core/hooks/parameterization/tariffs/useGetByIdTariffs";
import { useUpdateTariffs } from "../../../../../core/hooks/parameterization/tariffs/useUpdateTariffs";
import { TTariffs } from "../../../../../core/interfaces/parameterization/types";
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

  const schema = z.object({
    name: z.string().min(1, "Nombre del tarifario es obligatorio"),
    codingId: z
      .number({
        required_error: "ID de codificación verificación es obligatorio",
        invalid_type_error: "ID de codificación es obligatorio",
      })
      .positive("ID de codificación es obligatorio"),
  });
  type TTariffsForm = z.infer<typeof schema>;

  const { control, handleSubmit, reset } = useForm<TTariffsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      codingId: undefined,
    },
  });

  const onSubmit = (data: TTariffs) => {
    if (editUserId) {
      const payload = { ...data, isActive: true };
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
    createTariffs.mutate(data, {
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
        codingId: getTariff.codingId,
      });
    }
  }, [editUserId, getTariff]);

  if (loadingTariff) {
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
          <Input
            type="number"
            name="codingId"
            label="ID de codificación"
            placeholder="ID de codificación"
            control={control}
          />
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
