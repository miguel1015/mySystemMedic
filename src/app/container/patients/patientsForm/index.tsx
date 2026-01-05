"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { Button } from "antd";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { TUtils } from "../../../../types/utils";

const PatientsForm: React.FC<TUtils> = ({ setOpen }) => {
  const { control, handleSubmit } = useForm({
    /*     resolver: zodResolver(insuranceCompaniesSchema),
    defaultValues: TDefaultValues, */
  });

  const onSubmit = () => {
    toast.success("Formulario solo visual");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* EPS / CONVENIO */}
      <GridContainer gap="g-3">
        <SelectAutocomplete
          name="epsId"
          label="EPS"
          placeholder="Adres sistema de seguridad social en salud"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="agreementId"
          label="Convenio"
          placeholder="Seleccione el convenio"
          control={control}
          options={[]}
        />
      </GridContainer>

      {/* DOCUMENTO */}
      <GridContainer gap="g-3">
        <SelectAutocomplete
          name="documentType"
          label="Tipo documento"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />

        <Input
          name="documentNumber"
          label="Documento"
          placeholder="Número de documento"
          control={control}
        />
      </GridContainer>

      {/* NOMBRES */}
      <GridContainer columns="col-4" gap="g-3">
        <Input name="firstName" label="Primer Nombre" control={control} />
        <Input name="secondName" label="Segundo Nombre" control={control} />
        <Input name="firstLastName" label="Primer Apellido" control={control} />
        <Input
          name="secondLastName"
          label="Segundo Apellido"
          control={control}
        />

        <Input
          type="date"
          name="birthDate"
          label="Fecha nacimiento"
          control={control}
        />

        <SelectAutocomplete
          name="gender"
          label="Sexo"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />

        {/* PAÍSES */}
        <SelectAutocomplete
          name="residenceCountry"
          label="País residencia"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="originCountry"
          label="País origen"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="department"
          label="Departamento"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="city"
          label="Ciudad"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="zone"
          label="Zona"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />

        <Input name="address" label="Dirección" control={control} />
        <Input name="phone1" label="Teléfono 1" control={control} />
        <Input name="phone2" label="Teléfono 2" control={control} />
        <Input name="phone3" label="Teléfono 3" control={control} />

        <Input
          type="email"
          name="email"
          label="Correo electrónico"
          control={control}
        />

        <SelectAutocomplete
          name="maritalStatus"
          label="Estado civil"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="disability"
          label="Discapacidad"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="bloodGroup"
          label="Grupo sanguíneo"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="rh"
          label="RH"
          control={control}
          options={[]}
        />

        <SelectAutocomplete
          name="religion"
          label="Religión"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="occupation"
          label="Ocupación"
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

export default PatientsForm;
