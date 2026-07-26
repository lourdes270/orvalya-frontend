import { useCallback, useEffect, useState } from 'react'
import type { Perfil } from '../../../contexts/AuthContextType'
import {
  fetchAvisosDocumentosInApp,
  marcarAvisoLeido,
  type AvisoDocumento,
} from '../../../lib/avisosDocumentos'
import type { ResumenDocumentos } from '../../../lib/documentoVencimiento'
import { DOCUMENTOS_CONFIG } from './documentosConfig'
import TarjetaDocumento from './TarjetaDocumento'
import { useDocumentosPrestador } from './useDocumentosPrestador'

type Props = {
  perfil: Perfil
  onResumenChange?: (resumen: ResumenDocumentos, semaforo: 'verde' | 'amarillo' | 'rojo') => void
}

export default function DocumentosPrestador({ perfil, onResumenChange }: Props) {
  const { docs, setDoc, subir, resumen } = useDocumentosPrestador(perfil, onResumenChange)
  const [avisos, setAvisos] = useState<AvisoDocumento[]>([])

  const cargarAvisos = useCallback(() => {
    fetchAvisosDocumentosInApp(perfil.id).then(setAvisos).catch(console.error)
  }, [perfil.id])

  useEffect(() => {
    cargarAvisos()
  }, [cargarAvisos])

  const avisosSinLeer = avisos.filter(a => !a.leido_at)

  return (
    <div>
      <ResumenPrioridad resumen={resumen} />

      {avisosSinLeer.length > 0 && (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {avisosSinLeer.slice(0, 3).map(a => (
            <div
              key={a.id}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: a.umbral_dias < 0 ? '#FEF3F2' : '#FFFAEB',
                border: `1px solid ${a.umbral_dias < 0 ? '#FECDCA' : '#FEDF89'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F2D52' }}>{a.titulo}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475467', lineHeight: 1.45 }}>{a.cuerpo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void marcarAvisoLeido(a.id).then(cargarAvisos)
                  }}
                  style={{
                    flexShrink: 0,
                    background: 'transparent',
                    border: 'none',
                    color: '#667085',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Listo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ color: '#0F2D52', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
        Legajo para tercerización
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#667085', lineHeight: 1.5 }}>
        DGI, BPS y BSE son los papeles que suelen pedir las empresas. Orvalya te avisa antes de que venzan.
      </p>

      {DOCUMENTOS_CONFIG.map(d => (
        <TarjetaDocumento
          key={d.key}
          docKey={d.key}
          prestadorId={perfil.id}
          nombre={d.nombre}
          ayuda={d.ayuda}
          estado={docs[d.key]}
          onChange={c => setDoc(d.key, c)}
          onSubir={() => subir(d.key)}
        />
      ))}
    </div>
  )
}

function ResumenPrioridad({ resumen }: { resumen: ResumenDocumentos }) {
  const urgencia =
    resumen.vencidos > 0
      ? { titulo: 'Hay documentos vencidos', desc: 'Actualizalos para recuperar el semáforo en verde.', bg: '#FEF3F2', border: '#FECDCA', color: '#B42318' }
      : resumen.porVencer > 0
        ? {
            titulo: resumen.diasProximo === 0 ? 'Hay un vencimiento hoy' : `Próximo vencimiento en ${resumen.diasProximo} días`,
            desc: `${resumen.porVencer} documento${resumen.porVencer === 1 ? '' : 's'} por renovar.`,
            bg: '#FFFAEB',
            border: '#FEDF89',
            color: '#B54708',
          }
        : resumen.faltantes > 0
          ? {
              titulo: `Faltan ${resumen.faltantes} de ${resumen.totalRequeridos}`,
              desc: 'Completá el legajo para aparecer mejor ante empresas.',
              bg: '#F8FAFC',
              border: '#E4E7EC',
              color: '#344054',
            }
          : {
              titulo: 'Legajo al día',
              desc: 'Los tres certificados están vigentes. Te avisamos antes del próximo vencimiento.',
              bg: '#ECFDF3',
              border: '#A6F4C5',
              color: '#027A48',
            }

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '12px',
        background: urgencia.bg,
        border: `1px solid ${urgencia.border}`,
        marginBottom: '16px',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: urgencia.color }}>{urgencia.titulo}</p>
      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475467', lineHeight: 1.45 }}>{urgencia.desc}</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px', fontSize: '12px', color: '#667085' }}>
        <span>{resumen.alDia} al día</span>
        <span>{resumen.porVencer} por vencer</span>
        <span>{resumen.vencidos} vencidos</span>
        <span>{resumen.faltantes} pendientes</span>
      </div>
    </div>
  )
}
