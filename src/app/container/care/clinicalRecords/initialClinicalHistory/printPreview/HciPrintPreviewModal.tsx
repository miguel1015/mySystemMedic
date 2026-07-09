"use client";

import { createPortal } from "react-dom";
import { Button, Spin } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import Modal from "@/components/modal";
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider";
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission";
import type { GetUser } from "@/core/interfaces/user/users";
import type { DiagnosisRow } from "../types";
import { HciPrintDocument } from "./HciPrintDocument";

const INSTITUTION_PROVIDER_ID = 32;

interface PrintPatient {
  name: string;
  documentType: string;
  documentNumber: string;
  careScope: string;
  birthDate: string;
  sex: string;
  insurer: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  admissionId?: string | number;
  patient: PrintPatient;
  admissionDate: string;
  attentionDate: string;
  contractName: string;
  doctorName: string;
  doctorUser?: GetUser;
  diagnoses: DiagnosisRow[];
}

const HciPrintPreviewModal = ({
  open,
  onClose,
  admissionId,
  patient,
  admissionDate,
  attentionDate,
  contractName,
  doctorName,
  doctorUser,
  diagnoses,
}: Props) => {
  const { data: provider, isLoading: loadingProvider } = useGetProvider(
    INSTITUTION_PROVIDER_ID,
  );
  const { data: hcInicial, isLoading: loadingHci } = useGetHCInicialByAdmission(
    open ? admissionId : undefined,
  );

  const isLoading = loadingProvider || loadingHci;

  const printContent = !isLoading && (
    <HciPrintDocument
      provider={provider}
      patient={patient}
      admissionDate={admissionDate}
      attentionDate={attentionDate}
      contractName={contractName}
      doctorName={doctorName}
      doctorUser={doctorUser}
      hcInicial={hcInicial}
      diagnoses={diagnoses}
    />
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Vista previa - Historia Clínica Inicial"
        size="xl"
        footer={
          <>
            <Button onClick={onClose}>Cerrar</Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
          </>
        }
      >
        <div className="hci-print-screen-wrap">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <Spin size="large" />
            </div>
          ) : (
            printContent
          )}
        </div>
      </Modal>

      {/*
        Printing renders from a portal appended straight to <body>, outside
        the modal's position in the page tree. Printing the in-modal copy
        directly used to leave a blank leading page: `visibility: hidden`
        hides the rest of the page but doesn't collapse its layout height,
        so whatever content sits above this modal in the DOM still pushed
        the print output down by that much. A body-level portal + hiding
        every other top-level sibling with `display: none` (which *does*
        collapse space) avoids that entirely.
      */}
      {open &&
        !isLoading &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="hci-print-portal">{printContent}</div>,
          window.document.body,
        )}
    </>
  );
};

export default HciPrintPreviewModal;
