"use client"

import { useState } from "react"
import { Alert, Button, Empty, Input, InputNumber, Select, Spin, Tag, Tooltip } from "antd"
import { DeleteOutlined, MedicineBoxOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons"
import toast from "react-hot-toast"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { PersonCell, formatDocument } from "@/components/dataTable/cells"
import Modal from "@/components/modal"
import { fetchLots, usePharmacyPatients, useRegisterDispensation } from "@/core/hooks/pharmacy/usePharmacy"
import type { LotAvailability, Movement, PharmacyPatient, PharmacyProduct } from "@/core/interfaces/pharmacy/types"
import { formatCatalogLabel, formatPersonName } from "@/core/utils/displayText"
import {
  OperationSuccess,
  PopupLayer,
  ProductSelect,
  WarehouseSelect,
  useCurrentUserName,
  useDebounced,
  useWarehouseName,
} from "../shared/components"
import { expiryHint, fmtDate, fmtDateTime, fmtQty, fmtUnit, productKey } from "../shared/format"
import MovementsTable from "../shared/MovementsTable"
import styles from "../shared/pharmacy.module.scss"

interface Item {
  key: number
  product: PharmacyProduct
  requested: number | null
  lots: LotAvailability[]
  loadingLots: boolean
  // Cantidad a entregar de cada lote (lotId -> cantidad).
  allocation: Record<number, number>
}

let nextKey = 1

const round2 = (n: number) => Math.round(n * 100) / 100
const delivered = (item: Item) => round2(Object.values(item.allocation).reduce((s, q) => s + (q || 0), 0))

// FEFO: se toma primero del lote que vence antes (los lotes ya llegan ordenados).
function allocateFefo(lots: LotAvailability[], requested: number | null): Record<number, number> {
  const allocation: Record<number, number> = {}
  let pending = requested ?? 0
  for (const lot of lots) {
    if (pending <= 0) break
    const take = Math.min(lot.quantity, pending)
    if (take > 0) allocation[lot.lotId] = round2(take)
    pending = round2(pending - take)
  }
  return allocation
}

function itemError(item: Item): string | null {
  if (!item.requested || item.requested <= 0) return "Ingrese la cantidad solicitada."
  const total = delivered(item)
  if (total <= 0) return "Indique cuánto se entrega de al menos un lote."
  if (total > item.requested) return "La cantidad entregada supera la solicitada."
  for (const lot of item.lots) {
    if ((item.allocation[lot.lotId] ?? 0) > lot.quantity)
      return `El lote ${lot.lotNumber} solo tiene ${fmtQty(lot.quantity)} disponibles.`
  }
  return null
}

function PatientPicker({
  patient,
  onSelect,
}: {
  patient: PharmacyPatient | null
  onSelect: (p: PharmacyPatient | null) => void
}) {
  const [search, setSearch] = useState("")
  const debounced = useDebounced(search)
  const { data = [], isFetching } = usePharmacyPatients(debounced)
  const options = patient && !data.some((p) => p.id === patient.id) ? [patient, ...data] : data

  return (
    <Select
      style={{ width: "100%" }}
      size="large"
      showSearch
      filterOption={false}
      searchValue={search}
      onSearch={setSearch}
      value={patient?.id}
      onChange={(id) => {
        onSelect(options.find((p) => p.id === id) ?? null)
        setSearch("")
      }}
      allowClear
      onClear={() => onSelect(null)}
      loading={isFetching}
      placeholder="Buscar por número de identificación o nombre (mínimo 3 caracteres)"
      aria-label="Paciente"
      notFoundContent={
        debounced.trim().length < 3
          ? "Escriba al menos 3 caracteres"
          : isFetching
            ? "Buscando…"
            : "Ningún paciente coincide"
      }
      options={options.map((p) => ({
        value: p.id,
        label: `${formatPersonName(p.fullName)} · ${formatDocument(p.documentType, p.documentNumber)}`,
      }))}
    />
  )
}

export default function DispensingContainer() {
  const userName = useCurrentUserName()
  const register = useRegisterDispensation()

  const [patient, setPatient] = useState<PharmacyPatient | null>(null)
  const [admissionId, setAdmissionId] = useState<number | undefined>()
  const [warehouseId, setWarehouseId] = useState<number | undefined>()
  const [items, setItems] = useState<Item[]>([])
  const [adding, setAdding] = useState<PharmacyProduct | null>(null)
  const [observations, setObservations] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<Movement | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const warehouseName = useWarehouseName(warehouseId)

  const updateItem = (key: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)))

  const selectPatient = (p: PharmacyPatient | null) => {
    setPatient(p)
    // Si tiene una sola admisión activa se asocia de una vez.
    setAdmissionId(p?.activeAdmissions.length === 1 ? p.activeAdmissions[0].id : undefined)
  }

  const changeWarehouse = (id: number | undefined) => {
    if (items.length > 0 && id !== warehouseId) toast("Se quitaron los productos: los lotes dependen de la bodega.")
    setWarehouseId(id)
    setItems([])
  }

  const loadLots = async (key: number, product: PharmacyProduct, requested: number | null) => {
    if (!warehouseId) return
    updateItem(key, { loadingLots: true })
    try {
      const lots = await fetchLots({ warehouseId, productType: product.productType, productId: product.productId })
      updateItem(key, { lots, loadingLots: false, allocation: allocateFefo(lots, requested) })
    } catch (e) {
      updateItem(key, { loadingLots: false })
      toast.error((e as Error).message)
    }
  }

  const addProduct = (product: PharmacyProduct | null) => {
    if (!product) return
    const key = nextKey++
    setItems((prev) => [...prev, { key, product, requested: 1, lots: [], loadingLots: true, allocation: {} }])
    setAdding(null)
    loadLots(key, product, 1)
  }

  const errors = items.map(itemError)
  const valid = !!patient && !!warehouseId && items.length > 0 && errors.every((e) => !e)

  const reset = () => {
    setPatient(null)
    setAdmissionId(undefined)
    setItems([])
    setObservations("")
    setSubmitted(false)
    setConfirming(false)
    setResult(null)
  }

  const askConfirm = () => {
    setSubmitted(true)
    if (!valid) {
      toast.error(
        !patient
          ? "Seleccione el paciente."
          : !warehouseId
            ? "Seleccione la bodega."
            : "Revise los productos marcados.",
      )
      return
    }
    setConfirming(true)
  }

  const submit = () => {
    if (!patient || !warehouseId) return
    register.mutate(
      {
        patientId: patient.id,
        admissionId: admissionId ?? null,
        warehouseId,
        observations: observations.trim() || null,
        items: items.map((i) => ({
          productType: i.product.productType,
          productId: i.product.productId,
          requestedQuantity: i.requested!,
          lots: Object.entries(i.allocation)
            .filter(([, q]) => q > 0)
            .map(([lotId, quantity]) => ({ lotId: Number(lotId), quantity })),
        })),
      },
      {
        onSuccess: (movement) => {
          toast.success("Entrega registrada")
          setConfirming(false)
          setResult(movement)
        },
        onError: (e: Error) => {
          setConfirming(false)
          toast.error(e.message, { duration: 7000 })
          // Otro usuario pudo mover el inventario: se recargan los lotes.
          items.forEach((i) => loadLots(i.key, i.product, i.requested))
        },
      },
    )
  }

  const totalDelivered = items.reduce((s, i) => s + delivered(i), 0)

  return (
    <PopupLayer>
      <Container>
        <PageHeader
          icon={<MedicineBoxOutlined />}
          title="Dispensación a paciente"
          subtitle="Entrega de medicamentos e insumos con descuento automático por lote (FEFO)"
        />

        {result ? (
          <OperationSuccess movement={result} title="Entrega registrada" onNew={reset} newLabel="Nueva dispensación" />
        ) : (
          <div className={styles.layout}>
            <div className={styles.stack}>
              {/* 1. Paciente */}
              <section className={styles.panel} aria-labelledby="disp-patient">
                <div className={styles.panelHead}>
                  <span className={styles.step}>1</span>
                  <h2 id="disp-patient" className={styles.panelTitle}>
                    Paciente
                  </h2>
                  {patient && (
                    <Button type="link" size="small" className={styles.panelHint} onClick={() => setShowHistory(true)}>
                      Ver dispensaciones anteriores
                    </Button>
                  )}
                </div>
                <PatientPicker patient={patient} onSelect={selectPatient} />
                {submitted && !patient && <p className={styles.lineError}>Seleccione el paciente.</p>}
                {patient && (
                  <div className={styles.grid} style={{ marginTop: 14, alignItems: "end" }}>
                    <PersonCell
                      name={formatPersonName(patient.fullName)}
                      detail={formatDocument(patient.documentType, patient.documentNumber)}
                    />
                    <div className={styles.field}>
                      <label>Admisión (si aplica)</label>
                      <Select
                        allowClear
                        value={admissionId}
                        onChange={setAdmissionId}
                        placeholder={patient.activeAdmissions.length ? "Sin admisión" : "No tiene admisiones activas"}
                        disabled={patient.activeAdmissions.length === 0}
                        options={patient.activeAdmissions.map((a) => ({
                          value: a.id,
                          label: `#${a.id} · ${fmtDateTime(a.admissionDate)}${a.careScope ? ` · ${formatCatalogLabel(a.careScope)}` : ""}`,
                        }))}
                        aria-label="Admisión"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* 2. Bodega */}
              <section className={styles.panel} aria-labelledby="disp-warehouse">
                <div className={styles.panelHead}>
                  <span className={styles.step}>2</span>
                  <h2 id="disp-warehouse" className={styles.panelTitle}>
                    Bodega de entrega
                  </h2>
                </div>
                <WarehouseSelect
                  value={warehouseId}
                  onChange={changeWarehouse}
                  status={submitted && !warehouseId ? "error" : undefined}
                />
              </section>

              {/* 3. Productos */}
              <section className={styles.panel} aria-labelledby="disp-items">
                <div className={styles.panelHead}>
                  <span className={styles.step}>3</span>
                  <h2 id="disp-items" className={styles.panelTitle}>
                    Medicamentos e insumos
                  </h2>
                  <p className={styles.panelHint}>Solo lotes vigentes, del que vence primero al último</p>
                </div>

                <div className={styles.lines}>
                  {items.length === 0 && (
                    <div className={styles.emptyLines}>
                      {warehouseId
                        ? "Busque un producto para agregarlo a la entrega."
                        : "Seleccione primero la bodega desde la que se entrega."}
                    </div>
                  )}

                  {items.map((item, idx) => {
                    const total = delivered(item)
                    const available = item.lots.reduce((s, l) => s + l.quantity, 0)
                    const error = submitted ? errors[idx] : null
                    const partial = !errors[idx] && item.requested != null && total < item.requested
                    return (
                      <div key={item.key} className={styles.line}>
                        <div className={styles.lineHead}>
                          <span className={styles.product}>
                            <span className={styles.productName}>{item.product.name}</span>
                            <span className={styles.sub}>
                              {[item.product.productType, item.product.code, item.product.detail]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          <Tooltip title="Quitar">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => setItems((prev) => prev.filter((i) => i.key !== item.key))}
                              aria-label={`Quitar ${item.product.name}`}
                            />
                          </Tooltip>
                        </div>

                        <div className={styles.grid} style={{ marginBottom: 12 }}>
                          <div className={styles.field}>
                            <label className={styles.required}>
                              Cantidad solicitada ({fmtUnit(item.product.unit)})
                            </label>
                            <InputNumber
                              min={0.01}
                              precision={2}
                              value={item.requested}
                              onChange={(v) =>
                                updateItem(item.key, { requested: v, allocation: allocateFefo(item.lots, v) })
                              }
                              style={{ width: "100%" }}
                              status={submitted && !(item.requested && item.requested > 0) ? "error" : undefined}
                            />
                          </div>
                          <div className={styles.field}>
                            <label>Cantidad entregada</label>
                            <div className={styles.qty} style={{ fontSize: 20, lineHeight: "32px" }}>
                              {fmtQty(total)} <span className={styles.sub}>de {fmtQty(available)} disponibles</span>
                            </div>
                          </div>
                        </div>

                        {item.loadingLots ? (
                          <Spin size="small" />
                        ) : item.lots.length === 0 ? (
                          <Alert
                            type="warning"
                            showIcon
                            message="No hay lotes vigentes con existencia en esta bodega."
                          />
                        ) : (
                          <div className={styles.lotTableWrap}>
                            <table className={styles.lotTable}>
                              <thead>
                                <tr>
                                  <th>Lote</th>
                                  <th>Vencimiento</th>
                                  <th style={{ textAlign: "right" }}>Existencia</th>
                                  <th style={{ width: 150 }}>Entregar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.lots.map((lot) => (
                                  <tr key={lot.lotId}>
                                    <td>
                                      <span className={styles.mono}>{lot.lotNumber}</span>{" "}
                                      {lot.suggested && <Tag color="green">Sugerido</Tag>}
                                    </td>
                                    <td>
                                      {fmtDate(lot.expirationDate)}
                                      <div
                                        className={styles.sub}
                                        style={lot.isNearExpiry ? { color: "#b45309" } : undefined}
                                      >
                                        {expiryHint(lot.daysToExpire)}
                                      </div>
                                    </td>
                                    <td style={{ textAlign: "right" }} className={styles.qty}>
                                      {fmtQty(lot.quantity)}
                                    </td>
                                    <td>
                                      <InputNumber
                                        min={0}
                                        max={lot.quantity}
                                        precision={2}
                                        size="small"
                                        value={item.allocation[lot.lotId] ?? 0}
                                        onChange={(v) =>
                                          updateItem(item.key, {
                                            allocation: { ...item.allocation, [lot.lotId]: v ?? 0 },
                                          })
                                        }
                                        style={{ width: "100%" }}
                                        aria-label={`Cantidad a entregar del lote ${lot.lotNumber}`}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {error && (
                          <p className={styles.lineError} role="alert">
                            {error}
                          </p>
                        )}
                        {partial && total > 0 && (
                          <p className={styles.sub} style={{ marginTop: 8, marginBottom: 0, color: "#b45309" }}>
                            Entrega parcial: faltan {fmtQty(round2(item.requested! - total))}{" "}
                            {fmtUnit(item.product.unit)}.
                          </p>
                        )}
                      </div>
                    )
                  })}

                  <div className={styles.field}>
                    <label>
                      <PlusOutlined aria-hidden /> Agregar producto
                    </label>
                    <ProductSelect
                      value={adding}
                      onChange={addProduct}
                      warehouseId={warehouseId}
                      requireWarehouse
                      excludeKeys={items.map((i) => productKey(i.product.productType, i.product.productId))}
                      placeholder="Buscar en las existencias de la bodega"
                    />
                  </div>
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.field}>
                  <label htmlFor="disp-notes">Observaciones</label>
                  <Input.TextArea
                    id="disp-notes"
                    rows={2}
                    maxLength={2000}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </section>
            </div>

            <aside className={`${styles.panel} ${styles.summary}`} aria-label="Resumen de la entrega">
              <h2 className={styles.panelTitle} style={{ marginBottom: 14 }}>
                Resumen
              </h2>
              <dl className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <dt>Paciente</dt>
                  <dd>{patient ? formatPersonName(patient.fullName) : "—"}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Bodega</dt>
                  <dd>{warehouseName ?? "—"}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Productos</dt>
                  <dd>{items.length}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Unidades a entregar</dt>
                  <dd>{fmtQty(totalDelivered)}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Entrega</dt>
                  <dd>{userName}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Fecha y hora</dt>
                  <dd>Al confirmar</dd>
                </div>
              </dl>
              <Button type="primary" block size="large" onClick={askConfirm} icon={<UserOutlined />}>
                Confirmar entrega
              </Button>
            </aside>
          </div>
        )}

        <Modal
          open={confirming}
          onClose={() => !register.isPending && setConfirming(false)}
          title="Confirmar entrega"
          size="lg"
        >
          {patient && (
            <>
              <p style={{ marginTop: 0 }}>
                Se entregará a <strong>{formatPersonName(patient.fullName)}</strong> desde{" "}
                <strong>{warehouseName}</strong>. Las cantidades se descuentan de inmediato y el movimiento no se puede
                editar.
              </p>
              <div className={styles.lotTableWrap}>
                <table className={styles.lotTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Lote</th>
                      <th style={{ textAlign: "right" }}>Entregar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.flatMap((i) =>
                      i.lots
                        .filter((l) => (i.allocation[l.lotId] ?? 0) > 0)
                        .map((l) => (
                          <tr key={`${i.key}-${l.lotId}`}>
                            <td>{i.product.name}</td>
                            <td className={styles.mono}>{l.lotNumber}</td>
                            <td style={{ textAlign: "right" }} className={styles.qty}>
                              {fmtQty(i.allocation[l.lotId])} {fmtUnit(l.unit)}
                            </td>
                          </tr>
                        )),
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button onClick={() => setConfirming(false)} disabled={register.isPending}>
                  Volver
                </Button>
                <Button type="primary" loading={register.isPending} onClick={submit}>
                  Entregar y descontar
                </Button>
              </div>
            </>
          )}
        </Modal>

        <Modal
          open={showHistory}
          onClose={() => setShowHistory(false)}
          size="xl"
          title={patient ? `Dispensaciones · ${formatPersonName(patient.fullName)}` : ""}
        >
          {patient && showHistory ? (
            <MovementsTable compact query={{ patientId: patient.id, type: "Dispensacion" }} />
          ) : (
            <Empty />
          )}
        </Modal>
      </Container>
    </PopupLayer>
  )
}
