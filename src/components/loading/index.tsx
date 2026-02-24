import { Hospital, Stethoscope, HeartPulse } from "lucide-react"
import { styles, keyframes } from "./styles"

type LoadingProps = {
  active?: boolean;
};

const ICONS = [Hospital, Stethoscope, HeartPulse]

export default function Loading({ active = true }: LoadingProps) {
  if (!active) return null

  return (
    <div style={styles.overlay}>
      <style>{keyframes}</style>
      <div style={styles.spinnerWrapper}>
        <div style={styles.spinner} />
        {ICONS.map((Icon, i) => (
          <div
            key={i}
            style={{ ...styles.icon, animationDelay: `${i}s` }}
          >
            <Icon size={24} color="#0F6F5C" strokeWidth={2} />
          </div>
        ))}
      </div>
    </div>
  )
}
