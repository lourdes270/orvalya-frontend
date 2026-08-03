import { useId, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
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

const btnFotoBase: CSSProperties = {
  flex: 1,
  padding: '10px',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  textAlign: 'center',
  display: 'block',
  boxSizing: 'border-box',
}

export default function AvatarIncentiveCard({
  perfil,
  onPerfilUpdate,
  semaforo,
  docsCount,
  onDescargarPdf,
  generandoPdf,
}: AvatarIncentiveCardProps) {
  const uid = useId()
  const cameraId = `${uid}-camera`
  const galleryId = `${uid}-gallery`
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [autorizado, setAutorizado] = useState(Boolean(perfil.avatar_url))
  const [exito, setExito] = useState(false)

  const semaforoIcon = semaforo === 'verde' ? '🟢' : semaforo === 'amarillo' ? '🟡' : '🔴'
  const semaforoLabel = semaforo === 'verde' ? 'Documentación completa' : semaforo === 'amarillo' ? 'En progreso' : 'Documentación incompleta'
  const descripcionTexto = formatDescripcionServicio(perfil.descripcion)
  const zona = formatZonaDisplay(perfil.zona)
  const tieneFoto = Boolean(perfil.avatar_url)
  const disabledFoto = subiendo || !autorizado

  const handleFile = async (file: File) => {
    if (!autorizado) {
      setError('Marcá la casilla de autorización para subir la foto.')
      return
    }
    setSubiendo(true)
    setError('')
    setExito(false)
    try {
      const validacion = await validateImageUpload(file)
      if (!validacion.ok) {
        setError(validacion.message)
        return
      }
      const blob = await cropImageSquare(file)
      const result = await uploadAvatar(perfil.id, blob)
      if (!result.ok) {
        setError(result.message)
        return
      }
      onPerfilUpdate({ ...perfil, avatar_url: result.url })
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch (err) {
      console.error('avatar upload:', err)
      setError('No pudimos procesar la imagen. Probá con JPG o PNG.')
    } finally {
      setSubiendo(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) void handleFile(f)
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #DEE2E6',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      <div style={{
        background: '#0F2D52',
        padding: '24px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <label
          htmlFor={autorizado && !subiendo ? galleryId : undefined}
          aria-label={tieneFoto ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'}
          title={autorizado ? (tieneFoto ? 'Cambiar foto' : 'Agregar foto') : 'Marcá la autorización para cambiar la foto'}
          style={{
            position: 'relative',
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: disabledFoto ? 'not-allowed' : 'pointer',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        >
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
                display: 'block',
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
          <span style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#00B4A6',
            color: '#fff',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #0F2D52',
            pointerEvents: 'none',
          }}>
            📷
          </span>
        </label>

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

      <div style={{ padding: '14px 20px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#1F3864' }}>
          {tieneFoto
            ? 'Cambiar foto de perfil'
            : 'Sumá tu foto — las empresas confían más cuando ven a quién contratan'}
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

        <input
          id={cameraId}
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleInputChange}
          disabled={disabledFoto}
        />
        <input
          id={galleryId}
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
          disabled={disabledFoto}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <label
            htmlFor={disabledFoto ? undefined : cameraId}
            aria-disabled={disabledFoto}
            style={{
              ...btnFotoBase,
              background: '#00B4A6',
              cursor: disabledFoto ? 'not-allowed' : 'pointer',
              opacity: disabledFoto ? 0.5 : 1,
            }}
          >
            {subiendo ? 'Subiendo...' : '📷 Tomar foto'}
          </label>
          <label
            htmlFor={disabledFoto ? undefined : galleryId}
            aria-disabled={disabledFoto}
            style={{
              ...btnFotoBase,
              background: '#1F3864',
              cursor: disabledFoto ? 'not-allowed' : 'pointer',
              opacity: disabledFoto ? 0.5 : 1,
            }}
          >
            {subiendo ? 'Subiendo...' : tieneFoto ? '🖼 Elegir otra foto' : '🖼 Subir desde galería'}
          </label>
        </div>
        {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
        {exito && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#2B8A3E' }}>Foto actualizada</p>}
        {!autorizado && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#8C96A3' }}>
            Marcá la autorización para poder elegir una foto.
          </p>
        )}
      </div>
    </div>
  )
}
