import { useUserDocumentType } from "@/core/hooks/users/useDocumentTypes";
import { useCities } from "@/core/hooks/utils/useCities";
import { useCountries } from "@/core/hooks/utils/useCountries";
import { useStates } from "@/core/hooks/utils/useStates";

export function useSelectOptions() {
  const { data: dataDocumentType } = useUserDocumentType();
  const { data: dataCountries } = useCountries();
  const { data: dataStates } = useStates();
  const { data: dataCities } = useCities();

  const documentTypesOptions = (dataDocumentType ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const countriesOptions = (dataCountries ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const statesOptions = (dataStates ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const citiesOptions = (dataCities ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  return { documentTypesOptions, countriesOptions, statesOptions, citiesOptions };
}
