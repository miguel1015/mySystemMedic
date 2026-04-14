import { useMemo } from "react";
import { useUserDocumentType } from "@/core/hooks/users/useDocumentTypes";
import { useCities } from "@/core/hooks/utils/useCities";
import { useCountries } from "@/core/hooks/utils/useCountries";
import { useInsurers } from "@/core/hooks/utils/useInsurer";
import { useStates } from "@/core/hooks/utils/useStates";
import { useContracts } from "@/core/hooks/parameterization/contracts/useGetAllContracts";
import { useSexes } from "@/core/hooks/care/patients/useSexes";
import { useDisabilities } from "@/core/hooks/care/patients/useDisabilities";
import { useZones } from "@/core/hooks/care/patients/useZones";
import { useBloodGroups } from "@/core/hooks/care/patients/useBloodGroups";
import { useRhFactors } from "@/core/hooks/care/patients/useRhFactors";
import { useMaritalStatuses } from "@/core/hooks/care/patients/useMaritalStatuses";

interface UseSelectOptionsParams {
  residenceCountryId?: number;
  stateId?: number;
}

export function useSelectOptions({ residenceCountryId, stateId }: UseSelectOptionsParams = {}) {
  const { data: dataDocumentType } = useUserDocumentType();
  const { data: dataCountries } = useCountries();
  const { data: dataStates } = useStates();
  const { data: dataCities } = useCities();
  const { data: dataInsurers } = useInsurers();
  const { data: dataContracts } = useContracts();
  const { data: dataSexes } = useSexes();
  const { data: dataDisabilities } = useDisabilities();
  const { data: dataZones } = useZones();
  const { data: dataBloodGroups } = useBloodGroups();
  const { data: dataRhFactors } = useRhFactors();
  const { data: dataMaritalStatuses } = useMaritalStatuses();

  const documentTypesOptions = (dataDocumentType ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const countriesOptions = (dataCountries ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const statesOptions = useMemo(() => {
    const states = dataStates ?? [];
    const filtered = residenceCountryId
      ? states.filter((r) => r.countryId === residenceCountryId)
      : states;
    return filtered.map((r) => ({
      value: r.id,
      label: r.name,
    }));
  }, [dataStates, residenceCountryId]);

  const citiesOptions = useMemo(() => {
    const cities = dataCities ?? [];
    const filtered = stateId
      ? cities.filter((r) => r.stateId === stateId)
      : cities;
    return filtered.map((r) => ({
      value: r.id,
      label: r.name,
    }));
  }, [dataCities, stateId]);

  const insurersOptions = (dataInsurers ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const contractsOptions = (dataContracts ?? []).map((r) => ({
    value: r.id,
    label: r.contractName,
  }));

  const sexesOptions = (dataSexes ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const disabilitiesOptions = (dataDisabilities ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const zonesOptions = (dataZones ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const bloodGroupsOptions = (dataBloodGroups ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const rhFactorsOptions = (dataRhFactors ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const maritalStatusesOptions = (dataMaritalStatuses ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  return {
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
  };
}
