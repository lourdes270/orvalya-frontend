import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'

export default function PerfilPrestador() {
  const { perfil, setPerfil } = useAuth()
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    zona: '',
    rut: '',
    descripcion: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!perfil) return
    setForm({
      nombre: perfil.nombre ?? '',
      telefono: perfil.telefono ?? '',
      zona: perfil.zona ?? '',
      rut: perfil.rut ?? '',
      descripcion: perfil.descripcion ?? '',
    })
  }, [perfil])

  const guardar = async () => {
    if (!perfil) return
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setGuardando(true)
    setError('')
    try {
      const { error } = await supabase
        .from('perfiles')
        .update(form)
        .eq('id', perfil.id)
      if (error) throw error
      setPerfil({ ...perfil, ...form })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const campo = (label: string, key: keyof typeof form, placeholder: string, multiline = false) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: '#495057', marginBottom: '6px', fontWeight: 500 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '14px', color: '#212529', resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '14px', color: '#212529', boxSizing: 'border-box' }}
        />
      )}
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Mi perfil</h2>
      {campo('Nombre de la empresa o persona', 'nombre', 'Ej: Limpieza Industrial García')}
      {campo('RUT', 'rut', 'Ej: 21234567-8')}
      {campo('Teléfono', 'telefono', 'Ej: 099 123 456')}
      {campo('Zona de trabajo', 'zona', 'Ej: Montevideo, Canelones')}
      {campo('Descripción del servicio', 'descripcion', 'Describí brevemente qué servicios ofrecés', true)}
      {error && <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
      <button
        onClick={guardar}
        disabled={guardando}
        style={{ padding: '10px 24px', background: guardado ? '#40C057' : '#1F3864', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
      >
        {guardando ? 'Guardando...' : guardado ? 'Guardado ✓' : 'Guardar perfil'}
      </button>
    </div>
  )
}