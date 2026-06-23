import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'

export type Perfil = {
  id: string
  email: string
  nombre: string | null
  tipo: 'contratante' | 'prestador' | 'ambos' | 'pendiente'
  rut: string | null
  telefono: string | null
  zona: string | null
  descripcion: string | null
  avatar_url: string | null
  declaracion_jurada_aceptada: boolean
  declaracion_jurada_fecha?: string | null
  suscripcion_activa: boolean
  suscripcion_plan?: string | null
  suscripcion_hasta?: string | null
  contratos_activos_count?: number | null
  whatsapp?: string | null
  rango_edad?: string | null
  updated_at?: string | null
  created_at?: string | null
}

export type AuthContextValue = {
  loading: boolean
  session: Session | null
  user: User | null
  perfil: Perfil | null
  setPerfil: (perfil: Perfil) => void
  signInWithPassword: (args: { email: string; password: string }) => Promise<void>
  signUp: (args: { email: string; password: string }) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)