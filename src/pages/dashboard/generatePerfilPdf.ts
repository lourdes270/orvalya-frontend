import { jsPDF } from 'jspdf'
import type { Perfil } from '../../contexts/AuthContextType'
import { formatDescripcionServicio } from '../../lib/formatDescripcionServicio'
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
  zona: 'ZONA DE TRABAJO',
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

function buildServiciosText(descripcion: string | null | undefined): string {
  const resumen = formatDescripcionServicio(descripcion)
  const claves = extractPalabrasClave(descripcion)
  const partes: string[] = []

  if (resumen) {
    partes.push(`Profesional independiente en Uruguay. Servicios ofrecidos: ${resumen}.`)
  }
  if (claves.length > 0) {
    partes.push(`Competencias y palabras clave: ${claves.join(', ')}.`)
  }
  return partes.join(' ') || 'Profesional de servicios independientes registrado en Orvalya, Uruguay.'
}

function buildContactoText(perfil: Perfil): string {
  const lineas = [
    perfil.nombre?.trim() ? `Nombre: ${perfil.nombre.trim()}.` : '',
    perfil.email?.trim() ? `Email: ${perfil.email.trim()}.` : '',
    perfil.telefono?.trim() ? `Teléfono: ${perfil.telefono.trim()}.` : '',
    perfil.whatsapp?.trim() ? `WhatsApp: ${perfil.whatsapp.trim()}.` : '',
  ].filter(Boolean)

  return lineas.join(' ') || 'Datos de contacto disponibles en Orvalya.'
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
  const text = body.trim() || '—'
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
  doc.text(nameLines, MARGIN, 28)

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

  const sections: [string, string][] = [
    [SECTION_TITLES.contacto, buildContactoText(perfil)],
    [SECTION_TITLES.servicios, buildServiciosText(perfil.descripcion)],
    [SECTION_TITLES.zona, formatZonaDisplay(perfil.zona) || '—'],
    [SECTION_TITLES.sobreMi, perfil.sobre_mi ?? ''],
    [SECTION_TITLES.experiencia, perfil.experiencia ?? ''],
    [SECTION_TITLES.formacion, perfil.cursos ?? ''],
  ]

  for (const [title, body] of sections) {
    y = writeAtsSection(doc, title, body, y, width)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
  const footerY = ensureSpace(doc, y, 8)
  doc.text('Documento generado en Orvalya · orvalya.com', MARGIN, footerY)

  doc.save(`presentacion-comercial-orvalya-${slugifyNombre(perfil.nombre || 'prestador')}.pdf`)
}
