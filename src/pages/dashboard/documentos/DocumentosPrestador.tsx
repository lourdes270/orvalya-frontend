import type { Perfil } from '../../../contexts/AuthContextType'
import { DOCUMENTOS_CONFIG } from './documentosConfig'
import FilaDocumento from './FilaDocumento'
import { useDocumentosPrestador } from './useDocumentosPrestador'

export default function DocumentosPrestador({ perfil }: { perfil: Perfil }) {
  const { docs, setDoc, subir } = useDocumentosPrestador(perfil)

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>
        Mis documentos
      </h2>
      {DOCUMENTOS_CONFIG.map(d => (
        <FilaDocumento
          key={d.key}
          docKey={d.key}
          prestadorId={perfil.id}
          nombre={d.nombre}
          estado={docs[d.key]}
          onChange={c => setDoc(d.key, c)}
          onSubir={() => subir(d.key)}
        />
      ))}
    </div>
  )
}
