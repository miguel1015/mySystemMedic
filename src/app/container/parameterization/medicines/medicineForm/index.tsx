"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { Button } from "antd";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { TUtils } from "../../../../../types/utils";

const MedicinesForm: React.FC<TUtils> = ({ setOpen }) => {
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
          label="Nombre medicamento"
          placeholder="Nombre medicamento"
          control={control}
        />
        <Input name="CUM" label="CUM" placeholder="CUM" control={control} />
        <Input
          name="Concentración"
          label="Concentración"
          placeholder="Concentración"
          control={control}
        />

        <SelectAutocomplete
          name="gender"
          label="Unidad de medida"
          placeholder="Unidad de medida"
          control={control}
          options={[]}
        />

        {/* PAÍSES */}
        <SelectAutocomplete
          name="residenceCountry"
          label="Vía administración"
          placeholder="Vía administración"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="originCountry"
          label="Forma farmacéutica"
          placeholder="Forma farmacéutica"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="department"
          label="Grupo medicamento"
          placeholder="Grupo medicamento"
          control={control}
          options={[]}
        />

        <Input name="zone" label="ATC" placeholder="ATC" control={control} />
        <Input
          name="zone"
          label="Invima"
          placeholder="Invima"
          control={control}
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

export default MedicinesForm;
