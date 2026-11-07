"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { pharmacyApi } from "@/core/api/pharmacyApi"
import type {
  AdjustmentRequest,
  DispensationRequest,
  EntryRequest,
  ExitRequest,
  InventoryQuery,
  InventoryRow,
  InventorySummary,
  InventoryUnit,
  LotAvailability,
  LotLookup,
  Movement,
  MovementQuery,
  MovementRow,
  Paged,
  PharmacyPatient,
  PharmacyProduct,
  PharmacyUser,
  ProductType,
  Supplier,
  SupplierRequest,
  TransferRequest,
  Warehouse,
  WarehouseRequest,
} from "@/core/interfaces/pharmacy/types"

// Todas las consultas de farmacia cuelgan de esta clave: cualquier operación que mueve
// inventario las invalida juntas (existencias, lotes, movimientos, bodegas).
const ROOT = "pharmacy"

function useInvalidatePharmacy() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: [ROOT] })
}

// ───────────────────────── Bodegas ─────────────────────────

export function useWarehouses(includeInactive = false) {
  return useQuery({
    queryKey: [ROOT, "warehouses", includeInactive],
    queryFn: () => pharmacyApi.get<Warehouse[]>("/warehouses", { includeInactive }),
    staleTime: 60_000,
  })
}

export function useSaveWarehouse() {
  const invalidate = useInvalidatePharmacy()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: WarehouseRequest }) =>
      id ? pharmacyApi.put<Warehouse>(`/warehouses/${id}`, data) : pharmacyApi.post<Warehouse>("/warehouses", data),
    onSuccess: invalidate,
  })
}

export function useDeleteWarehouse() {
  const invalidate = useInvalidatePharmacy()
  return useMutation({
    mutationFn: (id: number) => pharmacyApi.del(`/warehouses/${id}`),
    onSuccess: invalidate,
  })
}

// ───────────────────────── Proveedores ─────────────────────────

export function useSuppliers(includeInactive = false) {
  return useQuery({
    queryKey: [ROOT, "suppliers", includeInactive],
    queryFn: () => pharmacyApi.get<Supplier[]>("/suppliers", { includeInactive }),
    staleTime: 60_000,
  })
}

export function useSaveSupplier() {
  const invalidate = useInvalidatePharmacy()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: SupplierRequest }) =>
      id ? pharmacyApi.put<Supplier>(`/suppliers/${id}`, data) : pharmacyApi.post<Supplier>("/suppliers", data),
    onSuccess: invalidate,
  })
}

export function useDeleteSupplier() {
  const invalidate = useInvalidatePharmacy()
  return useMutation({
    mutationFn: (id: number) => pharmacyApi.del(`/suppliers/${id}`),
    onSuccess: invalidate,
  })
}

// ───────────────────────── Catálogos ─────────────────────────

export function useInventoryUnits() {
  return useQuery({
    queryKey: [ROOT, "units"],
    queryFn: () => pharmacyApi.get<InventoryUnit[]>("/units"),
    staleTime: 5 * 60_000,
  })
}

export function usePharmacyUsers() {
  return useQuery({
    queryKey: [ROOT, "users"],
    queryFn: () => pharmacyApi.get<PharmacyUser[]>("/users"),
    staleTime: 5 * 60_000,
  })
}

export function usePharmacyPatients(search: string) {
  const term = search.trim()
  return useQuery({
    queryKey: [ROOT, "patients", term],
    queryFn: () => pharmacyApi.get<PharmacyPatient[]>("/patients", { search: term }),
    enabled: term.length >= 3,
    placeholderData: keepPreviousData,
  })
}

export interface ProductSearch {
  search?: string
  type?: ProductType
  warehouseId?: number
  includeExpired?: boolean
}

export function usePharmacyProducts(params: ProductSearch, enabled = true) {
  return useQuery({
    queryKey: [ROOT, "products", params],
    queryFn: () => pharmacyApi.get<PharmacyProduct[]>("/products", { ...params }),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export interface LotSearch {
  warehouseId?: number
  productType?: ProductType
  productId?: number
  includeExpired?: boolean
  includeEmpty?: boolean
}

export function useLots(params: LotSearch) {
  return useQuery({
    queryKey: [ROOT, "lots", params],
    queryFn: () => pharmacyApi.get<LotAvailability[]>("/lots", { ...params }),
    enabled: !!params.warehouseId && !!params.productType && !!params.productId,
  })
}

// Lotes de varios productos a la vez (dispensación y traslados con varias líneas).
export function fetchLots(params: LotSearch) {
  return pharmacyApi.get<LotAvailability[]>("/lots", { ...params })
}

export async function lookupLot(productType: ProductType, productId: number, lotNumber: string) {
  const lot = await pharmacyApi.get<LotLookup | "">("/lots/lookup", { productType, productId, lotNumber })
  return lot || null
}

// ───────────────────────── Inventario ─────────────────────────

export function useInventory(query: InventoryQuery) {
  return useQuery({
    queryKey: [ROOT, "inventory", query],
    queryFn: () => pharmacyApi.get<Paged<InventoryRow>>("/inventory", { ...query }),
    placeholderData: keepPreviousData,
  })
}

export function useInventorySummary(query: Pick<InventoryQuery, "search" | "productType" | "warehouseId">) {
  return useQuery({
    queryKey: [ROOT, "inventory-summary", query],
    queryFn: () => pharmacyApi.get<InventorySummary>("/inventory/summary", { ...query }),
    placeholderData: keepPreviousData,
  })
}

// ───────────────────────── Movimientos ─────────────────────────

export function useMovements(query: MovementQuery, enabled = true) {
  return useQuery({
    queryKey: [ROOT, "movements", query],
    queryFn: () => pharmacyApi.get<Paged<MovementRow>>("/movements", { ...query }),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useMovement(id?: number | null) {
  return useQuery({
    queryKey: [ROOT, "movement", id],
    queryFn: () => pharmacyApi.get<Movement>(`/movements/${id}`),
    enabled: !!id,
  })
}

function useOperation<T>(path: string) {
  const invalidate = useInvalidatePharmacy()
  return useMutation({
    mutationFn: (data: T) => pharmacyApi.post<Movement>(`/movements/${path}`, data),
    // Si otro usuario movió el inventario mientras tanto, lo que se ve queda al día.
    onSettled: invalidate,
  })
}

export const useRegisterEntry = () => useOperation<EntryRequest>("entries")
export const useRegisterDispensation = () => useOperation<DispensationRequest>("dispensations")
export const useRegisterTransfer = () => useOperation<TransferRequest>("transfers")
export const useRegisterExit = () => useOperation<ExitRequest>("exits")
export const useRegisterAdjustment = () => useOperation<AdjustmentRequest>("adjustments")
