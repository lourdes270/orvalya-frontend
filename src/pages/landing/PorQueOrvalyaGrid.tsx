import type { Icon } from '@phosphor-icons/react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { POR_QUE_ORVALYA } from './landingContent'
import {
  NAVY,
  TEAL,
  TEXT_MUTED,
  benefitCardStyle,
  iconBoxStyle,
} from './landingStyles'

function BenefitCard({ icon: IconComponent, title, text }: {
  icon: Icon
  title: string
  text: string
}) {
  return (
    <article style={benefitCardStyle}>
      <div style={iconBoxStyle}>
        <IconComponent size={24} weight="duotone" color={TEAL} aria-hidden />
      </div>
      <h3 style={{
        margin: '0 0 6px',
        fontSize: '15px',
        fontWeight: 700,
        color: NAVY,
        lineHeight: 1.35,
      }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: TEXT_MUTED }}>
        {text}
      </p>
    </article>
  )
}

export default function PorQueOrvalyaGrid() {
  const isMobile = useIsMobile(768)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? '12px' : '16px',
    }}>
      {POR_QUE_ORVALYA.map(item => (
        <BenefitCard key={item.title} {...item} />
      ))}
    </div>
  )
}
