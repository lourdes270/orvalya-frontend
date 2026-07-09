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
      // G19 · SG07 — Empresas de limpieza
      'Limpiador/a',
      'Auxiliar de servicio',
      'Peón',
      'Limpiavidrios',
      'Maquinista',
      { id: 'vidrios-y-altura', label: 'Limpiador/a de fachada' },
      'Encargado/a',
      'Auxiliar área salud',
      'Supervisor/a',
      // Sectores habituales en tercerización (Leyes 18.099 y 18.251)
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
      // G15 — Servicios de salud y anexos
      'Auxiliar de enfermería',
      { id: 'enfermero/a', label: 'Enfermero/a' },
      'Acompañante terapéutico',
      { id: 'adultos-mayores', label: 'Cuidador/a de adultos mayores' },
      { id: 'niños', label: 'Cuidador/a infantil' },
      { id: 'enfermos-y-postoperatorio', label: 'Cuidados postoperatorios' },
      { id: 'personas-con-discapacidad', label: 'Cuidados a personas con discapacidad' },
    ])
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    subrubros: createSubrubros([
      // G19 residual — sin laudo específico
      'Paseador/a',
      'Bañador/a',
      'Guardería en casa',
      'Adiestramiento',
    ])
  },
  {
    id: 'oficios',
    label: 'Oficios y mantenimiento',
    subrubros: createSubrubros([
      // G9 · SG01 — Construcción e instalaciones
      'Peón de obra',
      'Albañil/a',
      { id: 'electricista', label: 'Electricista' },
      'Pintor/a',
      'Carpintero/a',
      'Herrero/a',
      'Plomero/a',
      // G19 · SG16 — Áreas verdes
      { id: 'jardinero/a', label: 'Jardinero/a' },
      // G19 — oficios especializados
      'Fumigador/a',
      'Cerrajero/a',
      'Reparación de electrodomésticos',
    ])
  },
  {
    id: 'comercio',
    label: 'Comercio y ventas',
    subrubros: createSubrubros([
      // G10 · SG01 — Tiendas y comercio general
      'Cadete',
      'Vendedor/a',
      'Cajero/a',
      { id: 'repositor/a', label: 'Repositor/a' },
      'Promotor/a',
      // G11 · SG01 — Comercio minorista de alimentación
      'Carnicero/a',
      { id: 'panadero/a', label: 'Panadero/a' },
      { id: 'feriante', label: 'Feriante de alimentos' },
    ])
  },
  {
    id: 'gastronomia',
    label: 'Gastronomía y eventos',
    subrubros: createSubrubros([
      // G12 · SG04 — Restoranes, parrilladas y cantinas
      'Peón de cocina',
      'Ayudante de cocina',
      'Mozo/a',
      'Bartender',
      'Gambusero/a',
      { id: 'cocinero/a', label: 'Cocinero/a' },
      'Repostero/a',
      'Parrillero/a',
      'Jefe de cocina',
      // G12 · SG01 / catering
      'Catering',
      'Organización de eventos',
    ])
  },
  {
    id: 'logistica',
    label: 'Logística y transporte',
    subrubros: createSubrubros([
      // G13 — Transporte y almacenamiento
      { id: 'delivery', label: 'Chofer/a delivery' },
      { id: 'flete', label: 'Chofer/a de carga' },
      'Fletero/a',
      'Mudanzas',
      'Mensajería',
      { id: 'remis-y-traslados', label: 'Remis y traslados' },
      'Acompañante de viaje',
    ])
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    subrubros: createSubrubros([
      // G19 · SG08 — Empresas de seguridad y vigilancia (seguridad física)
      { id: 'vigilancia', label: 'Vigilante auxiliar' },
      { id: 'control-de-acceso', label: 'Control de acceso' },
      'Encargado de turno',
      { id: 'monitoreo', label: 'Monitoreo y CCTV' },
      'Chofer de seguridad',
    ])
  },
  {
    id: 'profesionales',
    label: 'Freelancers y profesionales',
    subrubros: createSubrubros([
      // G19 — Servicios profesionales y técnicos especializados
      'Diseño gráfico',
      'Desarrollo web',
      'Marketing digital',
      'Fotografía',
      'Video y edición',
      'Redacción y traducción',
      'Contabilidad',
      'Asesoría legal',
      'RRHH',
      'Arquitectura',
    ])
  },
  {
    id: 'arte',
    label: 'Arte y educación',
    subrubros: createSubrubros([
      // G16 — Servicios de enseñanza
      { id: 'clases-particulares', label: 'Profesor/a particular' },
      { id: 'música', label: 'Clases de música' },
      { id: 'idiomas', label: 'Enseñanza de idiomas' },
      // G18 — Culturales y esparcimiento
      { id: 'arte-y-manualidades', label: 'Arte y manualidades' },
      { id: 'yoga-y-fitness', label: 'Yoga y fitness' },
      // G19 · SG15 — Peluquerías unisex
      { id: 'peluquería-y-estética', label: 'Peluquería y estética' },
      'Oficial peinador/a',
      'Manicura y estética',
    ])
  },
  {
    id: 'varios',
    label: 'Varios',
    subrubros: createSubrubros([
      'Limpieza + cuidados',
      'Logística + comercio',
      'Oficios + jardinería',
      'Combinación propia',
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
