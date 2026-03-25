import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelectOptions } from "./useSelectOptions";

interface UsePatientFormProps {
  setOpen: (open: boolean) => void;
  editPatientId: number | null;
  setEditPatientId: (id: number | null) => void;
}

export function usePatientForm({
  setOpen,
  editPatientId,
  setEditPatientId,
}: UsePatientFormProps) {
  const { control, handleSubmit, reset } = useForm();
  const selectOptions = useSelectOptions();

  // TODO: Conectar con API real cuando esté disponible
  const onSubmit = () => {
    if (editPatientId) {
      toast.success("Solo visual: edición de paciente no disponible aún");
    } else {
      toast.success("Solo visual: creación de paciente no disponible aún");
    }
    reset();
    setOpen(false);
    setEditPatientId(null);
  };

  const handleCancel = () => {
    reset();
    setOpen(false);
    setEditPatientId(null);
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    handleCancel,
    isEditing: !!editPatientId,
    ...selectOptions,
  };
}
