"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { useState } from "react";
import ContractForm from "./contractForm";

export default function ContractsContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children={dict.contracts.title} level={3} />
        <CustomButton onClick={() => setOpen(true)} variant="primary" size="lg">
          {dict.contracts.newContract}
        </CustomButton>

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
