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

const ContractForm: React.FC = () => {
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
            label="¿Este contrato constituido legalmente por las partes?"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="valueMethod"
            label="Método de valores"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />
        </GridContainer>
        <GridContainer columns="col-4" gap="g-3">
          <SelectAutocomplete
            name="epsId"
            label="EPS"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <Input
            name="contractNumber"
            label="Número del contrato"
            placeholder="Número del contrato"
            control={control}
          />

          <Input
            name="contractName"
            label="Nombre del contrato"
            placeholder="Nombre del contrato"
            control={control}
          />
        </GridContainer>

        {/* ======================
            PORTAFOLIOS / CÓDIGOS
        ======================= */}
        <GridContainer columns="col-4" gap="g-3" container>
          <SelectAutocomplete
            name="portfolioGeneralId"
            label="Portafolio General"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="portfolioMedicationId"
            label="Portafolio Medicamento"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="portfolioSuppliesId"
            label="Portafolio Insumos"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="contractTypeId"
            label="Tipo de contrato"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="epsRegimeId"
            label="Régimen EPS"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />
          <Input
            name="epsCode"
            label="Código EPS"
            placeholder="Código EPS"
            control={control}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3" container>
          <SelectAutocomplete
            name="coverageId"
            label="Cobertura"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="userTypeId"
            label="Tipo de usuario"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="paymentMethodId"
            label="Modalidad de pago"
            placeholder="Seleccione"
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
            label="Objeto del contrato"
            placeholder="Describa el objeto del contrato"
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
            label="Fecha inicio del convenio"
            placeholder="dd/mm/aaaa"
            control={control}
          />

          <Input
            type="date"
            name="endDate"
            label="Fecha final del convenio"
            placeholder="dd/mm/aaaa"
            control={control}
          />

          <Input
            type="number"
            name="contractAmount"
            label="Monto del contrato"
            placeholder="$"
            control={control}
          />

          <Input
            type="number"
            name="individualAmount"
            label="Monto individual del contrato"
            placeholder="$"
            control={control}
          />

          {/* ======================
            ESTADO Y SERVICIOS
        ======================= */}
          <SelectAutocomplete
            name="contractStatusId"
            label="Estado del contrato"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="ripsServiceCode"
            label="Código de servicios para RIPS"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="surgicalServiceCode"
            label="Código de servicios quirúrgicos"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="capitationIndicatorId"
            label="Indicador de capitación"
            placeholder="Seleccione"
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
            label="Autorización código"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />

          <SelectAutocomplete
            name="authorizationSupport"
            label="Autorización soporte"
            placeholder="Seleccione"
            control={control}
            options={[]}
          />
        </GridContainer>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <CustomButton variant="secondary">Cancelar</CustomButton>
          <CustomButton
            variant="primary"
            // loading={createUser.isPending || updateUser.isPending}
          >
            Guardar
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
