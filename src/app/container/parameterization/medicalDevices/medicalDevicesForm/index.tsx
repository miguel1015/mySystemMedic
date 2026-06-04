"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { Button, Spin } from "antd";
import { TUtils } from "../../../../../types/utils";
import { useMedicalDeviceForm } from "./useMedicalDeviceForm";
import { useSelectOptions } from "./useSelectOptions";

const yesNoOptions = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

const MedicalDevicesForm: React.FC<TUtils> = ({
  setOpen,
  editUserId,
  setEditUserId,
}) => {
  const {
    control,
    handleSubmit,
    onSubmit,
    loadingMedicalDevice,
    isSubmitting,
  } = useMedicalDeviceForm({ setOpen, editUserId, setEditUserId });

  const {
    elementTypeOptions,
    elementUsageOptions,
    isLoading: loadingOptions,
  } = useSelectOptions();

  if (loadingOptions || (editUserId && loadingMedicalDevice)) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GridContainer columns="col-4" gap="g-3">
        <Input
          name="elementName"
          label="Nombre de elemento"
          placeholder="Nombre de elemento"
          control={control}
        />

        <SelectAutocomplete
          name="elementTypeId"
          label="Tipo de elemento"
          placeholder="Tipo de elemento"
          control={control}
          options={elementTypeOptions}
        />

        <SelectAutocomplete
          name="elementUsageId"
          label="Uso del elemento"
          placeholder="Uso del elemento"
          control={control}
          options={elementUsageOptions}
          getPopupContainer={() => document.body}
        />

        <Input
          name="ripsCode"
          label="Código RIPS"
          placeholder="Código RIPS"
          control={control}
        />

        <SelectAutocomplete
          name="isReusable"
          label="Reintegrable"
          placeholder="Reintegrable"
          control={control}
          options={yesNoOptions}
        />

        <SelectAutocomplete
          name="isInvasive"
          label="Invasivo"
          placeholder="Invasivo"
          control={control}
          options={yesNoOptions}
        />
      </GridContainer>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button onClick={() => setOpen(false)} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {editUserId ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
};

export default MedicalDevicesForm;
