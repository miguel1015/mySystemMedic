import { styles } from "./styles";

type LoadingProps = {
  active?: boolean;
};

export default function Loading({ active = true }: LoadingProps) {
  if (!active) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.spinnerWrapper}>
        <div style={styles.spinner} />

        <i
          className="material-icons"
          style={{ ...styles.icon, ...styles.icon1 }}
        >
          local_hospital
        </i>
        <i
          className="material-icons"
          style={{ ...styles.icon, ...styles.icon2 }}
        >
          medical_services
        </i>
        <i
          className="material-icons"
          style={{ ...styles.icon, ...styles.icon3 }}
        >
          healing
        </i>
      </div>
    </div>
  );
}
