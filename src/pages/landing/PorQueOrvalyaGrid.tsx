import type { Icon } from '@phosphor-icons/react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { revealStyle, useScrollReveal } from '../../hooks/useScrollReveal'
import { POR_QUE_ORVALYA } from './landingContent'
import {
  NAVY,
  TEAL,
  TEXT_MUTED,
  benefitCardStyle,
  iconBoxLargeStyle,
  sectionTitleStyle,
} from './landingStyles'

function BenefitCard({
  icon: IconComponent,
  title,
  text,
  visible,
  staggerMs,
}: {
  icon: Icon
  title: string
  text: string
  visible: boolean
  staggerMs: number
}) {
  return (
    <article
      className="landing-benefit-card"
      style={{
        ...benefitCardStyle,
        ...revealStyle(visible, staggerMs),
      }}
    >
      <div style={iconBoxLargeStyle}>
        <IconComponent size={32} weight="duotone" color={TEAL} aria-hidden />
      </div>
      <h3 style={{
        margin: '0 0 8px',
        fontSize: '18px',
        fontWeight: 800,
        color: NAVY,
        lineHeight: 1.3,
      }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: TEXT_MUTED }}>
        {text}
      </p>
    </article>
  )
}

export default function PorQueOrvalyaGrid() {
  const isMobile = useIsMobile(768)
  const { ref, visible } = useScrollReveal<HTMLDivElement>()

  return (
    <div ref={ref}>
      <h2 style={{ ...sectionTitleStyle, textAlign: isMobile ? 'left' : 'center', marginBottom: '40px' }}>
        ¿Por qué Orvalya?
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '16px' : '20px',
      }}>
        {POR_QUE_ORVALYA.map((item, i) => (
          <BenefitCard
            key={item.title}
            {...item}
            visible={visible}
            staggerMs={i * 90}
          />
        ))}
      </div>
    </div>
  )
}
