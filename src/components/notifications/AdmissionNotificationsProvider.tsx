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
import { Button, Modal, notification as antdNotification } from "antd"
import { UserAddOutlined } from "@ant-design/icons"
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
import {
  TRIAGE_NOTIFICATIONS_QUERY_KEY,
  useMarkTriageNotificationsSeen,
  useTriageNotifications,
} from "@/core/hooks/notifications/useTriageNotifications"
import { AdmissionNotification } from "@/core/interfaces/care/admissionNotifications"
import { TriageNotification } from "@/core/interfaces/care/triageNotifications"
import AdmissionNotificationCenter from "./AdmissionNotificationCenter"
import UrgentAdmissionModal from "./UrgentAdmissionModal"
import {
  buildAdmissionUrl,
  buildTriageUrl,
  isPending,
  playUrgentChime,
} from "./admissionNotificationUtils"
import "./admissionNotifications.scss"

const HUB_URL = `${process.env.NEXT_PUBLIC_API_URL}/hubs/notifications`
const ADMISSIONS_CHANGED_EVENT = "admissionNotificationsChanged"
const TRIAGE_CHANGED_EVENT = "triageNotificationsChanged"

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

// Notificaciones del dashboard: admisiones pendientes (admisionistas) y pacientes nuevos que
// esperan triage (médico general, enfermero, auxiliar de enfermería). La consulta al back es
// la fuente de verdad y SignalR solo avisa que hay que volver a consultar. Monta el modal
// urgente y el centro de notificaciones para todo el dashboard, así aparecen en cualquier vista.
export default function AdmissionNotificationsProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [modal, modalContextHolder] = Modal.useModal()
  const [toast, toastContextHolder] = antdNotification.useNotification()

  const [connected, setConnected] = useState(false)
  const [centerOpen, setCenterOpen] = useState(false)

  const {
    data,
    dataUpdatedAt,
    refetch,
  } = useAdmissionNotifications({ pollWhileDisconnected: !connected })
  const {
    data: triageData,
    dataUpdatedAt: triageUpdatedAt,
    refetch: refetchTriage,
  } = useTriageNotifications({ pollWhileDisconnected: !connected })
  const markSeen = useMarkAdmissionNotificationsSeen()
  const markTriageSeen = useMarkTriageNotificationsSeen()

  const canReceiveAdmissions = data?.canReceive ?? false
  const canReceiveTriage = triageData?.canReceive ?? false
  const canReceive = canReceiveAdmissions || canReceiveTriage

  const items = useMemo(() => data?.items ?? [], [data])
  const pending = useMemo(() => items.filter(isPending), [items])
  const urgentUnseen = useMemo(
    () => pending.filter((n) => n.isUrgent && !n.seen),
    [pending],
  )

  const triageItems = useMemo(() => triageData?.items ?? [], [triageData])
  const triagePending = useMemo(
    () => triageItems.filter((n) => n.status === "PENDIENTE"),
    [triageItems],
  )
  const triageUnseen = useMemo(() => triagePending.filter((n) => !n.seen), [triagePending])

  const refreshAdmissions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY })
  }, [queryClient])
  const refreshTriage = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: TRIAGE_NOTIFICATIONS_QUERY_KEY })
  }, [queryClient])

  // Al navegar se vuelve a consultar si lo que hay tiene más de 15 s.
  const lastUpdateRef = useRef({ admissions: dataUpdatedAt, triage: triageUpdatedAt })
  lastUpdateRef.current = { admissions: dataUpdatedAt, triage: triageUpdatedAt }
  useEffect(() => {
    const now = Date.now()
    if (canReceiveAdmissions && now - lastUpdateRef.current.admissions > 15_000) refetch()
    if (canReceiveTriage && now - lastUpdateRef.current.triage > 15_000) refetchTriage()
  }, [pathname, canReceiveAdmissions, canReceiveTriage, refetch, refetchTriage])

  // Conexión SignalR, solo para quien recibe algún tipo de aviso.
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

    const refreshAll = () => {
      refreshAdmissions()
      refreshTriage()
    }

    connection.on(ADMISSIONS_CHANGED_EVENT, refreshAdmissions)
    connection.on(TRIAGE_CHANGED_EVENT, refreshTriage)
    connection.onreconnecting(() => setConnected(false))
    connection.onreconnected(() => {
      setConnected(true)
      // Lo que llegó mientras estaba desconectado está en la BD.
      refreshAll()
    })

    const start = async () => {
      try {
        await connection.start()
        if (disposed) return
        setConnected(true)
        refreshAll()
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
  }, [canReceive, refreshAdmissions, refreshTriage])

  // Sonido cuando llega una urgencia nueva (no al recargar las que ya se conocían).
  const knownUrgentIdsRef = useRef<Set<number> | null>(null)
  useEffect(() => {
    if (!data) return
    const ids = urgentUnseen.map((n) => n.id)
    const known = knownUrgentIdsRef.current
    if (known && ids.some((id) => !known.has(id))) playUrgentChime()
    knownUrgentIdsRef.current = new Set([...(known ?? []), ...ids])
  }, [data, urgentUnseen])

  // Pide confirmación antes de salir de un formulario con posibles cambios sin guardar.
  const navigateSafely = useCallback(
    (url: string, okText: string, reloadPrefix: string) => {
      const navigate = () => {
        setCenterOpen(false)
        // Los formularios toman el documento solo al montarse: si ya está abierto se
        // recarga para que cargue el nuevo paciente.
        if (pathname.startsWith(reloadPrefix)) window.location.assign(url)
        else router.push(url)
      }

      if (!FORM_ROUTE.test(pathname)) {
        navigate()
        return
      }

      modal.confirm({
        title: "¿Salir de esta vista?",
        content: "Estás en un formulario. Si tienes cambios sin guardar, se perderán.",
        okText,
        cancelText: "Quedarme aquí",
        onOk: navigate,
      })
    },
    [modal, pathname, router],
  )

  const goToAdmission = useCallback(
    (notification: AdmissionNotification) =>
      navigateSafely(buildAdmissionUrl(notification), "Sí, ir a admisionar", "/care/admissions/new"),
    [navigateSafely],
  )

  const goToTriage = useCallback(
    (notification: TriageNotification) => {
      if (!notification.seen) markTriageSeen.mutate([notification.id])
      navigateSafely(buildTriageUrl(notification), "Sí, ir a triage", "/care/triage/new")
    },
    [markTriageSeen, navigateSafely],
  )

  // Aviso discreto (no urgente) cuando llega un paciente nuevo para triage. No se muestra
  // para los que ya existían al cargar la página ni para los que registró el propio usuario
  // (le llegan como vistos).
  const knownTriageIdsRef = useRef<Set<number> | null>(null)
  useEffect(() => {
    if (!triageData) return
    const known = knownTriageIdsRef.current
    if (known) {
      triageUnseen
        .filter((n) => !known.has(n.id))
        .forEach((n) => {
          const key = `triage-notification-${n.id}`
          toast.open({
            key,
            icon: <UserAddOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />,
            title: "Nuevo paciente para triage",
            description: [n.patientName, [n.documentTypeCode, n.documentNumber].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(" · "),
            placement: "bottomRight",
            duration: 10,
            actions: (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  toast.destroy(key)
                  goToTriage(n)
                }}
              >
                Hacer triage
              </Button>
            ),
          })
        })
    }
    knownTriageIdsRef.current = new Set([...(known ?? []), ...triageItems.map((n) => n.id)])
  }, [triageData, triageItems, triageUnseen, toast, goToTriage])

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

  // Abrir la carpeta "Por triage" marca como vistos los pacientes nuevos.
  const markTriageSeenMutate = markTriageSeen.mutate
  const unseenTriageIds = useMemo(() => triageUnseen.map((n) => n.id), [triageUnseen])
  const markTriageFolderSeen = useCallback(() => {
    if (unseenTriageIds.length > 0) markTriageSeenMutate(unseenTriageIds)
  }, [markTriageSeenMutate, unseenTriageIds])

  const contextValue = useMemo<AdmissionNotificationsContextValue>(
    () => ({
      canReceive,
      pendingCount: pending.length + triagePending.length,
      urgentPendingCount: pending.filter((n) => n.isUrgent).length,
      openCenter: () => setCenterOpen(true),
    }),
    [canReceive, pending, triagePending],
  )

  return (
    <AdmissionNotificationsContext.Provider value={contextValue}>
      {children}
      {modalContextHolder}
      {toastContextHolder}
      {canReceiveAdmissions && (
        <UrgentAdmissionModal
          open={urgentUnseen.length > 0 && !centerOpen}
          notifications={urgentUnseen}
          onAdmit={admitFromUrgent}
          onClose={dismissUrgent}
        />
      )}
      {canReceive && (
        <AdmissionNotificationCenter
          open={centerOpen}
          canReceiveAdmissions={canReceiveAdmissions}
          canReceiveTriage={canReceiveTriage}
          notifications={items}
          triageNotifications={triageItems}
          onAdmit={goToAdmission}
          onTriage={goToTriage}
          onTriageFolderViewed={markTriageFolderSeen}
          onClose={() => setCenterOpen(false)}
        />
      )}
    </AdmissionNotificationsContext.Provider>
  )
}
