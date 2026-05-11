'use client'

import { useEffect } from 'react'
import { initLenis, destroyLenis } from '@/lib/lenis'
import { ScrollTrigger } from '@/lib/gsap'

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = initLenis()

    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      destroyLenis()
    }
  }, [])

  return <>{children}</>
}
