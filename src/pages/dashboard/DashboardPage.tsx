import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/useAuth'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { Perfil } from '../../contexts/AuthContextType'
import { supabase } from '../../lib/supabase'
import DocumentosPrestador from './documentos/DocumentosPrestador'
import PerfilPrestador from './PerfilPrestador'
import AvatarIncentiveCard from './AvatarIncentiveCard'
import { statsGridStyle } from './dashboardLayout'
import DashboardContratante from './DashboardContratante'
import CuentaSeguridadPanel from './CuentaSeguridadPanel'
import { useContratanteProfile } from '../../hooks/useContratanteProfile'
import { Navigate } from 'react-router-dom'
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
          ? '¡Bienvenido a Orvalya! Completá tu perfil para publicar llamados de servicio.'
          : '¡Bienvenida a Orvalya! Completá tus documentos para aparecer en búsquedas.'}
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
          <div>
            <h1 style={{ color: '#1F3864', fontSize: '24px', fontWeight: 700, margin: 0 }}>Orvalya</h1>
            <p style={{ color: '#8C96A3', fontSize: '13px', margin: '4px 0 0' }}>
              {user?.email} · {perfilActivo?.tipo === 'prestador' ? 'Prestador' : 'Empresa contratante'}
            </p>
          </div>
          <button onClick={handleSignOut} style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #DEE2E6', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#495057' }}>
            Cerrar sesión
          </button>
        </div>
        <CuentaSeguridadPanel />
        {perfilActivo?.tipo === 'prestador'
          ? <DashboardPrestador perfil={perfilActivo} onPerfilUpdate={handlePerfilUpdate} />
          : <DashboardContratante />}
      </div>
      </div>
    </div>
  )
}

function DashboardPrestador({ perfil, onPerfilUpdate }: { perfil: Perfil; onPerfilUpdate: (p: Perfil) => void }) {
  const isMobile = useIsMobile(640)
  const [semaforo, setSemaforo] = useState<string>('rojo')
  const [docsCount, setDocsCount] = useState(0)
  const [generandoPdf, setGenerandoPdf] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { count, error } = await supabase
        .from('documentos').select('*', { count: 'exact', head: true })
        .eq('prestador_id', perfil.id)
        .eq('estado', 'vigente')
      if (error) console.error('Error semaforo:', error)
      const total = count ?? 0
      setDocsCount(total)
      setSemaforo(total >= 3 ? 'verde' : total >= 1 ? 'amarillo' : 'rojo')
    }
    loadData().catch(console.error)
  }, [perfil.id])

  const semaforoIcon = semaforo === 'verde' ? '🟢' : semaforo === 'amarillo' ? '🟡' : '🔴'
  const semaforoLabel = semaforo === 'verde' ? 'Completo' : semaforo === 'amarillo' ? 'En progreso' : 'Incompleto'

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

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleDescargarPdf}
          disabled={generandoPdf}
          style={{
            padding: '10px 18px',
            background: '#1F3864',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: generandoPdf ? 'not-allowed' : 'pointer',
            opacity: generandoPdf ? 0.7 : 1,
          }}
        >
          {generandoPdf ? 'Generando PDF...' : 'Descargar presentación comercial como PDF'}
        </button>
      </div>
      <div style={statsGridStyle(isMobile)}>
        <Tarjeta
          titulo="Semáforo"
          valor={`${semaforoIcon} ${semaforoLabel}`}
          desc="Estado de documentación"
          disclaimer="El semáforo indica el estado de tu documentación según lo que declaraste. No constituye verificación legal ni certificación de cumplimiento."
        />
        <Tarjeta titulo="Documentos" valor={`${docsCount} / 3`} desc="Certificados cargados" />
        <Tarjeta titulo="Contratos activos" valor="0" desc="Órdenes de servicio" />
      </div>
      <AvatarIncentiveCard perfil={perfil} onPerfilUpdate={onPerfilUpdate} />
      <PerfilPrestador perfil={perfil} onPerfilUpdate={onPerfilUpdate} />
      <DocumentosPrestador perfil={perfil} />
      <Seccion titulo="Mis contratos">
        <ItemVacio texto="Todavía no tenés contratos. Las empresas que te encuentren en Orvalya podrán contratarte desde acá." />
      </Seccion>
      <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#ADB5BD', lineHeight: 1.5 }}>
        {DISCLAIMER_PLATAFORMA}
      </p>
    </div>
  )
}

function Tarjeta({ titulo, valor, desc, disclaimer }: { titulo: string; valor: string; desc: string; disclaimer?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <p style={{ color: '#8C96A3', fontSize: '13px', margin: '0 0 8px' }}>{titulo}</p>
      <p style={{ color: '#1F3864', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{valor}</p>
      <p style={{ color: '#ADB5BD', fontSize: '12px', margin: disclaimer ? '0 0 8px' : 0 }}>{desc}</p>
      {disclaimer && (
        <p style={{ color: '#ADB5BD', fontSize: '11px', lineHeight: 1.4, margin: 0 }}>{disclaimer}</p>
      )}
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h2 style={{ color: '#1F3864', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>{titulo}</h2>
      {children}
    </div>
  )
}

function ItemVacio({ texto }: { texto: string }) {
  return (
    <p style={{ color: '#ADB5BD', fontSize: '14px', margin: 0, padding: '16px', background: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
      {texto}
    </p>
  )
}