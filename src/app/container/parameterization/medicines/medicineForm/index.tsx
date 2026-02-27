"use client"

import GridContainer from "@/components/componentLayout"
import Input from "@/components/input"
import SelectAutocomplete from "@/components/select"
import { Button, Spin } from "antd"
import { TUtils } from "../../../../../types/utils"
import { useMedicineForm } from "./useMedicineForm"
import { useSelectOptions } from "./useSelectOptions"

const MedicinesForm: React.FC<TUtils> = ({
  setOpen,
  editUserId,
  setEditUserId,
}) => {
  const {
    control,
    handleSubmit,
    onSubmit,
    loadingMedicine,
    isSubmitting,
  } = useMedicineForm({ setOpen, editUserId, setEditUserId })

  const {
    measurementUnitOptions,
    administrationRouteOptions,
    pharmaceuticalFormOptions,
    presentationOptions,
    medicineGroupOptions,
    isLoading: loadingOptions,
  } = useSelectOptions()

  if (loadingOptions || (editUserId && loadingMedicine)) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GridContainer columns="col-4" gap="g-3">
        <Input
          name="name"
          label="Nombre medicamento"
          placeholder="Nombre medicamento"
          control={control}
        />
        <Input
          name="cum"
          label="CUM"
          placeholder="CUM"
          control={control}
        />
        <Input
          name="concentration"
          label="Concentración"
          placeholder="Concentración"
          control={control}
        />

        <SelectAutocomplete
          name="measurementUnitSidamId"
          label="Unidad de medida"
          placeholder="Unidad de medida"
          control={control}
          options={measurementUnitOptions}
        />

        <SelectAutocomplete
          name="administrationRouteCode"
          label="Vía administración"
          placeholder="Vía administración"
          control={control}
          options={administrationRouteOptions}
        />

        <SelectAutocomplete
          name="pharmaceuticalFormCode"
          label="Forma farmacéutica"
          placeholder="Forma farmacéutica"
          control={control}
          options={pharmaceuticalFormOptions}
        />

        <SelectAutocomplete
          name="presentationCode"
          label="Presentación"
          placeholder="Presentación"
          control={control}
          options={presentationOptions}
        />

        <SelectAutocomplete
          name="medicineGroupCode"
          label="Grupo medicamento"
          placeholder="Grupo medicamento"
          control={control}
          options={medicineGroupOptions}
        />

        <Input
          name="atc"
          label="ATC"
          placeholder="ATC"
          control={control}
        />
        <Input
          name="invima"
          label="Código INVIMA"
          placeholder="Código INVIMA"
          control={control}
        />
        <Input
          name="price"
          label="Precio"
          placeholder="Precio"
          control={control}
          type="number"
        />
      </GridContainer>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
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
  )
}

export default MedicinesForm
