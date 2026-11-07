"use client"

import { useState } from "react"
import { Alert, Button, DatePicker, Input, InputNumber, Select, Tooltip } from "antd"
import { DeleteOutlined, ImportOutlined, PlusOutlined } from "@ant-design/icons"
import dayjs, { type Dayjs } from "dayjs"
import toast from "react-hot-toast"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { lookupLot, useRegisterEntry, useSuppliers } from "@/core/hooks/pharmacy/usePharmacy"
import type { LotLookup, Movement, PharmacyProduct } from "@/core/interfaces/pharmacy/types"
import { formatInstitutionName } from "@/core/utils/displayText"
import {
  OperationSuccess,
  PopupLayer,
  ProductSelect,
  WarehouseSelect,
  useCurrentUserName,
  useWarehouseName,
} from "../shared/components"
import { fmtDate, fmtQty, fmtUnit, productKey, todayIso } from "../shared/format"
import styles from "../shared/pharmacy.module.scss"

interface Line {
  key: number
  product: PharmacyProduct | null
  lotNumber: string
  manufactureDate: string | null
  expirationDate: string | null
  quantity: number | null
  // Si el lote ya existe se reutiliza con su vencimiento (no se sobrescribe).
  existing: LotLookup | null
}

let nextKey = 1
const newLine = (): Line => ({
  key: nextKey++,
  product: null,
  lotNumber: "",
  manufactureDate: null,
  expirationDate: null,
  quantity: null,
  existing: null,
})

const toIso = (d: Dayjs | null) => (d ? d.format("YYYY-MM-DD") : null)
const toDay = (s: string | null) => (s ? dayjs(s) : null)

function lineError(line: Line, today: string): string | null {
  if (!line.product) return "Seleccione el medicamento o insumo."
  if (!line.lotNumber.trim()) return "Ingrese el número de lote."
  if (!line.expirationDate) return "Ingrese la fecha de vencimiento."
  if (line.expirationDate < today) return "El lote ya está vencido; no se puede ingresar."
  if (line.manufactureDate && line.manufactureDate > line.expirationDate)
    return "La fecha de fabricación no puede ser posterior al vencimiento."
  if (line.manufactureDate && line.manufactureDate > today) return "La fecha de fabricación no puede ser futura."
  if (!line.quantity || line.quantity <= 0) return "La cantidad debe ser mayor a cero."
  return null
}

export default function EntriesContainer() {
  const today = todayIso()
  const userName = useCurrentUserName()
  const register = useRegisterEntry()
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers()

  const [warehouseId, setWarehouseId] = useState<number | undefined>()
  const [supplierId, setSupplierId] = useState<number | undefined>()
  const [supportDocument, setSupportDocument] = useState("")
  const [documentDate, setDocumentDate] = useState<string | null>(today)
  const [observations, setObservations] = useState("")
  const [lines, setLines] = useState<Line[]>([newLine()])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<Movement | null>(null)
  const warehouseName = useWarehouseName(warehouseId)

  const update = (key: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  // Al salir del número de lote se busca si ya existe para ese producto.
  const checkLot = async (line: Line) => {
    const number = line.lotNumber.trim()
    if (!line.product || !number) return
    try {
      const found = await lookupLot(line.product.productType, line.product.productId, number)
      update(line.key, {
        existing: found,
        ...(found
          ? { expirationDate: found.expirationDate, manufactureDate: found.manufactureDate ?? null }
          : line.existing
            ? { expirationDate: null, manufactureDate: null }
            : {}),
      })
    } catch {
      // Si falla la consulta, el backend valida igual al guardar.
    }
  }

  const duplicateKeys = (() => {
    const seen = new Map<string, number>()
    lines.forEach((l) => {
      if (!l.product || !l.lotNumber.trim()) return
      const k = `${productKey(l.product.productType, l.product.productId)}|${l.lotNumber.trim().toUpperCase()}`
      seen.set(k, (seen.get(k) ?? 0) + 1)
    })
    return seen
  })()

  const errors = lines.map((l) => {
    const err = lineError(l, today)
    if (err) return err
    const k = `${productKey(l.product!.productType, l.product!.productId)}|${l.lotNumber.trim().toUpperCase()}`
    return (duplicateKeys.get(k) ?? 0) > 1 ? "Este lote está repetido en la entrada." : null
  })
  const valid = !!warehouseId && lines.length > 0 && errors.every((e) => !e) && (!documentDate || documentDate <= today)
  const totalUnits = lines.reduce((sum, l) => sum + (l.quantity ?? 0), 0)

  const reset = () => {
    setSupplierId(undefined)
    setSupportDocument("")
    setDocumentDate(today)
    setObservations("")
    setLines([newLine()])
    setSubmitted(false)
    setResult(null)
  }

  const submit = () => {
    setSubmitted(true)
    if (!valid || !warehouseId) {
      toast.error("Revise los datos marcados antes de registrar la entrada.")
      return
    }
    register.mutate(
      {
        warehouseId,
        supplierId: supplierId ?? null,
        supportDocument: supportDocument.trim() || null,
        documentDate,
        observations: observations.trim() || null,
        items: lines.map((l) => ({
          productType: l.product!.productType,
          productId: l.product!.productId,
          lotNumber: l.lotNumber.trim(),
          manufactureDate: l.manufactureDate,
          expirationDate: l.expirationDate!,
          quantity: l.quantity!,
        })),
      },
      {
        onSuccess: (movement) => {
          toast.success("Entrada registrada")
          setResult(movement)
        },
        onError: (e: Error) => toast.error(e.message, { duration: 6000 }),
      },
    )
  }

  return (
    <PopupLayer>
      <Container>
        <PageHeader
          icon={<ImportOutlined />}
          title="Registrar entrada"
          subtitle="Ingreso de medicamentos e insumos al inventario, por lote"
        />

        {result ? (
          <OperationSuccess
            movement={result}
            title="Entrada registrada"
            onNew={reset}
            newLabel="Registrar otra entrada"
          />
        ) : (
          <div className={styles.layout}>
            <div className={styles.stack}>
              <section className={styles.panel} aria-labelledby="entry-doc">
                <div className={styles.panelHead}>
                  <span className={styles.step}>1</span>
                  <h2 id="entry-doc" className={styles.panelTitle}>
                    Destino y documento
                  </h2>
                </div>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label className={styles.required}>Bodega de destino</label>
                    <WarehouseSelect
                      value={warehouseId}
                      onChange={setWarehouseId}
                      status={submitted && !warehouseId ? "error" : undefined}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Proveedor</label>
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      placeholder="Opcional"
                      loading={loadingSuppliers}
                      value={supplierId}
                      onChange={setSupplierId}
                      options={suppliers.map((s) => ({
                        value: s.id,
                        label: `${formatInstitutionName(s.name)} · NIT ${s.nit}`,
                      }))}
                      notFoundContent="No hay proveedores activos"
                      aria-label="Proveedor"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Factura o documento soporte</label>
                    <Input
                      value={supportDocument}
                      onChange={(e) => setSupportDocument(e.target.value)}
                      maxLength={100}
                      placeholder="Opcional · FAC-12345"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Fecha de ingreso</label>
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={toDay(documentDate)}
                      onChange={(d) => setDocumentDate(toIso(d))}
                      disabledDate={(d) => d.isAfter(dayjs(), "day")}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <label>Observaciones</label>
                    <Input.TextArea
                      rows={2}
                      maxLength={2000}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </section>

              <section className={styles.panel} aria-labelledby="entry-lines">
                <div className={styles.panelHead}>
                  <span className={styles.step}>2</span>
                  <h2 id="entry-lines" className={styles.panelTitle}>
                    Productos y lotes
                  </h2>
                  <p className={styles.panelHint}>Un mismo producto puede ingresar con varios lotes</p>
                </div>

                <div className={styles.lines}>
                  {lines.map((line, i) => {
                    const error = submitted ? errors[i] : null
                    return (
                      <div key={line.key} className={styles.line}>
                        <div className={styles.lineHead}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <ProductSelect
                              value={line.product}
                              onChange={(product) =>
                                update(line.key, {
                                  product,
                                  existing: null,
                                  expirationDate: null,
                                  manufactureDate: null,
                                })
                              }
                              status={submitted && !line.product ? "error" : undefined}
                            />
                          </div>
                          <Tooltip title="Quitar">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              disabled={lines.length === 1}
                              onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                              aria-label="Quitar producto"
                            />
                          </Tooltip>
                        </div>
                        <div className={styles.grid}>
                          <div className={styles.field}>
                            <label className={styles.required}>Número de lote</label>
                            <Input
                              value={line.lotNumber}
                              onChange={(e) => update(line.key, { lotNumber: e.target.value.toUpperCase() })}
                              onBlur={() => checkLot(line)}
                              maxLength={50}
                              placeholder="L2026A"
                              status={submitted && !line.lotNumber.trim() ? "error" : undefined}
                            />
                          </div>
                          <div className={styles.field}>
                            <label>Fecha de fabricación</label>
                            <DatePicker
                              format="DD/MM/YYYY"
                              value={toDay(line.manufactureDate)}
                              onChange={(d) => update(line.key, { manufactureDate: toIso(d) })}
                              disabled={!!line.existing}
                              disabledDate={(d) => d.isAfter(dayjs(), "day")}
                              placeholder="Opcional"
                              style={{ width: "100%" }}
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.required}>Fecha de vencimiento</label>
                            <DatePicker
                              format="DD/MM/YYYY"
                              value={toDay(line.expirationDate)}
                              onChange={(d) => update(line.key, { expirationDate: toIso(d) })}
                              disabled={!!line.existing}
                              disabledDate={(d) => d.isBefore(dayjs(), "day")}
                              status={submitted && !line.expirationDate ? "error" : undefined}
                              style={{ width: "100%" }}
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.required}>
                              Cantidad recibida{line.product ? ` (${fmtUnit(line.product.unit)})` : ""}
                            </label>
                            <InputNumber
                              min={0.01}
                              step={1}
                              precision={2}
                              value={line.quantity}
                              onChange={(v) => update(line.key, { quantity: v })}
                              style={{ width: "100%" }}
                              status={submitted && !(line.quantity && line.quantity > 0) ? "error" : undefined}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        {line.existing && (
                          <p className={styles.sub} style={{ marginTop: 8, marginBottom: 0 }}>
                            Lote ya registrado (vence {fmtDate(line.existing.expirationDate)}): la cantidad se suma a su
                            existencia en la bodega.
                          </p>
                        )}
                        {error && (
                          <p className={styles.lineError} role="alert">
                            {error}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  <Button icon={<PlusOutlined />} onClick={() => setLines((prev) => [...prev, newLine()])}>
                    Agregar otro producto o lote
                  </Button>
                </div>
              </section>
            </div>

            <aside className={`${styles.panel} ${styles.summary}`} aria-label="Resumen de la entrada">
              <h2 className={styles.panelTitle} style={{ marginBottom: 14 }}>
                Resumen
              </h2>
              <dl className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <dt>Bodega</dt>
                  <dd>{warehouseName ?? "—"}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Líneas</dt>
                  <dd>{lines.length}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Unidades</dt>
                  <dd>{fmtQty(totalUnits)}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Responsable</dt>
                  <dd>{userName}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Fecha y hora</dt>
                  <dd>Al confirmar</dd>
                </div>
              </dl>
              {submitted && !valid && (
                <Alert type="error" showIcon style={{ marginBottom: 12 }} message="Hay datos por corregir." />
              )}
              <Button type="primary" block size="large" loading={register.isPending} onClick={submit}>
                Registrar entrada
              </Button>
            </aside>
          </div>
        )}
      </Container>
    </PopupLayer>
  )
}
