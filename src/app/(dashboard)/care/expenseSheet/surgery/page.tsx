import ExpenseSheetModule from "../../../../container/care/expenseSheetModule"

export default function SurgeryExpenseSheetPage() {
  return (
    <ExpenseSheetModule
      title="Hoja Gastos de Cirugia"
      description="Gestion de medicamentos, insumos quirurgicos y material esteril utilizados por el paciente seleccionado."
      context="surgery"
    />
  )
}
