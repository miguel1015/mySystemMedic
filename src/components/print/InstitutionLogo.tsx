"use client"

import type { TProvider } from "@/core/interfaces/parameterization/types"

interface Props {
  provider?: TProvider
  className?: string
}

// Logo cargado en "Datos IPS" para los encabezados de impresión. Si la institución no tiene
// logo no se muestra nada, para no imprimir el de otra entidad. El tamaño y la posición
// los define `className` en el CSS de cada documento; la imagen se ajusta sin deformarse.
export const InstitutionLogo = ({ provider, className }: Props) => {
  if (!provider?.logo) return null

  return (
    <div className={className}>
      <img
        src={provider.logo}
        alt={provider.name ? `Logo ${provider.name}` : "Logo"}
        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }}
      />
    </div>
  )
}
