"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { AdmissionNotificationsResponse } from "@/core/interfaces/care/admissionNotifications"

export const ADMISSION_NOTIFICATIONS_QUERY_KEY = ["admission-notifications"] as const

async function getMyAdmissionNotifications(): Promise<AdmissionNotificationsResponse> {
  const res = await fetch(ENDPOINTS.ADMISSION_NOTIFICATIONS.GET_MINE, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? `GET error: ${res.statusText}`)
  }

  return data as AdmissionNotificationsResponse
}

interface UseAdmissionNotificationsOptions {
  // Respaldo mientras SignalR está desconectado; con la conexión activa no hace falta.
  pollWhileDisconnected: boolean
}

// Triages pendientes de admisión del usuario. Se consulta al entrar, al volver a la pestaña,
// al navegar (AdmissionNotificationsProvider) y cuando SignalR avisa un cambio. Si falla
// (sesión vencida, back dormido) se conserva lo último y no se muestra error.
export function useAdmissionNotifications({ pollWhileDisconnected }: UseAdmissionNotificationsOptions) {
  return useQuery({
    queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY,
    queryFn: getMyAdmissionNotifications,
    // Quien no es admisionista solo se vuelve a verificar de vez en cuando (por si le dan permiso).
    staleTime: (query) => (query.state.data?.canReceive === false ? 5 * 60_000 : 15_000),
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      pollWhileDisconnected && query.state.data?.canReceive ? 60_000 : false,
    retry: 1,
  })
}

export function useMarkAdmissionNotificationsSeen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationIds: number[]) =>
      create<{ seen: number }, { notificationIds: number[] }>(
        ENDPOINTS.ADMISSION_NOTIFICATIONS.MARK_SEEN,
        { notificationIds },
      ),
    // Se marca de una vez en pantalla para que el modal no reaparezca mientras responde el back.
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY })
      queryClient.setQueryData<AdmissionNotificationsResponse>(
        ADMISSION_NOTIFICATIONS_QUERY_KEY,
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) =>
              notificationIds.includes(item.id) ? { ...item, seen: true } : item,
            ),
          },
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY })
    },
  })
}

// Triage I a III: quien lo registró no admisiona enseguida y se avisa al admisionista.
export function notifyAdmission(triageId: number) {
  return create<{ notified: boolean }, Record<string, never>>(
    ENDPOINTS.ADMISSION_NOTIFICATIONS.NOTIFY(triageId),
    {},
  )
}

// Igual que notifyAdmission, pero sobrevive al cierre o recarga de la pestaña (keepalive).
export function notifyAdmissionOnExit(triageId: number) {
  try {
    fetch(ENDPOINTS.ADMISSION_NOTIFICATIONS.NOTIFY(triageId), {
      method: "POST",
      credentials: "include",
      keepalive: true,
    })
  } catch {
    // La pestaña se está cerrando: no hay a quién mostrarle el error.
  }
}
