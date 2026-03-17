"use client"

import { useContracts } from "@/core/hooks/parameterization/contracts/useGetAllContracts"
import { useMedicines } from "@/core/hooks/parameterization/medicines/useGetAllMedicines"
import { useTariffs } from "@/core/hooks/parameterization/tariffs/useGetAllTariffs"
import { useContractCatalogs } from "@/core/hooks/parameterization/contracts/useContractCatalogs"
import { motion } from "framer-motion"
import { CSSProperties } from "react"
import { FileText, Pill, Receipt, TrendingUp, Activity, BarChart3 } from "lucide-react"
import { Spin } from "antd"
import { ContractsByStatusChart } from "./charts/ContractsByStatusChart"
import { MedicinePriceChart } from "./charts/MedicinePriceChart"
import { ContractsTimelineChart } from "./charts/ContractsTimelineChart"
import { TariffDistributionChart } from "./charts/TariffDistributionChart"
import { StatCard } from "./StatCard"

const s = (style: CSSProperties) => style

const styles = {
  wrapper: s({
    padding: "0 8px",
    minHeight: "100vh",
  }),
  greeting: s({
    fontSize: "28px",
    fontWeight: 700,
    color: "#1F3D36",
    marginBottom: "4px",
  }),
  subtitle: s({
    fontSize: "15px",
    color: "#6B7280",
    marginBottom: "32px",
  }),
  statsGrid: s({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  }),
  chartsGrid: s({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  }),
  chartCard: s({
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 8px 32px rgba(15, 111, 92, 0.08)",
    padding: "28px",
    overflow: "hidden",
    position: "relative" as const,
  }),
  chartTitle: s({
    fontSize: "18px",
    fontWeight: 600,
    color: "#1F3D36",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }),
  loadingContainer: s({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
  }),
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

export default function DashboardContainer() {
  const { data: contracts, isLoading: loadingContracts } = useContracts()
  const { data: medicines, isLoading: loadingMedicines } = useMedicines()
  const { data: tariffs, isLoading: loadingTariffs } = useTariffs()
  const { data: catalogs } = useContractCatalogs()

  const isLoading = loadingContracts || loadingMedicines || loadingTariffs

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    )
  }

  const contractCount = contracts?.length ?? 0
  const medicineCount = medicines?.length ?? 0
  const tariffCount = tariffs?.length ?? 0
  const activeContracts = contracts?.filter((c) => c.status === "Activo").length ?? 0

  return (
    <motion.div
      style={styles.wrapper}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 style={styles.greeting}>Dashboard</h1>
        <p style={styles.subtitle}>
          Resumen general del sistema
        </p>
      </motion.div>

      <motion.div style={styles.statsGrid} variants={itemVariants}>
        <StatCard
          icon={<FileText size={24} />}
          title="Contratos"
          value={contractCount}
          subtitle={`${activeContracts} activos`}
          color="#0F6F5C"
          gradient="linear-gradient(135deg, #0F6F5C 0%, #1a9e7e 100%)"
          delay={0}
        />
        <StatCard
          icon={<Pill size={24} />}
          title="Medicamentos"
          value={medicineCount}
          subtitle="Registrados"
          color="#6366F1"
          gradient="linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
          delay={0.1}
        />
        <StatCard
          icon={<Receipt size={24} />}
          title="Tarifarios"
          value={tariffCount}
          subtitle="Configurados"
          color="#F59E0B"
          gradient="linear-gradient(135deg, #F59E0B 0%, #F97316 100%)"
          delay={0.2}
        />
      </motion.div>

      <motion.div style={styles.chartsGrid} variants={itemVariants}>
        <motion.div style={styles.chartCard} variants={itemVariants}>
          <div style={styles.chartTitle}>
            <Activity size={20} color="#0F6F5C" />
            Estado de Contratos
          </div>
          <ContractsByStatusChart contracts={contracts ?? []} />
        </motion.div>

        <motion.div style={styles.chartCard} variants={itemVariants}>
          <div style={styles.chartTitle}>
            <TrendingUp size={20} color="#6366F1" />
            Contratos por Mes
          </div>
          <ContractsTimelineChart contracts={contracts ?? []} />
        </motion.div>
      </motion.div>

      <motion.div style={styles.chartsGrid} variants={itemVariants}>
        <motion.div style={styles.chartCard} variants={itemVariants}>
          <div style={styles.chartTitle}>
            <BarChart3 size={20} color="#F59E0B" />
            Precios de Medicamentos
          </div>
          <MedicinePriceChart medicines={medicines ?? []} />
        </motion.div>

        <motion.div style={styles.chartCard} variants={itemVariants}>
          <div style={styles.chartTitle}>
            <Receipt size={20} color="#10B981" />
            Distribución de Tarifarios
          </div>
          <TariffDistributionChart tariffs={tariffs ?? []} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
