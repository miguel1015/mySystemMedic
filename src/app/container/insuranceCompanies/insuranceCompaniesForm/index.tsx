import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateInsuranceCompany } from "../../../../core/hooks/parameterization/insuranceCompany/useCreateInsuranceCompany";
import { useGetInsuranceCompanyById } from "../../../../core/hooks/parameterization/insuranceCompany/useGetByIdInsuranceCompany";
import { useUpdateInsuranceCompany } from "../../../../core/hooks/parameterization/insuranceCompany/useUpdateInsuranceCompany";
import { useAdministradorTypes } from "../../../../core/hooks/utils/useAdministradorTypes";
import { useCities } from "../../../../core/hooks/utils/useCities";
import { Insurance } from "../../../../core/interfaces/parameterization/types";
import useDictionary from "../../../../locales/dictionary-hook";
import { TUtils } from "../../../../types/utils";
import { insuranceCompaniesSchema, TDefaultValues } from "./schema";

const InsuranceCompaniesForm: React.FC<TUtils> = ({ setOpen, editUserId }) => {
  const dict = useDictionary();
  const { data: dataCities } = useCities();
  const { data: dataAdministradorTypes } = useAdministradorTypes();
  const createInsuranceCompany = useCreateInsuranceCompany();
  const updateInsuranceCompany = useUpdateInsuranceCompany();
  const { data: getInsuranceCompany, isLoading: loadingUser } =
    useGetInsuranceCompanyById(Number(editUserId));

  const citiesOptions = (dataCities ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));

  const administradorTypesOptions = (dataAdministradorTypes ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(insuranceCompaniesSchema),
    defaultValues: TDefaultValues,
  });

  const onSubmit = (data: Insurance) => {
    if (editUserId) {
      const payload = { ...data, isActive: true };
      updateInsuranceCompany.mutate(
        { id: editUserId, data: payload },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Aseguradora actualizada correctamente");
          },
          onError: (err: Error) => {
            toast.error(err.message);
          },
        }
      );
      return;
    }
    createInsuranceCompany.mutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success("Aseguradora creada correctamente");
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    });
  };

  useEffect(() => {
    if (editUserId && getInsuranceCompany) {
      reset({
        name: getInsuranceCompany.name ?? "",
        nit: getInsuranceCompany.nit ?? "",
        address: getInsuranceCompany.address ?? 0,
        administratorTypeId: getInsuranceCompany.administratorTypeId ?? 0,
        phone1: getInsuranceCompany.phone1 ?? "",
        code: getInsuranceCompany.code ?? 0,
        verificationDigit: getInsuranceCompany.verificationDigit ?? 0,
        cityId: getInsuranceCompany.cityId ?? 0,
        email: getInsuranceCompany.email ?? "",
      });
    }
  }, [editUserId, getInsuranceCompany, reset]);
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer columns="col-4" gap="g-3">
          <Input
            name="name"
            label={dict.insuranceCompanies.insuranceName}
            placeholder={dict.insuranceCompanies.placeholderInsuranceName}
            control={control}
          />

          <Input
            name="nit"
            label={dict.insuranceCompanies.nit}
            placeholder={dict.insuranceCompanies.placeholderNit}
            control={control}
          />

          <Input
            name="code"
            label={dict.insuranceCompanies.insuranceCode}
            placeholder={dict.insuranceCompanies.placeholderInsuranceCode}
            control={control}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <Input
            type="number"
            name="verificationDigit"
            label={dict.insuranceCompanies.verificationDigit}
            placeholder={dict.insuranceCompanies.placeholderVerificationDigit}
            control={control}
          />

          <Input
            name="address"
            label={dict.insuranceCompanies.address}
            placeholder={dict.insuranceCompanies.placeholderAddress}
            control={control}
          />

          <SelectAutocomplete
            name="cityId"
            label={dict.insuranceCompanies.cityId}
            placeholder={dict.insuranceCompanies.placeholderCityId}
            control={control}
            options={citiesOptions}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <Input
            name="phone1"
            label={dict.insuranceCompanies.phone}
            placeholder={dict.insuranceCompanies.placeholderPhone}
            control={control}
          />

          <Input
            type="email"
            name="email"
            label={dict.insuranceCompanies.email}
            placeholder={dict.insuranceCompanies.placeholderEmail}
            control={control}
          />

          <SelectAutocomplete
            name="administratorTypeId"
            label={dict.insuranceCompanies.adminTypeId}
            placeholder={dict.insuranceCompanies.placeholderAdminTypeId}
            control={control}
            options={administradorTypesOptions}
          />
        </GridContainer>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button
            type="default"
            htmlType="button"
            onClick={() => setOpen(false)}
          >
            {dict.insuranceCompanies.cancel}
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={
              createInsuranceCompany.isPending ||
              updateInsuranceCompany.isPending
            }
          >
            {dict.insuranceCompanies.save}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InsuranceCompaniesForm;
