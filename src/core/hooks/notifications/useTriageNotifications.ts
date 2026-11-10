"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TriageNotificationsResponse } from "@/core/interfaces/care/triageNotifications"

export const TRIAGE_NOTIFICATIONS_QUERY_KEY = ["triage-notifications"] as const

async function getMyTriageNotifications(): Promise<TriageNotificationsResponse> {
  const res = await fetch(ENDPOINTS.TRIAGE_NOTIFICATIONS.GET_MINE, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? `GET error: ${res.statusText}`)
  }

  return data as TriageNotificationsResponse
}

interface UseTriageNotificationsOptions {
  // Respaldo mientras SignalR está desconectado; con la conexión activa no hace falta.
  pollWhileDisconnected: boolean
}

// Pacientes nuevos que esperan triage. Mismo esquema que las notificaciones de admisión: se
// consulta al entrar, al volver a la pestaña, al navegar y cuando SignalR avisa un cambio.
export function useTriageNotifications({ pollWhileDisconnected }: UseTriageNotificationsOptions) {
  return useQuery({
    queryKey: TRIAGE_NOTIFICATIONS_QUERY_KEY,
    queryFn: getMyTriageNotifications,
    // Quien no tiene el perfil solo se vuelve a verificar de vez en cuando.
    staleTime: (query) => (query.state.data?.canReceive === false ? 5 * 60_000 : 15_000),
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      pollWhileDisconnected && query.state.data?.canReceive ? 60_000 : false,
    retry: 1,
  })
}

export function useMarkTriageNotificationsSeen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationIds: number[]) =>
      create<{ seen: number }, { notificationIds: number[] }>(
        ENDPOINTS.TRIAGE_NOTIFICATIONS.MARK_SEEN,
        { notificationIds },
      ),
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: TRIAGE_NOTIFICATIONS_QUERY_KEY })
      queryClient.setQueryData<TriageNotificationsResponse>(
        TRIAGE_NOTIFICATIONS_QUERY_KEY,
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
      queryClient.invalidateQueries({ queryKey: TRIAGE_NOTIFICATIONS_QUERY_KEY })
    },
  })
}
