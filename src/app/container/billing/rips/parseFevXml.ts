// Datos de la factura electrónica (FEV) que el MUV cruza con el RIPS. Salen del XML
// AttachedDocument que devuelve Facturación Electrónica: la factura firmada (Invoice) viaja
// como texto dentro de cac:Attachment / cac:ExternalReference / cbc:Description.
export interface FevSummary {
  // cbc:ID: número de la factura (RVC004).
  invoiceNum: string | null
  // AccountingSupplierParty / PartyTaxScheme / CompanyID: NIT del facturador (RVC001).
  supplierNit: string | null
  // cbc:CustomizationID: tipo de operación. La FEV en salud usa los tipos SS-* (SS-CUFE,
  // SS-SinAporte, etc.); 10 es una factura comercial estándar.
  customizationId: string | null
  // LegalMonetaryTotal / LineExtensionAmount: valor de los servicios antes de pagos
  // moderadores y anticipos (RVG08).
  lineExtensionAmount: number | null
  // cac:InvoicePeriod: periodo de facturación, obligatorio para el MUV (VFE020 / VFE021) y
  // contra el que se validan las fechas de los servicios (RVC014 / RVC044).
  periodStart: string | null
  periodEnd: string | null
  // UBLExtensions / CustomTagGeneral: campos adicionales del sector salud (FED060).
  hasHealthExtension: boolean
}

const firstByLocalName = (root: Document | Element, name: string): Element | null =>
  root.getElementsByTagNameNS("*", name)[0] ?? null

const childByLocalName = (parent: Element | null, name: string): Element | null => {
  if (!parent) return null
  return Array.from(parent.children).find((child) => child.localName === name) ?? null
}

const text = (element: Element | null) => element?.textContent?.trim() || null

function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder("utf-8").decode(bytes)
}

function findInvoice(attached: Document): Element | null {
  const direct = firstByLocalName(attached, "Invoice")
  if (direct) return direct

  const parser = new DOMParser()
  for (const description of Array.from(attached.getElementsByTagNameNS("*", "Description"))) {
    const content = description.textContent ?? ""
    if (!content.includes("<Invoice")) continue
    const inner = parser.parseFromString(content.trim(), "application/xml")
    if (inner.getElementsByTagName("parsererror").length) continue
    const invoice = firstByLocalName(inner, "Invoice")
    if (invoice) return invoice
  }
  return null
}

// Devuelve null si el Base64 no es un AttachedDocument con una factura legible.
export function parseFevXml(base64: string | null | undefined): FevSummary | null {
  if (!base64) return null
  try {
    const attached = new DOMParser().parseFromString(decodeBase64Utf8(base64), "application/xml")
    if (attached.getElementsByTagName("parsererror").length) return null
    const invoice = findInvoice(attached)
    if (!invoice) return null

    const supplierTaxScheme = firstByLocalName(
      childByLocalName(childByLocalName(invoice, "AccountingSupplierParty"), "Party") ?? invoice,
      "PartyTaxScheme",
    )
    const period = childByLocalName(invoice, "InvoicePeriod")
    const amountText = text(childByLocalName(childByLocalName(invoice, "LegalMonetaryTotal"), "LineExtensionAmount"))
    const amount = amountText === null ? NaN : Number(amountText)

    return {
      invoiceNum: text(childByLocalName(invoice, "ID")),
      supplierNit: text(childByLocalName(supplierTaxScheme, "CompanyID")),
      customizationId: text(childByLocalName(invoice, "CustomizationID")),
      lineExtensionAmount: Number.isFinite(amount) ? amount : null,
      periodStart: text(childByLocalName(period, "StartDate")),
      periodEnd: text(childByLocalName(period, "EndDate")),
      hasHealthExtension: invoice.getElementsByTagNameNS("*", "CustomTagGeneral").length > 0,
    }
  } catch {
    return null
  }
}
