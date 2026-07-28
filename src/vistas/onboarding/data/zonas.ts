export const DEPARTAMENTOS = [
  'Artigas',
  'Canelones',
  'Cerro Largo',
  'Colonia',
  'Durazno',
  'Flores',
  'Florida',
  'Lavalleja',
  'Maldonado',
  'Montevideo',
  'Paysandú',
  'Río Negro',
  'Rivera',
  'Rocha',
  'Salto',
  'San José',
  'Soriano',
  'Tacuarembó',
  'Treinta y Tres',
] as const

export const ZONAS_MONTEVIDEO = [
  'Todo Montevideo',
  'Zona Centro',
  'Zona Este',
  'Zona Oeste',
  'Zona Norte',
  'Zona Sur',
] as const

export type Departamento = typeof DEPARTAMENTOS[number]
export type ZonaMontevideo = typeof ZONAS_MONTEVIDEO[number]
