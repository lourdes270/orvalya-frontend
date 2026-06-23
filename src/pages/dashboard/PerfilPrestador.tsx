import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Perfil } from '../../contexts/AuthContextType'
import { isDescripcionJson } from '../../lib/formatDescripcionServicio'
import { RANGOS_EDAD, selectRangoEdadStyle } from '../../lib/rangoEdad'
import { formatZonaDisplay } from './formatZona'
import PerfilPublicoCard from './PerfilPublicoCard'
import { DescripcionServicioField } from './DescripcionServicioField'

interface PerfilPrestadorProps {
  perfil: Perfil
  onPerfilUpdate: (perfil: Perfil) => void
}

export default function PerfilPrestador({ perfil, onPerfilUpdate }: PerfilPrestadorProps) {
  const [form, setForm] = useState({ nombre: '', telefono: '', zona: '', rut: '', descripcion: '', rango_edad: '' })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!perfil) return
    setForm({
      nombre: perfil.nombre ?? '',
      telefono: perfil.telefono ?? '',
      zona: formatZonaDisplay(perfil.zona),
      rut: perfil.rut ?? '',
      descripcion: perfil.descripcion ?? '',
      rango_edad: perfil.rango_edad ?? '',
    })
  }, [perfil])

  const guardar = async () => {
    if (!perfil) return
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setGuardando(true)
    setError('')
    try {
      const payload: Record<string, string | null> = {
        nombre: form.nombre,
        telefono: form.telefono,
        rut: form.rut,
        rango_edad: form.rango_edad || null,
      }
      if (!isDescripcionJson(form.descripcion)) payload.descripcion = form.descripcion
      const { error } = await supabase.from('perfiles').update(payload).eq('id', perfil.id)
      if (error) throw error
      onPerfilUpdate({ ...perfil, ...form, rango_edad: form.rango_edad || null })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const campo = (label: string, key: 'nombre' | 'rut' | 'telefono' | 'zona', placeholder: string) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '6px', fontWeight: 500 }}>{label}</label>
      <input
        type="text"
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '14px', color: '#212529', boxSizing: 'border-box' }}
      />
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Mi perfil</h2>
      <PerfilPublicoCard perfil={{ ...perfil, nombre: form.nombre, rango_edad: form.rango_edad || null }} />
      {campo('Nombre de la empresa o persona', 'nombre', 'Ej: Limpieza Industrial García')}
      {campo('RUT', 'rut', 'Ej: 21234567-8')}
      {campo('Teléfono', 'telefono', 'Ej: 099 123 456')}
      {campo('Zona de trabajo', 'zona', 'Ej: Montevideo, Canelones')}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '6px', fontWeight: 500 }}>Rango de edad (opcional)</label>
        <select value={form.rango_edad} onChange={e => setForm(prev => ({ ...prev, rango_edad: e.target.value }))} style={selectRangoEdadStyle}>
          <option value="">Preferir no indicar</option>
          {RANGOS_EDAD.map(r => <option key={r} value={r}>{r} años</option>)}
        </select>
      </div>
      <DescripcionServicioField raw={form.descripcion} />
      {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
      <button onClick={guardar} disabled={guardando} style={{ padding: '10px 24px', background: guardado ? '#40C057' : '#1F3864', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
        {guardando ? 'Guardando...' : guardado ? 'Guardado ✓' : 'Guardar perfil'}
      </button>
    </div>
  )
}
