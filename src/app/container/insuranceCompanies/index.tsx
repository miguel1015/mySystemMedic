"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { useState } from "react";
import InsuranceCompaniesForm from "./insuranceCompaniesForm";

export default function InsuranceCompaniesContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children={dict.insuranceCompanies.title} level={3} />
        <CustomButton onClick={() => setOpen(true)} variant="primary" size="lg">
          {dict.insuranceCompanies.create}
        </CustomButton>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={dict.insuranceCompanies.create}
          size="xl"
        >
          <InsuranceCompaniesForm />
        </Modal>
      </div>
    </Container>
  );
}
