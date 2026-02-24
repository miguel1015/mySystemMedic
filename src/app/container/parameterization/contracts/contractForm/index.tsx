import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import Title from "@/components/title";
import Select from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider } from "antd";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateContract } from "../../../../../core/hooks/parameterization/contracts/useCreateContract";
import { useGetContractById } from "../../../../../core/hooks/parameterization/contracts/useGetByIdContract";
import { useUpdateContract } from "../../../../../core/hooks/parameterization/contracts/useUpdateContract";
import { useCreateContractDetail } from "../../../../../core/hooks/parameterization/contractDetails/useCreateContractDetail";
import { useUpdateContractDetail } from "../../../../../core/hooks/parameterization/contractDetails/useUpdateContractDetail";
import { useContractDetails } from "../../../../../core/hooks/parameterization/contractDetails/useGetAllContractDetails";
import { Contract } from "../../../../../core/interfaces/parameterization/types";
import { TUtils } from "../../../../../types/utils";
import useDictionary from "../../../../../locales/dictionary-hook";
import {
  ContractSchema,
  TContractSchema,
  TDefaultValues,
  ContractDetailSchema,
  TContractDetailSchema,
  TDetailDefaultValues,
} from "./contractSchema";
import { useContractOptions } from "./hooks";

const ContractForm: React.FC<TUtils> = ({
  setOpen,
  setEditUserId,
  editUserId,
}) => {
  const dict = useDictionary();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const createContractDetail = useCreateContractDetail();
  const updateContractDetail = useUpdateContractDetail();
  const { data: getContract, isLoading: loadingContract } = useGetContractById(
    Number(editUserId),
  );
  const { data: allContractDetails } = useContractDetails();

  const {
    insurersOptions,
    citiesOptions,
    benefitPlansOptions,
    tariffsOptions,
  } = useContractOptions();

  const { control, handleSubmit, reset } = useForm<TContractSchema>({
    resolver: zodResolver(ContractSchema),
    defaultValues: TDefaultValues,
  });

  const {
    control: detailControl,
    handleSubmit: handleDetailSubmit,
    reset: resetDetail,
  } = useForm<TContractDetailSchema>({
    resolver: zodResolver(ContractDetailSchema),
    defaultValues: TDetailDefaultValues,
  });

  const booleanOptions = [
    { value: 1, label: "Sí" },
    { value: 2, label: "No" },
  ];

  const contractTypeOptions = [
    { value: 1, label: "Capitado" },
    { value: 2, label: "Evento" },
  ];

  const existingDetail = useMemo(() => {
    if (!editUserId || !allContractDetails) return null;
    return (
      allContractDetails.find((d) => d.contractId === Number(editUserId)) ??
      null
    );
  }, [editUserId, allContractDetails]);

  const onSubmit = () => {
    handleSubmit((contractData) => {
      handleDetailSubmit((detailData: TContractDetailSchema) => {
        if (editUserId) {
          updateContract.mutate(
            {
              id: editUserId,
              data: {
                ...contractData,
                isActive: contractData.isActive === 1,
                chargeCopay: contractData.chargeCopay === 1,
                chargeModeratingFee: contractData.chargeModeratingFee === 1,
              },
            },
            {
              onSuccess: () => {
                if (existingDetail) {
                  updateContractDetail.mutate(
                    {
                      id: existingDetail.id,
                      data: { ...detailData, contractId: Number(editUserId) },
                    },
                    {
                      onSuccess: () => {
                        setOpen(false);
                        setEditUserId(null);
                        toast.success(
                          "Contrato y detalle actualizados correctamente",
                        );
                      },
                      onError: (err: Error) => toast.error(err.message),
                    },
                  );
                } else {
                  createContractDetail.mutate(
                    { ...detailData, contractId: Number(editUserId) },
                    {
                      onSuccess: () => {
                        setOpen(false);
                        setEditUserId(null);
                        toast.success(
                          "Contrato actualizado y detalle creado correctamente",
                        );
                      },
                      onError: (err: Error) => toast.error(err.message),
                    },
                  );
                }
              },
              onError: (err: Error) => toast.error(err.message),
            },
          );
          return;
        }

        createContract.mutate(
          {
            ...contractData,
            isActive: contractData.isActive === 1,
            chargeCopay: contractData.chargeCopay === 1,
            chargeModeratingFee: contractData.chargeModeratingFee === 1,
          },
          {
            onSuccess: (newContract) => {
              const contractId = (newContract as { id: number }).id;
              createContractDetail.mutate(
                { ...detailData, contractId },
                {
                  onSuccess: () => {
                    reset();
                    resetDetail();
                    setOpen(false);
                    toast.success("Contrato y detalle creados correctamente");
                  },
                  onError: (err: Error) => toast.error(err.message),
                },
              );
            },
            onError: (err: Error) => toast.error(err.message),
          },
        );
      })();
    })();
  };

  useEffect(() => {
    if (editUserId && getContract) {
      reset({
        contractNumber: getContract.contractNumber,
        insurerId: getContract.insurerId,
        contractType: getContract.contractType,
        populationNumber: getContract.populationNumber,
        cityId: getContract.cityId,
        startDate: getContract.startDate,
        endDate: getContract.endDate,
        isActive: getContract.isActive ? 1 : 2,
        tariffScheduleId: getContract.tariffScheduleId,
        medicineTariffScheduleId: getContract.medicineTariffScheduleId,
        factor: getContract.factor,
        providerId: getContract.providerId,
        policy: getContract.policy,
        chargeCopay: getContract.chargeCopay ? 1 : 2,
        chargeModeratingFee: getContract.chargeModeratingFee ? 1 : 2,
        billingDestinationId: getContract.billingDestinationId,
        benefitPlanId: getContract.benefitPlanId,
        referenceCode: getContract.referenceCode,
      });
    }
  }, [editUserId, getContract]);

  useEffect(() => {
    if (existingDetail) {
      resetDetail({
        startDate: existingDetail.startDate,
        endDate: existingDetail.endDate,
        serviceId: existingDetail.serviceId,
        externalTariffScheduleId: existingDetail.externalTariffScheduleId,
        factor: existingDetail.factor,
      });
    }
  }, [existingDetail]);

  if (loadingContract && editUserId) {
    return <p>Cargando contrato...</p>;
  }

  const isPending =
    createContract.isPending ||
    updateContract.isPending ||
    createContractDetail.isPending ||
    updateContractDetail.isPending;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <GridContainer columns="col-4" gap="g-3">
          <Input
            name="contractNumber"
            label={dict.contracts.contractNumber}
            placeholder={dict.contracts.contractNumber}
            control={control}
          />

          <SelectAutocomplete
            name="insurerId"
            label={dict.contracts.epsId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={insurersOptions}
          />

          <Input
            name="contractType"
            label="Tipo de Contrato"
            placeholder="Tipo de Contrato"
            control={control}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <Input
            type="number"
            name="populationNumber"
            label={dict.contracts.coverageId}
            placeholder="0"
            control={control}
          />

          <SelectAutocomplete
            name="cityId"
            label={dict.contracts.userTypeId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={citiesOptions}
          />

          <Input
            type="date"
            name="startDate"
            label={dict.contracts.startDate}
            placeholder={dict.contracts.placeholderDate}
            control={control}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <Input
            type="date"
            name="endDate"
            label={dict.contracts.endDate}
            placeholder={dict.contracts.placeholderDate}
            control={control}
          />

          <Select
            name="isActive"
            label="Activo"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={booleanOptions}
          />

          <SelectAutocomplete
            name="tariffScheduleId"
            label={dict.contracts.epsCode}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={tariffsOptions}
          />

          <Input
            type="number"
            name="factor"
            label={dict.contracts.individualAmount}
            placeholder="1.0"
            control={control}
          />

          <SelectAutocomplete
            name="medicineTariffScheduleId"
            label={dict.contracts.contractAmount}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={tariffsOptions}
          />

          <Input
            type="number"
            name="medicineAdjustmentFactor"
            label="Ajuste de medicamentos"
            placeholder="Seleccione un ajuste"
            control={control}
          />

          <Input
            type="number"
            name="providerId"
            label={dict.contracts.portfolioGeneralId}
            placeholder="ID"
            control={control}
          />

          <Input
            name="policy"
            label={dict.contracts.portfolioMedicationId}
            placeholder="POL-001"
            control={control}
          />

          <Select
            name="chargeCopay"
            label="Cobracopago"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={booleanOptions}
          />

          <Select
            name="chargeModeratingFee"
            label="Cuota moderadora"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={booleanOptions}
          />

          <Input
            type="number"
            name="billingDestinationId"
            label="Destino de facturación"
            placeholder="ID"
            control={control}
          />

          <SelectAutocomplete
            name="benefitPlanId"
            label="Plan de beneficios"
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={benefitPlansOptions}
          />

          <Input
            name="referenceCode"
            label="Código de referencia"
            placeholder="CODREF-001"
            control={control}
          />
        </GridContainer>

        <Divider />

        <Title level={3}>Detalle del Contrato</Title>

        <GridContainer columns="col-4" gap="g-3">
          <Input
            type="date"
            name="startDate"
            label="Fecha de inicio (detalle)"
            placeholder="YYYY-MM-DD"
            control={detailControl}
          />

          <Input
            type="date"
            name="endDate"
            label="Fecha de fin (detalle)"
            placeholder="YYYY-MM-DD"
            control={detailControl}
          />

          <SelectAutocomplete
            name="serviceId"
            label="Servicio"
            placeholder="Seleccione un servicio"
            control={detailControl}
            options={booleanOptions}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <SelectAutocomplete
            name="externalTariffScheduleId"
            label="Tarifario externo"
            placeholder="Seleccione un tarifario"
            control={detailControl}
            options={tariffsOptions}
          />

          <Input
            type="number"
            name="factor"
            label="Factor (detalle)"
            placeholder="1.0"
            control={detailControl}
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
          <Button type="primary" htmlType="submit" loading={isPending}>
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
