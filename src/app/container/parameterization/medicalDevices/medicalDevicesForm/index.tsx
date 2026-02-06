"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { Button } from "antd";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { TUtils } from "../../../../../types/utils";

const MedicalDevicesForm: React.FC<TUtils> = ({ setOpen }) => {
  const { control, handleSubmit } = useForm({
    /*     resolver: zodResolver(insuranceCompaniesSchema),
    defaultValues: TDefaultValues, */
  });

  const onSubmit = () => {
    toast.success("Formulario solo visual");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* NOMBRES */}
      <GridContainer columns="col-4" gap="g-3">
        <Input
          name="medicineName"
          label="Nombre elemento"
          placeholder="Nombre elemento"
          control={control}
        />

        <SelectAutocomplete
          name="gender"
          label="Tipo de elemento"
          placeholder="Tipo de elemento"
          control={control}
          options={[]}
        />

        {/* PAÍSES */}
        <SelectAutocomplete
          name="residenceCountry"
          label="Uso del elemento"
          placeholder="Uso del elemento"
          control={control}
          options={[]}
        />

        <Input
          name="Concentración"
          label="Concentración"
          placeholder="Concentración"
          control={control}
        />
        <SelectAutocomplete
          name="originCountry"
          label="Reintegrable"
          placeholder="Reintegrable"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="department"
          label="Invasivo "
          placeholder="Invasivo "
          control={control}
          options={[]}
        />
      </GridContainer>

      {/* BOTONES */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="primary" htmlType="submit">
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default MedicalDevicesForm;
