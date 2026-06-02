"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Activity,
  AlertCircle,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import styles from "./login.module.scss";

const loginSchema = z.object({
  email: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginProps {
  callbackUrl: string;
  hasCallbackParam?: boolean;
}

export default function Login({ callbackUrl, hasCallbackParam }: LoginProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (hasCallbackParam) {
      toast.error("Tu sesión ha expirado, por favor inicia sesión nuevamente");
      router.replace("/login", { scroll: false });
    }
  }, [hasCallbackParam, router]);

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (res?.error) {
      toast.error("Usuario o contraseña inválidos");
      return;
    }

    toast.success("Bienvenido 👋");
    router.push(callbackUrl || "/");
  };

  return (
    <div className={styles.page}>
      {/* ── Brand panel ── */}
      <aside className={styles.brand}>
        <div className={styles.brandTop}>
          <div className={styles.logoMark}>
            <HeartPulse size={26} strokeWidth={2.2} />
          </div>
          <span className={styles.logoText}>
            Data<span>Medic</span>
          </span>
        </div>

        <div className={styles.brandMid}>
          <h1 className={styles.headline}>
            Gestión clínica <em>inteligente</em> para tu institución de salud.
          </h1>
          <p className={styles.subhead}>
            Historias clínicas, admisiones, triage y parametrización en una sola
            plataforma moderna, segura y confiable.
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <ShieldCheck size={18} />
            </span>
            Datos protegidos y cifrados de extremo a extremo
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <Activity size={18} />
            </span>
            Indicadores y reportes en tiempo real
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <Stethoscope size={18} />
            </span>
            Diseñado para el flujo de trabajo asistencial
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <section className={styles.formSide}>
        <div className={styles.card}>
          <div className={styles.mobileBrand}>
            <div className={styles.logoMark}>
              <HeartPulse size={22} strokeWidth={2.2} />
            </div>
            <span className={styles.logoText}>
              Data<span>Medic</span>
            </span>
          </div>

          <h2 className={styles.welcome}>Bienvenido de nuevo</h2>
          <p className={styles.welcomeSub}>
            Ingresa tus credenciales para acceder al sistema.
          </p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Usuario
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <User size={18} />
                </span>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="Ingresa tu usuario"
                  className={`${styles.input} ${errors.email ? styles.error : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <span className={styles.errorMsg}>
                  <AlertCircle size={13} />
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Contraseña
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  className={`${styles.input} ${errors.password ? styles.error : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorMsg}>
                  <AlertCircle size={13} />
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className={styles.row}>
              <label className={styles.remember}>
                <input type="checkbox" />
                Recordarme
              </label>
              <button type="button" className={styles.forgot}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Ingresando…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
        </div>

        <div className={styles.footer}>
          DataMedic · Versión 12.0.024.2221
        </div>
      </section>
    </div>
  );
}
