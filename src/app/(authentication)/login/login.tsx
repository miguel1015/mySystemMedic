"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  Button,
  Row,
  Col,
  Alert,
  Container,
  Spinner,
} from "react-bootstrap";

// Zod schema
const loginSchema = z.object({
  username: z.string().min(1, "Campo requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginProps {
  callbackUrl: string;
}

export default function Login({ callbackUrl }: LoginProps) {
  const router = useRouter();
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
    <Container fluid className="vh-80 d-flex p-0">
      <div
        className="d-flex flex-column justify-content-center align-items-start bg-dark text-light p-5"
        style={{ flex: 1, animation: "fadeInLeft 1s" }}
      >
        <h2 className="mb-2">Bienvenido</h2>
        <h4 className="mb-4">Ingresa con tu cuenta</h4>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)} className="w-100">
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              type="text"
              placeholder="Usuario"
              isInvalid={!!errors.username}
              {...register("username")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Contraseña"
              isInvalid={!!errors.password}
              {...register("password")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-3">
            <Col className="text-end">
              <Link href="#" className="text-decoration-none text-info">
                Olvidé mi contraseña
              </Link>
            </Col>
          </Row>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "LOGIN"}
          </Button>

          <div className="mt-3 d-flex justify-content-between">
            <Link href="/register" className="text-decoration-none text-light">
              Crear cuenta
            </Link>
          </div>
        </Form>
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          backgroundImage:
            "url('https://cloudfront-us-east-1.images.arcpublishing.com/copesa/RDH5EPH2TNENPI73NBWUWWMLPA.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: "fadeInRight 1s",
        }}
      />

      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Container>
  );
}
