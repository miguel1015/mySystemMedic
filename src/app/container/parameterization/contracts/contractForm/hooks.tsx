import { useBenefitPlans } from "../../../../../core/hooks/utils/useBenefitPlans";
import { useCities } from "../../../../../core/hooks/utils/useCities";
import { useInsurers } from "../../../../../core/hooks/utils/useInsurer";
import { useTariffs } from "../../../../../core/hooks/parameterization/tariffs/useGetAllTariffs";

export const useContractOptions = () => {
  const { data: dataInsurers } = useInsurers();
  const { data: dataCities } = useCities();
  const { data: dataBenefitPlans } = useBenefitPlans();
  const { data: dataTariffs } = useTariffs();

  const insurersOptions = (dataInsurers ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));

  const citiesOptions = (dataCities ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));

  const benefitPlansOptions = (dataBenefitPlans ?? []).map((x) => ({
    value: x.id,
    label: x.name,
  }));

  const tariffsOptions = (dataTariffs ?? []).map((x) => ({
    value: x.id!,
    label: x.name,
  }));

  return {
    insurersOptions,
    citiesOptions,
    benefitPlansOptions,
    tariffsOptions,
  };
};
