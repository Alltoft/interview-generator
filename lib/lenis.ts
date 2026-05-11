import Lenis from 'lenis'
import { gsap } from '@/lib/gsap'

let lenis: Lenis | null = null

export function initLenis(): Lenis {
  if (lenis) return lenis

  lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    syncTouch: false,
  })

  gsap.ticker.add((time) => {
    lenis!.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis(): Lenis | null {
  return lenis
}

export function destroyLenis(): void {
  if (lenis) {
    lenis.destroy()
    lenis = null
  }
}
