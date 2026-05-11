'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const SHOWCASES = [
  {
    role: 'Customer Success Manager',
    question: 'Describe a time you turned a dissatisfied customer into a long-term advocate.',
  },
  {
    role: 'Engineering Manager',
    question: 'How do you handle a situation where a team member is consistently underperforming?',
  },
  {
    role: 'Product Manager',
    question: 'Walk me through your framework for prioritizing a backlog when everything feels urgent.',
  },
  {
    role: 'UX Designer',
    question: 'Tell me about a design decision you made that was unpopular but ultimately correct.',
  },
  {
    role: 'Data Analyst',
    question: 'Describe a time when your data analysis changed a key business decision.',
  },
  {
    role: 'Marketing Lead',
    question: 'How do you measure the success of a campaign when brand awareness is the primary goal?',
  },
]

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      if (!track) return

      const totalWidth = track.scrollWidth
      const viewportWidth = window.innerWidth

      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'top 30%',
            scrub: true,
          },
        }
      )

      gsap.to(track, {
        x: -(totalWidth - viewportWidth + 80),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalWidth - viewportWidth + 80}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ background: 'var(--c-bg)', overflow: 'hidden', position: 'relative', zIndex: 1 }}
    >
      <div style={{ padding: '4rem var(--gutter) 2rem' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--c-muted)',
            marginBottom: '0.75rem',
          }}
        >
          Across every role
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 400,
            color: 'var(--c-text)',
          }}
        >
          Questions for every seat at the table.
        </h2>
      </div>

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: '1.5rem',
          padding: '2rem var(--gutter) 4rem',
          width: 'max-content',
        }}
      >
        {SHOWCASES.map((item) => (
          <div
            key={item.role}
            style={{
              width: '320px',
              flexShrink: 0,
              border: '1px solid var(--c-border)',
              borderRadius: '4px',
              padding: '2rem',
              background: 'var(--c-surface)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--c-muted)',
                marginBottom: '1.25rem',
              }}
            >
              {item.role}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--c-text)',
              }}
            >
              &ldquo;{item.question}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
