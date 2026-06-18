import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/useAuth'
import type { Perfil } from '../../contexts/AuthContextType'
import { supabase } from '../../lib/supabase'
import DocumentosPrestador from './DocumentosPrestador'
import PerfilPrestador from './PerfilPrestador'

export { formatZonaDisplay } from './formatZona'

const CINCO_MINUTOS_MS = 5 * 60 * 1000

function esPerfilRecienCreado(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < CINCO_MINUTOS_MS
}

function BannerBienvenida({ onClose }: { onClose: () => void }) {
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
        ¡Bienvenida a Orvalya! Completá tus documentos para aparecer en búsquedas.
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
  const mostrarBanner = !bannerCerrado && esPerfilRecienCreado(perfilActivo?.created_at)

  if (cargandoPerfil) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#8C96A3' }}>
        Cargando perfil...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {mostrarBanner && <BannerBienvenida onClose={() => setBannerCerrado(true)} />}
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
        {perfilActivo?.tipo === 'prestador'
          ? <DashboardPrestador perfil={perfilActivo} onPerfilUpdate={handlePerfilUpdate} />
          : <DashboardContratante />}
      </div>
      </div>
    </div>
  )
}

function DashboardPrestador({ perfil, onPerfilUpdate }: { perfil: Perfil; onPerfilUpdate: (p: Perfil) => void }) {
  const [semaforo, setSemaforo] = useState<string>('rojo')
  const [docsCount, setDocsCount] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const { data: prestador } = await supabase
        .from('prestadores').select('semaforo').eq('id', perfil.id).single()
      if (prestador) setSemaforo(prestador.semaforo ?? 'rojo')
      const { count } = await supabase
        .from('documentos').select('*', { count: 'exact' }).eq('prestador_id', perfil.id)
      setDocsCount(count ?? 0)
    }
    loadData().catch(console.error)
  }, [perfil.id])

  const semaforoIcon = semaforo === 'verde' ? '🟢' : semaforo === 'amarillo' ? '🟡' : '🔴'
  const semaforoLabel = semaforo === 'verde' ? 'Completo' : 'Incompleto'

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Tarjeta titulo="Semáforo" valor={`${semaforoIcon} ${semaforoLabel}`} desc="Estado de documentación" />
        <Tarjeta titulo="Documentos" valor={`${docsCount} / 3`} desc="Certificados cargados" />
        <Tarjeta titulo="Contratos activos" valor="0" desc="Órdenes de servicio" />
      </div>
      <PerfilPrestador perfil={perfil} onPerfilUpdate={onPerfilUpdate} />
      <DocumentosPrestador perfil={perfil} />
      <Seccion titulo="Mis contratos">
        <ItemVacio texto="No tenés contratos activos. Cuando una empresa te contrate, aparecerán acá." />
      </Seccion>
    </div>
  )
}

function DashboardContratante() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Tarjeta titulo="Proveedores" valor="0" desc="Prestadores vinculados" />
        <Tarjeta titulo="Contratos activos" valor="0" desc="Órdenes generadas" />
        <Tarjeta titulo="Alertas" valor="0" desc="Documentos por vencer" />
      </div>
      <Seccion titulo="Mis proveedores">
        <ItemVacio texto="No tenés proveedores vinculados. Buscá prestadores verificados en el directorio." />
      </Seccion>
      <Seccion titulo="Contratos recientes">
        <ItemVacio texto="No generaste contratos todavía. Las órdenes de servicio aparecerán acá." />
      </Seccion>
    </div>
  )
}

function Tarjeta({ titulo, valor, desc }: { titulo: string; valor: string; desc: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <p style={{ color: '#8C96A3', fontSize: '13px', margin: '0 0 8px' }}>{titulo}</p>
      <p style={{ color: '#1F3864', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>{valor}</p>
      <p style={{ color: '#ADB5BD', fontSize: '12px', margin: 0 }}>{desc}</p>
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