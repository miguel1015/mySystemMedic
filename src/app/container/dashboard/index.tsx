"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Button, Skeleton } from "antd"
import { FileAddOutlined, AlertOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useNavigationAccess } from "@/core/hooks/authentication/useNavigationAccess"
import { canAccessRoute } from "@/core/utils/routeAccess"
import { DashboardCarousel, CarouselSlide } from "./Carousel"
import { TodaySlide } from "./slides/TodaySlide"
import { ClinicalSlide } from "./slides/ClinicalSlide"
import { BillingSlide } from "./slides/BillingSlide"
import { greetingFor, useNow } from "./utils"
import styles from "./dashboard.module.scss"

const QUICK_ACTIONS = [
  { href: "/care/admissions/new", label: "Nueva admisión", icon: <FileAddOutlined /> },
  { href: "/care/triage/new", label: "Nuevo triage", icon: <AlertOutlined /> },
  { href: "/care/evolveClinicalHistory", label: "Evolucionar HC", icon: <EditOutlined /> },
  { href: "/care/admissionHistory", label: "Consultar HC", icon: <HistoryOutlined /> },
]

// Inicio. Encabezado fijo y un carrusel de vistas (Hoy, Atención clínica, Facturación).
// Cada vista y cada sección aparece solo si el rol puede abrir el módulo del que sale su
// información, así recepción, clínica, facturación y administración ven lo suyo.
export default function DashboardContainer() {
  const now = useNow()
  const { data: me } = useMe()
  const { data: access, isLoading: loadingAccess } = useNavigationAccess()

  // /api/users/me devuelve firstName y userProfileName (la interfaz User aún no los declara).
  const profile = me as (typeof me & { firstName?: string; userProfileName?: string }) | undefined
  const firstName = (profile?.firstName || profile?.name)?.trim().split(/\s+/)[0]
  const roleName = profile?.userProfileName || profile?.role
  const date = now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })

  const slides = useMemo<CarouselSlide[]>(() => {
    if (!access) return []
    const can = (route: string) => canAccessRoute(route, access)

    const today = {
      day: can("/care/triage"),
      ongoing: can("/care/ongoingCare"),
      billing: can("/billing/admissionIntegral"),
      contracts: can("/parameterization/contracts"),
      medicines: can("/parameterization/medicines"),
      tariffs: can("/parameterization/tariffs"),
    }
    const clinical = { triage: can("/care/triage"), admissions: can("/care/admissions") }
    const invoices = can("/billing/electronicInvoices")

    const list: CarouselSlide[] = [
      { id: "today", label: "Hoy", render: () => <TodaySlide access={today} now={now} /> },
    ]
    if (clinical.triage || clinical.admissions || today.ongoing) {
      list.push({
        id: "clinical",
        label: "Atención clínica",
        render: ({ cycle }) => (
          <ClinicalSlide
            now={now}
            cycle={cycle}
            showTriage={clinical.triage}
            showAdmissions={clinical.admissions}
            showOngoing={today.ongoing}
          />
        ),
      })
    }
    if (invoices) {
      list.push({
        id: "billing",
        label: "Facturación",
        render: ({ cycle }) => <BillingSlide now={now} cycle={cycle} showPending={today.billing} />,
      })
    }
    return list
  }, [access, now])

  const actions = access ? QUICK_ACTIONS.filter((a) => canAccessRoute(a.href, access)) : []

  return (
    <div className={styles.wrapper}>
      <header className={styles.top}>
        <div>
          <h1 className={styles.greeting}>
            {greetingFor(now)}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className={styles.meta}>
            <span className={styles.date}>{date}</span>
            {roleName && <span className={styles.role}>{roleName}</span>}
          </p>
        </div>

        {actions.length > 0 && (
          <nav className={styles.actions} aria-label="Accesos rápidos">
            {actions.map((a, i) => (
              <Link key={a.href} href={a.href} legacyBehavior passHref>
                <Button type={i === 0 ? "primary" : "default"} icon={a.icon} href={a.href}>
                  {a.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {loadingAccess ? (
        <div className={styles.panel}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : (
        <DashboardCarousel slides={slides} interval={20_000} />
      )}
    </div>
  )
}
