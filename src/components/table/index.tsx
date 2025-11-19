"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/container";
import CustomButton from "@/components/button";

// Datos de ejemplo
interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

const initialUsers: User[] = [
  {
    id: 1,
    nombre: "Juan Perez",
    email: "juan@example.com",
    rol: "Admin",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Maria Gomez",
    email: "maria@example.com",
    rol: "Usuario",
    estado: "Inactivo",
  },
  {
    id: 3,
    nombre: "Carlos Sanchez",
    email: "carlos@example.com",
    rol: "Usuario",
    estado: "Activo",
  },
  {
    id: 4,
    nombre: "Ana Torres",
    email: "ana@example.com",
    rol: "Admin",
    estado: "Activo",
  },
  {
    id: 5,
    nombre: "Luis Ramirez",
    email: "luis@example.com",
    rol: "Usuario",
    estado: "Inactivo",
  },
];

export default function UsersTable() {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search) return initialUsers;
    return initialUsers.filter(
      (user) =>
        user.nombre.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.rol.toLowerCase().includes(search.toLowerCase()) ||
        user.estado.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <Container className="py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          {/* Buscador */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tabla */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{user.rol}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.estado === "Activo"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <CustomButton size="sm" variant="outline">
                          Editar
                        </CustomButton>
                        <CustomButton size="sm" variant="danger">
                          Eliminar
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  );
}
