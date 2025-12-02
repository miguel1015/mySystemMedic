import { z } from "zod";

export const ContractSchema = z.object({
  documentTypeId: z.number().min(1, "Tipo de documento es obligatorio"),
});
