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
      { id: 'ama-de-llaves', label: 'Administración del hogar' },
      { id: 'cocinero/a', label: 'Cocina doméstica' },
      'Planchado y lavandería',
      'Ordenamiento', 'Compras del hogar'
    ])
  },
  {
    id: 'cuidados',
    label: 'Cuidados y salud',
    subrubros: createSubrubros([
      'Adultos mayores', 'Niños', 'Enfermos y postoperatorio',
      'Personas con discapacidad',
      { id: 'enfermero/a', label: 'Enfermería' },
      'Acompañante terapéutico'
    ])
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    subrubros: createSubrubros([
      { id: 'paseador/a', label: 'Paseo de mascotas' },
      { id: 'bañador/a', label: 'Baño de mascotas' },
      'Guardería en casa', 'Adiestramiento'
    ])
  },
  {
    id: 'oficios',
    label: 'Oficios y mantenimiento',
    subrubros: createSubrubros([
      'Electricista',
      { id: 'plomero/a', label: 'Plomería' },
      { id: 'pintor/a', label: 'Pintura' },
      { id: 'jardinero/a', label: 'Jardinería' },
      'Albañil',
      { id: 'carpintero/a', label: 'Carpintería' },
      { id: 'herrero/a', label: 'Herrería' },
      { id: 'fumigador/a', label: 'Fumigación' },
      { id: 'cerrajero/a', label: 'Cerrajería' },
      'Reparación de electrodomésticos'
    ])
  },
  {
    id: 'comercio',
    label: 'Comercio y ventas',
    subrubros: createSubrubros([
      { id: 'vendedor/a', label: 'Ventas en local' },
      { id: 'cajero/a', label: 'Atención de caja' },
      { id: 'repositor/a', label: 'Reposición en góndola' },
      { id: 'promotor/a', label: 'Promoción de productos' },
      { id: 'carnicero/a', label: 'Carnicería' },
      { id: 'panadero/a', label: 'Panadería' },
      'Feriante'
    ])
  },
  {
    id: 'gastronomia',
    label: 'Gastronomía y eventos',
    subrubros: createSubrubros([
      'Catering', 'Repostería',
      { id: 'mozo/a', label: 'Servicio de mesa' },
      'Bartender',
      { id: 'cocinero/a', label: 'Cocina' },
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
