import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCities } from "../../../../core/hooks/utils/useCities";
import useDictionary from "../../../../locales/dictionary-hook";
import { insuranceCompaniesSchema, TDefaultValues } from "./schema";

const InsuranceCompaniesForm: React.FC = () => {
  const dict = useDictionary();
  const { data: dataCities } = useCities();

  const citiesOptions = (dataCities ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(insuranceCompaniesSchema),
    defaultValues: TDefaultValues,
  });

  const onSubmit = () => {
    toast.success("Formulario solo visual");
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer columns="col-4" gap="g-3">
          <Input
            name="insuranceName"
            label={dict.insuranceCompanies.insuranceName}
            placeholder={dict.insuranceCompanies.placeholderInsuranceName}
            control={control}
          />

          <Input
            type="number"
            name="nit"
            label={dict.insuranceCompanies.nit}
            placeholder={dict.insuranceCompanies.placeholderNit}
            control={control}
          />

          <Input
            name="insuranceCode"
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
            type="number"
            name="phone"
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
            name="adminTypeId"
            label={dict.insuranceCompanies.adminTypeId}
            placeholder={dict.insuranceCompanies.placeholderAdminTypeId}
            control={control}
            options={[]}
          />
        </GridContainer>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button>{dict.insuranceCompanies.cancel}</Button>

          <Button type="primary" htmlType="submit">
            {dict.insuranceCompanies.save}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InsuranceCompaniesForm;
