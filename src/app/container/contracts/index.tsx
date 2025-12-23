"use client";

import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { Button } from "antd";
import dynamic from "next/dynamic";
import { useState } from "react";

const ContractForm = dynamic(() => import("./contractForm"), {
  loading: () => <p>Cargando formulario...</p>,
});

export default function ContractsContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children={dict.contracts.title} level={3} />
        <Button onClick={() => setOpen(true)} type="primary">
          {dict.contracts.newContract}
        </Button>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={dict.contracts.newContract}
          size="xl"
        >
          <ContractForm />
        </Modal>
      </div>
    </Container>
  );
}
