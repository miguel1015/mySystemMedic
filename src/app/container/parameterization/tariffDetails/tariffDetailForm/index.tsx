"use client";

import CupsPicker from "@/app/container/parameterization/cupsHomologation/cupsPicker";
import GridContainer from "@/components/componentLayout";
import Input from "@/components/input";
import RHFAntdInputNumber from "@/components/inputNumber";
import SelectAutocomplete from "@/components/select";
import { useCupsSearch } from "@/core/hooks/parameterization/cups/useCups";
import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs";
import { useSurgicalGroups } from "@/core/hooks/parameterization/surgicalGroups/useGetAllSurgicalGroups";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button, Spin } from "antd";
import { Controller } from "react-hook-form";
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
  const {
    control,
    handleSubmit,
    onSubmit,
    isSubmitting,
    isAddingCups,
    startNewCups,
    cancelNewCups,
  } = useTariffDetailForm({ record, onClose });

  const { data: tariffs, isLoading: loadingTariffs } = useTariffs();
  const { data: surgicalGroups, isLoading: loadingSurgicalGroups } =
    useSurgicalGroups();
  // Nombre del CUPS que ya tiene el detalle, para mostrarlo junto al código.
  const { data: currentCups = [] } = useCupsSearch(record?.cupsCode ?? "");
  const currentCupsName =
    currentCups.find((c) => c.code === record?.cupsCode)?.name ?? "";

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

        <RHFAntdInputNumber
          name="factors"
          label="Factor"
          placeholder="Factor"
          control={control}
          decimalSeparator=","
          formatter={(value) =>
            value === undefined || value === null
              ? ""
              : String(value).replace(".", ",")
          }
          parser={(displayValue) =>
            displayValue ? Number(displayValue.replace(",", ".")) : 0
          }
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

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Código CUPS
        </label>
        {isAddingCups ? (
          <>
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message="El CUPS se agregará al catálogo y reemplazará el actual de este detalle."
              description="El validador del Ministerio (MUV) solo acepta códigos de la tabla de SISPRO: si el código está mal escrito o no es oficial, el RIPS será rechazado."
            />
            <GridContainer columns="col-4" gap="g-3">
              <Input
                name="newCups.code"
                label="Código"
                placeholder="Ej. 890201"
                maxLength={10}
                helperText="Se guarda con la descripción del detalle como nombre"
                control={control}
              />
            </GridContainer>
            <Button
              type="link"
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={cancelNewCups}
              style={{ paddingInline: 0 }}
            >
              Volver a buscar en el catálogo
            </Button>
          </>
        ) : (
          <Controller
            name="cups"
            control={control}
            render={({ field }) => (
              <CupsPicker
                description={record?.description ?? ""}
                referenceCode={record?.referenceCode}
                value={
                  field.value && !field.value.name && field.value.code === record?.cupsCode
                    ? { ...field.value, name: currentCupsName }
                    : field.value
                }
                onChange={field.onChange}
                onRequestNew={startNewCups}
              />
            )}
          />
        )}
      </div>

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
