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
  suscripcion_activa: boolean
}

export type AuthContextValue = {
  loading: boolean
  session: Session | null
  user: User | null
  perfil: Perfil | null
  setPerfil: (perfil: Perfil) => void
  signInWithPassword: (args: { email: string; password: string }) => Promise<void>
  signUp: (args: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)