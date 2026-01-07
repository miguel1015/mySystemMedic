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
