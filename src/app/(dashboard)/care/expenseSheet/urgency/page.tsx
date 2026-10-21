import { Suspense } from "react"
import ExpenseSheet from "../../../../container/care/expenseSheet"

interface PageProps {
  searchParams: { admissionId?: string }
}

export default function UrgencyExpenseSheetPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <ExpenseSheet key={searchParams.admissionId} tipoHoja="Urgencias" />
    </Suspense>
  )
}
