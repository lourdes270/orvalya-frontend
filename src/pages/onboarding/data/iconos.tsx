import {
  Sparkle, Broom, Heartbeat, PawPrint, Wrench,
  CashRegister, CookingPot, Van, ShieldCheck,
  Briefcase, BookOpen, SquaresFour, Compass
} from '@phosphor-icons/react'

export const RUBRO_ICONOS: Record<string, React.ReactNode> = {
  limpieza: <Sparkle weight="light" size={28} color="#1F3864" />,
  domestico: <Broom weight="light" size={28} color="#1F3864" />,
  cuidados: <Heartbeat weight="light" size={28} color="#1F3864" />,
  mascotas: <PawPrint weight="light" size={28} color="#1F3864" />,
  oficios: <Wrench weight="light" size={28} color="#1F3864" />,
  comercio: <CashRegister weight="light" size={28} color="#1F3864" />,
  gastronomia: <CookingPot weight="light" size={28} color="#1F3864" />,
  logistica: <Van weight="light" size={28} color="#1F3864" />,
  seguridad: <ShieldCheck weight="light" size={28} color="#1F3864" />,
  profesionales: <Briefcase weight="light" size={28} color="#1F3864" />,
  arte: <BookOpen weight="light" size={28} color="#1F3864" />,
  varios: <SquaresFour weight="light" size={28} color="#1F3864" />,
  otro: <Compass weight="light" size={28} color="#1F3864" />,
}
