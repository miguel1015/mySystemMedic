import Input from "@/components/input";
import Select from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import GridContainer from "../../../../../components/componentLayout";
import { useContracts } from "../../../../../core/hooks/parameterization/contracts/useGetAllContracts";
import { useCreateTariffs } from "../../../../../core/hooks/parameterization/tariffs/useCreateTariffs";
import { useGetTariffById } from "../../../../../core/hooks/parameterization/tariffs/useGetByIdTariffs";
import { useUpdateTariffs } from "../../../../../core/hooks/parameterization/tariffs/useUpdateTariffs";
import { useValueMethods } from "../../../../../core/hooks/utils/useValueMethods";
import { TUtils } from "../../../../../types/utils";
import TariffsFormSkeleton from "./tariffsSkeleton";

const schema = z.object({
  contractId: z
    .number({
      required_error: "Contrato es obligatorio",
      invalid_type_error: "Contrato es obligatorio",
    })
    .positive("Contrato es obligatorio"),
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
  const { data: contracts = [], isLoading: loadingContracts } = useContracts();
  const { data: valueMethods = [], isLoading: loadingValueMethods } =
    useValueMethods();

  const statusOptions = [
    { value: 1, label: "Activo" },
    { value: 2, label: "Inactivo" },
  ];

  const contractOptions = useMemo(
    () =>
      (contracts ?? [])
        .filter((contract) => {
          const status =
            contract.contractStatusDescription ?? contract.status ?? "";
          return !status || status.toLowerCase() === "activo";
        })
        .map((contract) => ({
          value: contract.id,
          label: contract.contractName
            ? `${contract.contractName} (${contract.contractNumber})`
            : contract.contractNumber,
        })),
    [contracts],
  );

  const valueMethodsOptions = useMemo(
    () =>
      (valueMethods ?? []).map((valueMethod) => ({
        value: valueMethod.id,
        label: valueMethod.description,
      })),
    [valueMethods],
  );

  const { control, handleSubmit, reset } = useForm<TTariffsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractId: undefined,
      name: "",
      valueMethodId: undefined,
      isActive: 1,
    },
  });

  const onSubmit = (data: TTariffsForm) => {
    if (editUserId) {
      const payload = {
        contractId: data.contractId,
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
      contractId: data.contractId,
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
        contractId: getTariff.contractId,
        name: getTariff.name,
        valueMethodId: getTariff.valueMethodId,
        isActive: getTariff.isActive ? 1 : 2,
      });
    }
  }, [editUserId, getTariff, reset]);

  if (loadingTariff && editUserId) {
    return <TariffsFormSkeleton />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer columns="col-4" gap="g-3" container>
          <Select
            name="contractId"
            label="Contrato"
            placeholder="Seleccione un contrato"
            control={control}
            options={contractOptions}
            disabled={loadingContracts}
            getPopupContainer={() => document.body}
          />
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
            disabled={loadingValueMethods}
            getPopupContainer={() => document.body}
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
            disabled={createTariffs.isPending || updateTariffs.isPending}
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
