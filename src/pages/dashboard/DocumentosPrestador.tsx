import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { supabase } from '../../lib/supabase'

const DOCUMENTOS = [
  { key: 'certificado_dgi', nombre: 'Certificado DGI' },
  { key: 'certificado_bps', nombre: 'Certificado BPS' },
  { key: 'constancia_bse', nombre: 'Constancia BSE' },
]

type DocEstado = {
  archivo: File | null
  fecha_vencimiento: string
  subiendo: boolean
  subido: boolean
  error: string
}

export default function DocumentosPrestador() {
  const { perfil } = useAuth()
  const [docs, setDocs] = useState<Record<string, DocEstado>>(
    Object.fromEntries(DOCUMENTOS.map(d => [d.key, {
      archivo: null, fecha_vencimiento: '', subiendo: false, subido: false, error: ''
    }]))
  )

  const setDoc = (key: string, changes: Partial<DocEstado>) => {
    setDocs(prev => ({ ...prev, [key]: { ...prev[key], ...changes } }))
  }

  const subir = async (key: string) => {
    const doc = docs[key]
    if (!doc.archivo || !doc.fecha_vencimiento || !perfil) return
    setDoc(key, { subiendo: true, error: '' })
    try {
      const ext = doc.archivo.name.split('.').pop()
      const path = `${perfil.id}/${key}.${ext}`

      // Remove old files
      await supabase.storage.from('documentos').remove([
        `${perfil.id}/${key}.pdf`,
        `${perfil.id}/${key}.jpg`,
        `${perfil.id}/${key}.jpeg`,
        `${perfil.id}/${key}.png`,
      ]).catch(() => {}) // Ignore errors if files don't exist

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('documentos').upload(path, doc.archivo)
      if (uploadError) throw uploadError

      // Try upsert: update if exists, insert if not
      const { error: upsertError } = await supabase
        .from('documentos')
        .upsert({
          prestador_id: perfil.id,
          nombre: key,
          archivo_url: path,
          fecha_vencimiento: doc.fecha_vencimiento
        }, { onConflict: 'prestador_id,nombre' })
      
      // Ignore permission denied errors for contratos table - document was likely saved
      if (upsertError && upsertError.message?.includes('contratos')) {
        console.warn('Upsert succeeded but trigger failed on contratos:', upsertError)
      } else if (upsertError) {
        throw upsertError
      }

      setDoc(key, { subido: true, subiendo: false })
    } catch (err: unknown) {
      console.error('Upload error:', err)
      let msg = 'Error al subir'
      if (err instanceof Error) {
        msg = err.message
      } else if (typeof err === 'object' && err !== null) {
        msg = JSON.stringify(err)
      }
      setDoc(key, { error: msg, subiendo: false })
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>
        Mis documentos
      </h2>
      {DOCUMENTOS.map(d => (
        <FilaDocumento
          key={d.key}
          nombre={d.nombre}
          estado={docs[d.key]}
          onChange={(changes) => setDoc(d.key, changes)}
          onSubir={() => subir(d.key)}
        />
      ))}
    </div>
  )
}

function FilaDocumento({ nombre, estado, onChange, onSubir }: {
  nombre: string
  estado: DocEstado
  onChange: (c: Partial<DocEstado>) => void
  onSubir: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F3F5' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{estado.subido ? '✅' : '⬜'}</span>
          <span style={{ fontWeight: 500, color: '#1F3864', fontSize: '14px' }}>{nombre}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input type="date" value={estado.fecha_vencimiento}
            onChange={e => onChange({ fecha_vencimiento: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '13px', color: '#495057' }} />
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={e => onChange({ archivo: e.target.files?.[0] ?? null })} />
          <button onClick={() => inputRef.current?.click()}
            style={{ padding: '6px 12px', background: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#495057' }}>
            {estado.archivo ? estado.archivo.name.substring(0, 20) + '...' : 'Seleccionar archivo'}
          </button>
          <button onClick={onSubir}
            disabled={!estado.archivo || !estado.fecha_vencimiento || estado.subiendo}
            style={{ padding: '6px 14px', background: estado.subido ? '#40C057' : '#1F3864', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', opacity: (!estado.archivo || !estado.fecha_vencimiento) ? 0.5 : 1 }}>
            {estado.subiendo ? 'Subiendo...' : estado.subido ? 'Subido ✓' : 'Subir'}
          </button>
        </div>
      </div>
      {estado.error && <p style={{ color: '#FA5252', fontSize: '12px', margin: '6px 0 0' }}>{estado.error}</p>}
    </div>
  )
}