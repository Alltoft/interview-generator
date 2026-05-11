'use client'

import { useEffect, useRef } from 'react'
import { gsap, DrawSVGPlugin } from '@/lib/gsap'

// DrawSVGPlugin imported to ensure it's registered (used via GSAP drawSVG property)
void DrawSVGPlugin

const STEPS = [
  {
    num: '01',
    title: 'Enter a role',
    body: 'Type any job title — Customer Success Manager, Senior Engineer, Head of Design.',
  },
  {
    num: '02',
    title: 'AI generates',
    body: 'Gemini crafts 3 tailored behavioral questions specific to that role and its challenges.',
  },
  {
    num: '03',
    title: 'Copy & use',
    body: 'Questions are ready instantly. Copy any question and use it in your next interview.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])
  const lineRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stepsRef.current.filter(Boolean),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      )

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            duration: 1.2,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--c-surface)',
        padding: 'var(--section-gap) var(--gutter)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--c-muted)',
            marginBottom: '4rem',
          }}
        >
          Simple by design
        </p>

        <div style={{ position: 'relative' }}>
          <svg
            aria-hidden="true"
            className="connector-line"
            viewBox="0 0 100 1"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: 0,
              width: '100%',
              height: '2px',
              overflow: 'visible',
              display: 'none',
            }}
          >
            <path
              ref={lineRef}
              d="M 16.6 0 L 83.3 0"
              stroke="#1e1e1e"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          </svg>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '3rem',
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => { stepsRef.current[i] = el }}
                style={{ opacity: 0 }}
              >
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    border: '1px solid var(--c-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: 'var(--c-muted)',
                    background: 'var(--c-bg)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {step.num}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.4rem',
                    fontWeight: 500,
                    color: 'var(--c-text)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {step.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', lineHeight: 1.65 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .connector-line { display: block !important; }
        }
      `}</style>
    </section>
  )
}
