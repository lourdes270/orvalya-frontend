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

export const RUBROS: Omit<Rubro, 'icono'>[] = [
  {
    id: 'limpieza',
    label: 'Limpieza y sanitización',
    subrubros: createSubrubros([
      'Hogares', 'Oficinas', 'Industrial', 'Post-obra',
      'Vidrios y altura', 'Desinfección', 'Alfombras y tapizados'
    ])
  },
  {
    id: 'domestico',
    label: 'Servicio doméstico',
    subrubros: createSubrubros([
      // Categoría General (Consejo de Salarios — trabajo doméstico)
      'Ama de llaves',
      { id: 'ordenamiento', label: 'Orden y limpieza del hogar' },
      'Planchado y lavandería',
      { id: 'compras-del-hogar', label: 'Mandados y compras del hogar' },
      // Categoría Cocina (Consejo de Salarios — trabajo doméstico)
      { id: 'cocinero/a', label: 'Cocinero/a' },
    ])
  },
  {
    id: 'cuidados',
    label: 'Cuidados y salud',
    subrubros: createSubrubros([
      // Categoría Cuidados (Consejo de Salarios — trabajo doméstico)
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
