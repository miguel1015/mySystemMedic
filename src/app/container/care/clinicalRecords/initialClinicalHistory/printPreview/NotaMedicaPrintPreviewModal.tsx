"use client";

import { createPortal } from "react-dom";
import { Button, Spin } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import Modal from "@/components/modal";
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider";
import type { GetUser } from "@/core/interfaces/user/users";
import { INSTITUTION_PROVIDER_ID, type PrintPatient } from "./printDocument.utils";
import { NotaMedicaPrintDocument } from "./NotaMedicaPrintDocument";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  patient: PrintPatient;
  admissionDate: string;
  contractName: string;
  fechaNota: string;
  horaNota: string;
  doctorName: string;
  doctorUser?: GetUser;
  nota: string;
}

const NotaMedicaPrintPreviewModal = ({
  open,
  onClose,
  title,
  patient,
  admissionDate,
  contractName,
  fechaNota,
  horaNota,
  doctorName,
  doctorUser,
  nota,
}: Props) => {
  const { data: provider, isLoading } = useGetProvider(
    INSTITUTION_PROVIDER_ID,
  );

  const printContent = !isLoading && (
    <NotaMedicaPrintDocument
      provider={provider}
      patient={patient}
      admissionDate={admissionDate}
      contractName={contractName}
      fechaNota={fechaNota}
      horaNota={horaNota}
      doctorName={doctorName}
      doctorUser={doctorUser}
      nota={nota}
    />
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={title}
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

export default NotaMedicaPrintPreviewModal;
