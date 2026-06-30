export type SemaforoEstado = 'verde' | 'amarillo' | 'rojo'

export type PrestadorPublico = {
  id: string
  nombre: string | null
  zona: string | null
  descripcion: string | null
  avatar_url: string | null
  rango_edad: string | null
  sobre_mi: string | null
  experiencia: string | null
  cursos: string | null
  semaforo: SemaforoEstado
}
