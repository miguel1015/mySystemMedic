"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, Spin } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import Modal from "@/components/modal";
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider";
import type { TProvider } from "@/core/interfaces/parameterization/types";
import { INSTITUTION_PROVIDER_ID } from "./printDocument.utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  renderDocument: (provider: TProvider | undefined) => ReactNode;
}

const ClinicalPrintPreviewModal = ({ open, onClose, title, renderDocument }: Props) => {
  const { data: provider, isLoading } = useGetProvider(INSTITUTION_PROVIDER_ID);

  const printContent = !isLoading && renderDocument(provider);

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

export default ClinicalPrintPreviewModal;
