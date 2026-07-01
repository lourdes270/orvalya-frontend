import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { User } from '@phosphor-icons/react'
import { PageMeta } from '../../components/seo/PageMeta'
import { formatDescripcionServicio } from '../../lib/formatDescripcionServicio'
import {
  categoriaPrincipal,
  fetchPrestadorPublico,
  truncarMeta,
} from '../../lib/prestadorPublicoHelpers'
import { colorSemaforo, iconoSemaforo, labelSemaforo } from '../../lib/semaforo'
import { useIsMobile } from '../../hooks/useIsMobile'
import LandingLayout from '../landing/LandingLayout'
import NotFoundPage from '../NotFoundPage'
import { formatZonaDisplay } from '../dashboard/formatZona'
import type { PrestadorPublico } from '../../types/prestadorPublico'
import { BORDER, NAVY, SURFACE, TEAL, TEXT_BODY, TEXT_MUTED } from '../landing/landingStyles'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function Seccion({ titulo, texto }: { titulo: string; texto: string | null | undefined }) {
  if (!texto?.trim()) return null
  return (
    <section style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${BORDER}`,
      marginBottom: '12px',
    }}>
      <h2 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700, color: NAVY }}>{titulo}</h2>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, color: TEXT_BODY, whiteSpace: 'pre-wrap' }}>
        {texto.trim()}
      </p>
    </section>
  )
}

export default function PrestadorPublicoPage() {
  const { id } = useParams<{ id: string }>()
  const isMobile = useIsMobile(768)
  const [prestador, setPrestador] = useState<PrestadorPublico | null | undefined>(undefined)
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !UUID_RE.test(id)) {
      setPrestador(null)
      return
    }
    let mounted = true
    setRateLimitMsg(null)
    fetchPrestadorPublico(id)
      .then(data => { if (mounted) setPrestador(data) })
      .catch(err => {
        if (!mounted) return
        if (err instanceof Error && err.message.includes('Demasiadas solicitudes')) {
          setRateLimitMsg(err.message)
        }
        setPrestador(null)
      })
    return () => { mounted = false }
  }, [id])

  if (prestador === undefined && !rateLimitMsg) {
    return (
      <LandingLayout>
        <div style={{ padding: '48px 16px', textAlign: 'center', color: TEXT_MUTED }}>
          Cargando perfil...
        </div>
      </LandingLayout>
    )
  }

  if (rateLimitMsg) {
    return (
      <LandingLayout>
        <div style={{ padding: '48px 16px', textAlign: 'center', color: TEXT_MUTED, maxWidth: '480px', margin: '0 auto' }}>
          {rateLimitMsg}
        </div>
      </LandingLayout>
    )
  }

  if (!prestador) {
    return <NotFoundPage />
  }

  const nombre = prestador.nombre?.trim() || 'Prestador'
  const categoria = categoriaPrincipal(prestador.descripcion)
  const servicios = formatDescripcionServicio(prestador.descripcion)
  const zona = formatZonaDisplay(prestador.zona) || 'Uruguay'
  const metaTitle = `${nombre} · Prestador de ${categoria} en ${zona} | Orvalya`
  const metaDescription = truncarMeta(prestador.sobre_mi)

  return (
    <LandingLayout>
      <PageMeta title={metaTitle} description={metaDescription} />
      <article style={{
        padding: isMobile ? '24px 16px 40px' : '40px 24px 56px',
        background: SURFACE,
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: `1px solid ${BORDER}`,
            padding: isMobile ? '24px 20px' : '32px 28px',
            boxShadow: '0 4px 24px rgba(15, 45, 82, 0.06)',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              width: isMobile ? '96px' : '112px',
              height: isMobile ? '96px' : '112px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              overflow: 'hidden',
              background: '#E9ECEF',
              border: '3px solid #fff',
              boxShadow: '0 2px 12px rgba(15, 45, 82, 0.1)',
            }}>
              {prestador.avatar_url ? (
                <img
                  src={prestador.avatar_url}
                  alt={nombre}
                  width={112}
                  height={112}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F4F8FB',
                }}>
                  <User size={48} weight="duotone" color={TEAL} aria-hidden />
                </div>
              )}
            </div>

            <h1 style={{
              margin: '0 0 8px',
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: 700,
              color: NAVY,
              lineHeight: 1.25,
            }}>
              {nombre}
            </h1>

            {servicios && (
              <p style={{ margin: '0 0 6px', fontSize: '15px', color: TEXT_BODY, lineHeight: 1.45 }}>
                {servicios}
              </p>
            )}

            <p style={{ margin: '0 0 12px', fontSize: '14px', color: TEXT_MUTED }}>
              {zona}
            </p>

            {prestador.rango_edad && (
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: TEXT_MUTED }}>
                {prestador.rango_edad} años
              </p>
            )}

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '999px',
              background: '#F8F9FA',
              border: `1px solid ${BORDER}`,
            }}>
              <span aria-hidden>{iconoSemaforo(prestador.semaforo)}</span>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: colorSemaforo(prestador.semaforo),
              }}>
                Documentación: {labelSemaforo(prestador.semaforo)}
              </span>
            </div>
          </div>

          <Seccion titulo="Sobre mí" texto={prestador.sobre_mi} />
          <Seccion titulo="Experiencia" texto={prestador.experiencia} />
          <Seccion titulo="Cursos y estudios" texto={prestador.cursos} />

          <p style={{
            margin: '16px 0 0',
            fontSize: '11px',
            lineHeight: 1.5,
            color: TEXT_MUTED,
            textAlign: 'center',
          }}>
            El semáforo indica el estado general de la documentación declarada. Orvalya no certifica cumplimiento legal.
          </p>
        </div>
      </article>
    </LandingLayout>
  )
}
