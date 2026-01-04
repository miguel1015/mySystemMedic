"use client";

import GridContainer from "@/components/componentLayout";
import SelectAutocomplete from "@/components/select";
import { Button } from "antd";
import Input from "@/components/input";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const PatientsForm: React.FC = () => {
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
      <GridContainer columns="col-2" gap="g-3">
        <SelectAutocomplete
          name="epsId"
          label="EPS"
          placeholder="Seleccione EPS"
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
      <GridContainer columns="col-2" gap="g-3">
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
        <Input name="firstName" label="1 Nombre" control={control} />
        <Input name="secondName" label="2 Nombre" control={control} />
        <Input name="firstLastName" label="1 Apellido" control={control} />
        <Input name="secondLastName" label="2 Apellido" control={control} />
      </GridContainer>

      {/* NACIMIENTO / SEXO */}
      <GridContainer columns="col-2" gap="g-3">
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
      </GridContainer>

      {/* PAÍSES */}
      <GridContainer columns="col-2" gap="g-3">
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
      </GridContainer>

      {/* UBICACIÓN */}
      <GridContainer columns="col-3" gap="g-3">
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
      </GridContainer>

      {/* DIRECCIÓN / TELÉFONOS */}
      <GridContainer columns="col-4" gap="g-3">
        <Input name="address" label="Dirección" control={control} />
        <Input name="phone1" label="Teléfono 1" control={control} />
        <Input name="phone2" label="Teléfono 2" control={control} />
        <Input name="phone3" label="Teléfono 3" control={control} />
      </GridContainer>

      {/* EMAIL */}
      <GridContainer columns="col-1" gap="g-3">
        <Input
          type="email"
          name="email"
          label="Correo electrónico"
          control={control}
        />
      </GridContainer>

      {/* ESTADO CIVIL */}
      <GridContainer columns="col-4" gap="g-3">
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
      </GridContainer>

      {/* RELIGIÓN / OCUPACIÓN */}
      <GridContainer columns="col-2" gap="g-3">
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
        <Button>Cancelar</Button>
        <Button type="primary" htmlType="submit">
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default PatientsForm;
