"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { Button, Divider, Spin } from "antd";
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
    loadingPatient,
    isSubmitting,
    hasCountry,
    hasState,
    documentTypesOptions,
    countriesOptions,
    statesOptions,
    citiesOptions,
    insurersOptions,
    contractsOptions,
    sexesOptions,
    disabilitiesOptions,
    zonesOptions,
    bloodGroupsOptions,
    rhFactorsOptions,
    maritalStatusesOptions,
  } = usePatientForm({ setOpen, editPatientId, setEditPatientId });

  if (isEditing && loadingPatient) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ── DATOS GENERALES ── */}
      <p style={sectionTitleStyle}>Datos Generales</p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <GridContainer columns="col-4" gap="g-3">
        <SelectAutocomplete
          name="insurerId"
          label="EPS"
          placeholder="Seleccione la EPS"
          control={control}
          options={insurersOptions}
        />
        <SelectAutocomplete
          name="contractId"
          label="Contrato"
          placeholder="Seleccione el contrato"
          control={control}
          options={contractsOptions}
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
          name="middleName"
          label="Segundo Nombre"
          placeholder="Segundo Nombre"
          control={control}
        />
        <Input
          name="lastName"
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
          name="sexId"
          label="Sexo"
          placeholder="Seleccione"
          control={control}
          options={sexesOptions}
        />
        <SelectAutocomplete
          name="maritalStatusId"
          label="Estado civil"
          placeholder="Seleccione"
          control={control}
          options={maritalStatusesOptions}
        />
        <SelectAutocomplete
          name="disabilityId"
          label="Discapacidad"
          placeholder="Seleccione"
          control={control}
          options={disabilitiesOptions}
        />
      </GridContainer>

      {/* ── UBICACIÓN ── */}
      <p style={sectionTitleStyle}>Ubicación</p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <GridContainer columns="col-4" gap="g-3">
        <SelectAutocomplete
          name="birthCountryId"
          label="País de nacimiento"
          placeholder="Seleccione"
          control={control}
          options={countriesOptions}
        />
        <SelectAutocomplete
          name="residenceCountryId"
          label="País de residencia"
          placeholder="Seleccione"
          control={control}
          options={countriesOptions}
        />
        <SelectAutocomplete
          name="stateId"
          label="Departamento"
          placeholder={hasCountry ? "Seleccione" : "Seleccione un país primero"}
          control={control}
          options={statesOptions}
          disabled={!hasCountry}
        />
        <SelectAutocomplete
          name="cityId"
          label="Ciudad"
          placeholder={hasState ? "Seleccione" : "Seleccione un departamento primero"}
          control={control}
          options={citiesOptions}
          disabled={!hasState}
        />

        <SelectAutocomplete
          name="zoneId"
          label="Zona"
          placeholder="Seleccione"
          control={control}
          options={zonesOptions}
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
          name="bloodGroupId"
          label="Grupo sanguíneo"
          placeholder="Seleccione"
          control={control}
          options={bloodGroupsOptions}
        />
        <SelectAutocomplete
          name="rhFactorId"
          label="RH"
          placeholder="Seleccione"
          control={control}
          options={rhFactorsOptions}
        />
      </GridContainer>

      {/* ── BOTONES ── */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button onClick={handleCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
};

export default PatientsForm;
