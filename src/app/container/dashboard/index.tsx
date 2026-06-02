"use client"

import { useContracts } from "@/core/hooks/parameterization/contracts/useGetAllContracts"
import { useMedicines } from "@/core/hooks/parameterization/medicines/useGetAllMedicines"
import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs"
import { useContractCatalogs } from "@/core/hooks/parameterization/contracts/useContractCatalogs"
import { motion } from "framer-motion"
import {
  FileText,
  Pill,
  Receipt,
  Activity,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Sparkles,
} from "lucide-react"
import { useMemo } from "react"
import { ContractsByStatusChart } from "./charts/ContractsByStatusChart"
import { MedicinePriceChart } from "./charts/MedicinePriceChart"
import { ContractsTimelineChart } from "./charts/ContractsTimelineChart"
import { TariffDistributionChart } from "./charts/TariffDistributionChart"
import { StatCard, StatCardSkeleton } from "./StatCard"
import styles from "./dashboard.module.scss"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

function ChartCardSkeleton() {
  return (
    <div className={styles.chartCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className={styles.skeletonIcon} style={{ width: 32, height: 32, borderRadius: 10 }} />
        <div className={styles.skeleton} style={{ width: 140, height: 13 }} />
      </div>
      <div className={styles.skeletonChart} />
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

export default function DashboardContainer() {
  const { data: contracts, isLoading: loadingContracts } = useContracts()
  const { data: medicines, isLoading: loadingMedicines } = useMedicines()
  const { data: tariffs, isLoading: loadingTariffs } = useTariffs()
  useContractCatalogs()

  const contractCount = contracts?.length ?? 0
  const medicineCount = medicines?.length ?? 0
  const tariffCount = tariffs?.length ?? 0
  const activeContracts = contracts?.filter((c) => c.status === "Activo").length ?? 0

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    []
  )

  return (
    <motion.div
      className={styles.wrapper}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.section className={styles.hero} variants={itemVariants}>
        <div className={styles.heroContent}>
          <div>
            <span className={styles.heroEyebrow}>
              <Sparkles size={13} /> Panel de control
            </span>
            <h1 className={styles.greeting}>{getGreeting()}, bienvenido 👋</h1>
            <p className={styles.subtitle}>
              Este es el resumen general del sistema clínico DataMedic.
            </p>
          </div>
          <div className={styles.heroDate}>
            <CalendarDays size={16} />
            {today}
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <div className={styles.sectionLabel}>Indicadores</div>
        <div className={styles.statsGrid}>
          {loadingContracts ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              icon={<FileText />}
              title="Contratos"
              value={contractCount}
              subtitle={`${activeContracts} activos`}
              color="#0F6F5C"
              gradient="linear-gradient(135deg, #0F6F5C 0%, #10B981 100%)"
              delay={0}
            />
          )}
          {loadingMedicines ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              icon={<Pill />}
              title="Medicamentos"
              value={medicineCount}
              subtitle="Registrados"
              color="#6366F1"
              gradient="linear-gradient(135deg, #6366F1 0%, #818CF8 100%)"
              delay={0.06}
            />
          )}
          {loadingTariffs ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              icon={<Receipt />}
              title="Tarifarios"
              value={tariffCount}
              subtitle="Configurados"
              color="#F59E0B"
              gradient="linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
              delay={0.12}
            />
          )}
        </div>
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={itemVariants}>
        <div className={styles.sectionLabel}>Contratos</div>
        <div className={styles.chartsGrid}>
          {loadingContracts ? (
            <ChartCardSkeleton />
          ) : (
            <motion.div className={styles.chartCard} whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
              <div className={styles.chartCardHeader}>
                <h3 className={styles.chartTitle}>
                  <span
                    className={styles.chartTitleIcon}
                    style={{ background: "rgba(15, 111, 92, 0.1)", color: "#0F6F5C" }}
                  >
                    <Activity size={16} />
                  </span>
                  Estado de Contratos
                </h3>
              </div>
              <ContractsByStatusChart contracts={contracts ?? []} />
            </motion.div>
          )}

          {loadingContracts ? (
            <ChartCardSkeleton />
          ) : (
            <motion.div className={styles.chartCard} whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
              <div className={styles.chartCardHeader}>
                <h3 className={styles.chartTitle}>
                  <span
                    className={styles.chartTitleIcon}
                    style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366F1" }}
                  >
                    <TrendingUp size={16} />
                  </span>
                  Contratos por Mes
                </h3>
              </div>
              <ContractsTimelineChart contracts={contracts ?? []} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div variants={itemVariants}>
        <div className={styles.sectionLabel}>Inventario</div>
        <div className={styles.chartsGrid}>
          {loadingMedicines ? (
            <ChartCardSkeleton />
          ) : (
            <motion.div className={styles.chartCard} whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
              <div className={styles.chartCardHeader}>
                <h3 className={styles.chartTitle}>
                  <span
                    className={styles.chartTitleIcon}
                    style={{ background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}
                  >
                    <BarChart3 size={16} />
                  </span>
                  Precios de Medicamentos
                </h3>
              </div>
              <MedicinePriceChart medicines={medicines ?? []} />
            </motion.div>
          )}

          {loadingTariffs ? (
            <ChartCardSkeleton />
          ) : (
            <motion.div className={styles.chartCard} whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
              <div className={styles.chartCardHeader}>
                <h3 className={styles.chartTitle}>
                  <span
                    className={styles.chartTitleIcon}
                    style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}
                  >
                    <Receipt size={16} />
                  </span>
                  Distribución de Tarifarios
                </h3>
              </div>
              <TariffDistributionChart tariffs={tariffs ?? []} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
