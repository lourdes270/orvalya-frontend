import { jsPDF } from 'jspdf'
import type { Perfil } from '../../contexts/AuthContextType'
import { RUBROS } from '../onboarding/data/rubros'
import { formatZonaDisplay } from './formatZona'

const MARGIN = 22
const LINE_HEIGHT = 5.2
const PAGE_BOTTOM = 278
const HEADER_HEIGHT = 48

const NAVY = { r: 15, g: 45, b: 82 } as const
const TEAL = { r: 0, g: 180, b: 166 } as const
const BODY = { r: 33, g: 37, b: 41 } as const
const MUTED = { r: 73, g: 80, b: 87 } as const

const SECTION_TITLES = {
  contacto: 'DATOS DE CONTACTO',
  servicios: 'SERVICIOS',
  sobreMi: 'SOBRE MÍ',
  experiencia: 'EXPERIENCIA',
  formacion: 'FORMACIÓN',
} as const

async function loadImageAsDataUrl(url: string): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' } | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const format = dataUrl.includes('image/png') ? 'PNG' : 'JPEG'
    return { dataUrl, format }
  } catch {
    return null
  }
}

function slugifyNombre(nombre: string): string {
  return nombre
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'prestador'
}

function extractPalabrasClave(descripcion: string | null | undefined): string[] {
  if (!descripcion?.trim()) return []
  try {
    const parsed = JSON.parse(descripcion) as Record<string, string[]>
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return []

    const rubroMap = new Map(RUBROS.map(r => [r.id, r]))
    const keywords = new Set<string>()

    for (const [rubroId, subIds] of Object.entries(parsed)) {
      const rubro = rubroMap.get(rubroId)
      if (rubro) keywords.add(rubro.label)
      if (!Array.isArray(subIds)) continue
      for (const subId of subIds) {
        const sub = rubro?.subrubros.find(s => s.id === subId)
        keywords.add(sub?.label ?? subId.replace(/-/g, ' '))
      }
    }
    return [...keywords]
  } catch {
    return []
  }
}

function buildContactoText(perfil: Perfil): string[] {
  const lineas: string[] = []
  if (perfil.nombre?.trim()) lineas.push(perfil.nombre.trim())
  if (perfil.email?.trim()) lineas.push(perfil.email.trim())
  if (perfil.telefono?.trim()) lineas.push(`Tel: ${perfil.telefono.trim()}`)
  if (perfil.whatsapp?.trim()) lineas.push(`WhatsApp: ${perfil.whatsapp.trim()}`)
  return lineas
}

function isSectionEmpty(body: string | null | undefined): boolean {
  if (body == null) return true
  const t = body.trim()
  return t === '' || t === '—'
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_BOTTOM) {
    doc.addPage()
    return MARGIN
  }
  return y
}

function drawTealRule(doc: jsPDF, y: number, width: number): number {
  doc.setDrawColor(TEAL.r, TEAL.g, TEAL.b)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, MARGIN + width, y)
  return y + 7
}

function writeAtsSection(
  doc: jsPDF,
  title: string,
  body: string,
  y: number,
  contentWidth: number,
): number {
  const text = body.trim()
  const lines = doc.splitTextToSize(text, contentWidth)
  y = ensureSpace(doc, y, 14 + lines.length * LINE_HEIGHT)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.text(title, MARGIN, y)
  y += 5

  y = drawTealRule(doc, y, contentWidth)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(BODY.r, BODY.g, BODY.b)
  doc.text(lines, MARGIN, y)
  return y + lines.length * LINE_HEIGHT + 12
}

const CONTACT_LINE_HEIGHT = 6
const CHIP_BG = { r: 224, g: 247, b: 245 } as const

function writeContactoSection(
  doc: jsPDF,
  lines: string[],
  y: number,
  contentWidth: number,
): number {
  y = ensureSpace(doc, y, 14 + lines.length * CONTACT_LINE_HEIGHT)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.text(SECTION_TITLES.contacto, MARGIN, y)
  y += 5
  y = drawTealRule(doc, y, contentWidth)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  for (const line of lines) {
    doc.setTextColor(TEAL.r, TEAL.g, TEAL.b)
    doc.text('•', MARGIN, y)
    doc.setTextColor(BODY.r, BODY.g, BODY.b)
    doc.text(line, MARGIN + 4, y)
    y += CONTACT_LINE_HEIGHT
  }
  return y + 6
}

function writeServiciosChips(
  doc: jsPDF,
  descripcion: string | null | undefined,
  y: number,
  contentWidth: number,
): number {
  const chips = extractPalabrasClave(descripcion)
  if (chips.length === 0) return y

  const fontSize = 9
  const chipPadH = 3
  const chipGap = 2.5
  const chipH = 7
  const borderRadius = 3

  y = ensureSpace(doc, y, 20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.text(SECTION_TITLES.servicios, MARGIN, y)
  y += 5
  y = drawTealRule(doc, y, contentWidth)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(fontSize)

  let x = MARGIN
  let rowY = y

  for (const chip of chips) {
    const textW = doc.getTextWidth(chip)
    const chipW = textW + chipPadH * 2

    if (x + chipW > MARGIN + contentWidth && x > MARGIN) {
      x = MARGIN
      rowY += chipH + chipGap
    }

    const prevPage = doc.getNumberOfPages()
    rowY = ensureSpace(doc, rowY, chipH + 4)
    if (doc.getNumberOfPages() > prevPage) {
      x = MARGIN
    }

    doc.setFillColor(CHIP_BG.r, CHIP_BG.g, CHIP_BG.b)
    doc.roundedRect(x, rowY, chipW, chipH, borderRadius, borderRadius, 'F')
    doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
    doc.text(chip, x + chipPadH, rowY + chipH - 2.5)

    x += chipW + chipGap
  }

  return rowY + chipH + 12
}

async function drawHeader(doc: jsPDF, perfil: Perfil): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth()
  const nombre = perfil.nombre?.trim() || 'Prestador Orvalya'

  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b)
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(TEAL.r, TEAL.g, TEAL.b)
  doc.text('Orvalya', MARGIN, 14)

  const photoSize = 28
  const photoX = pageWidth - MARGIN - photoSize
  const photoY = 10
  let nameMaxWidth = contentWidth(doc) - photoSize - 6

  if (perfil.avatar_url) {
    const img = await loadImageAsDataUrl(perfil.avatar_url)
    if (img) {
      try {
        doc.addImage(img.dataUrl, img.format, photoX, photoY, photoSize, photoSize)
      } catch {
        nameMaxWidth = contentWidth(doc)
      }
    } else {
      nameMaxWidth = contentWidth(doc)
    }
  } else {
    nameMaxWidth = contentWidth(doc)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  const nameLines = doc.splitTextToSize(nombre, nameMaxWidth)
  const nameY = 26
  const nameLineHeight = 8
  doc.text(nameLines, MARGIN, nameY)

  const zona = formatZonaDisplay(perfil.zona)
  if (zona) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(180, 195, 210)
    doc.text(zona, MARGIN, nameY + nameLines.length * nameLineHeight)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(200, 220, 235)
  doc.text('Presentación comercial de servicios · Uruguay', MARGIN, HEADER_HEIGHT - 8)

  return HEADER_HEIGHT + 14
}

function contentWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth() - MARGIN * 2
}

export async function descargarPerfilPdf(perfil: Perfil): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const nombre = perfil.nombre?.trim() || 'Prestador Orvalya'
  doc.setProperties({
    title: `Presentación comercial — ${nombre} — Orvalya`,
  })
  const width = contentWidth(doc)
  let y = await drawHeader(doc, perfil)

  const contactoLines = buildContactoText(perfil)
  if (contactoLines.length > 0) {
    y = writeContactoSection(doc, contactoLines, y, width)
  }

  const servicioChips = extractPalabrasClave(perfil.descripcion)
  if (servicioChips.length > 0) {
    y = writeServiciosChips(doc, perfil.descripcion, y, width)
  }

  const textSections: [string, string][] = [
    [SECTION_TITLES.sobreMi, perfil.sobre_mi ?? ''],
    [SECTION_TITLES.experiencia, perfil.experiencia ?? ''],
    [SECTION_TITLES.formacion, perfil.cursos ?? ''],
  ]

  for (const [title, body] of textSections) {
    if (isSectionEmpty(body)) continue
    y = writeAtsSection(doc, title, body, y, width)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
  const footerY = ensureSpace(doc, y, 8)
  doc.text('Documento generado en Orvalya · orvalya.com', MARGIN, footerY)

  doc.save(`presentacion-comercial-orvalya-${slugifyNombre(perfil.nombre || 'prestador')}.pdf`)
}
