/**
 * Rutas públicas que sirve Next (carpeta app/), no el router del SPA.
 *
 * Un navigate() de react-router no las encuentra y cae en el NotFoundPage del
 * SPA, así que hay que forzar una carga completa para que responda el servidor.
 */
export function irAPaginaPublica(ruta: string): void {
  window.location.assign(ruta)
}
