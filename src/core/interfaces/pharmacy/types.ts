// Tipos del módulo de farmacia (MediNexus /api/pharmacy).
// Las fechas sin hora (vencimiento, fabricación) llegan como "yyyy-MM-dd".

export type ProductType = "Medicamento" | "Insumo"
export type InventoryStatus = "Disponible" | "ProximoAVencer" | "Vencido" | "Agotado"
export type MovementType = "Entrada" | "Salida" | "Traslado" | "Dispensacion" | "Ajuste"
export type Direction = "Entrada" | "Salida"

export interface Paged<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface Warehouse {
  id: number
  code: string
  name: string
  description?: string | null
  location?: string | null
  responsibleUserId?: number | null
  responsibleUserName?: string | null
  isVirtual: boolean
  isActive: boolean
  lotsWithStock: number
  totalQuantity: number
  canDelete: boolean
}

export interface WarehouseRequest {
  code: string
  name: string
  description?: string | null
  location?: string | null
  responsibleUserId?: number | null
  isVirtual: boolean
  isActive: boolean
}

export interface Supplier {
  id: number
  nit: string
  verificationDigit?: string | null
  name: string
  contactName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  isActive: boolean
  canDelete: boolean
}

export type SupplierRequest = Omit<Supplier, "id" | "canDelete">

export interface PharmacyUser {
  id: number
  name: string
  documentNumber?: string | null
}

export interface PharmacyPatient {
  id: number
  fullName: string
  documentType?: string | null
  documentNumber: string
  birthDate: string
  activeAdmissions: { id: number; admissionDate: string; careScope?: string | null }[]
}

export interface InventoryUnit {
  id: number
  name: string
}

export interface PharmacyProduct {
  productType: ProductType
  productId: number
  code?: string | null
  name: string
  detail?: string | null
  unit: string
  availableQuantity?: number | null
}

export interface LotAvailability {
  lotId: number
  lotNumber: string
  manufactureDate?: string | null
  expirationDate: string
  quantity: number
  unit: string
  isExpired: boolean
  isNearExpiry: boolean
  daysToExpire: number
  suggested: boolean
}

export interface LotLookup {
  lotId: number
  lotNumber: string
  manufactureDate?: string | null
  expirationDate: string
  unit: string
}

export interface InventoryRow {
  stockId: number
  lotId: number
  productType: ProductType
  productId: number
  code?: string | null
  productName: string
  warehouseId: number
  warehouseCode: string
  warehouseName: string
  isVirtualWarehouse: boolean
  lotNumber: string
  manufactureDate?: string | null
  expirationDate: string
  quantity: number
  unit: string
  status: InventoryStatus
  daysToExpire: number
}

export interface InventorySummary {
  products: number
  lotsWithStock: number
  available: number
  nearExpiry: number
  expired: number
  outOfStock: number
  nearExpiryDays: number
}

export interface InventoryQuery {
  search?: string
  productType?: ProductType
  warehouseId?: number
  status?: InventoryStatus | "ConExistencia"
  page?: number
  pageSize?: number
}

export interface MovementRow {
  movementId: number
  detailId: number
  type: MovementType
  direction: Direction
  occurredAt: string
  productType: ProductType
  code?: string | null
  productName: string
  lotId: number
  lotNumber: string
  expirationDate: string
  sourceWarehouseName?: string | null
  destinationWarehouseName?: string | null
  quantity: number
  unit: string
  patientId?: number | null
  patientName?: string | null
  patientDocument?: string | null
  userId: number
  userName: string
  reason?: string | null
  observations?: string | null
}

export interface MovementDetailLine {
  id: number
  direction: Direction
  warehouseId: number
  warehouseName: string
  productType: ProductType
  code?: string | null
  productName: string
  lotId: number
  lotNumber: string
  expirationDate: string
  quantity: number
  requestedQuantity?: number | null
  balanceAfter: number
  unit: string
}

export interface Movement {
  id: number
  type: MovementType
  occurredAt: string
  userId: number
  userName: string
  userDocument?: string | null
  sourceWarehouseId?: number | null
  sourceWarehouseName?: string | null
  destinationWarehouseId?: number | null
  destinationWarehouseName?: string | null
  patientId?: number | null
  patientName?: string | null
  patientDocument?: string | null
  admissionId?: number | null
  supplierId?: number | null
  supplierName?: string | null
  supportDocument?: string | null
  documentDate?: string | null
  reason?: string | null
  correctsMovementId?: number | null
  observations?: string | null
  details: MovementDetailLine[]
}

export interface MovementQuery {
  from?: string
  to?: string
  type?: MovementType
  productType?: ProductType
  productId?: number
  lotNumber?: string
  lotId?: number
  warehouseId?: number
  patientId?: number
  patient?: string
  userId?: number
  page?: number
  pageSize?: number
}

export interface LotQuantity {
  lotId: number
  quantity: number
}

export interface EntryRequest {
  warehouseId: number
  supplierId?: number | null
  supportDocument?: string | null
  documentDate?: string | null
  observations?: string | null
  items: {
    productType: ProductType
    productId: number
    lotNumber: string
    manufactureDate?: string | null
    expirationDate: string
    quantity: number
  }[]
}

export interface DispensationRequest {
  patientId: number
  admissionId?: number | null
  warehouseId: number
  observations?: string | null
  items: {
    productType: ProductType
    productId: number
    requestedQuantity: number
    lots: LotQuantity[]
  }[]
}

export interface TransferRequest {
  sourceWarehouseId: number
  destinationWarehouseId: number
  observations?: string | null
  items: LotQuantity[]
}

export interface ExitRequest {
  warehouseId: number
  reason: string
  observations?: string | null
  items: LotQuantity[]
}

export interface AdjustmentRequest {
  warehouseId: number
  reason: string
  correctsMovementId?: number | null
  observations?: string | null
  items: { lotId: number; direction: Direction; quantity: number }[]
}
