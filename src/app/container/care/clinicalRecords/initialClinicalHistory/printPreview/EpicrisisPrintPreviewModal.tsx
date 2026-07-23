"use client";

import { createPortal } from "react-dom";
import { Button, Spin } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import Modal from "@/components/modal";
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider";
import type { GetUser } from "@/core/interfaces/user/users";
import type {
  HCInicialResponse,
  EvolucionResponse,
  EvolucionEspecialistaResponse,
  NotaMedicaResponse,
  ProcedimientoMenorResponse,
  ProcedimientoDiagnosticoResponse,
  ProcedimientoNoQxResponse,
  NotaEnfermeriaResponse,
  DescripcionQuirurgicaResponse,
} from "@/core/interfaces/care/hciInicial";
import type { DiagnosisRow } from "../types";
import { EpicrisisPrintDocument } from "./EpicrisisPrintDocument";
import { INSTITUTION_PROVIDER_ID, type PrintPatient } from "./printDocument.utils";

interface Props {
  open: boolean;
  onClose: () => void;
  patient: PrintPatient;
  admissionDate: string;
  attentionDate: string;
  attentionTime: string;
  contractName: string;
  doctorName: string;
  doctorUser?: GetUser;
  users: GetUser[];
  hcInicial?: HCInicialResponse | null;
  diagnoses: DiagnosisRow[];
  descripcionesQuirurgicas: DescripcionQuirurgicaResponse[];
  notasMedicas: NotaMedicaResponse[];
  evoluciones: EvolucionResponse[];
  evolucionEspecialistas: EvolucionEspecialistaResponse[];
  procedimientosMenores: ProcedimientoMenorResponse[];
  procedimientosDiagnosticos: ProcedimientoDiagnosticoResponse[];
  procedimientosNoQx: ProcedimientoNoQxResponse[];
  notasEnfermeria: NotaEnfermeriaResponse[];
}

const EpicrisisPrintPreviewModal = ({
  open,
  onClose,
  patient,
  admissionDate,
  attentionDate,
  attentionTime,
  contractName,
  doctorName,
  doctorUser,
  users,
  hcInicial,
  diagnoses,
  descripcionesQuirurgicas,
  notasMedicas,
  evoluciones,
  evolucionEspecialistas,
  procedimientosMenores,
  procedimientosDiagnosticos,
  procedimientosNoQx,
  notasEnfermeria,
}: Props) => {
  const { data: provider, isLoading } = useGetProvider(INSTITUTION_PROVIDER_ID);

  const printContent = !isLoading && (
    <EpicrisisPrintDocument
      provider={provider}
      patient={patient}
      admissionDate={admissionDate}
      attentionDate={attentionDate}
      attentionTime={attentionTime}
      contractName={contractName}
      doctorName={doctorName}
      doctorUser={doctorUser}
      users={users}
      hcInicial={hcInicial}
      diagnoses={diagnoses}
      descripcionesQuirurgicas={descripcionesQuirurgicas}
      notasMedicas={notasMedicas}
      evoluciones={evoluciones}
      evolucionEspecialistas={evolucionEspecialistas}
      procedimientosMenores={procedimientosMenores}
      procedimientosDiagnosticos={procedimientosDiagnosticos}
      procedimientosNoQx={procedimientosNoQx}
      notasEnfermeria={notasEnfermeria}
    />
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Vista previa - Epicrisis"
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

export default EpicrisisPrintPreviewModal;
