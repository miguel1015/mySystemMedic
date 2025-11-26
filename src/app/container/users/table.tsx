"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/container";
import CustomButton from "@/components/button";
import { useGetUsers } from "@/core/hooks/users/useGetUsers";

export default function UsersTable() {
  const { data: dataUsers } = useGetUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!dataUsers) return [];
    return dataUsers.filter(
      (user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        String(user.userRoleId).includes(search.toLowerCase()) ||
        (user.isActive ? "activo" : "inactivo").includes(search.toLowerCase())
    );
  }, [search, dataUsers]);

  return (
    <Container className="py-4">
      {" "}
      <div className="card shadow-sm">
        {" "}
        <div className="card-body">
          {/* Buscador */}{" "}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />{" "}
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
                {filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{`${user.firstName} ${user.lastName}`}</td>
                    <td>{user.email}</td>
                    <td>{user.userRoleId}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.isActive ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
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
