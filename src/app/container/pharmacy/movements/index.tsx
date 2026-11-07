"use client"

import { useState } from "react"
import { Button, DatePicker, Input, Select } from "antd"
import { HistoryOutlined } from "@ant-design/icons"
import type { Dayjs } from "dayjs"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { usePharmacyUsers } from "@/core/hooks/pharmacy/usePharmacy"
import type { MovementQuery, MovementType, PharmacyProduct } from "@/core/interfaces/pharmacy/types"
import { formatPersonName } from "@/core/utils/displayText"
import { PopupLayer, ProductSelect, WarehouseSelect, useDebounced } from "../shared/components"
import { MOVEMENT_META } from "../shared/format"
import MovementsTable from "../shared/MovementsTable"
import styles from "../shared/pharmacy.module.scss"

const TYPE_OPTIONS = (Object.keys(MOVEMENT_META) as MovementType[]).map((t) => ({
  value: t,
  label: MOVEMENT_META[t].label,
}))

export default function MovementsContainer() {
  const { data: users = [] } = usePharmacyUsers()
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [type, setType] = useState<MovementType | undefined>()
  const [product, setProduct] = useState<PharmacyProduct | null>(null)
  const [lotNumber, setLotNumber] = useState("")
  const [warehouseId, setWarehouseId] = useState<number | undefined>()
  const [patient, setPatient] = useState("")
  const [userId, setUserId] = useState<number | undefined>()
  const debouncedLot = useDebounced(lotNumber)
  const debouncedPatient = useDebounced(patient)

  const query: MovementQuery = {
    from: range?.[0]?.format("YYYY-MM-DD"),
    to: range?.[1]?.format("YYYY-MM-DD"),
    type,
    productType: product?.productType,
    productId: product?.productId,
    lotNumber: debouncedLot.trim() || undefined,
    warehouseId,
    patient: debouncedPatient.trim() || undefined,
    userId,
  }
  const active = Object.values(query).filter((v) => v !== undefined).length

  const clear = () => {
    setRange(null)
    setType(undefined)
    setProduct(null)
    setLotNumber("")
    setWarehouseId(undefined)
    setPatient("")
    setUserId(undefined)
  }

  return (
    <PopupLayer>
      <Container>
        <PageHeader
          icon={<HistoryOutlined />}
          title="Movimientos de inventario"
          subtitle="Entradas, salidas, traslados, dispensaciones y ajustes. Haga clic en una fila para ver el detalle."
        />

        <div className={styles.toolbar}>
          <DatePicker.RangePicker
            format="DD/MM/YYYY"
            value={range}
            onChange={(v) => setRange(v)}
            allowEmpty={[true, true]}
            placeholder={["Desde", "Hasta"]}
            aria-label="Rango de fechas"
          />
          <Select
            className={styles.filter}
            placeholder="Tipo de movimiento"
            allowClear
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
            aria-label="Tipo de movimiento"
          />
          <WarehouseSelect
            className={styles.filter}
            placeholder="Todas las bodegas"
            value={warehouseId}
            onChange={setWarehouseId}
            allowClear
          />
          <Select
            className={styles.filter}
            placeholder="Responsable"
            allowClear
            showSearch
            optionFilterProp="label"
            value={userId}
            onChange={setUserId}
            options={users.map((u) => ({ value: u.id, label: formatPersonName(u.name) }))}
            aria-label="Usuario responsable"
          />
        </div>
        <div className={styles.toolbar}>
          <div style={{ width: "min(100%, 380px)" }}>
            <ProductSelect value={product} onChange={setProduct} placeholder="Medicamento o insumo" />
          </div>
          <Input
            className={styles.filter}
            placeholder="Número de lote"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            allowClear
            aria-label="Número de lote"
          />
          <Input
            className={styles.filter}
            placeholder="Paciente (documento o nombre)"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            allowClear
            aria-label="Paciente"
          />
          {active > 0 && (
            <Button type="link" onClick={clear}>
              Limpiar filtros
            </Button>
          )}
        </div>

        <MovementsTable query={query} />
      </Container>
    </PopupLayer>
  )
}
