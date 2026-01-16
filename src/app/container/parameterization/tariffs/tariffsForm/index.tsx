import { zodResolver } from "@hookform/resolvers/zod";
import GridContainer from "../../../../../components/componentLayout";
import Input from "@/components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "antd";
import { TUtils } from "../../../../../types/utils";

const TariffsForm: React.FC<TUtils> = ({ setOpen }) => {
  const schema = z.object({
    name: z.string().min(1, "Nombre del tarifario es obligatorio"),
    id: z
      .number({
        required_error: "ID de codificación verificación es obligatorio",
        invalid_type_error: "ID de codificación es obligatorio",
      })
      .positive("ID de codificación es obligatorio"),
  });
  type TTariffsForm = z.infer<typeof schema>;

  const { control, handleSubmit } = useForm<TTariffsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      id: undefined,
    },
  });

  const onSubmit = () => {
    toast.success("Formulario solo visual");
    setOpen(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer columns="col-4" gap="g-3" container>
          <Input
            name="name"
            label="Nombre del tarifario"
            placeholder="Nombre del tarifario"
            control={control}
          />
          <Input
            type="number"
            name="id"
            label="ID de codificación"
            placeholder="ID de codificación"
            control={control}
          />
        </GridContainer>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button>Cancelar</Button>
          <Button type="primary" htmlType="submit">
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TariffsForm;
