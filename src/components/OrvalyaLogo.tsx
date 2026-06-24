import { useState } from 'react'

const NAVY = '#0F2D52'
const TEAL = '#00B4A6'

function InfinityMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path
        d="M10 16c0-3.3 2.7-6 6-6 2.2 0 4.1 1.2 5.1 3 1-1.8 2.9-3 5.1-3 3.3 0 6 2.7 6 6s-2.7 6-6 6c-2.2 0-4.1-1.2-5.1-3-1 1.8-2.9 3-5.1 3-3.3 0-6-2.7-6-6z"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface OrvalyaLogoProps {
  height?: number
  showText?: boolean
  color?: string
}

export function OrvalyaLogo({ height = 28, showText = true, color = NAVY }: OrvalyaLogoProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const iconSize = height

  if (!imgFailed) {
    return (
      <img
        src="/orvalya_logo.png"
        alt="Orvalya"
        height={iconSize}
        style={{ display: 'block', objectFit: 'contain', width: 'auto', maxHeight: iconSize }}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <InfinityMark size={iconSize} />
      {showText && (
        <span style={{ fontSize: `${height * 0.85}px`, fontWeight: 700, color, letterSpacing: '-0.02em' }}>
          Orvalya
        </span>
      )}
    </span>
  )
}
