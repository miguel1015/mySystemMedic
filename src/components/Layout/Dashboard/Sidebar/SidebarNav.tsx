import SidebarNavGroup from "@/components/Layout/Dashboard/Sidebar/SidebarNavGroup";
import SidebarNavItem from "@/components/Layout/Dashboard/Sidebar/SidebarNavItem";
import { getDictionary } from "@/locales/dictionary";
import { faStackOverflow } from "@fortawesome/free-brands-svg-icons";
import {
  faFileLines,
  faHospital,
  faSave,
  faSquareCheck,
  faUser,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBacteria,
  faBox,
  faBug,
  faCodeFork,
  faDollar,
  faDownload,
  faFileArrowUp,
  faFileInvoice,
  faFirstAid,
  faFlask,
  faGear,
  faHome,
  faRotate,
  faStethoscope,
  faSuitcase,
  faUserDoctor,
  faUserNurse,
  faUserPlus,
  faUsers,
  faWallet,
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
        toggleIcon={faGear}
        toggleText={dict.sidebar.items.configuration}
      >
        <SidebarNavItem href="#" icon={faSuitcase}>
          {dict.sidebar.configuration.contracts}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faBox}>
          {dict.sidebar.configuration.services}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faHospital}>
          {dict.sidebar.configuration.eps}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faSuitcase}>
          {dict.sidebar.configuration.surgical}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFirstAid}>
          {dict.sidebar.configuration.Pricing}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFirstAid}>
          {dict.sidebar.configuration.generalPortfolio}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faBacteria}>
          {dict.sidebar.configuration.laboratory}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faHospital}>
          {dict.sidebar.configuration.templatesHc}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFirstAid}>
          {dict.sidebar.configuration.medications}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStethoscope}>
          {dict.sidebar.configuration.supplies}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faSave}>
          {dict.sidebar.configuration.security}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faWallet}
        toggleText={dict.sidebar.items.wallet}
      >
        <SidebarNavItem href="#" icon={faDollar}>
          {dict.sidebar.wallet.invoicePayment}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faFileInvoice}>
          {dict.sidebar.wallet.billingObjections}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faDollar}>
          {dict.sidebar.wallet.accountingNote}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFileInvoice}
        toggleText={dict.sidebar.items.billing}
      >
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.admissionOpenIntegral}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faCodeFork}>
          {dict.sidebar.billing.surgeryUpload}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.admissionClosedIntegral}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faDollar}>
          {dict.sidebar.billing.invoiceVisualization}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.invoiceAttachment}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.billingReport}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.electronicDocuments}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.admissionReport}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.servicesReport}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faStackOverflow}>
          {dict.sidebar.billing.eDocNotSent}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faUserNurse}
        toggleText={dict.sidebar.items.careManagement}
      >
        <SidebarNavItem href="#" icon={faFileLines}>
          {dict.sidebar.careManagement.hcConsultation}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faUserDoctor}>
          {dict.sidebar.careManagement.hcEvolution}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faUserDoctor}>
          {dict.sidebar.careManagement.patientsAttendedToday}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faUserDoctor}>
          {dict.sidebar.careManagement.ambulatory}
        </SidebarNavItem>
        <SidebarNavItem href="#" icon={faUserDoctor}>
          {dict.sidebar.careManagement.operatingRoomReport}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFlask}
        toggleText={dict.sidebar.items.clinicalLaboratory}
      >
        <SidebarNavItem href="#" icon={faFileInvoice}>
          {dict.sidebar.items.deliveryResults}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faUser}
        toggleText={dict.sidebar.items.patients}
      >
        <SidebarNavItem icon={faUserPlus} href="#">
          {dict.sidebar.items.patients}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFileArrowUp}
        toggleText={dict.sidebar.items.filing}
      >
        <SidebarNavItem icon={faRotate} href="#">
          {dict.sidebar.filing.invoiceReview}
        </SidebarNavItem>
        <SidebarNavItem icon={faSquareCheck} href="#">
          {dict.sidebar.filing.filingProcess}
        </SidebarNavItem>
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.filing.filingUpdate}
        </SidebarNavItem>
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.filing.glossResponse}
        </SidebarNavItem>
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.filing.furipsFlatFiles}
        </SidebarNavItem>
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.filing.ripsFlatFiles}
        </SidebarNavItem>
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.filing.filingReport}
        </SidebarNavItem>
        <SidebarNavItem icon={faBug} href="#">
          {dict.sidebar.filing.flatFilesPerInvoice}
        </SidebarNavItem>
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.filing.glossReport}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faXRay}
        toggleText={dict.sidebar.items.radiology}
      >
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.radiology.radiologyManagement}
        </SidebarNavItem>
        <SidebarNavItem icon={faFileLines} href="#">
          {dict.sidebar.radiology.radiologyInformation}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup
        toggleIcon={faFileLines}
        toggleText={dict.sidebar.items.institutionalReports}
      >
        <SidebarNavItem icon={faDownload} href="#">
          {dict.sidebar.institutionalReports.resolution256}
        </SidebarNavItem>
        <SidebarNavItem icon={faDownload} href="#">
          {dict.sidebar.institutionalReports.circular030}
        </SidebarNavItem>
        <SidebarNavItem icon={faDownload} href="#">
          {dict.sidebar.institutionalReports.st006Information}
        </SidebarNavItem>
      </SidebarNavGroup>

      <SidebarNavGroup toggleIcon={faUser} toggleText={dict.sidebar.items.user}>
        <SidebarNavItem icon={faUsers} href="/users">
          {dict.sidebar.items.users}
        </SidebarNavItem>
      </SidebarNavGroup>
    </ul>
  );
}
