"use client"

import { useMemo, useState } from "react"
import { Button, Input, Tooltip } from "antd"
import {
  DeleteOutlined,
  EditOutlined,
  FontSizeOutlined,
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
  SignatureOutlined,
} from "@ant-design/icons"
import toast from "react-hot-toast"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import Modal from "@/components/modal"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import { formatDate } from "@/core/utils/date"
import {
  useDeleteSignature,
  useSignatures,
} from "@/core/hooks/parameterization/signatures/useSignatures"
import type { SignatureKind, SignatureTemplate } from "@/core/interfaces/parameterization/signatures"
import SignatureStudio, { METHOD_LABELS } from "./SignatureStudio"
import styles from "./signatures.module.scss"

const METHODS: { kind: SignatureKind; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    kind: "drawn",
    label: "Dibujarla",
    hint: "Con el mouse, el dedo o un lápiz digital.",
    icon: <EditOutlined />,
  },
  {
    kind: "uploaded",
    label: "Subir una foto",
    hint: "De la firma en papel; el fondo se quita solo.",
    icon: <PictureOutlined />,
  },
  {
    kind: "typed",
    label: "Escribirla",
    hint: "El nombre en letra caligráfica.",
    icon: <FontSizeOutlined />,
  },
]

type StudioState = { signature: SignatureTemplate | null; method: SignatureKind } | null

export default function SignaturesContainer() {
  const { data, isLoading, isError, refetch } = useSignatures()
  const deleteSignature = useDeleteSignature()
  const [search, setSearch] = useState("")
  const [studio, setStudio] = useState<StudioState>(null)
  // Se cambia la clave en cada apertura para que el estudio arranque siempre limpio.
  const [studioKey, setStudioKey] = useState(0)
  const [toDelete, setToDelete] = useState<SignatureTemplate | null>(null)

  const signatures = data ?? []
  const total = signatures.length
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es")
    if (!term) return signatures
    return signatures.filter((s) => s.name.toLocaleLowerCase("es").includes(term))
  }, [signatures, search])

  const openStudio = (signature: SignatureTemplate | null, method: SignatureKind = "drawn") => {
    setStudioKey((k) => k + 1)
    setStudio({ signature, method: signature?.kind ?? method })
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await deleteSignature.mutateAsync(toDelete.id)
      toast.success("Firma eliminada de la biblioteca")
      setToDelete(null)
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "No se pudo eliminar la firma.")
    }
  }

  return (
    <Container>
      <PageHeader
        icon={<SignatureOutlined />}
        title="Firmas"
        subtitle={
          isLoading
            ? "Cargando firmas…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "firma en la biblioteca" : "firmas en la biblioteca"} · se asignan desde Usuarios`
        }
        actions={
          total > 0 && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openStudio(null)}>
              Nueva firma
            </Button>
          )
        }
      />

      <div className={styles.root}>
        {isLoading ? (
          <div className={styles.grid} aria-busy="true" aria-label="Cargando firmas">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={styles.skeletonTile} />
            ))}
          </div>
        ) : isError ? (
          <div className={styles.messageBox} role="alert">
            <p>No se pudo cargar la biblioteca de firmas. Revise la conexión e intente de nuevo.</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
          </div>
        ) : total === 0 ? (
          <section className={styles.empty} aria-labelledby="signatures-empty-title">
            <h2 className={styles.emptyTitle} id="signatures-empty-title">
              Cree la primera firma de la biblioteca
            </h2>
            <p className={styles.emptyText}>
              Las firmas que guarde aquí se pueden asignar a cualquier usuario desde su formulario, y
              aparecen al pie de la historia clínica, las órdenes médicas y demás documentos que
              firma. Elija cómo quiere crearla:
            </p>
            <div className={styles.methods}>
              {METHODS.map((m) => (
                <button key={m.kind} type="button" className={styles.method} onClick={() => openStudio(null, m.kind)}>
                  <span className={styles.methodIcon} aria-hidden>
                    {m.icon}
                  </span>
                  <span className={styles.methodLabel}>{m.label}</span>
                  <span className={styles.methodHint}>{m.hint}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <>
            <div className={styles.toolbar}>
              <Input
                className={styles.search}
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Buscar firma por nombre"
                aria-label="Buscar firma por nombre"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className={styles.count}>
                {filtered.length === total
                  ? `${total} ${total === 1 ? "firma" : "firmas"}`
                  : `${filtered.length} de ${total}`}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className={styles.messageBox}>
                <p>Ninguna firma coincide con «{search.trim()}».</p>
                <Button onClick={() => setSearch("")}>Limpiar búsqueda</Button>
              </div>
            ) : (
              <ul className={styles.grid} style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {filtered.map((s) => (
                  <li key={s.id} className={styles.tile}>
                    <button
                      type="button"
                      className={styles.tilePaper}
                      onClick={() => openStudio(s)}
                      aria-label={`Editar la firma ${s.name}`}
                    >
                      <img src={s.imageData} alt="" />
                    </button>
                    <div className={styles.tileBody}>
                      <div className={styles.tileText}>
                        <p className={styles.tileName} title={s.name}>
                          {s.name}
                        </p>
                        <p className={styles.tileMeta}>
                          {METHOD_LABELS[s.kind]} · {formatDate(s.updatedAt)}
                        </p>
                      </div>
                      <div className={styles.tileActions}>
                        <Tooltip title="Editar">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            aria-label={`Editar ${s.name}`}
                            onClick={() => openStudio(s)}
                          />
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            aria-label={`Eliminar ${s.name}`}
                            onClick={() => setToDelete(s)}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <Modal
        open={studio !== null}
        onClose={() => setStudio(null)}
        title={studio?.signature ? "Editar firma" : "Nueva firma"}
        size="xl"
      >
        {studio && (
          <SignatureStudio
            key={studioKey}
            signature={studio.signature}
            initialMethod={studio.method}
            onDone={() => setStudio(null)}
            onCancel={() => setStudio(null)}
          />
        )}
      </Modal>

      <ModalConfirm
        open={toDelete !== null}
        title="¿Eliminar esta firma?"
        subtitle={
          toDelete
            ? `«${toDelete.name}» deja de estar en la biblioteca. Los usuarios que ya la tienen asignada la conservan.`
            : undefined
        }
        confirmText="Eliminar"
        loading={deleteSignature.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </Container>
  )
}
