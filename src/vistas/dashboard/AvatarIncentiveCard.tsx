import { useRef, useState, type ChangeEvent, type RefObject } from 'react'
import { cropImageSquare } from '../../lib/cropImageSquare'
import { validateImageUpload } from '../../lib/fileValidation'
import { uploadAvatar } from '../../lib/uploadAvatar'
import type { Perfil } from '../../contexts/AuthContextType'
import { formatZonaDisplay } from './formatZona'
import { formatDescripcionServicio } from '../../lib/formatDescripcionServicio'

interface AvatarIncentiveCardProps {
  perfil: Perfil
  onPerfilUpdate: (perfil: Perfil) => void
  semaforo: string
  docsCount: number
  onDescargarPdf: () => void
  generandoPdf: boolean
}

export default function AvatarIncentiveCard({
  perfil,
  onPerfilUpdate,
  semaforo,
  docsCount,
  onDescargarPdf,
  generandoPdf,
}: AvatarIncentiveCardProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [autorizado, setAutorizado] = useState(false)

  const semaforoIcon = semaforo === 'verde' ? '🟢' : semaforo === 'amarillo' ? '🟡' : '🔴'
  const semaforoLabel = semaforo === 'verde' ? 'Documentación completa' : semaforo === 'amarillo' ? 'En progreso' : 'Documentación incompleta'
  const descripcionTexto = formatDescripcionServicio(perfil.descripcion)
  const zona = formatZonaDisplay(perfil.zona)

  const handleFile = async (file: File) => {
    if (!autorizado) return
    setSubiendo(true)
    setError('')
    try {
      const validacion = await validateImageUpload(file)
      if (!validacion.ok) { setError(validacion.message); return }
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
    if (subiendo || !autorizado) return
    ref.current?.click()
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DEE2E6',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      {/* Header navy con foto */}
      <div style={{
        background: '#0F2D52',
        padding: '24px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Foto o placeholder */}
        <div style={{ position: 'relative' }}>
          {perfil.avatar_url ? (
            <img
              src={perfil.avatar_url}
              alt={perfil.nombre ?? 'Foto de perfil'}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #00B4A6',
              }}
            />
          ) : (
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: '#1F3864',
              border: '3px dashed #00B4A6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
            }}>👤</div>
          )}
        </div>

        {/* Nombre */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>
            {perfil.nombre || 'Tu nombre'}
          </p>
          {descripcionTexto && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#00B4A6' }}>
              {descripcionTexto}
            </p>
          )}
          {zona && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8BAFC7' }}>
              {zona}
            </p>
          )}
        </div>

        {/* Semáforo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255,255,255,0.08)',
          padding: '6px 14px',
          borderRadius: '20px',
        }}>
          <span style={{ fontSize: '14px' }}>{semaforoIcon}</span>
          <span style={{ fontSize: '12px', color: '#fff' }}>{semaforoLabel}</span>
          <span style={{ fontSize: '12px', color: '#8BAFC7' }}>· {docsCount}/3 docs</span>
        </div>
      </div>

      {/* Botón PDF */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F3F5' }}>
        <button
          type="button"
          onClick={onDescargarPdf}
          disabled={generandoPdf}
          style={{
            width: '100%',
            padding: '12px',
            background: generandoPdf ? '#8BAFC7' : '#00B4A6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: generandoPdf ? 'not-allowed' : 'pointer',
          }}
        >
          {generandoPdf ? 'Generando PDF...' : '⬇ Descargar presentación como PDF'}
        </button>
      </div>

      {/* Subir foto — solo si no tiene */}
      {!perfil.avatar_url && (
        <div style={{ padding: '14px 20px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#1F3864' }}>
            Sumá tu foto — las empresas confían más cuando ven a quién contratan
          </p>
          <label style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '10px',
            fontSize: '12px',
            color: '#495057',
            cursor: 'pointer',
            alignItems: 'flex-start',
          }}>
            <input
              type="checkbox"
              checked={autorizado}
              onChange={e => setAutorizado(e.target.checked)}
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
            <span>Autorizo a Orvalya a mostrar esta imagen a empresas contratantes.</span>
          </label>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleInputChange} />
          <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleInputChange} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={subiendo || !autorizado}
              onClick={() => abrirInput(cameraInputRef)}
              style={{
                flex: 1,
                padding: '10px',
                background: '#00B4A6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (subiendo || !autorizado) ? 'not-allowed' : 'pointer',
                opacity: (subiendo || !autorizado) ? 0.5 : 1,
              }}
            >
              📷 Tomar foto
            </button>
            <button
              type="button"
              disabled={subiendo || !autorizado}
              onClick={() => abrirInput(galleryInputRef)}
              style={{
                flex: 1,
                padding: '10px',
                background: '#1F3864',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (subiendo || !autorizado) ? 'not-allowed' : 'pointer',
                opacity: (subiendo || !autorizado) ? 0.5 : 1,
              }}
            >
              🖼 Subir desde galería
            </button>
          </div>
          {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
        </div>
      )}
    </div>
  )
}
