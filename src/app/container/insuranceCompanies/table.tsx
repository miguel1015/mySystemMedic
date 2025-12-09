"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/container";
import CustomButton from "@/components/button";
import ModalConfirm from "@/components/modalConfirmation.tsx";
import toast from "react-hot-toast";

import { useInsurers } from "@/core/hooks/utils/useInsurer";
import { useDeleteUser } from "@/core/hooks/users/useDeleteUser";

interface InsuranceTableProps {
  onEdit: (id: number) => void;
}

export default function InsuranceTable({ onEdit }: InsuranceTableProps) {
  const { data: dataInsurers } = useInsurers();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [insurerToDelete, setInsurerToDelete] = useState<number | null>(null);

  // ---------- PAGINACIÓN ----------
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // ---------- FILTRO + ORDENAMIENTO ----------
  const filteredInsurers = useMemo(() => {
    if (!dataInsurers) return [];

    const term = search.toLowerCase();

    return dataInsurers
      .filter(
        (insurer) =>
          insurer.name.toLowerCase().includes(term) ||
          String(insurer.id).includes(term)
      )
      .sort((a, b) => a.id - b.id); // Orden ascendente por ID
  }, [search, dataInsurers]);

  // ---------- CALCULAR PAGINACIÓN ----------
  const totalPages = Math.ceil(filteredInsurers.length / ITEMS_PER_PAGE);

  const paginatedInsurers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredInsurers.slice(start, start + ITEMS_PER_PAGE);
  }, [page, filteredInsurers]);

  // Si al filtrar quedaste en una página que ya no existe
  if (page > totalPages && totalPages > 0) {
    setPage(1);
  }

  return (
    <Container className="py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          {/* Buscador */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar aseguradora..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reinicia a la primera página al buscar
              }}
            />
          </div>

          {/* Tabla */}
          <div className="table-responsive">
            <table className="table table-hover align-middle table-lg">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {paginatedInsurers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-3">
                      No se encontraron aseguradoras
                    </td>
                  </tr>
                )}

                {paginatedInsurers.map((insurer) => (
                  <tr key={insurer.id}>
                    <td>{insurer.id}</td>
                    <td>{insurer.name}</td>

                    <td>
                      <div className="d-flex gap-2">
                        <CustomButton
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(insurer.id)}
                        >
                          Editar
                        </CustomButton>

                        <CustomButton
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setInsurerToDelete(insurer.id);
                            setOpenConfirm(true);
                          }}
                        >
                          Eliminar
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 5,
              }}
            >
              <CustomButton
                variant="soft"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </CustomButton>

              <span className="align-self-center">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
              </span>

              <CustomButton
                variant="soft"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </CustomButton>
            </div>
          )}
        </div>
      </div>

      {/* Confirmación de eliminación */}
      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar aseguradora"
        subtitle="¿Estás seguro de eliminar esta aseguradora?"
        onConfirm={() => {
          deleteUser.mutate(Number(insurerToDelete), {
            onSuccess: () => toast.success("Aseguradora eliminada"),
            onError: () => toast.error("Error eliminando aseguradora"),
          });
          setOpenConfirm(false);
        }}
      />
    </Container>
  );
}
