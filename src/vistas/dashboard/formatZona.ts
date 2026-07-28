export function formatZonaDisplay(zona: string | null | undefined): string {
  if (!zona?.trim()) return ''
  try {
    const parsed = JSON.parse(zona) as { todoUruguay?: boolean; departamentos?: string[] }
    if (typeof parsed.todoUruguay === 'boolean') {
      if (parsed.todoUruguay) return 'Todo Uruguay'
      if (parsed.departamentos?.length) return parsed.departamentos.join(', ')
    }
  } catch {
    // formato antiguo: string plano
  }
  return zona
}
