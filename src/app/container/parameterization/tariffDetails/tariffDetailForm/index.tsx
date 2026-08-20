"use client";

import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import SelectAutocomplete from "@/components/select";
import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs";
import { useSurgicalGroups } from "@/core/hooks/parameterization/surgicalGroups/useGetAllSurgicalGroups";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";
import { Button, Spin } from "antd";
import { useTariffDetailForm } from "./useTariffDetailForm";

const yesNoOptions = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

interface TariffDetailFormProps {
  record: TTariffDetail | null;
  onClose: () => void;
}

const TariffDetailForm: React.FC<TariffDetailFormProps> = ({
  record,
  onClose,
}) => {
  const { control, handleSubmit, onSubmit, isSubmitting } =
    useTariffDetailForm({ record, onClose });

  const { data: tariffs, isLoading: loadingTariffs } = useTariffs();
  const { data: surgicalGroups, isLoading: loadingSurgicalGroups } =
    useSurgicalGroups();

  const tariffOptions = (tariffs ?? []).map((tariff) => ({
    value: tariff.id!,
    label: tariff.name,
  }));

  const surgicalGroupOptions = (surgicalGroups ?? []).map((group) => ({
    value: group.id,
    label: `${group.referenceCode} - ${group.qxGroup}`,
  }));

  if (loadingTariffs || loadingSurgicalGroups) {
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
          name="referenceCode"
          label="Código referencia"
          placeholder="Código referencia"
          type="number"
          control={control}
        />

        <SelectAutocomplete
          name="tariffId"
          label="Tarifario"
          placeholder="Tarifario"
          control={control}
          options={tariffOptions}
          getPopupContainer={() => document.body}
        />

        <SelectAutocomplete
          name="surgicalGroupId"
          label="Grupo quirúrgico"
          placeholder="Grupo quirúrgico"
          control={control}
          options={surgicalGroupOptions}
          getPopupContainer={() => document.body}
        />

        <Input
          name="value"
          label="Valor"
          placeholder="Valor"
          type="number"
          control={control}
        />

        <Input
          name="factors"
          label="Factor"
          placeholder="Factor"
          type="number"
          control={control}
        />

        <SelectAutocomplete
          name="isSurgicalProcedure"
          label="Procedimiento quirúrgico"
          placeholder="Procedimiento quirúrgico"
          control={control}
          options={yesNoOptions}
        />
      </GridContainer>

      <Input
        name="description"
        label="Descripción"
        placeholder="Descripción"
        control={control}
      />

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Actualizar
        </Button>
      </div>
    </form>
  );
};

export default TariffDetailForm;
