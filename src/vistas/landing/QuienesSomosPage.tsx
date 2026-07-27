import type { ReactNode } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import LandingCtaSection from './LandingCtaSection'
import LandingLayout from './LandingLayout'
import PorQueOrvalyaGrid from './PorQueOrvalyaGrid'
import { QUIENES_SOMOS_TEXT, VISION_TEXT } from './landingContent'
import {
  BORDER,
  SURFACE,
  TEAL,
  sectionBodyStyle,
  sectionTitleStyle,
} from './landingStyles'

function ContentSection({
  title,
  surface,
  children,
  isMobile,
}: {
  title: string
  surface: boolean
  children: ReactNode
  isMobile: boolean
}) {
  return (
    <section style={{
      padding: isMobile ? '40px 16px' : '56px 24px',
      background: surface ? SURFACE : '#fff',
      borderTop: surface ? 'none' : `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        {children}
      </div>
    </section>
  )
}

export default function QuienesSomosPage() {
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
            color: TEAL,
          }}>
            Sobre Orvalya
          </p>
          <h1 style={{
            ...sectionTitleStyle,
            marginBottom: '12px',
            fontSize: isMobile ? 'clamp(26px, 6vw, 32px)' : 'clamp(28px, 3vw, 36px)',
          }}>
            Quiénes somos
          </h1>
          <p style={{ ...sectionBodyStyle, maxWidth: '720px' }}>
            {QUIENES_SOMOS_TEXT}
          </p>
        </div>
      </section>

      <ContentSection title="Visión" surface isMobile={isMobile}>
        <p style={{ ...sectionBodyStyle, maxWidth: '720px' }}>
          {VISION_TEXT}
        </p>
      </ContentSection>

      <ContentSection title="Por qué Orvalya" surface={false} isMobile={isMobile}>
        <PorQueOrvalyaGrid />
      </ContentSection>

      <LandingCtaSection showBackLink />
    </LandingLayout>
  )
}
