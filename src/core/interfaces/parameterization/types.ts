export interface Insurance {
  name: string;
  nit: string;
  verificationDigit: number;
  code: string;
  address: string;
  cityId: number;
  phone1: string;
  phone2?: string;
  email: string;
  administratorTypeId: number;
}

export interface TTariffs {
  id?: number;
  codingId: number;
  name: string;
}

export interface TTableMedicine {
  id?: number;
  cum?: string;
  status?: string;
  name: string;
}

export interface Contract {
  contractNumber: string;
  insurerId: number;
  contractType: string;
  populationNumber: number;
  cityId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  tariffScheduleId: number;
  medicineTariffScheduleId: number | null;
  factor: number;
  providerId: number;
  policy: string;
  chargeCopay: boolean;
  chargeModeratingFee: boolean;
  billingDestinationId: number;
  benefitPlanId: number;
  referenceCode: string;
}

export interface TContract extends Contract {
  id: number;
}

export interface ContractDetail {
  contractId: number;
  startDate: string;
  endDate: string | null;
  serviceId: number;
  externalTariffScheduleId: number;
  factor: number;
}

export interface TContractDetail extends ContractDetail {
  id: number;
}

export interface TIpsData {
  id?: number;
  companyName: string;
  nit: string;
  verificationDigit: number;
  habilitationCode: string;
  complexityLevel: string;
  invoiceConsecutive: number;
  phone: string;
  email: string;
  ivaPercentage: number;
  currencySymbol: string;
  address: string;
  stateId: number;
  cityId: number;
  isIps: boolean;
  isAmbulance: boolean;
  electronicInvoicing: boolean;
  ownWebServices: boolean;
  apiSiigo: boolean;
  legalRepDocument: string;
  legalRepName: string;
  logo?: string;
  legalRepSignature?: string;
}
