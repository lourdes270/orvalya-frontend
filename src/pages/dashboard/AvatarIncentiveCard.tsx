import { useRef, useState } from 'react'
import { cropImageSquare } from '../../lib/cropImageSquare'
import { uploadAvatar } from '../../lib/uploadAvatar'
import type { Perfil } from '../../contexts/AuthContextType'

interface AvatarIncentiveCardProps {
  perfil: Perfil
  onPerfilUpdate: (perfil: Perfil) => void
}

export default function AvatarIncentiveCard({ perfil, onPerfilUpdate }: AvatarIncentiveCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  if (perfil.avatar_url) return null

  const handleFile = async (file: File) => {
    setSubiendo(true)
    setError('')
    try {
      const blob = await cropImageSquare(file)
      const url = await uploadAvatar(perfil.id, blob)
      if (!url) throw new Error('No se pudo subir la foto')
      onPerfilUpdate({ ...perfil, avatar_url: url })
    } catch {
      setError('No pudimos subir la foto. Intentá de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #E6FCF5 0%, #fff 100%)',
      border: '1px solid #B2F2E8',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: '#fff',
        border: '2px dashed #00B4A6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        flexShrink: 0,
      }}>👤</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1F3864', fontSize: '15px' }}>
          Sumá tu foto de perfil
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#495057', lineHeight: 1.4 }}>
          Las empresas confían más cuando ven tu rostro. Es opcional y podés hacerlo ahora.
        </p>
        <input ref={inputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }} />
        <button
          type="button"
          disabled={subiendo}
          onClick={() => inputRef.current?.click()}
          style={{
            padding: '10px 16px',
            background: '#00B4A6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: subiendo ? 'not-allowed' : 'pointer',
            opacity: subiendo ? 0.7 : 1,
          }}
        >
          {subiendo ? 'Subiendo...' : 'Subí tu foto'}
        </button>
        {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
      </div>
    </div>
  )
}
