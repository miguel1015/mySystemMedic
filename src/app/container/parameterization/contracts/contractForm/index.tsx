import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateContract } from "../../../../../core/hooks/parameterization/contracts/useCreateContract";
import { useGetContractById } from "../../../../../core/hooks/parameterization/contracts/useGetByIdContract";
import { useUpdateContract } from "../../../../../core/hooks/parameterization/contracts/useUpdateContract";
import { TUtils } from "../../../../../types/utils";
import useDictionary from "../../../../../locales/dictionary-hook";
import {
  ContractSchema,
  TContractSchema,
  TDefaultValues,
} from "./contractSchema";
import { useContractOptions } from "./hooks";

const statusOptions = [
  { value: 1, label: "Activo" },
  { value: 2, label: "Suspendido" },
  { value: 3, label: "Terminado" },
];

const ContractForm: React.FC<TUtils> = ({
  setOpen,
  setEditUserId,
  editUserId,
}) => {
  const dict = useDictionary();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const { data: getContract, isLoading: loadingContract } = useGetContractById(
    Number(editUserId),
  );

  const {
    insurersOptions,
    valueMethodsOptions,
    contractTypesOptions,
    epsRegimensOptions,
    userTypesOptions,
    paymentModalitiesOptions,
    coveragesOptions,
  } = useContractOptions();

  const { control, handleSubmit, reset } = useForm<TContractSchema>({
    resolver: zodResolver(ContractSchema),
    defaultValues: TDefaultValues,
  });

  const onSubmit = handleSubmit((data) => {
    if (editUserId) {
      updateContract.mutate(
        { id: editUserId, data },
        {
          onSuccess: () => {
            setOpen(false);
            setEditUserId(null);
            toast.success("Contrato actualizado correctamente");
          },
          onError: (err: Error) => toast.error(err.message),
        },
      );
      return;
    }

    createContract.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success("Contrato creado correctamente");
      },
      onError: (err: Error) => toast.error(err.message),
    });
  });

  useEffect(() => {
    if (editUserId && getContract) {
      reset({
        insurerId: getContract.insurerId,
        contractNumber: getContract.contractNumber,
        contractName: getContract.contractName,
        valueMethodId: getContract.valueMethodId,
        benefitPlanContractTypeId: getContract.benefitPlanContractTypeId,
        epsRegimeId: getContract.epsRegimeId,
        healthUserTypeId: getContract.healthUserTypeId,
        paymentModalityId: getContract.paymentModalityId,
        coverageId: getContract.coverageId,
        startDate: getContract.startDate,
        endDate: getContract.endDate,
        contractStatusId: getContract.contractStatusId,
      });
    }
  }, [editUserId, getContract]);

  if (loadingContract && editUserId) {
    return <p>Cargando contrato...</p>;
  }

  const isPending = createContract.isPending || updateContract.isPending;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <GridContainer columns="col-4" gap="g-3">
          <SelectAutocomplete
            name="insurerId"
            label={dict.contracts.epsId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={insurersOptions}
          />

          <Input
            name="contractNumber"
            label={dict.contracts.contractNumber}
            placeholder={dict.contracts.contractNumber}
            control={control}
          />

          <Input
            name="contractName"
            label="Nombre del contrato"
            placeholder="Nombre del contrato"
            control={control}
          />

          <SelectAutocomplete
            name="valueMethodId"
            label="Método de valores"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={valueMethodsOptions}
          />

          <SelectAutocomplete
            name="benefitPlanContractTypeId"
            label="Tipo de contrato"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={contractTypesOptions}
          />

          <SelectAutocomplete
            name="epsRegimeId"
            label="Régimen EPS"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={epsRegimensOptions}
          />

          <SelectAutocomplete
            name="healthUserTypeId"
            label="Tipo de usuario"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={userTypesOptions}
          />

          <SelectAutocomplete
            name="paymentModalityId"
            label="Modalidad de pago"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={paymentModalitiesOptions}
          />

          <SelectAutocomplete
            name="coverageId"
            label="Cobertura"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={coveragesOptions}
          />

          <Input
            type="date"
            name="startDate"
            label={dict.contracts.startDate}
            placeholder={dict.contracts.placeholderDate}
            control={control}
          />

          <Input
            type="date"
            name="endDate"
            label={dict.contracts.endDate}
            placeholder={dict.contracts.placeholderDate}
            control={control}
          />

          <SelectAutocomplete
            name="contractStatusId"
            label="Estado"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={statusOptions}
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
            loading={isPending}
            disabled={isPending}
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
