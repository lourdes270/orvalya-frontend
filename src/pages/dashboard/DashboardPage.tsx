import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { X } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/useAuth'
import type { Perfil } from '../../contexts/AuthContextType'
import { supabase } from '../../lib/supabase'
import {
  resumenDocumentos,
  semaforoDesdeResumen,
  type ResumenDocumentos,
} from '../../lib/documentoVencimiento'
import { colorSemaforo, labelSemaforo } from '../../lib/semaforo'
import type { SemaforoEstado } from '../../types/prestadorPublico'
import DocumentosPrestador from './documentos/DocumentosPrestador'
import { DOCUMENTOS_CONFIG } from './documentos/documentosConfig'
import { fetchVigenteDocuments } from './documentos/uploadDocument'
import PerfilPrestador from './PerfilPrestador'
import PerfilPublicoCard from './PerfilPublicoCard'
import AvatarIncentiveCard from './AvatarIncentiveCard'
import DashboardContratante from './DashboardContratante'
import CuentaSeguridadPanel from './CuentaSeguridadPanel'
import { useContratanteProfile } from '../../hooks/useContratanteProfile'
import { DISCLAIMER_PLATAFORMA } from '../legal/legalCopy'

export { formatZonaDisplay } from './formatZona'

const CINCO_MINUTOS_MS = 5 * 60 * 1000

function esPerfilRecienCreado(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < CINCO_MINUTOS_MS
}

function BannerBienvenida({ esContratante, onClose }: { esContratante: boolean; onClose: () => void }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '14px 16px',
      backgroundColor: '#40C057',
      color: '#ffffff',
    }}>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, flex: 1 }}>
        {esContratante
          ? 'Te damos la bienvenida a Orvalya. Completá tu perfil para publicar llamados de servicio.'
          : 'Te damos la bienvenida a Orvalya. Completá tus documentos para aparecer en búsquedas.'}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#ffffff',
        }}
      >
        <X size={20} weight="bold" />
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const { user, perfil: perfilGlobal, setPerfil, signOut } = useAuth()
  const navigate = useNavigate()
  const [perfil, setPerfilLocal] = useState<Perfil | null>(null)
  const [cargandoPerfil, setCargandoPerfil] = useState(true)
  const [bannerCerrado, setBannerCerrado] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setCargandoPerfil(false)
      return
    }

    let mounted = true

    const fetchPerfil = async () => {
      setCargandoPerfil(true)
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!mounted) return
        if (error) throw error
        if (data) {
          setPerfilLocal(data)
          setPerfil(data)
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err)
      } finally {
        if (mounted) setCargandoPerfil(false)
      }
    }

    fetchPerfil()
    return () => { mounted = false }
  }, [user?.id, setPerfil])

  const handlePerfilUpdate = (updated: Perfil) => {
    setPerfilLocal(updated)
    setPerfil(updated)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const perfilActivo = perfil ?? perfilGlobal
  const esContratante = perfilActivo?.tipo === 'contratante'
  const { perfilCompleto, loading: loadingContratante } = useContratanteProfile()
  const mostrarBanner = !bannerCerrado && esPerfilRecienCreado(perfilActivo?.created_at)

  if (cargandoPerfil) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#8C96A3' }}>
        Cargando perfil...
      </div>
    )
  }

  if (esContratante && !loadingContratante && !perfilCompleto) {
    return <Navigate to="/contratante/perfil" replace />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {mostrarBanner && <BannerBienvenida esContratante={esContratante} onClose={() => setBannerCerrado(true)} />}
      <div style={{ padding: '40px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#8C96A3', fontSize: '13px', margin: 0 }}>
            {user?.email} · {perfilActivo?.tipo === 'prestador' ? 'Prestador' : 'Empresa contratante'}
          </p>
          <button onClick={handleSignOut} style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #DEE2E6', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#495057' }}>
            Cerrar sesión
          </button>
        </div>
        {perfilActivo?.tipo === 'prestador'
          ? <DashboardPrestador perfil={perfilActivo} onPerfilUpdate={handlePerfilUpdate} />
          : <DashboardContratante />}
      </div>
      </div>
    </div>
  )
}

function DashboardPrestador({ perfil, onPerfilUpdate }: { perfil: Perfil; onPerfilUpdate: (p: Perfil) => void }) {
  const [tabActiva, setTabActiva] = useState<'perfil' | 'documentos' | 'cuenta'>('perfil')
  const [semaforo, setSemaforo] = useState<SemaforoEstado>('rojo')
  const [docsCount, setDocsCount] = useState(0)
  const [resumenDocs, setResumenDocs] = useState<ResumenDocumentos | null>(null)
  const [generandoPdf, setGenerandoPdf] = useState(false)

  const aplicarResumen = useCallback((resumen: ResumenDocumentos, nextSemaforo: SemaforoEstado) => {
    setResumenDocs(resumen)
    setDocsCount(resumen.cargados)
    setSemaforo(nextSemaforo)
  }, [])

  useEffect(() => {
    fetchVigenteDocuments(perfil.id).then(({ data, error }) => {
      if (error) {
        console.error('Error semaforo:', error)
        return
      }
      const byKey = new Map(
        (data ?? []).map(row => [row.tipo_documento ?? row.nombre, row.fecha_vencimiento]),
      )
      const items = DOCUMENTOS_CONFIG.map(d => ({
        subido: byKey.has(d.key),
        fechaVencimiento: byKey.get(d.key) ?? null,
      }))
      const resumen = resumenDocumentos(items, DOCUMENTOS_CONFIG.length)
      aplicarResumen(resumen, semaforoDesdeResumen(resumen))
    }).catch(console.error)
  }, [perfil.id, aplicarResumen])

  const semaforoLabel = labelSemaforo(semaforo)
  const semaforoColor = colorSemaforo(semaforo)

  const handleDescargarPdf = async () => {
    setGenerandoPdf(true)
    try {
      const { descargarPerfilPdf } = await import('./generatePerfilPdf')
      await descargarPerfilPdf(perfil)
    } catch (err) {
      console.error('Error generando PDF:', err)
    } finally {
      setGenerandoPdf(false)
    }
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    flex: 1,
    padding: '12px 4px',
    fontSize: '13px',
    fontWeight: tabActiva === tab ? 600 : 400,
    border: 'none',
    borderBottom: tabActiva === tab ? '2px solid #00B4A6' : '2px solid transparent',
    background: tabActiva === tab ? '#fff' : '#F8F9FA',
    color: tabActiva === tab ? '#00B4A6' : '#8C96A3',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  })

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DEE2E6', marginBottom: '0', background: '#F8F9FA', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        <button style={tabStyle('perfil')} onClick={() => setTabActiva('perfil')}>
          <span style={{ fontSize: '18px' }}>👤</span>
          Mi perfil
        </button>
        <button style={tabStyle('documentos')} onClick={() => setTabActiva('documentos')}>
          <span style={{ fontSize: '18px' }}>📄</span>
          Documentos
        </button>
        <button style={tabStyle('cuenta')} onClick={() => setTabActiva('cuenta')}>
          <span style={{ fontSize: '18px' }}>⚙️</span>
          Mi cuenta
        </button>
      </div>

      {/* TAB: MI PERFIL */}
      {tabActiva === 'perfil' && (
        <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '16px' }}>
          <AvatarIncentiveCard
            perfil={perfil}
            onPerfilUpdate={onPerfilUpdate}
            semaforo={semaforo}
            docsCount={docsCount}
            onDescargarPdf={handleDescargarPdf}
            generandoPdf={generandoPdf}
          />
          <PerfilPublicoCard perfil={perfil} />
          <PerfilPrestador perfil={perfil} onPerfilUpdate={onPerfilUpdate} />
        </div>
      )}

      {/* TAB: DOCUMENTOS */}
      {tabActiva === 'documentos' && (
        <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '20px 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            background: '#F8F9FA',
            border: '1px solid #DEE2E6',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <span
              aria-hidden
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: semaforoColor,
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1F3864' }}>
                Documentación: {semaforoLabel}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8C96A3' }}>
                {docsCount} de 3 certificados
                {resumenDocs && resumenDocs.vencidos > 0
                  ? ` · ${resumenDocs.vencidos} vencido${resumenDocs.vencidos === 1 ? '' : 's'}`
                  : resumenDocs && resumenDocs.porVencer > 0
                    ? ` · ${resumenDocs.porVencer} por vencer`
                    : ''}
              </p>
            </div>
          </div>

          <DocumentosPrestador perfil={perfil} onResumenChange={aplicarResumen} />

          <p style={{ margin: '16px 0 0', fontSize: '11px', color: '#ADB5BD', lineHeight: 1.5 }}>
            {DISCLAIMER_PLATAFORMA}
          </p>
        </div>
      )}

      {/* TAB: MI CUENTA */}
      {tabActiva === 'cuenta' && (
        <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '20px 16px' }}>
          <CuentaSeguridadPanel />
        </div>
      )}

    </div>
  )
}