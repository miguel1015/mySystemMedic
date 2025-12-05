import { contracts } from "./contracts/contracts";
import { general } from "./general";
import { insuranceCompanies } from "./InsuranceCompanies/InsuranceCompanies";
import { sidebar } from "./layout";
import { users } from "./users/users";

const port = {
  users,
  sidebar,
  general,
  contracts,
  insuranceCompanies,
};

export default port;
