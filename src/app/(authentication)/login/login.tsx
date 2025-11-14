"use client";

import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

// ✅ Zod schema
const loginSchema = z.object({
  email: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
  costCenter: z.string().optional(),
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
    router.push("/");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Fondo izquierdo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "45%",
          height: "100%",
          background: "#9fb1c9",
          borderTopRightRadius: "50% 20%",
          borderBottomRightRadius: "40% 30%",
          zIndex: 1,
        }}
      />

      {/* Fondo derecho */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "50%",
          height: "85%",
          background: "linear-gradient(180deg, #4da8e8 0%, #3ba9e7 100%)",
          borderTopLeftRadius: "60% 90%",
          zIndex: 1,
        }}
      />

      {/* Card principal */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "white",
          borderRadius: "40px",
          padding: "30px 50px 35px",
          width: "90%",
          maxWidth: "600px",
          margin: "20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2 style={{ color: "#2b7ab8", fontSize: "32px", margin: 0 }}>
            Medic <span style={{ color: "#3ba9e7" }}>System</span>
          </h2>
          <h3 style={{ color: "#d0d0d0", fontWeight: 300 }}>Login</h3>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            type="text"
            placeholder="Usuario"
            {...register("email")}
            style={{
              width: "100%",
              padding: "14px 25px",
              background: "#e8e8e8",
              border: errors.email ? "2px solid #f44" : "none",
              borderRadius: "50px",
              fontSize: "15px",
              color: "#333",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {errors.email && (
            <span style={{ color: "red", fontSize: "13px" }}>
              {errors.email.message}
            </span>
          )}

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password")}
              style={{
                width: "100%",
                padding: "14px 25px",
                paddingRight: "50px",
                background: "#e8e8e8",
                border: errors.password ? "2px solid #f44" : "none",
                borderRadius: "50px",
                fontSize: "15px",
                color: "#333",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#999",
                cursor: "pointer",
              }}
            >
              <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"} />
            </button>
          </div>
          {errors.password && (
            <span style={{ color: "red", fontSize: "13px" }}>
              {errors.password.message}
            </span>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "8px",
              background: loading
                ? "#7fb8e6"
                : "linear-gradient(135deg, #2563ba 0%, #1e4a8f 100%)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(37, 99, 186, 0.4)",
              transition: "all 0.3s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Cargando..." : "Iniciar"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          right: "25px",
          fontSize: "13px",
          color: "#2b7ab8",
          zIndex: 20,
          fontWeight: "500",
        }}
      >
        Version 12.0.024.2221
      </div>

      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Head>
    </div>
  );
}
