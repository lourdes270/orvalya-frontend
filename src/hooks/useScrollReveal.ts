import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type ScrollRevealOptions = {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
): { ref: RefObject<T | null>; visible: boolean } {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (options.once !== false) observer.disconnect()
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '0px 0px -48px 0px',
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options.once, options.rootMargin, options.threshold])

  return { ref, visible }
}

export function useHeroFadeIn(): boolean {
  const [visible, setVisible] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return visible
}

export function revealStyle(visible: boolean, staggerMs = 0): CSSProperties {
  if (prefersReducedMotion()) {
    return { opacity: 1, transform: 'none' }
  }
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 0.6s ease ${staggerMs}ms, transform 0.6s ease ${staggerMs}ms`,
    willChange: visible ? 'auto' : 'opacity, transform',
  }
}
