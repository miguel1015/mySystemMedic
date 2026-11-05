import { useCallback, useState } from "react"
import type { TablePaginationConfig } from "antd"

// Numeración continua para la columna "#" de una tabla antd paginada.
//
// El `index` que antd pasa a `render` es la posición DENTRO de la página, así que
// usar `index + 1` reinicia la cuenta en cada página (la página 2 empezaba en 1).
// Este hook escucha el `onChange` de la tabla para saber en qué página está, sin
// controlar la paginación: la tabla sigue funcionando exactamente igual.
//
//   const { onTableChange, rowNumber } = useRowNumbering(filtered.length)
//   render: (_v, _r, index) => rowNumber(index)
//   <Table onChange={onTableChange} … />
export function useRowNumbering(total: number, initialPageSize = 10) {
  const [paging, setPaging] = useState({ current: 1, pageSize: initialPageSize })

  const onTableChange = useCallback(
    (pagination: TablePaginationConfig) => {
      setPaging({
        current: pagination.current ?? 1,
        pageSize: pagination.pageSize ?? initialPageSize,
      })
    },
    [initialPageSize],
  )

  // Si una búsqueda deja menos resultados y la página actual queda fuera de rango,
  // antd muestra la última página disponible; aquí se hace el mismo ajuste.
  const lastPage = Math.max(1, Math.ceil(total / paging.pageSize))
  const current = Math.min(paging.current, lastPage)

  const rowNumber = useCallback(
    (index: number) => (current - 1) * paging.pageSize + index + 1,
    [current, paging.pageSize],
  )

  return { onTableChange, rowNumber }
}
