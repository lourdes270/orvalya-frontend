export const QUIENES_SOMOS_TEXT =
  'Orvalya nace de más de una década de experiencia directa en el sector de servicios en Uruguay. Vimos de cerca lo que significa para un prestador independiente perder una oportunidad por no tener un papel a mano, y para una empresa asumir un riesgo legal por no saber con quién está trabajando. Construimos la plataforma que resuelve eso — simple y pensada para la realidad uruguaya.'

export const VISION_TEXT =
  'Que cada prestador de servicios en Uruguay pueda demostrar su cumplimiento legal con un clic, y que cada empresa pueda contratar con la documentación a la vista. Sin trámites, sin intermediarios, sin sorpresas.'

/**
 * Sin componentes de icono acá: este módulo lo consumen las páginas
 * server-rendered de app/, y @phosphor-icons/react es solo de cliente.
 */
export const POR_QUE_ORVALYA: { title: string; text: string }[] = [
  {
    title: 'Todo en un solo lugar',
    text: 'Legajos, certificados y vencimientos sin planillas sueltas',
  },
  {
    title: 'Diseñado para el prestador real',
    text: 'No solo para grandes corporaciones',
  },
  {
    title: 'Alineado con la Ley 18.099 y 18.251',
    text: 'Desde el primer día',
  },
  {
    title: 'Tus documentos, siempre actualizados',
    text: 'Listos para mostrar cuando te buscan',
  },
  {
    title: 'Plataforma 100% uruguaya',
    text: 'Pensada para nuestra realidad',
  },
]

export const COMO_FUNCIONA_PASOS = [
  'Registrate gratis y subí tus documentos',
  'Orvalya organiza tus vencimientos y te avisa cuando se acercan',
  'Las empresas te encuentran, vos seguís trabajando',
]

export const NAV_LINKS = [
  { label: 'Quiénes Somos', path: '/quienes-somos' },
  { label: 'Cómo Funciona', path: '/como-funciona' },
] as const
