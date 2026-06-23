import { STYLES } from '../styles/onboarding.styles'
import { MobileStepFooter } from '../components/MobileStepFooter'

interface Step1FotoPerfilProps {
  previewUrl: string | null
  isMobile: boolean
  onSelectFile: (file: File) => void
  onAvanzar: () => void
  onOmitir: () => void
}

export default function Step1FotoPerfil({
  previewUrl,
  isMobile,
  onSelectFile,
  onAvanzar,
  onOmitir,
}: Step1FotoPerfilProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onSelectFile(file)
  }

  return (
    <div style={STYLES.wrapper(isMobile)}>
      <div style={STYLES.card(isMobile)}>
        <h1 style={STYLES.titulo(isMobile)}>Subí tu foto de perfil</h1>
        <p style={STYLES.subtitulo()}>
          Los contratantes confían más cuando ven tu rostro. Podés cambiarla después.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: '#F1F3F5',
            border: '2px dashed #CED4DA',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '48px', color: '#ADB5BD' }}>👤</span>
            )}
          </div>
          <label style={{
            padding: '12px 24px',
            background: '#1F3864',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Subí tu foto
            <input type="file" accept="image/*" capture="user" onChange={handleFile} style={{ display: 'none' }} />
          </label>
          {!previewUrl && (
            <button type="button" onClick={onOmitir} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>
              Continuar sin foto
            </button>
          )}
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" style={STYLES.botonPrimario(isMobile)} onClick={onAvanzar}>
              {previewUrl ? 'Siguiente' : 'Continuar'}
            </button>
          </div>
        )}
        {isMobile && (
          <MobileStepFooter
            label={previewUrl ? 'Foto lista — siguiente paso' : 'Podés agregar tu foto después'}
            buttonText={previewUrl ? 'Siguiente' : 'Continuar'}
            onAction={onAvanzar}
          />
        )}
      </div>
    </div>
  )
}
