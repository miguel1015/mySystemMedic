export interface UserRole {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
}
export interface UserProfile {
  id: number;
  name: string;
  userRoleId: number;
  nameRol: string;
  isActive: boolean;
  description: string;
}

export interface UserDocumentType {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
}

export interface UserStatuses {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
}

export interface DataUser {
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  username: string;
  userProfileId: number;
  userRoleId: number;
  userStatusId: number;
  email: string;
  password: string;
  phone?: string;
  telephone?: string;
  signature?: string;
}

export interface GetUser {
  id: number;
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  username: string;
  userProfileId: number;
  userRoleId: number;
  userStatusId: number;
  email: string;
  password: string;
  isActive: number;
  userStatusName: string;
  userRoleName: string;
  createdAt: string;
  phone?: string;
  telephone?: string;
  signature?: string;
}

export interface TCountries {
  id: number;
  code: string;
  name: string;
}

export interface TStates {
  id: number;
  name: string;
  daneCode: string;
  countryId: number;
  countryName: string;
}
export interface TCities {
  id: number;
  code: string;
  furipsCode: string;
  name: string;
  stateId: number;
  stateName: string;
  countryId: number;
  countryName: string;
}
export interface TAdministradorTypes {
  id: number;
  name: string;
  shortName: string;
}
export interface TBenefitPlans {
  id: number;
  name: string;
}
export interface TInsurers {
  id: number;
  name: string;
  nit: string;
  verificationDigit: number;
  code: string;
  address: string;
  phone1: string;
  phone2: null;
  email: string;
  cityId: 150;
  cityName: string;
  stateId: 14;
  stateName: string;
  countryId: 48;
  countryName: string;
  administratorTypeId: 4;
  administratorTypeName: string;
  administratorTypeShortName: string;
}
