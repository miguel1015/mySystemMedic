import CustomButton from "@/components/button";
import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { insuranceCompaniesSchema, TDefaultValues } from "./schema";

const InsuranceCompaniesForm: React.FC = () => {
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
            label="Nombre aseguradora"
            placeholder="Nombre aseguradora"
            control={control}
          />

          <Input
            type="number"
            name="nit"
            label="NIT / EPS"
            placeholder="NIT"
            control={control}
          />

          <Input
            name="insuranceCode"
            label="Código aseguradora"
            placeholder="Código"
            control={control}
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <Input
            type="number"
            name="verificationDigit"
            label="Dígito verificación"
            placeholder="0-9"
            control={control}
          />

          <Input
            name="address"
            label="Dirección"
            placeholder="Dirección"
            control={control}
          />

          <SelectAutocomplete
            name="cityId"
            label="Ciudad"
            placeholder="Seleccione ciudad"
            control={control}
            options={[]} // ← Aquí van tus ciudades
          />
        </GridContainer>

        <GridContainer columns="col-4" gap="g-3">
          <Input
            type="number"
            name="phone"
            label="Teléfono"
            placeholder="Teléfono"
            control={control}
          />

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="email@dominio.com"
            control={control}
          />

          <SelectAutocomplete
            name="adminTypeId"
            label="Tipo de administradora"
            placeholder="Seleccione tipo"
            control={control}
            options={[]} // ← Aquí van tus tipos de administradora
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

export default InsuranceCompaniesForm;
