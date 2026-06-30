import { useIsMobile } from '../../hooks/useIsMobile'
import ComoFuncionaSteps from './ComoFuncionaSteps'
import LandingCtaSection from './LandingCtaSection'
import LandingLayout from './LandingLayout'
import { NAVY, SURFACE, sectionBodyStyle, sectionTitleStyle } from './landingStyles'

export default function ComoFuncionaPage() {
  const isMobile = useIsMobile(768)

  return (
    <LandingLayout>
      <section style={{
        padding: isMobile ? '32px 16px 40px' : '48px 24px 56px',
        background: `linear-gradient(180deg, ${SURFACE} 0%, #fff 100%)`,
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <p style={{
            margin: '0 0 8px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: NAVY,
            opacity: 0.7,
          }}>
            Tres pasos
          </p>
          <h1 style={{
            ...sectionTitleStyle,
            marginBottom: '12px',
            fontSize: isMobile ? 'clamp(26px, 6vw, 32px)' : 'clamp(28px, 3vw, 36px)',
          }}>
            Cómo funciona
          </h1>
          <p style={{
            ...sectionBodyStyle,
            marginBottom: '32px',
            maxWidth: '640px',
          }}>
            Orvalya conecta prestadores independientes con empresas que buscan contratar
            con tranquilidad. Todo el proceso es digital, simple y pensado para Uruguay.
          </p>
          <ComoFuncionaSteps />
        </div>
      </section>
      <LandingCtaSection showBackLink />
    </LandingLayout>
  )
}
