import ExpenseSheetModule from "../../../../container/care/expenseSheetModule"

export default function UrgencyExpenseSheetPage() {
  return (
    <ExpenseSheetModule
      title="Hoja de Gastos de Urgencias"
      description="Gestion de medicamentos, insumos quirurgicos y material esteril utilizados por el paciente seleccionado."
      context="surgery"
    />
  )
}
