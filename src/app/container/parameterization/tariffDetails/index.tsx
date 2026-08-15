"use client";

import { Container } from "@/components/container";
import Title from "@/components/title";
import TariffDetailsTable from "./table";

export default function TariffDetailsContainer() {
  return (
    <Container>
      <Title children="Tarifas de detalle" level={3} />
      <TariffDetailsTable />
    </Container>
  );
}
