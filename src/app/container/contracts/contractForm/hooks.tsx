import { useAdministradorTypes } from "../../../../core/hooks/utils/useAdministradorTypes";
import { useCountries } from "../../../../core/hooks/utils/useCountries";
import { useInsurers } from "../../../../core/hooks/utils/useInsurer";
import { useStates } from "../../../../core/hooks/utils/useStates";

export const contractHook = () => {
  const { data: dataStates } = useStates();
  const { data: dataCountries } = useCountries();
  const { data: dataAdministradorTypes } = useAdministradorTypes();

  const administradorTypesOptions = (dataAdministradorTypes ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));
  const countriesOptions = (dataCountries ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));
  const statesOptions = (dataStates ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));
  return {
    statesOptions,
    countriesOptions,
    administradorTypesOptions,
  };
};
