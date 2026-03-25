"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { Button, Divider } from "antd";
import { usePatientForm } from "./usePatientForm";

interface PatientsFormProps {
  setOpen: (open: boolean) => void;
  editPatientId: number | null;
  setEditPatientId: (id: number | null) => void;
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--theme-primary, #0F6F5C)",
  marginBottom: 4,
  marginTop: 8,
};

const PatientsForm: React.FC<PatientsFormProps> = ({
  setOpen,
  editPatientId,
  setEditPatientId,
}) => {
  const {
    control,
    handleSubmit,
    onSubmit,
    handleCancel,
    isEditing,
    documentTypesOptions,
    countriesOptions,
    statesOptions,
    citiesOptions,
  } = usePatientForm({ setOpen, editPatientId, setEditPatientId });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ── DATOS GENERALES ── */}
      <p style={sectionTitleStyle}>Datos Generales</p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <GridContainer gap="g-3">
        <SelectAutocomplete
          name="epsId"
          label="EPS"
          placeholder="Seleccione la EPS"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="documentTypeId"
          label="Tipo de documento"
          placeholder="Seleccione"
          control={control}
          options={documentTypesOptions}
        />
        <Input
          name="documentNumber"
          label="Documento"
          placeholder="Número de documento"
          control={control}
        />
      </GridContainer>

      {/* ── DATOS PERSONALES ── */}
      <p style={sectionTitleStyle}>Datos Personales</p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <GridContainer columns="col-4" gap="g-3">
        <Input
          name="firstName"
          label="Primer Nombre"
          placeholder="Primer Nombre"
          control={control}
        />
        <Input
          name="secondName"
          label="Segundo Nombre"
          placeholder="Segundo Nombre"
          control={control}
        />
        <Input
          name="firstLastName"
          label="Primer Apellido"
          placeholder="Primer Apellido"
          control={control}
        />
        <Input
          name="secondLastName"
          label="Segundo Apellido"
          placeholder="Segundo Apellido"
          control={control}
        />

        <Input
          type="date"
          name="birthDate"
          label="Fecha de nacimiento"
          placeholder="Fecha de nacimiento"
          control={control}
        />
        <SelectAutocomplete
          name="gender"
          label="Sexo"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="maritalStatus"
          label="Estado civil"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="disability"
          label="Discapacidad"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />
      </GridContainer>

      {/* ── UBICACIÓN ── */}
      <p style={sectionTitleStyle}>Ubicación</p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <GridContainer columns="col-4" gap="g-3">
        <SelectAutocomplete
          name="originCountry"
          label="País de origen"
          placeholder="Seleccione"
          control={control}
          options={countriesOptions}
        />
        <SelectAutocomplete
          name="residenceCountry"
          label="País de residencia"
          placeholder="Seleccione"
          control={control}
          options={countriesOptions}
        />
        <SelectAutocomplete
          name="department"
          label="Departamento"
          placeholder="Seleccione"
          control={control}
          options={statesOptions}
        />
        <SelectAutocomplete
          name="city"
          label="Ciudad"
          placeholder="Seleccione"
          control={control}
          options={citiesOptions}
        />

        <SelectAutocomplete
          name="zone"
          label="Zona"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />
        <Input
          name="address"
          label="Dirección"
          placeholder="Dirección"
          control={control}
        />
      </GridContainer>

      {/* ── CONTACTO ── */}
      <p style={sectionTitleStyle}>Contacto</p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <GridContainer gap="g-3">
        <Input
          name="phone"
          label="Teléfono"
          placeholder="Teléfono"
          control={control}
        />
        <Input
          type="email"
          name="email"
          label="Correo electrónico"
          placeholder="ejemplo@correo.com"
          control={control}
        />
      </GridContainer>

      {/* ── INFORMACIÓN MÉDICA ── */}
      <p style={sectionTitleStyle}>Información Médica</p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <GridContainer gap="g-3">
        <SelectAutocomplete
          name="bloodGroup"
          label="Grupo sanguíneo"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />
        <SelectAutocomplete
          name="rh"
          label="RH"
          placeholder="Seleccione"
          control={control}
          options={[]}
        />
      </GridContainer>

      {/* ── BOTONES ── */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button onClick={handleCancel}>Cancelar</Button>
        <Button type="primary" htmlType="submit">
          {isEditing ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
};

export default PatientsForm;
