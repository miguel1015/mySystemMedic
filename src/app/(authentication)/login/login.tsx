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
import CustomButton from "../../../components/button";

// Schema Zod
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

      {/* CARD */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "white",
          borderRadius: "30px",
          padding: "45px 45px",
          width: "100%",
          maxWidth: "420px",
          height: "400px",

          boxShadow:
            "0 8px 20px rgba(0,0,0,0.08), 0 15px 40px rgba(0,0,0,0.12)",

          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Título */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#2b7ab8", fontSize: "30px", margin: 0 }}>
            Data<span style={{ color: "#3ba9e7" }}>Medic</span>
          </h2>
          <h3
            style={{
              color: "#bfbfbf",
              fontWeight: 300,
              marginTop: "4px",
              fontSize: "18px",
            }}
          >
            Login
          </h3>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "10px",
          }}
        >
          {/* Input usuario */}
          <input
            type="text"
            placeholder="Usuario"
            {...register("email")}
            style={{
              width: "100%",
              padding: "10px 18px",
              background: "#F1F1F1",
              border: errors.email
                ? "1px solid #ff4d4d"
                : "1px solid transparent",
              borderRadius: "25px",
              fontSize: "14px",
              height: "36px",
              outline: "none",
              transition: "0.2s",
            }}
          />
          {errors.email && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.email.message}
            </span>
          )}

          {/* Input contraseña */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password")}
              style={{
                width: "100%",
                padding: "10px 18px",
                paddingRight: "45px",
                background: "#F1F1F1",
                border: errors.password
                  ? "1px solid #ff4d4d"
                  : "1px solid transparent",
                borderRadius: "25px",
                fontSize: "14px",
                height: "36px",
                outline: "none",
                transition: "0.2s",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#999",
                fontSize: "14px",
              }}
            >
              <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"} />
            </button>
          </div>
          {errors.password && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.password.message}
            </span>
          )}

          {/* Botón */}
          <CustomButton loading={loading}>Iniciar</CustomButton>
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
