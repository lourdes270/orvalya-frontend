import { useRef, useState, type ChangeEvent, type CSSProperties, type RefObject } from 'react'
import { cropImageSquare } from '../../lib/cropImageSquare'
import { validateImageUpload } from '../../lib/fileValidation'
import { uploadAvatar } from '../../lib/uploadAvatar'
import type { Perfil } from '../../contexts/AuthContextType'

interface AvatarIncentiveCardProps {
  perfil: Perfil
  onPerfilUpdate: (perfil: Perfil) => void
}

export default function AvatarIncentiveCard({ perfil, onPerfilUpdate }: AvatarIncentiveCardProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [autorizado, setAutorizado] = useState(false)

  if (perfil.avatar_url) return null

  const botonesDeshabilitados = subiendo || !autorizado

  const handleFile = async (file: File) => {
    if (!autorizado) return
    setSubiendo(true)
    setError('')
    try {
      const validacion = await validateImageUpload(file)
      if (!validacion.ok) {
        setError(validacion.message)
        return
      }
      const blob = await cropImageSquare(file)
      const url = await uploadAvatar(perfil.id, blob)
      if (!url) throw new Error('No se pudo subir la imagen')
      onPerfilUpdate({ ...perfil, avatar_url: url })
    } catch {
      setError('No pudimos subir la imagen. Intentá de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && autorizado) handleFile(f)
    e.target.value = ''
  }

  const abrirInput = (ref: RefObject<HTMLInputElement | null>) => {
    if (botonesDeshabilitados) return
    ref.current?.click()
  }

  const botonStyle: CSSProperties = {
    padding: '10px 16px',
    background: '#00B4A6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: botonesDeshabilitados ? 'not-allowed' : 'pointer',
    opacity: botonesDeshabilitados ? 0.5 : 1,
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
          Sumá la foto o logo de tu empresa
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#495057', lineHeight: 1.4 }}>
          Las empresas confían más cuando ven con quién trabajan. Podés subir tu foto personal o el logo de tu empresa.
        </p>
        <label style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '13px', color: '#495057', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autorizado}
            onChange={e => setAutorizado(e.target.checked)}
            style={{ marginTop: '2px' }}
          />
          <span>Autorizo a Orvalya a mostrar esta imagen a empresas contratantes dentro de la plataforma.</span>
        </label>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            disabled={botonesDeshabilitados}
            onClick={() => abrirInput(cameraInputRef)}
            style={botonStyle}
          >
            {subiendo ? 'Subiendo...' : 'Tomar foto'}
          </button>
          <button
            type="button"
            disabled={botonesDeshabilitados}
            onClick={() => abrirInput(galleryInputRef)}
            style={botonStyle}
          >
            {subiendo ? 'Subiendo...' : 'Subir desde galería/PC'}
          </button>
        </div>
        {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
      </div>
    </div>
  )
}
