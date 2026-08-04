/**
 * Copy SEO para landings de prestadores/llamados.
 * Apunta a búsquedas LATAM: monotributista, unipersonal, pyme,
 * independiente, autónomo + rubro + zona.
 */

export type SeoCopy = {
  titulo: string
  intro: string
  metaTitle: string
  metaDesc: string
  keywords: string[]
  cuerpo: string
  faqs: Array<{ pregunta: string; respuesta: string }>
}

/** Audiencia LATAM: cómo se buscan a sí mismos / los buscan las empresas. */
export const AUDIENCIA_LATAM = [
  'prestadores independientes',
  'trabajador independiente',
  'independiente',
  'unipersonal',
  'empresa unipersonal',
  'monotributista',
  'monotributo',
  'mono',
  'pyme',
  'pymes',
  'pequeña empresa',
  'autónomo',
  'freelancer',
  'freelancers',
  'cuenta propia',
  'tercerizados',
  'servicio tercerizado',
] as const

const FAQ_AUDIENCIA: SeoCopy['faqs'] = [
  {
    pregunta: '¿Orvalya es para monotributistas y unipersonales?',
    respuesta:
      'Sí. Está pensada para prestadores independientes: monotributistas, unipersonales, freelancers y pequeños negocios (pyme) que ofrecen servicios con documentación al día.',
  },
  {
    pregunta: '¿También sirve si soy una pyme o empresa chica?',
    respuesta:
      'Sí. Las pymes y empresas contratantes usan Orvalya para encontrar independientes verificados y llevar el seguimiento documental de quienes tercerizan.',
  },
]

/** Términos colaterales por rubro. */
const COLATERALES: Record<string, string[]> = {
  limpieza: [
    'limpieza',
    'sanitización',
    'servicio de limpieza',
    'empresa de limpieza',
    'personal de limpieza',
    'auxiliar de limpieza',
    'desinfección',
    'limpieza de oficinas',
    'limpieza de hogares',
    'monotributista limpieza',
  ],
  cuidados: [
    'cuidados',
    'enfermería',
    'cuidador',
    'acompañante',
    'cuidado de adultos mayores',
    'cuidado infantil',
    'salud a domicilio',
    'cuidador independiente',
  ],
  mascotas: [
    'mascotas',
    'paseador de perros',
    'cuidado de mascotas',
    'guardería canina',
    'baño de mascotas',
  ],
  oficios: [
    'oficios',
    'albañil',
    'electricista',
    'plomero',
    'pintor',
    'mantenimiento',
    'reparaciones',
    'jardinería',
    'oficio independiente',
  ],
  comercio: [
    'comercio',
    'vendedor',
    'cajero',
    'repositor',
    'cadete',
    'personal de tienda',
  ],
  gastronomia: [
    'gastronomía',
    'cocina',
    'mozo',
    'cocinero',
    'catering',
    'eventos',
    'personal de restaurant',
  ],
  logistica: [
    'logística',
    'transporte',
    'delivery',
    'flete',
    'mudanzas',
    'chofer',
    'mensajería',
  ],
  seguridad: [
    'seguridad',
    'vigilancia',
    'control de acceso',
    'vigilante',
    'portería',
  ],
  profesionales: [
    'freelancers',
    'profesionales independientes',
    'diseño',
    'desarrollo web',
    'contabilidad',
    'marketing',
    'autónomo',
  ],
  arte: [
    'clases particulares',
    'educación',
    'música',
    'idiomas',
    'peluquería',
    'estética',
  ],
  varios: ['servicios independientes', 'tercerizados', 'monotributista', 'pyme'],
}

function colateralesDe(rubroId: string | null): string[] {
  if (!rubroId) return [...AUDIENCIA_LATAM]
  return [...(COLATERALES[rubroId] ?? []), ...AUDIENCIA_LATAM.slice(0, 8)]
}

function cortoRubro(rubroLabel: string | null): string {
  if (!rubroLabel) return 'servicios'
  return rubroLabel.split(/y|,/)[0]!.trim().toLowerCase()
}

function regionFrase(zona: string | null): string {
  if (!zona) return 'en Uruguay'
  return `en ${zona}, Uruguay`
}

function keywordsBase(
  rubroId: string | null,
  rubroLabel: string | null,
  zona: string | null,
  tipo: 'prestadores' | 'llamados',
): string[] {
  const corto = cortoRubro(rubroLabel)
  const cols = colateralesDe(rubroId)
  const base = [
    ...AUDIENCIA_LATAM,
    ...cols.slice(0, 8),
    corto,
    zona ?? 'Uruguay',
    'Uruguay',
    'LATAM',
    'Montevideo',
    tipo === 'prestadores' ? 'directorio de independientes' : 'trabajos',
    tipo === 'prestadores' ? 'contratar independiente' : 'empleo',
    tipo === 'llamados' ? 'llamados laborales' : 'documentación BPS BSE DGI',
  ]
  if (zona) {
    base.push(
      `${corto} ${zona}`,
      `independiente ${zona}`,
      `monotributista ${zona}`,
      `pyme ${zona}`,
      `servicios en ${zona}`,
      `${zona} Uruguay`,
    )
  }
  if (corto !== 'servicios') {
    base.push(
      `monotributista ${corto}`,
      `independiente ${corto}`,
      `unipersonal ${corto}`,
      `pyme ${corto}`,
    )
  }
  return [...new Set(base.filter(Boolean))]
}

function conFaqAudiencia(faqs: SeoCopy['faqs']): SeoCopy['faqs'] {
  const keys = new Set(faqs.map(f => f.pregunta))
  return [...faqs, ...FAQ_AUDIENCIA.filter(f => !keys.has(f.pregunta))]
}

export function copyPrestadores(
  rubroId: string | null,
  rubroLabel: string | null,
  zona: string | null,
): SeoCopy {
  const corto = cortoRubro(rubroLabel)
  const region = regionFrase(zona)
  const cols = colateralesDe(rubroId)
  const ejemplos = cols.slice(0, 4).join(', ')
  const keywords = keywordsBase(rubroId, rubroLabel, zona, 'prestadores')

  if (rubroLabel && zona) {
    return {
      titulo: `${corto.charAt(0).toUpperCase() + corto.slice(1)} en ${zona}`,
      intro:
        `Independientes, monotributistas, unipersonales y pymes de ${corto} ${region}. ` +
        `Perfiles con documentación verificada: compará tarifas, zona y contactá directo.`,
      metaTitle: `${corto.charAt(0).toUpperCase() + corto.slice(1)} ${zona} | Mono · Pyme · Independiente`,
      metaDesc:
        `${rubroLabel} en ${zona}, Uruguay. Monotributistas, unipersonales, independientes y pymes: ` +
        `${ejemplos}. Papeles al día en Orvalya.`,
      keywords,
      cuerpo:
        `Si buscás ${corto} en ${zona} —monotributista, unipersonal, freelancer o pyme de servicios— ` +
        `en Orvalya encontrás prestadores independientes con papeles declarados (BPS, BSE, DGI cuando aplica). ` +
        `Ideal para empresas que tercerizan y para independientes que quieren que los encuentren. ` +
        `Filtrá por departamento o mirá llamados abiertos en la misma zona.`,
      faqs: conFaqAudiencia([
        {
          pregunta: `¿Cómo encuentro ${corto} en ${zona}?`,
          respuesta:
            `Acá ves independientes de ${rubroLabel.toLowerCase()} en ${zona}: monotributistas, unipersonales y freelancers. ` +
            `Entrá al perfil, mirá tarifa, zona y documentación, y contactá directo.`,
        },
        {
          pregunta: `¿Hay monotributistas o unipersonales de ${corto} en ${zona}?`,
          respuesta:
            `Sí. El directorio prioriza prestadores independientes (mono, unipersonal, cuenta propia) que ofrecen ${corto} ` +
            `(${ejemplos}) con seguimiento documental para contratantes y pymes.`,
        },
        {
          pregunta: `¿Los perfiles son solo de ${zona}?`,
          respuesta:
            `Listamos quienes declaran trabajar en ${zona}. Algunos también cubren departamentos vecinos o todo Uruguay.`,
        },
      ]),
    }
  }

  if (rubroLabel) {
    return {
      titulo: `${corto.charAt(0).toUpperCase() + corto.slice(1)} en Uruguay`,
      intro:
        `Independientes, monotributistas y unipersonales de ${corto} en todo el país. ` +
        `Filtrá por departamento para ver quién trabaja en tu zona.`,
      metaTitle: `${corto.charAt(0).toUpperCase() + corto.slice(1)} Uruguay | Monotributista e independiente`,
      metaDesc:
        `${rubroLabel} en Uruguay: monotributistas, unipersonales, pymes e independientes de ${corto}. ` +
        `Documentación verificada por departamento.`,
      keywords,
      cuerpo:
        `Buscás ${corto} en Uruguay —monotributista, unipersonal, autónomo o pyme chica— y querés filtrar por región. ` +
        `Orvalya reúne prestadores independientes de ${rubroLabel.toLowerCase()} con perfiles públicos y papeles al día. ` +
        `Usá el filtro de departamento (Montevideo, Canelones, Maldonado, etc.) para acotar la búsqueda.`,
      faqs: conFaqAudiencia([
        {
          pregunta: `¿Dónde hay ${corto} cerca de mí?`,
          respuesta:
            `Elegí tu departamento. Vas a ver independientes (mono, unipersonal, freelancer) que cubren esa zona.`,
        },
        {
          pregunta: `¿Qué incluye ${rubroLabel.toLowerCase()}?`,
          respuesta: `Rubros y tareas frecuentes: ${ejemplos}. Cada perfil detalla qué ofrece.`,
        },
      ]),
    }
  }

  if (zona) {
    return {
      titulo: `Independientes, mono y pymes en ${zona}`,
      intro:
        `Prestadores independientes en ${zona}, Uruguay: monotributistas, unipersonales y pymes de servicios. ` +
        `Limpieza, cuidados, oficios, gastronomía, logística y más.`,
      metaTitle: `Monotributistas e independientes en ${zona} | Orvalya`,
      metaDesc:
        `Independientes, monotributistas, unipersonales y pymes en ${zona}, Uruguay. ` +
        `Servicios con documentación al día. Contratá o registrate gratis.`,
      keywords,
      cuerpo:
        `En ${zona} y alrededores: si sos monotributista, unipersonal o pyme de servicios —o necesitás contratarlos— ` +
        `Orvalya conecta independientes con empresas. Limpieza, cuidados, oficios, delivery, gastronomía y más, ` +
        `con papeles a la vista. Filtrá por rubro o mirá llamados laborales abiertos en ${zona}.`,
      faqs: conFaqAudiencia([
        {
          pregunta: `¿Qué servicios hay en ${zona}?`,
          respuesta:
            `Limpieza, cuidados, oficios, gastronomía, logística, seguridad y más, según los independientes registrados.`,
        },
        {
          pregunta: `¿Puedo registrarme si soy mono o unipersonal en ${zona}?`,
          respuesta:
            `Sí. Creá tu perfil gratis, cargá documentación y aparecé cuando empresas y pymes busquen en ${zona}.`,
        },
      ]),
    }
  }

  return {
    titulo: 'Independientes, monotributistas y pymes en Uruguay',
    intro:
      'Directorio de prestadores independientes en Uruguay: monotributistas, unipersonales, freelancers y pymes de servicios. ' +
      'Buscá por rubro y departamento.',
    metaTitle: 'Monotributistas, unipersonales y pymes | Independientes Uruguay',
    metaDesc:
      'Orvalya: monotributistas, unipersonales, independientes y pymes en Uruguay. ' +
      'Limpieza, oficios, cuidados. Documentación verificada. Registro gratis.',
    keywords,
    cuerpo:
      'Orvalya es la web app para prestadores independientes y empresas en Uruguay y LATAM: ' +
      'monotributistas (mono), empresas unipersonales, freelancers, autónomos y pymes que ofrecen o contratan servicios. ' +
      'Compará perfiles, tarifas y documentación (BPS, BSE, DGI) por rubro y departamento. ' +
      'Si sos independiente, registrate gratis; si sos empresa o pyme, encontrá terceros con papeles al día.',
    faqs: conFaqAudiencia([
      {
        pregunta: '¿Quiénes se registran en Orvalya?',
        respuesta:
          'Prestadores independientes: monotributistas, unipersonales, freelancers y pequeños negocios de limpieza, cuidados, oficios, gastronomía, logística, seguridad y más. También empresas y pymes que tercerizan.',
      },
      {
        pregunta: '¿Cómo empiezo si soy mono o unipersonal?',
        respuesta:
          'Registrate gratis, completá tu perfil, subí documentación y aparecé en búsquedas por rubro y zona en todo Uruguay.',
      },
    ]),
  }
}

export function copyLlamados(
  rubroId: string | null,
  rubroLabel: string | null,
  zona: string | null,
): SeoCopy {
  const corto = cortoRubro(rubroLabel)
  const region = regionFrase(zona)
  const cols = colateralesDe(rubroId)
  const ejemplos = cols.slice(0, 4).join(', ')
  const keywords = keywordsBase(rubroId, rubroLabel, zona, 'llamados')

  if (rubroLabel && zona) {
    return {
      titulo: `Trabajo de ${corto} en ${zona}`,
      intro:
        `Llamados de ${corto} ${region} para independientes, monotributistas y unipersonales. ` +
        `Publicados por empresas y pymes que buscan prestadores ahora.`,
      metaTitle: `Trabajo ${corto} ${zona} | Mono · Independiente · Pyme`,
      metaDesc:
        `Trabajo de ${corto} en ${zona} para monotributistas e independientes. ` +
        `Llamados de empresas y pymes: ${ejemplos}.`,
      keywords,
      cuerpo:
        `Si sos monotributista, unipersonal o independiente y buscás trabajo de ${corto} en ${zona}, ` +
        `acá hay llamados abiertos de empresas y pymes. También podés ver el directorio de independientes del mismo rubro.`,
      faqs: conFaqAudiencia([
        {
          pregunta: `¿Hay empleo de ${corto} en ${zona} para mono o independiente?`,
          respuesta:
            `Los llamados de esta página son avisos de ${rubroLabel.toLowerCase()} en ${zona}, pensados para prestadores independientes.`,
        },
        {
          pregunta: '¿Es un portal de empleos tradicional?',
          respuesta:
            'Orvalya se enfoca en independientes y tercerización con documentación. Los llamados son pedidos reales de servicio o personal en Uruguay.',
        },
      ]),
    }
  }

  if (rubroLabel) {
    return {
      titulo: `Trabajos de ${corto} en Uruguay`,
      intro:
        `Llamados abiertos de ${corto} para independientes, monotributistas y unipersonales en todo el país. Filtrá por departamento.`,
      metaTitle: `Trabajo ${corto} Uruguay | Independientes y monotributistas`,
      metaDesc:
        `Empleos y llamados de ${corto} en Uruguay para mono, unipersonal e independiente: ${ejemplos}.`,
      keywords,
      cuerpo:
        `Ofertas de ${rubroLabel.toLowerCase()} en Uruguay orientadas a independientes y pymes de servicios. ` +
        `Filtrá por zona o mirá el directorio si preferís ofrecer tu servicio.`,
      faqs: conFaqAudiencia([
        {
          pregunta: `¿Cómo busco trabajo de ${corto} cerca?`,
          respuesta: 'Usá el filtro de departamento. Vas a ver solo los llamados de esa zona.',
        },
      ]),
    }
  }

  if (zona) {
    return {
      titulo: `Trabajos para independientes en ${zona}`,
      intro:
        `Llamados abiertos en ${zona} para monotributistas, unipersonales y pymes: limpieza, cuidados, oficios y más.`,
      metaTitle: `Trabajo en ${zona} | Monotributistas e independientes`,
      metaDesc:
        `Trabajos y llamados en ${zona}, Uruguay, para independientes, mono y unipersonales. Servicios con demanda real.`,
      keywords,
      cuerpo:
        `Empleos y llamados laborales en ${zona} para quien trabaja por cuenta propia o con pyme chica. ` +
        `Revisá avisos abiertos o el directorio de independientes de la misma región.`,
      faqs: conFaqAudiencia([
        {
          pregunta: `¿Qué trabajos hay en ${zona}?`,
          respuesta:
            'Depende de lo publicado: limpieza, cuidados, oficios, gastronomía, logística y otros servicios.',
        },
      ]),
    }
  }

  return {
    titulo: 'Trabajos para independientes, mono y pymes en Uruguay',
    intro:
      'Llamados laborales en Uruguay para monotributistas, unipersonales, freelancers y pymes de servicios. Filtrá por rubro y departamento.',
    metaTitle: 'Trabajos Uruguay | Independientes, monotributistas y pymes',
    metaDesc:
      'Llamados y empleos en Uruguay para monotributistas, unipersonales e independientes. Limpieza, oficios, cuidados y más.',
    keywords,
    cuerpo:
      'Orvalya publica llamados de empresas y pymes que necesitan prestadores independientes en Uruguay. ' +
      'Si sos mono, unipersonal o freelancer, buscá por rubro o departamento; si ofrecés servicio, también podés crear tu perfil gratis.',
    faqs: conFaqAudiencia([
      {
        pregunta: '¿Qué tipo de trabajos se publican?',
        respuesta:
          'Pedidos de servicio y personal para independientes: limpieza, cuidados, oficios, comercio, gastronomía, logística, seguridad y más.',
      },
    ]),
  }
}
