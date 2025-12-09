import GridContainer from "@/components/componentLayout";
import SelectAutocomplete from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ContractSchema,
  TContractSchema,
  TDefaultValues,
} from "./contractSchema";
import Input from "@/components/input";
import CustomButton from "@/components/button";
import TextArea from "../../../../components/textArea";
import toast from "react-hot-toast";
import useDictionary from "../../../../locales/dictionary-hook";
import { contractHook } from "./hooks";

const ContractForm: React.FC = () => {
  const dict = useDictionary();

  const { control, handleSubmit } = useForm<TContractSchema>({
    resolver: zodResolver(ContractSchema),
    defaultValues: TDefaultValues,
  });

  const onSubmit = () => {
    toast.success("Formulario solo visual");
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ======================
            BLOQUE SUPERIOR
        ======================= */}
        <GridContainer columns="col-4" gap="g-3">
          <SelectAutocomplete
            name="isLegal"
            label={dict.contracts.isLegal}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="valueMethod"
            label={dict.contracts.valueMethod}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <SelectAutocomplete
            name="epsId"
            label={dict.contracts.epsId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <Input
            name="contractNumber"
            label={dict.contracts.contractNumber}
            placeholder={dict.contracts.contractNumber}
            control={control}
          />

          <Input
            name="contractName"
            label={dict.contracts.contractName}
            placeholder={dict.contracts.contractName}
            control={control}
          />
        </GridContainer>

        {/* ======================
            PORTAFOLIOS / CÓDIGOS
        ======================= */}
        <GridContainer columns="col-4" gap="g-3" container>
          <SelectAutocomplete
            name="portfolioGeneralId"
            label={dict.contracts.portfolioGeneralId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="portfolioMedicationId"
            label={dict.contracts.portfolioMedicationId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="portfolioSuppliesId"
            label={dict.contracts.portfolioSuppliesId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="contractTypeId"
            label={dict.contracts.contractTypeId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="epsRegimeId"
            label={dict.contracts.epsRegimeId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <Input
            name="epsCode"
            label={dict.contracts.epsCode}
            placeholder={dict.contracts.epsCode}
            control={control}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3" container>
          <SelectAutocomplete
            name="coverageId"
            label={dict.contracts.coverageId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="userTypeId"
            label={dict.contracts.userTypeId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="paymentMethodId"
            label={dict.contracts.paymentMethodId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />
        </GridContainer>

        {/* ======================
            OBJETO DEL CONTRATO
        ======================= */}
        <GridContainer columns="col-12" container gap="g-3">
          <TextArea
            name="contractObject"
            label={dict.contracts.contractObject}
            placeholder={dict.contracts.placeholderContractObject}
            control={control}
          />
        </GridContainer>

        {/* ======================
            FECHAS Y VALORES
        ======================= */}
        <GridContainer columns="col-4" gap="g-3">
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

          <Input
            type="number"
            name="contractAmount"
            label={dict.contracts.contractAmount}
            placeholder={dict.contracts.placeholderMoney}
            control={control}
          />

          <Input
            type="number"
            name="individualAmount"
            label={dict.contracts.individualAmount}
            placeholder={dict.contracts.placeholderMoney}
            control={control}
          />

          {/* ======================
            ESTADO Y SERVICIOS
        ======================= */}
          <SelectAutocomplete
            name="contractStatusId"
            label={dict.contracts.contractStatusId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="ripsServiceCode"
            label={dict.contracts.ripsServiceCode}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="surgicalServiceCode"
            label={dict.contracts.surgicalServiceCode}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="capitationIndicatorId"
            label={dict.contracts.capitationIndicatorId}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />
        </GridContainer>

        {/* ======================
            AUTORIZACIONES
        ======================= */}
        <GridContainer columns="col-4" gap="g-3">
          <SelectAutocomplete
            name="authorizationCode"
            label={dict.contracts.authorizationCode}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="authorizationSupport"
            label={dict.contracts.authorizationSupport}
            placeholder={dict.contracts.placeholderSelect}
            control={control}
            options={[]}
          />
        </GridContainer>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <CustomButton variant="secondary">Cancelar</CustomButton>
          <CustomButton variant="primary">Guardar</CustomButton>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
