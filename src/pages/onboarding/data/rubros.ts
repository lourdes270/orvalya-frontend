import type { Rubro, SubRubro } from '../types'

const slugify = (text: string): string =>
  text.toLowerCase().replace(/\s+/g, '-')

type SubrubroInput = string | { id: string; label: string }

const createSubrubros = (items: SubrubroInput[]): SubRubro[] =>
  items.map(item =>
    typeof item === 'string'
      ? { id: slugify(item), label: item }
      : item
  )

/** Rubros retirados del onboarding; se mantienen para perfiles ya guardados. */
const RUBROS_LEGACY_LABELS: Record<string, string> = {
  domestico: 'Servicio doméstico',
}

export function getRubroLabel(id: string): string {
  return RUBROS.find(r => r.id === id)?.label ?? RUBROS_LEGACY_LABELS[id] ?? id
}

export const RUBROS: Omit<Rubro, 'icono'>[] = [
  {
    id: 'limpieza',
    label: 'Limpieza y sanitización',
    subrubros: createSubrubros([
      // Categorías del Consejo de Salarios — Grupo 19, Subgrupo 07 (Empresas de limpieza)
      'Limpiador/a',
      'Auxiliar de servicio',
      'Peón',
      'Limpiavidrios',
      'Maquinista',
      { id: 'vidrios-y-altura', label: 'Limpiador/a de fachada' },
      'Encargado/a',
      'Auxiliar área salud',
      'Supervisor/a',
      // Sectores donde suelen contratar empresas (Leyes 18.099 y 18.251 — tercerización)
      { id: 'hogares', label: 'Hogares' },
      { id: 'oficinas', label: 'Oficinas y edificios' },
      'Industrial',
      'Post-obra',
      'Desinfección',
      'Alfombras y tapizados',
    ])
  },
  {
    id: 'cuidados',
    label: 'Cuidados y salud',
    subrubros: createSubrubros([
      'Adultos mayores', 'Niños', 'Enfermos y postoperatorio',
      'Personas con discapacidad', 'Enfermero/a',
      'Acompañante terapéutico'
    ])
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    subrubros: createSubrubros([
      'Paseador/a', 'Bañador/a', 'Guardería en casa', 'Adiestramiento'
    ])
  },
  {
    id: 'oficios',
    label: 'Oficios y mantenimiento',
    subrubros: createSubrubros([
      'Electricista', 'Plomero/a', 'Pintor/a', 'Jardinero/a',
      'Albañil', 'Carpintero/a', 'Herrero/a', 'Fumigador/a',
      'Cerrajero/a', 'Reparación de electrodomésticos'
    ])
  },
  {
    id: 'comercio',
    label: 'Comercio y ventas',
    subrubros: createSubrubros([
      'Vendedor/a', 'Cajero/a', 'Repositor/a', 'Promotor/a',
      'Carnicero/a', 'Panadero/a', 'Feriante'
    ])
  },
  {
    id: 'gastronomia',
    label: 'Gastronomía y eventos',
    subrubros: createSubrubros([
      'Catering', 'Repostería', 'Mozo/a', 'Bartender',
      { id: 'cocinero/a', label: 'Cocinero/a' },
      'Organización de eventos'
    ])
  },
  {
    id: 'logistica',
    label: 'Logística y transporte',
    subrubros: createSubrubros([
      'Delivery', 'Mudanzas', 'Mensajería',
      'Remis y traslados', 'Flete', 'Acompañante de viaje'
    ])
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    subrubros: createSubrubros([
      'Vigilancia', 'Control de acceso', 'Monitoreo'
    ])
  },
  {
    id: 'profesionales',
    label: 'Freelancers y profesionales',
    subrubros: createSubrubros([
      'Diseño gráfico', 'Desarrollo web', 'Marketing digital',
      'Fotografía', 'Video y edición', 'Redacción y traducción',
      'Contabilidad', 'Asesoría legal', 'RRHH', 'Arquitectura'
    ])
  },
  {
    id: 'arte',
    label: 'Arte y educación',
    subrubros: createSubrubros([
      'Clases particulares', 'Música', 'Idiomas',
      'Arte y manualidades', 'Yoga y fitness',
      'Peluquería y estética'
    ])
  },
  {
    id: 'varios',
    label: 'Varios',
    subrubros: createSubrubros([
      'Limpieza + cuidados', 'Logística + comercio',
      'Oficios + jardinería', 'Combinación propia'
    ]),
    tieneTextoLibre: true
  },
  {
    id: 'otro',
    label: 'Otro',
    subrubros: [],
    tieneTextoLibre: true
  }
]
