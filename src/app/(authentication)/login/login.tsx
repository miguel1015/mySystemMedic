"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Zod schema
const loginSchema = z.object({
  username: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
  costCenter: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginProps {
  callbackUrl: string;
}

export default function Login({ callbackUrl }: LoginProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setServerError("");

    try {
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (!res) {
        setServerError("Login fallido");
        return;
      }

      const { ok, error: err, url } = res;

      if (!ok) {
        setServerError(err || "Login fallido");
        return;
      }

      if (url) {
        router.push(url);
      }
    } catch (error: unknown) {
      const err = error as { message: string };
      setServerError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
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

      {/* Forma ondulada derecha - azul brillante */}
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

      {/* Card de Login */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "white",
          borderRadius: "40px",
          // boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          padding: "30px 50px 35px",
          width: "90%",
          maxWidth: "600px",
          margin: "20px",
        }}
      >
        {/* Logo y título */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            {/* Logo con órbitas */}
            <div style={{ position: "relative", marginRight: "15px" }}>
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #5ba3d8 0%, #2b7ab8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "3px solid white",
                    background:
                      "linear-gradient(135deg, #4da8e8 0%, #2980b9 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#b8d9f0",
                    }}
                  />
                </div>
              </div>
              {/* Órbitas decorativas */}
              <div
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "2.5px solid #5ba3d8",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "7px",
                  left: "-7px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2.5px solid #7fb8e6",
                }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#2b7ab8",
                  margin: 0,
                  lineHeight: 0.95,
                }}
              >
                Medic
              </h1>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#3ba9e7",
                  margin: 0,
                  lineHeight: 0.95,
                }}
              >
                System
              </h2>
            </div>
          </div>
          <h3
            style={{
              fontSize: "24px",
              color: "#d0d0d0",
              fontWeight: "300",
              margin: 0,
            }}
          >
            Login
          </h3>
        </div>

        {/* Error del servidor */}
        {serverError && (
          <div
            style={{
              marginBottom: "15px",
              background: "#fee",
              color: "#c33",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "13px",
            }}
          >
            {serverError}
          </div>
        )}

        {/* Formulario */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Campo Usuario */}
          <div>
            <input
              type="text"
              placeholder="Usuario"
              {...register("username")}
              className={`w-full px-6 py-4 bg-gray-100 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.username ? "ring-2 ring-red-400" : "focus:ring-blue-400"
              }`}
              style={{
                width: "100%",
                padding: "14px 25px",
                background: "#e8e8e8",
                border: errors.username ? "2px solid #f44" : "none",
                borderRadius: "50px",
                fontSize: "15px",
                color: "#333",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                {...register("password")}
                className={`w-full px-6 py-4 bg-gray-100 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-12 ${
                  errors.password
                    ? "ring-2 ring-red-400"
                    : "focus:ring-blue-400"
                }`}
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
                  fontSize: "16px",
                  padding: "5px",
                }}
              >
                <i
                  className={showPassword ? "far fa-eye-slash" : "far fa-eye"}
                />
              </button>
            </div>
          </div>

          {/* Botón Iniciar */}
          <button
            onClick={handleSubmit(onSubmit)}
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
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid white",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            ) : (
              "Iniciar"
            )}
          </button>

          {/* Link Cambiar contraseña */}
          <div style={{ textAlign: "center", paddingTop: "10px" }}>
            <button
              type="button"
              onClick={() => alert("Funcionalidad de cambio de contraseña")}
              style={{
                background: "none",
                border: "none",
                color: "#ccc",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              ¿Cambiar contraseña?
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "25px",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
            textAlign: "right",
          }}
        >
          <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>
            Product by{" "}
            <span style={{ fontWeight: "600", color: "#888" }}>CAWIMI</span>
          </p>
        </div>
      </div>

      {/* Versión en esquina inferior derecha */}
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

      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <Head>
        <style>{`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      div[style*="maxWidth: '600px'"] {
        padding: 25px 35px 30px !important;
      }
    }

    @media (max-width: 480px) {
      div[style*="maxWidth: '600px'"] {
        padding: 20px 25px 25px !important;
      }
    }
  `}</style>
      </Head>
    </div>
  );
}
