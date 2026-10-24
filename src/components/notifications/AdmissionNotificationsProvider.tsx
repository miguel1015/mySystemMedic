"use client"

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Modal } from "antd"
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr"
import { getAccessToken } from "@/core/api/getToken"
import {
  ADMISSION_NOTIFICATIONS_QUERY_KEY,
  useAdmissionNotifications,
  useMarkAdmissionNotificationsSeen,
} from "@/core/hooks/notifications/useAdmissionNotifications"
import { AdmissionNotification } from "@/core/interfaces/care/admissionNotifications"
import AdmissionNotificationCenter from "./AdmissionNotificationCenter"
import UrgentAdmissionModal from "./UrgentAdmissionModal"
import { buildAdmissionUrl, isPending, playUrgentChime } from "./admissionNotificationUtils"
import "./admissionNotifications.scss"

const HUB_URL = `${process.env.NEXT_PUBLIC_API_URL}/hubs/notifications`
const CHANGED_EVENT = "admissionNotificationsChanged"

// Reintenta para siempre: Render free se duerme y tarda en despertar.
const RECONNECT_DELAYS = [0, 2_000, 5_000, 10_000]
const MAX_RECONNECT_DELAY = 30_000

// Vistas de formulario: salir de ellas puede perder cambios sin guardar.
const FORM_ROUTE = /\/(new|edit)(\/|$)/

interface AdmissionNotificationsContextValue {
  canReceive: boolean
  pendingCount: number
  urgentPendingCount: number
  openCenter: () => void
}

const AdmissionNotificationsContext = createContext<AdmissionNotificationsContextValue>({
  canReceive: false,
  pendingCount: 0,
  urgentPendingCount: 0,
  openCenter: () => undefined,
})

export const useAdmissionNotificationsContext = () => useContext(AdmissionNotificationsContext)

// Notificaciones de admisión del admisionista: la consulta al back es la fuente de verdad y
// SignalR solo avisa que hay que volver a consultar. Monta el modal urgente y el centro de
// notificaciones para todo el dashboard, así aparecen en cualquier vista.
export default function AdmissionNotificationsProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [modal, modalContextHolder] = Modal.useModal()

  const [connected, setConnected] = useState(false)
  const [centerOpen, setCenterOpen] = useState(false)

  const { data, dataUpdatedAt, refetch } = useAdmissionNotifications({
    pollWhileDisconnected: !connected,
  })
  const markSeen = useMarkAdmissionNotificationsSeen()

  const canReceive = data?.canReceive ?? false
  const items = useMemo(() => data?.items ?? [], [data])
  const pending = useMemo(() => items.filter(isPending), [items])
  const urgentUnseen = useMemo(
    () => pending.filter((n) => n.isUrgent && !n.seen),
    [pending],
  )

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY })
  }, [queryClient])

  // Al navegar se vuelve a consultar si lo que hay tiene más de 15 s.
  const lastUpdateRef = useRef(dataUpdatedAt)
  lastUpdateRef.current = dataUpdatedAt
  useEffect(() => {
    if (canReceive && Date.now() - lastUpdateRef.current > 15_000) refetch()
  }, [pathname, canReceive, refetch])

  // Conexión SignalR, solo para admisionistas.
  useEffect(() => {
    if (!canReceive || !process.env.NEXT_PUBLIC_API_URL) return

    let disposed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: async () => (await getAccessToken()) ?? "" })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: ({ previousRetryCount }) =>
          RECONNECT_DELAYS[previousRetryCount] ?? MAX_RECONNECT_DELAY,
      })
      .configureLogging(LogLevel.None)
      .build()

    connection.on(CHANGED_EVENT, refresh)
    connection.onreconnecting(() => setConnected(false))
    connection.onreconnected(() => {
      setConnected(true)
      // Lo que llegó mientras estaba desconectado está en la BD.
      refresh()
    })

    const start = async () => {
      try {
        await connection.start()
        if (disposed) return
        setConnected(true)
        refresh()
      } catch {
        if (!disposed) retryTimer = setTimeout(start, MAX_RECONNECT_DELAY)
      }
    }

    connection.onclose(() => {
      setConnected(false)
      if (!disposed) retryTimer = setTimeout(start, MAX_RECONNECT_DELAY)
    })

    start()

    return () => {
      disposed = true
      clearTimeout(retryTimer)
      setConnected(false)
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop().catch(() => undefined)
      }
    }
  }, [canReceive, refresh])

  // Sonido cuando llega una urgencia nueva (no al recargar las que ya se conocían).
  const knownUrgentIdsRef = useRef<Set<number> | null>(null)
  useEffect(() => {
    if (!data) return
    const ids = urgentUnseen.map((n) => n.id)
    const known = knownUrgentIdsRef.current
    if (known && ids.some((id) => !known.has(id))) playUrgentChime()
    knownUrgentIdsRef.current = new Set([...(known ?? []), ...ids])
  }, [data, urgentUnseen])

  const goToAdmission = useCallback(
    (notification: AdmissionNotification) => {
      const url = buildAdmissionUrl(notification)
      const navigate = () => {
        setCenterOpen(false)
        // El formulario de admisión toma el documento solo al montarse: si ya está abierto se
        // recarga para que cargue el nuevo paciente.
        if (pathname.startsWith("/care/admissions/new")) window.location.assign(url)
        else router.push(url)
      }

      if (!FORM_ROUTE.test(pathname)) {
        navigate()
        return
      }

      modal.confirm({
        title: "¿Salir de esta vista?",
        content: "Estás en un formulario. Si tienes cambios sin guardar, se perderán.",
        okText: "Sí, ir a admisionar",
        cancelText: "Quedarme aquí",
        onOk: navigate,
      })
    },
    [modal, pathname, router],
  )

  // El modal muestra todas las urgencias sin ver: cerrar o admisionar las marca como vistas.
  const dismissUrgent = useCallback(() => {
    markSeen.mutate(urgentUnseen.map((n) => n.id))
  }, [markSeen, urgentUnseen])

  const admitFromUrgent = useCallback(
    (notification: AdmissionNotification) => {
      dismissUrgent()
      goToAdmission(notification)
    },
    [dismissUrgent, goToAdmission],
  )

  const contextValue = useMemo<AdmissionNotificationsContextValue>(
    () => ({
      canReceive,
      pendingCount: pending.length,
      urgentPendingCount: pending.filter((n) => n.isUrgent).length,
      openCenter: () => setCenterOpen(true),
    }),
    [canReceive, pending],
  )

  return (
    <AdmissionNotificationsContext.Provider value={contextValue}>
      {children}
      {modalContextHolder}
      {canReceive && (
        <>
          <UrgentAdmissionModal
            open={urgentUnseen.length > 0 && !centerOpen}
            notifications={urgentUnseen}
            onAdmit={admitFromUrgent}
            onClose={dismissUrgent}
          />
          <AdmissionNotificationCenter
            open={centerOpen}
            notifications={items}
            onAdmit={goToAdmission}
            onClose={() => setCenterOpen(false)}
          />
        </>
      )}
    </AdmissionNotificationsContext.Provider>
  )
}
