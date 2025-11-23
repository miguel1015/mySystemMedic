import SidebarNavGroup from "@/components/Layout/Dashboard/Sidebar/SidebarNavGroup";
import SidebarNavItem from "@/components/Layout/Dashboard/Sidebar/SidebarNavItem";
import { getDictionary } from "@/locales/dictionary";
import {
  faChartBar,
  faFileCode,
  faFileLines,
  faHospital,
  faNoteSticky,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBoxOpen,
  faCalculator,
  faCapsules,
  faCircleExclamation,
  faCircleInfo,
  faCut,
  faFileArrowUp,
  faFileCircleCheck,
  faFileCircleXmark,
  faFileContract,
  faFileInvoice,
  faFileInvoiceDollar,
  faFileMedicalAlt,
  faFileSignature,
  faFlaskVial,
  faGear,
  faHome,
  faHospitalUser,
  faListCheck,
  faMicroscope,
  faMoneyBill,
  faNotesMedical,
  faPills,
  faPrescriptionBottleMedical,
  faStethoscope,
  faTruckMedical,
  faUserDoctor,
  faUsers,
  faWallet,
  faWarehouse,
  faXRay,
} from "@fortawesome/free-solid-svg-icons";

export default async function SidebarNav() {
  const dict = await getDictionary();
  return (
    <ul className="list-unstyled">
      <SidebarNavItem icon={faHome} href="/">
        {dict.sidebar.items.dashboard}
      </SidebarNavItem>
      <SidebarNavGroup
        toggleIcon={faStethoscope}
        toggleText={dict.sidebar.items.healthcare}
      >
        <SidebarNavItem href="#" icon={faNotesMedical}>
          {dict.sidebar.healthcare.triage}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faHospitalUser}>
          {dict.sidebar.healthcare.admission}
        </SidebarNavItem>
        <SidebarNavGroup
          toggleIcon={faStethoscope}
          toggleText={dict.sidebar.healthcare.ongoingCare}
        >
          <SidebarNavItem href="#" icon={faListCheck}>
            {dict.sidebar.healthcare.careList}
          </SidebarNavItem>
        </SidebarNavGroup>
        <SidebarNavGroup
          toggleIcon={faXRay}
          toggleText={dict.sidebar.items.radiology}
        >
          <SidebarNavItem icon={faCircleInfo} href="#">
            {dict.sidebar.radiology.radiologyManagement}
          </SidebarNavItem>
          <SidebarNavItem icon={faCircleInfo} href="#">
            {dict.sidebar.radiology.radiologyInformation}
          </SidebarNavItem>
        </SidebarNavGroup>
        <SidebarNavGroup
          toggleIcon={faFlaskVial}
          toggleText={dict.sidebar.items.clinicalLaboratory}
        >
          <SidebarNavItem href="#" icon={faFileInvoice}>
            {dict.sidebar.items.deliveryResults}
          </SidebarNavItem>
        </SidebarNavGroup>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faPrescriptionBottleMedical}
        toggleText={dict.sidebar.items.pharmacy}
      >
        <SidebarNavItem href="#" icon={faPills}>
          {dict.sidebar.pharmacy.references}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faTruckMedical}>
          {dict.sidebar.pharmacy.suppliers}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faBoxOpen}>
          {dict.sidebar.pharmacy.supplies}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFileInvoiceDollar}
        toggleText={dict.sidebar.items.billing}
      >
        <SidebarNavItem href="#" icon={faFileInvoice}>
          {dict.sidebar.billing.admissionOpenIntegral}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faCut}>
          {dict.sidebar.billing.surgeryUpload}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileMedicalAlt}>
          {dict.sidebar.billing.admissionClosedIntegral}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileLines}>
          {dict.sidebar.billing.invoiceVisualization}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileArrowUp}>
          {dict.sidebar.billing.invoiceAttachment}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faChartBar}>
          {dict.sidebar.billing.billingReport}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileCode}>
          {dict.sidebar.billing.electronicDocuments}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileCircleCheck}>
          {dict.sidebar.billing.admissionReport}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileContract}>
          {dict.sidebar.billing.servicesReport}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faCircleExclamation}>
          {dict.sidebar.billing.eDocNotSent}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faGear}
        toggleText={dict.sidebar.items.settings}
      >
        <SidebarNavItem href="#" icon={faGear}>
          {dict.sidebar.settings.services}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faHospital}>
          {dict.sidebar.settings.ipsData}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileSignature}>
          {dict.sidebar.settings.contracts}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faCapsules}>
          {dict.sidebar.settings.medications}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faUsers}>
          {dict.sidebar.settings.users}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faMicroscope}>
          {dict.sidebar.settings.medicalDevices}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faWarehouse}>
          {dict.sidebar.settings.infrastructureInventory}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faUserDoctor}>
          {dict.sidebar.settings.infrastructureManagement}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faCalculator}
        toggleText={dict.sidebar.items.accounting}
      >
        <SidebarNavGroup
          toggleIcon={faWallet}
          toggleText={dict.sidebar.items.wallet}
        >
          <SidebarNavItem href="#" icon={faMoneyBill}>
            {dict.sidebar.wallet.invoicePayment}
          </SidebarNavItem>
          <SidebarNavItem href="#" icon={faFileCircleXmark}>
            {dict.sidebar.wallet.billingObjections}
          </SidebarNavItem>
          <SidebarNavItem href="#" icon={faNoteSticky}>
            {dict.sidebar.wallet.accountingNote}
          </SidebarNavItem>
        </SidebarNavGroup>
      </SidebarNavGroup>
    </ul>
  );
}
