"use client";

import { useState } from "react";
import { Container } from "../../../../components/container";
import { Button, Input, DatePicker, Select } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  PrinterOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Modal from "../../../../components/modal";
import Epicrisis from "./epicrisis";
import Acto from "./acto";
import Title from "antd/es/typography/Title";

interface Especialidad {
  id: number;
  nombre: string;
  tieneHC: boolean;
}

const especialidades: Especialidad[] = [
  { id: 1, nombre: "MEDICINA GENERAL", tieneHC: false },
  { id: 2, nombre: "ANESTESIOLOGIA", tieneHC: false },
  { id: 3, nombre: "ORTOPEDIA Y TRAUMOTOLOGIA", tieneHC: false },
];

const CareManagementContainer = () => {
  const [open, setOpen] = useState(false);
  const [openActo, setOpenActo] = useState(false);
  const [especialidadBusqueda, setEspecialidadBusqueda] = useState("");
  const [paciente] = useState({
    nombre: "JONATHAN RODRIGUEZ QUINTERO",
  });

  return (
    <Container>
      {/* Título principal */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <SearchOutlined
          style={{ color: "#0F6F5C", fontSize: "18px", marginBottom: "20px" }}
        />
        <Title level={4}>Buscar Historial Clínico</Title>
      </div>

      {/* Buscador de especialidad */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <label style={{ fontWeight: 500, minWidth: "140px" }}>
          Especialidad Medica
        </label>
        <Input
          placeholder="Especialidad"
          value={especialidadBusqueda}
          onChange={(e) => setEspecialidadBusqueda(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
        <Button type="primary" icon={<SearchOutlined />}>
          Buscar
        </Button>
      </div>

      {/* Información del paciente */}
      <div
        style={{
          backgroundColor: "#528063",
          padding: "12px 16px",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
      >
        <Title level={5}>PACIENTE: {paciente.nombre}</Title>
      </div>

      {/* Tabla de especialidades */}
      <div className="table-responsive" style={{ marginBottom: "24px" }}>
        <table
          className="table table-bordered"
          style={{ backgroundColor: "#fff" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e3f2fd" }}>
              <th style={{ width: "30%" }}>Especialidad de atención</th>
              <th style={{ width: "40%" }}>Historia Clínica</th>
              <th style={{ width: "30%" }}>Epicrisis</th>
            </tr>
          </thead>
          <tbody>
            {/* Fila con botones principales */}
            <tr>
              <td>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => setOpenActo(true)}
                >
                  EPICRISIS PCTE
                </Button>
              </td>
              <td></td>
              <td>
                <Button
                  type="primary"
                  icon={<PrinterOutlined />}
                  onClick={() => setOpen(true)}
                  style={{
                    backgroundColor: "#0F6F5C",
                    borderColor: "#0F6F5C",
                  }}
                >
                  EPICRISIS IPS
                </Button>
              </td>
            </tr>

            {/* Filas de especialidades */}
            {especialidades.map((esp) => (
              <tr key={esp.id}>
                <td>{esp.nombre}</td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button icon={<EditOutlined />} size="small" />
                    <Button
                      size="small"
                      icon={<FileTextOutlined />}
                      disabled={!esp.tieneHC}
                    >
                      HC desactivadas
                    </Button>
                  </div>
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección inferior */}
      <div className="table-responsive">
        <table
          className="table table-bordered"
          style={{ backgroundColor: "#fff" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e3f2fd" }}>
              <th>Ordenes</th>
              <th>Aplicación de medicamento</th>
              <th>Hoja de Laboratorio</th>
              <th colSpan={3}>Hoja de gastos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: "center" }}>
                <Button icon={<EditOutlined />} size="small" />
              </td>
              <td style={{ textAlign: "center" }}>
                <Button icon={<PrinterOutlined />} size="small" />
              </td>
              <td>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Button icon={<FileTextOutlined />} size="small">
                    Laboratorio
                  </Button>
                </div>
              </td>
              <td style={{ textAlign: "center" }}>
                <Button icon={<FileTextOutlined />} size="small">
                  Hospitalización
                </Button>
              </td>
              <td style={{ textAlign: "center" }}>
                <Button icon={<FileTextOutlined />} size="small">
                  Cirugía
                </Button>
              </td>
              <td style={{ textAlign: "center" }}>
                <Button icon={<FileTextOutlined />} size="small">
                  Urgencia
                </Button>
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td>
                <div>
                  <label style={{ fontSize: "12px", display: "block" }}>
                    Fecha lab.
                  </label>
                  <DatePicker
                    placeholder="dd/mm"
                    format="DD/MM"
                    size="small"
                    style={{ width: "100%" }}
                  />
                </div>
              </td>
              <td>
                <div>
                  <label style={{ fontSize: "12px", display: "block" }}>
                    Fecha hoja Hosp.
                  </label>
                  <DatePicker
                    placeholder="dd/mm"
                    format="DD/MM"
                    size="small"
                    style={{ width: "100%" }}
                  />
                </div>
              </td>
              <td>
                <div>
                  <label style={{ fontSize: "12px", display: "block" }}>
                    Fecha hoja Cirugía
                  </label>
                  <DatePicker
                    placeholder="dd/mm"
                    format="DD/MM"
                    size="small"
                    style={{ width: "100%" }}
                  />
                </div>
              </td>
              <td>
                <div>
                  <label style={{ fontSize: "12px", display: "block" }}>
                    Fecha hoja Urgencia
                  </label>
                  <DatePicker
                    placeholder="dd/mm"
                    format="DD/MM"
                    size="small"
                    style={{ width: "100%" }}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title="Ver epicrisis"
        size="xl"
      >
        <Epicrisis setOpen={setOpen} />
      </Modal>
      <Modal
        open={openActo}
        onClose={() => {
          setOpenActo(false);
        }}
        title="Ver acto"
        size="xl"
      >
        <Acto setOpen={setOpenActo} />
      </Modal>
    </Container>
  );
};

export default CareManagementContainer;
