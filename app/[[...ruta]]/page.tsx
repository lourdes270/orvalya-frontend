import type { Metadata } from 'next'
import SpaMount from './SpaMount'

type Props = { params: Promise<{ ruta?: string[] }> }

/** Rutas de la app privada: no deben entrar al índice de Google. */
const PRIVADAS = ['auth', 'dashboard', 'onboarding', 'admin', 'contratante', 'aceptar-terminos']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ruta } = await params
  const primero = ruta?.[0]

  if (primero && PRIVADAS.includes(primero)) {
    return { robots: { index: false, follow: false } }
  }
  return {}
}

export default function Page() {
  return <SpaMount />
}
