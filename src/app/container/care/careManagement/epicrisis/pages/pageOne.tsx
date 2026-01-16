import React from "react";

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 11,
    color: "#000",
    padding: "24px",
    width: "100%",
    lineHeight: 1.4,
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
  },
  subtitle: {
    fontSize: 11,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  row: {
    display: "flex",
    marginBottom: 4,
  },
  label: {
    width: 180,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  twoCols: {
    display: "flex",
    gap: 40,
  },
  col: {
    flex: 1,
  },
  paragraph: {
    textAlign: "justify",
  },
  footer: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 10,
  },
};

const PageOne: React.FC = () => {
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>CLINICA FUNDACION IPS SAS</div>
        <div style={styles.subtitle}>NIT: 900517542-5</div>
        <div style={styles.subtitle}>TEL: 4131122</div>
        <div style={styles.subtitle}>DIRECCION: CALLE 8 NO 8-121</div>
      </div>

      {/* DATOS PACIENTE */}
      <div style={styles.twoCols}>
        <div style={styles.col}>
          <div style={styles.row}>
            <div style={styles.label}>PACIENTE:</div>
            <div style={styles.value}>JHONNY RAFAEL CANTILLO JIMENEZ</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>SEXO:</div>
            <div style={styles.value}>M</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>DIRECCION:</div>
            <div style={styles.value}>CL 10A NO 3 72</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>COTIZANTE:</div>
            <div style={styles.value}>JHONNY RAFAEL CANTILLO JIMENEZ</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>EMPRESA:</div>
            <div style={styles.value}>ADRES</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>EDAD:</div>
            <div style={styles.value}>55 Años</div>
          </div>
        </div>

        <div style={styles.col}>
          <div style={styles.row}>
            <div style={styles.label}>DOCUMENTO:</div>
            <div style={styles.value}>CC 72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>UBICACIÓN HISTORIA:</div>
            <div style={styles.value}>72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>TEL:</div>
            <div style={styles.value}>3175263488</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>DOC. COTIZANTE:</div>
            <div style={styles.value}>72177668</div>
          </div>
          <div style={styles.row}>
            <div style={styles.label}>PARENTESCO:</div>
            <div style={styles.value}></div>
          </div>
        </div>
      </div>

      {/* PageOne */}
      <div style={styles.sectionTitle}>PageOne</div>

      <div style={styles.row}>
        <div style={styles.label}>FECHA DE INGRESO:</div>
        <div style={styles.value}>29/05/2025</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>HORA DE INGRESO:</div>
        <div style={styles.value}>12:10</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>FECHA DE EGRESO:</div>
        <div style={styles.value}>31/05/2025</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>HORA DE EGRESO:</div>
        <div style={styles.value}>12:29</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>SERVICIO INGRESO:</div>
        <div style={styles.value}>URGENCIA</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>SERVICIO EGRESO:</div>
        <div style={styles.value}>HOSPITALIZACIÓN</div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}>DIAGNOSTICO INGRESO:</div>
        <div style={styles.value}>CONTUSION DEL HOMBRO Y DEL BRAZO</div>
      </div>

      {/* MOTIVO */}
      <div style={styles.row}>
        <div style={styles.label}>MOTIVO DE CONSULTA</div>
        <div style={styles.value}>ACCIDENTE DE TRANSITO</div>
      </div>

      <div style={styles.row}>
        <div style={styles.label}>CAUSA EXTERNA</div>
        <div style={styles.value}>Accidente de tránsito</div>
      </div>

      {/* EVOLUCION */}
      <div style={styles.row}>
        <div style={styles.label}>EVOLUCIÓN DE LA ENFERMEDAD</div>
        <div style={styles.value}>
          INGRESA A LOS SERVICIOS DE URGENCIAS PACIENTE DE SEXO MASCULINO DE 55
          AÑOS DE EDAD POSTERIOR A SER VICTIMA DE ACCIDENTE DE TRANSITO EN
          CALIDAD DE PEATÓN AL SER ARROLLADO VEHÍCULO TIPO MOTOCICLETA, CON
          IMPACTO A NIVEL DE HOMBRO DERECHO QUE AUMENTA A LA PALPACIÓN Y A LA
          MOVILIDAD, ACOMPAÑADO DE EDEMA, DEFORMIDAD Y LIMITACION FUNCIONAL.
          TRAUMA EN MUSLO DERECHO ASOCIADO A DOLOR POSTRAUMÁTICO, DEFORMIDAD Y
          LIMITACION FUNCIONAL, MOTIVO POR EL CUAL CONSULTA.
        </div>
      </div>

      {/* ANTECEDENTES */}
      <div style={styles.sectionTitle}>ANTECEDENTES</div>
      {[
        "PATOLOGICOS",
        "TOXICOS",
        "ALERGICOS",
        "TRAUMATICOS",
        "TRANSFUSIONES",
        "QUIRURGICOS",
        "OBSTETRICOS",
      ].map((item) => (
        <div key={item} style={styles.row}>
          <div style={styles.label}>{item}:</div>
          <div style={styles.value}>NIEGA</div>
        </div>
      ))}

      <div style={styles.row}>
        <div style={styles.label}>EXAMEN FISICO DE INGRESO</div>
        <div style={styles.value}>
          CABEZA Y CUELLO NORMOCÉFALO, CUELLO MÓVIL SIN ADENOMEGALIAS O,
          ESCLERAS ANICTÉRICAS, CONJUNTIVAS NORMOCROMICAS, PUPILAS ISOCORICAS,
          NORMORREACTIVAS A LA LUZ, PALPABLES, MUCOSA HÚMEDAS TORAX SIMÉTRICO
          EXPANSIBLE SIN RETRACCIONES, RUIDOS CARDIACOS RÍTMICO SIN SOPLOS,
          PULMONES CON MURMULLO VESICULAR PRESENTE SIN AGREGADOS.
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.label} />
        <div style={styles.value}>
          TORAX SIMÉTRICO EXPANSIBLE SIN RETRACCIONES, RUIDOS CARDIACOS RÍTMICO
          SIN SOPLOS, PULMONES CON MURMULLO VESICULAR PRESENTE SIN AGREGADOS.
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.label} />
        <div style={styles.value}>
          ABDOMEN BLANDO, DEPRESIBLE, APARENEMENTE NO DOLOROSO A LA PALPACIÓN,
          NO MASAS, NI MEGALIAS, NO IRRITACIÓN PERITONEAL
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.label} />
        <div style={styles.value}>
          EXTREMIDADES ARTICULACION DEL HOMBRO DERECHO CON EDEMA, DEFORMIDAD,
          ENTUMECIMIENTO, DOLOR AGUDO, Y LIMITACION A LA MOVILIDAD, PRESENTA EN
          MUSLO DERECHO EN TERCIO MEDIO AUMENTO DE VOLUMEN, EVIDENTE DEFORMIDAD,
          TUMEFACCION Y HORMIGUEO. DOLOR AGUDO MOVIMIENTOS LIMITADOS, LLENADO
          CAPILAR MENOR A 2 SEGUNDOS., RESTO DE EXTREMIDADES SIN LESIONES
          APARENTES.
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.label} />
        <div style={styles.value}>
          NEUROLOGICO PACIENTE CONSCIENTE, ORIENTADA EN TIEMPO ESPACIO Y
          PERSONA, REFLEJOS CONSERVADOS, SENSIBILIDAD SUPERFICIAL Y PROFUNDA
          CONSERVADAS.
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.label} />
        <div style={styles.value}>
          GENITOURINARIO NORMOCONFIGURADO, DIURESIS +
        </div>
      </div>

      {/* JUSTIFICACION */}
      <div style={styles.sectionTitle}>JUSTIFICACION DE LA HOSPITALIZACIÓN</div>
      <div style={styles.paragraph}>
        REDUCCIÓN ABIERTA DE FRACTURA EN DIAFISIS DE FEMUR CON FIJACIÓN INTERNA
        (DISPOSITIVOS)
      </div>

      <div style={styles.footer}>Página 1 de 9</div>
    </div>
  );
};

export default PageOne;
