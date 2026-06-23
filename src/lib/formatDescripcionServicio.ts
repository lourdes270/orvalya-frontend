import { RUBROS } from '../pages/onboarding/data/rubros'

const rubroMap = new Map(RUBROS.map(r => [r.id, r]))
const subrubroMap = new Map(
  RUBROS.flatMap(r => r.subrubros.map(s => [s.id, { rubro: r, sub: s }] as const)),
)

function formatSegment(rubroId: string, subIds: string[]): string {
  const rubro = rubroMap.get(rubroId)
  const rubroLabel = rubro?.label ?? rubroId
  const subs = subIds
    .map(id => subrubroMap.get(id)?.sub.label ?? id.replace(/-/g, ' '))
    .join(', ')
  return subs ? `${rubroLabel} · ${subs}` : rubroLabel
}

export function formatDescripcionServicio(raw: string | null | undefined): string {
  if (!raw?.trim()) return ''
  try {
    const parsed = JSON.parse(raw) as Record<string, string[]>
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return raw
    const parts = Object.entries(parsed)
      .filter(([, subs]) => Array.isArray(subs) && subs.length > 0)
      .map(([rubroId, subs]) => formatSegment(rubroId, subs))
    return parts.length > 0 ? parts.join(' · ') : raw
  } catch {
    return raw
  }
}

export function isDescripcionJson(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
  } catch {
    return false
  }
}
