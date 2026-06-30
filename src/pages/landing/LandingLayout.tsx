import type { ReactNode } from 'react'
import LandingFooter from './LandingFooter'
import LandingHeader from './LandingHeader'
import { pageShellStyle } from './landingStyles'

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div style={pageShellStyle}>
      <LandingHeader />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <LandingFooter />
    </div>
  )
}
