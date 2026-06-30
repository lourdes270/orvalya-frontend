import type { Icon } from '@phosphor-icons/react'
import {
  ArrowsClockwise,
  CloudCheck,
  GlobeHemisphereWest,
  Scales,
  Wrench,
} from '@phosphor-icons/react'

export const QUIENES_SOMOS_TEXT =
  'Orvalya nace de más de una década de experiencia directa en el sector de servicios en Uruguay. Vimos de cerca lo que significa para un prestador independiente perder una oportunidad por no tener un papel a mano, y para una empresa asumir un riesgo legal por no saber con quién está trabajando. Construimos la plataforma que resuelve eso — simple, automática y pensada para la realidad uruguaya.'

export const VISION_TEXT =
  'Que cada prestador de servicios en Uruguay pueda demostrar su cumplimiento legal con un clic, y que cada empresa pueda contratar con la tranquilidad de saber que está en regla. Sin trámites, sin intermediarios, sin sorpresas.'

export const POR_QUE_ORVALYA: { icon: Icon; title: string; text: string }[] = [
  {
    icon: CloudCheck,
    title: '100% digital y automático',
    text: 'Olvidate del papeleo',
  },
  {
    icon: Wrench,
    title: 'Diseñado para el prestador real',
    text: 'No solo para grandes corporaciones',
  },
  {
    icon: Scales,
    title: 'Alineado con la Ley 18.099 y 18.251',
    text: 'Desde el primer día',
  },
  {
    icon: ArrowsClockwise,
    title: 'Tus documentos, siempre actualizados',
    text: 'Listos para mostrar cuando te buscan',
  },
  {
    icon: GlobeHemisphereWest,
    title: 'Plataforma 100% uruguaya',
    text: 'Pensada para nuestra realidad',
  },
]

export const COMO_FUNCIONA_PASOS = [
  'Registrate gratis y subí tus documentos',
  'Orvalya verifica y mantiene todo al día',
  'Las empresas te encuentran, vos seguís trabajando',
]

export const NAV_LINKS = [
  { label: 'Quiénes Somos', path: '/quienes-somos' },
  { label: 'Cómo Funciona', path: '/como-funciona' },
] as const
