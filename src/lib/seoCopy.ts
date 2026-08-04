/**
 * Copy SEO para landings de prestadores/llamados.
 * Combina keywords cortas, zona/región y términos colaterales
 * (servicio, empresa, personal, empleo, trabajo) sin relleno artificial.
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

/** Términos colaterales por rubro: lo que la gente busca aunque no diga “prestador”. */
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
  ],
  cuidados: [
    'cuidados',
    'enfermería',
    'cuidador',
    'acompañante',
    'cuidado de adultos mayores',
    'cuidado infantil',
    'salud a domicilio',
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
    'profesionales',
    'diseño',
    'desarrollo web',
    'contabilidad',
    'marketing',
  ],
  arte: [
    'clases particulares',
    'educación',
    'música',
    'idiomas',
    'peluquería',
    'estética',
  ],
  varios: ['servicios', 'tercerizados', 'prestadores'],
}

const COLATERALES_GENERALES = [
  'prestadores independientes',
  'unipersonal',
  'monotributista',
  'freelancers',
  'servicios',
  'tercerizados',
  'documentación verificada',
  'Uruguay',
]

function colateralesDe(rubroId: string | null): string[] {
  if (!rubroId) return COLATERALES_GENERALES
  return COLATERALES[rubroId] ?? COLATERALES_GENERALES
}

function cortoRubro(rubroLabel: string | null): string {
  if (!rubroLabel) return 'servicios'
  // "Limpieza y sanitización" → "limpieza"
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
    ...cols.slice(0, 6),
    corto,
    zona ?? 'Uruguay',
    'Uruguay',
    tipo === 'prestadores' ? 'prestadores independientes' : 'trabajos',
    tipo === 'prestadores' ? 'unipersonal' : 'empleo',
    tipo === 'prestadores' ? 'monotributista' : 'llamados laborales',
    tipo === 'llamados' ? 'llamados laborales' : 'directorio',
  ]
  if (zona) {
    base.push(`${corto} ${zona}`, `servicios en ${zona}`, `${zona} Uruguay`)
  }
  return [...new Set(base.filter(Boolean))]
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
        `Prestadores independientes de ${corto} y servicios relacionados ${region}. ` +
        `Unipersonales, monotributistas y freelancers con documentación verificada: compará tarifas, zona y contactá directo.`,
      metaTitle: `${corto.charAt(0).toUpperCase() + corto.slice(1)} en ${zona} | Independientes Uruguay`,
      metaDesc:
        `${rubroLabel} en ${zona}, Uruguay. Contratá independientes (unipersonal, monotributista): ` +
        `${ejemplos}. Documentación al día en Orvalya.`,
      keywords,
      cuerpo:
        `Si buscás ${corto} en ${zona} —servicio puntual, personal independiente o unipersonal— ` +
        `en Orvalya encontrás perfiles con papeles declarados (BPS, BSE, DGI cuando aplica). ` +
        `También podés filtrar por otros departamentos del Uruguay o mirar llamados abiertos en la misma zona.`,
      faqs: [
        {
          pregunta: `¿Cómo encuentro ${corto} en ${zona}?`,
          respuesta:
            `En esta página ves prestadores independientes de ${rubroLabel.toLowerCase()} que trabajan en ${zona}. ` +
            `Entrá al perfil, mirá tarifa, zona y documentación, y contactá directo.`,
        },
        {
          pregunta: `¿Sirve si busco unipersonal o monotributista de ${corto}?`,
          respuesta:
            `Sí. Orvalya está pensada para independientes, unipersonales y monotributistas que ofrecen ${corto} ` +
            `(${ejemplos}) con seguimiento documental para contratantes.`,
        },
        {
          pregunta: `¿Los independientes son solo de ${zona}?`,
          respuesta:
            `Listamos quienes declaran trabajar en ${zona}. Algunos también cubren departamentos vecinos o todo Uruguay.`,
        },
      ],
    }
  }

  if (rubroLabel) {
    return {
      titulo: `${corto.charAt(0).toUpperCase() + corto.slice(1)} en Uruguay`,
      intro:
        `Prestadores independientes de ${corto} en todo el país. Filtrá por departamento (Montevideo, Canelones, Maldonado y más) ` +
        `para ver quién trabaja en tu zona.`,
      metaTitle: `${corto.charAt(0).toUpperCase() + corto.slice(1)} en Uruguay | Independientes`,
      metaDesc:
        `${rubroLabel} en Uruguay: independientes, unipersonales y monotributistas de ${corto}. ` +
        `Directorio con documentación verificada por departamento.`,
      keywords,
      cuerpo:
        `Buscás ${corto} en Uruguay —independiente, unipersonal o monotributista— y querés ver opciones por región. ` +
        `Orvalya agrupa prestadores independientes de ${rubroLabel.toLowerCase()} con perfiles públicos y papeles al día. ` +
        `Usá el filtro de departamento para acotar a tu zona o ciudad.`,
      faqs: [
        {
          pregunta: `¿Dónde hay ${corto} cerca de mí?`,
          respuesta:
            `Elegí tu departamento en los filtros. Vas a ver independientes que declaran cubrir esa zona del Uruguay.`,
        },
        {
          pregunta: `¿Qué incluye ${rubroLabel.toLowerCase()}?`,
          respuesta:
            `Rubros y tareas frecuentes: ${ejemplos}. Cada perfil detalla qué ofrece.`,
        },
      ],
    }
  }

  if (zona) {
    return {
      titulo: `Independientes y servicios en ${zona}`,
      intro:
        `Prestadores independientes en ${zona}, Uruguay: limpieza, cuidados, oficios, gastronomía, logística y más. ` +
        `Unipersonales y monotributistas con documentación verificada.`,
      metaTitle: `Independientes y servicios en ${zona} | Orvalya Uruguay`,
      metaDesc:
        `Prestadores independientes en ${zona}, Uruguay. Limpieza, cuidados, oficios, gastronomía y más. ` +
        `Unipersonales y monotributistas con papeles al día.`,
      keywords,
      cuerpo:
        `${zona} y alrededores: si necesitás contratar un servicio o personal independiente ` +
        `(limpieza, cuidados, oficios, delivery, gastronomía, etc.), acá ves prestadores independientes de la zona. ` +
        `Filtrá por tipo de servicio o mirá llamados laborales abiertos en ${zona}.`,
      faqs: [
        {
          pregunta: `¿Qué servicios hay en ${zona}?`,
          respuesta:
            `Limpieza, cuidados y salud, oficios, gastronomía, logística, seguridad y más, según los independientes registrados en Orvalya.`,
        },
        {
          pregunta: `¿Puedo contratar desde otra ciudad?`,
          respuesta:
            `Sí, si el independiente cubre ${zona} o todo Uruguay. Revisá la zona declarada en cada perfil.`,
        },
      ],
    }
  }

  return {
    titulo: 'Prestadores independientes en Uruguay',
    intro:
      'Directorio de independientes, unipersonales y monotributistas en Uruguay: limpieza, cuidados, oficios, gastronomía, logística y más. ' +
      'Buscá por rubro y departamento.',
    metaTitle: 'Prestadores independientes en Uruguay | Unipersonales y monotributistas',
    metaDesc:
      'Encontrá prestadores independientes en Uruguay: unipersonales, monotributistas y freelancers. ' +
      'Limpieza, cuidados, oficios. Documentación verificada por departamento.',
    keywords,
    cuerpo:
      'Orvalya conecta empresas y particulares con prestadores independientes en todo Uruguay. ' +
      'Si buscás limpieza, oficios, cuidados, gastronomía o logística —por ciudad o departamento— ' +
      'podés comparar perfiles de unipersonales y monotributistas, tarifas y estado documental antes de contactar.',
    faqs: [
      {
        pregunta: '¿Quiénes se registran en Orvalya?',
        respuesta:
          'Prestadores independientes: unipersonales, monotributistas y freelancers de limpieza, cuidados, oficios, gastronomía, logística, seguridad y más.',
      },
      {
        pregunta: '¿Cómo filtro por zona?',
        respuesta:
          'Elegí el departamento (Artigas, Montevideo, Canelones, Maldonado, etc.) en los filtros de esta página.',
      },
    ],
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
        `Llamados y ofertas de ${corto} ${region}. Empleos y trabajos publicados por empresas y particulares que buscan prestadores ahora.`,
      metaTitle: `Trabajo ${corto} en ${zona} | Empleos y llamados`,
      metaDesc:
        `Trabajo de ${corto} en ${zona}, Uruguay. Empleos, llamados laborales y ofertas: ${ejemplos}. Publicados en Orvalya.`,
      keywords,
      cuerpo:
        `Si buscás trabajo de ${corto} en ${zona} —empleo, jornada, o llamado puntual— ` +
        `acá figuran avisos abiertos de quienes necesitan personal o servicio. ` +
        `También podés ver prestadores de ${corto} ya registrados en la misma zona.`,
      faqs: [
        {
          pregunta: `¿Hay empleo de ${corto} en ${zona}?`,
          respuesta:
            `Los llamados abiertos de esta página son avisos actuales de ${rubroLabel.toLowerCase()} en ${zona}. Revisá requisitos y postulate o contactá.`,
        },
        {
          pregunta: '¿Es lo mismo que un portal de empleos?',
          respuesta:
            'Orvalya se enfoca en prestadores y tercerización con documentación. Los llamados son pedidos reales de servicio o personal en Uruguay.',
        },
      ],
    }
  }

  if (rubroLabel) {
    return {
      titulo: `Trabajos de ${corto} en Uruguay`,
      intro:
        `Llamados abiertos de ${corto} en todo el país. Filtrá por departamento para ver empleos y trabajos en tu zona.`,
      metaTitle: `Trabajo de ${corto} en Uruguay | Llamados abiertos`,
      metaDesc:
        `Empleos y trabajos de ${corto} en Uruguay: ${ejemplos}. Llamados laborales abiertos por zona.`,
      keywords,
      cuerpo:
        `Ofertas y llamados de ${rubroLabel.toLowerCase()} en Uruguay. Buscá por región para encontrar trabajo cerca tuyo, ` +
        `o explorá prestadores del mismo rubro si preferís ofrecer tu servicio.`,
      faqs: [
        {
          pregunta: `¿Cómo busco trabajo de ${corto} cerca?`,
          respuesta: 'Usá el filtro de departamento. Vas a ver solo los llamados de esa zona del Uruguay.',
        },
      ],
    }
  }

  if (zona) {
    return {
      titulo: `Trabajos y empleos en ${zona}`,
      intro:
        `Llamados abiertos en ${zona}: limpieza, cuidados, oficios, gastronomía y más. Publicados por quienes buscan prestadores hoy.`,
      metaTitle: `Trabajo en ${zona} | Empleos y llamados Uruguay`,
      metaDesc:
        `Trabajos y empleos en ${zona}, Uruguay. Llamados laborales de limpieza, oficios, cuidados y más.`,
      keywords,
      cuerpo:
        `Empleos y llamados laborales en ${zona} y zona. Si buscás trabajo corto o continuo en servicios, ` +
        `revisá los avisos abiertos o el directorio de prestadores de la misma región.`,
      faqs: [
        {
          pregunta: `¿Qué trabajos hay en ${zona}?`,
          respuesta:
            'Depende de lo publicado: limpieza, cuidados, oficios, gastronomía, logística y otros servicios.',
        },
      ],
    }
  }

  return {
    titulo: 'Trabajos y llamados abiertos en Uruguay',
    intro:
      'Empleos y llamados laborales en Uruguay: limpieza, cuidados, oficios, gastronomía, logística y más. Filtrá por rubro y departamento.',
    metaTitle: 'Trabajos y empleos en Uruguay | Llamados laborales',
    metaDesc:
      'Trabajo en Uruguay: llamados laborales y empleos de limpieza, oficios, cuidados, gastronomía. Avisos abiertos por zona.',
    keywords,
    cuerpo:
      'Orvalya publica llamados de empresas y particulares que necesitan prestadores en Uruguay. ' +
      'Buscá trabajo por rubro o por departamento, o pasá al directorio de prestadores si querés ofrecer tu servicio.',
    faqs: [
      {
        pregunta: '¿Qué tipo de trabajos se publican?',
        respuesta:
          'Pedidos de servicio y personal: limpieza, cuidados, oficios, comercio, gastronomía, logística, seguridad y más.',
      },
    ],
  }
}
