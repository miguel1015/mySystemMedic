"use client";

import { useState } from "react";
import { Container } from "../../../../components/container";
import Title from "../../../../components/title";
import { Button } from "antd";
import Modal from "../../../../components/modal";
import Epicrisis from "./epicrisis";
import Acto from "./acto";

const CareManagementContainer = () => {
  const [open, setOpen] = useState(false);
  const [openActo, setOpenActo] = useState(false);

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children="Gestión asistencial" level={3} />
        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={() => setOpen(true)} type="primary">
            Epicrisis
          </Button>
          <Button onClick={() => setOpenActo(true)} type="primary">
            Acto
          </Button>
        </div>
      </div>

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
