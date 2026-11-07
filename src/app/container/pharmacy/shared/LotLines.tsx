"use client"

import { Button, InputNumber, Radio, Select, Tag, Tooltip } from "antd"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { useLots } from "@/core/hooks/pharmacy/usePharmacy"
import type { Direction, LotAvailability, PharmacyProduct } from "@/core/interfaces/pharmacy/types"
import { ProductSelect } from "./components"
import { expiryHint, fmtDate, fmtQty, fmtUnit } from "./format"
import styles from "./pharmacy.module.scss"

export interface LotLine {
  key: number
  product: PharmacyProduct | null
  lot: LotAvailability | null
  quantity: number | null
  direction: Direction
}

let nextKey = 1
export const newLotLine = (direction: Direction = "Salida"): LotLine => ({
  key: nextKey++,
  product: null,
  lot: null,
  quantity: null,
  direction,
})

export function lotLineError(line: LotLine, all: LotLine[]): string | null {
  if (!line.product) return "Seleccione el medicamento o insumo."
  if (!line.lot) return "Seleccione el lote."
  if (!line.quantity || line.quantity <= 0) return "La cantidad debe ser mayor a cero."
  if (line.direction === "Salida" && line.quantity > line.lot.quantity)
    return `El lote solo tiene ${fmtQty(line.lot.quantity)} en la bodega.`
  if (all.filter((l) => l.lot?.lotId === line.lot!.lotId).length > 1) return "Este lote está repetido."
  return null
}

function LineRow({
  line,
  warehouseId,
  withDirection,
  canRemove,
  error,
  onChange,
  onRemove,
}: {
  line: LotLine
  warehouseId?: number
  withDirection?: boolean
  canRemove: boolean
  error: string | null
  onChange: (patch: Partial<LotLine>) => void
  onRemove: () => void
}) {
  // Lo que sale debe existir en la bodega (vencidos incluidos: se pueden dar de baja o
  // trasladar). Un ajuste que suma puede usar cualquier lote del producto.
  const adding = line.direction === "Entrada"
  const { data: lots = [], isFetching } = useLots({
    warehouseId,
    productType: line.product?.productType,
    productId: line.product?.productId,
    includeExpired: true,
    includeEmpty: adding,
  })

  return (
    <div className={styles.line}>
      <div className={styles.lineHead}>
        {withDirection && (
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            size="small"
            value={line.direction}
            onChange={(e) => onChange({ direction: e.target.value, product: null, lot: null })}
            options={[
              { value: "Salida", label: "Resta" },
              { value: "Entrada", label: "Suma" },
            ]}
            aria-label="Sentido del ajuste"
          />
        )}
        <span style={{ flex: 1 }} />
        <Tooltip title="Quitar">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={!canRemove}
            onClick={onRemove}
            aria-label="Quitar línea"
          />
        </Tooltip>
      </div>
      <div className={styles.grid}>
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.required}>Medicamento o insumo</label>
          <ProductSelect
            value={line.product}
            onChange={(product) => onChange({ product, lot: null })}
            warehouseId={adding ? undefined : warehouseId}
            requireWarehouse={!adding}
            includeExpired
          />
        </div>
        <div className={styles.field}>
          <label className={styles.required}>Lote</label>
          <Select
            value={line.lot?.lotId}
            onChange={(id) => onChange({ lot: lots.find((l) => l.lotId === id) ?? null })}
            disabled={!line.product || !warehouseId}
            loading={isFetching}
            placeholder={line.product ? "Seleccione el lote" : "Primero el producto"}
            aria-label="Lote"
            notFoundContent={adding ? "El producto no tiene lotes; regístrelo con una entrada." : "Sin existencias"}
            options={lots.map((l) => ({
              value: l.lotId,
              label: (
                <span>
                  <span className={styles.mono}>{l.lotNumber}</span> · vence {fmtDate(l.expirationDate)} ·{" "}
                  {fmtQty(l.quantity)} {fmtUnit(l.unit)}
                  {l.isExpired && (
                    <Tag color="red" style={{ marginLeft: 6 }}>
                      Vencido
                    </Tag>
                  )}
                </span>
              ),
            }))}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.required}>Cantidad{line.product ? ` (${fmtUnit(line.product.unit)})` : ""}</label>
          <InputNumber
            min={0.01}
            max={!adding && line.lot ? line.lot.quantity : undefined}
            precision={2}
            value={line.quantity}
            onChange={(v) => onChange({ quantity: v })}
            style={{ width: "100%" }}
            disabled={!line.lot}
          />
        </div>
      </div>
      {line.lot && (
        <p className={styles.sub} style={{ margin: "8px 0 0" }}>
          En la bodega: {fmtQty(line.lot.quantity)} {fmtUnit(line.lot.unit)} · {expiryHint(line.lot.daysToExpire)}
        </p>
      )}
      {error && (
        <p className={styles.lineError} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default function LotLines({
  lines,
  onChange,
  warehouseId,
  withDirection,
  submitted,
  addLabel = "Agregar otro lote",
}: {
  lines: LotLine[]
  onChange: (lines: LotLine[]) => void
  warehouseId?: number
  withDirection?: boolean
  submitted: boolean
  addLabel?: string
}) {
  return (
    <div className={styles.lines}>
      {lines.map((line) => (
        <LineRow
          key={line.key}
          line={line}
          warehouseId={warehouseId}
          withDirection={withDirection}
          canRemove={lines.length > 1}
          error={submitted ? lotLineError(line, lines) : null}
          onChange={(patch) => onChange(lines.map((l) => (l.key === line.key ? { ...l, ...patch } : l)))}
          onRemove={() => onChange(lines.filter((l) => l.key !== line.key))}
        />
      ))}
      <Button icon={<PlusOutlined />} onClick={() => onChange([...lines, newLotLine(lines.at(-1)?.direction)])}>
        {addLabel}
      </Button>
    </div>
  )
}
