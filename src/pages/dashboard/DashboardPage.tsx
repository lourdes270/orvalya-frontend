import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

export default function DashboardPage() {
  const { user, perfil, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', padding: '40px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#1F3864', fontSize: '24px', fontWeight: 700, margin: 0 }}>
              Orvalya
            </h1>
            <p style={{ color: '#8C96A3', fontSize: '13px', margin: '4px 0 0' }}>
              {user?.email} · {perfil?.tipo === 'prestador' ? 'Prestador' : 'Empresa contratante'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #DEE2E6', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#495057' }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Dashboard según perfil */}
        {perfil?.tipo === 'prestador' ? <DashboardPrestador /> : <DashboardContratante />}

      </div>
    </div>
  )
}

function DashboardPrestador() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Tarjeta titulo="Semáforo" valor="🔴 Incompleto" desc="Documentación pendiente" />
        <Tarjeta titulo="Documentos" valor="0 / 3" desc="Certificados cargados" />
        <Tarjeta titulo="Contratos activos" valor="0" desc="Órdenes de servicio" />
      </div>
      <Seccion titulo="Mis documentos">
        <ItemVacio texto="No cargaste documentos todavía. Subí tu Certificado DGI, BPS y BSE para activar tu perfil." />
      </Seccion>
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