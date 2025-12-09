"use client";

import CustomButton from "@/components/button";
import { Container } from "@/components/container";
import Modal from "@/components/modal";
import Title from "@/components/title";
import useDictionary from "@/locales/dictionary-hook";
import { useState } from "react";
import InsuranceCompaniesForm from "./insuranceCompaniesForm";
import InsuranceTable from "./table";

export default function InsuranceCompaniesContainer() {
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setOpen(true);
  };

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title children={dict.insuranceCompanies.title} level={3} />
        <CustomButton onClick={() => setOpen(true)} variant="primary" size="lg">
          {dict.insuranceCompanies.create}
        </CustomButton>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={dict.insuranceCompanies.create}
        size="xl"
      >
        <InsuranceCompaniesForm />
      </Modal>
      <InsuranceTable onEdit={handleEdit} />
    </Container>
  );
}
