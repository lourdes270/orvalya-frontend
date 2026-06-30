import type { SemaforoEstado } from '../types/prestadorPublico'

export function labelSemaforo(estado: SemaforoEstado): string {
  if (estado === 'verde') return 'Completo'
  if (estado === 'amarillo') return 'En progreso'
  return 'Incompleto'
}

export function colorSemaforo(estado: SemaforoEstado): string {
  if (estado === 'verde') return '#40C057'
  if (estado === 'amarillo') return '#FAB005'
  return '#FA5252'
}

export function iconoSemaforo(estado: SemaforoEstado): string {
  if (estado === 'verde') return '🟢'
  if (estado === 'amarillo') return '🟡'
  return '🔴'
}
