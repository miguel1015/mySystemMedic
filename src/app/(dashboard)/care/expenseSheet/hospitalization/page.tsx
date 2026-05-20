import ExpenseSheetModule from "../../../../container/care/expenseSheetModule"

export default function HospitalizationExpenseSheetPage() {
  return (
    <ExpenseSheetModule
      title="Hoja de Gastos Hospitalizacion"
      description="Gestion de medicamentos, insumos quirurgicos y material esteril utilizados por el paciente seleccionado."
      context="surgery"
    />
  )
}
