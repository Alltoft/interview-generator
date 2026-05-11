'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

const ROW_1 = [
  'Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist',
  'Marketing Lead', 'Customer Success Manager', 'DevOps Engineer', 'Finance Analyst',
  'HR Business Partner', 'Sales Director', 'Engineering Manager', 'Content Strategist',
]

const ROW_2 = [
  'Operations Manager', 'Business Analyst', 'Solutions Architect', 'Brand Designer',
  'Account Executive', 'Data Engineer', 'QA Engineer', 'Scrum Master',
  'Chief of Staff', 'Growth Manager', 'Technical Writer', 'Legal Counsel',
]

interface MarqueeRowProps {
  items: string[]
  direction: 'left' | 'right'
}

function MarqueeRow({ items, direction }: MarqueeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const totalWidth = row.scrollWidth / 2

    const tween = gsap.fromTo(
      row,
      { x: direction === 'left' ? 0 : -totalWidth },
      {
        x: direction === 'left' ? -totalWidth : 0,
        duration: totalWidth / 40,
        ease: 'none',
        repeat: -1,
      }
    )

    const pauseRow = () => tween.timeScale(0.2)
    const resumeRow = () => tween.timeScale(1)
    row.addEventListener('mouseenter', pauseRow)
    row.addEventListener('mouseleave', resumeRow)

    return () => {
      row.removeEventListener('mouseenter', pauseRow)
      row.removeEventListener('mouseleave', resumeRow)
      tween.kill()
    }
  }, [direction])

  const doubled = [...items, ...items]

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div ref={rowRef} style={{ display: 'flex', gap: '0.75rem', width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            style={{
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              color: 'var(--c-muted)',
              border: '1px solid var(--c-border)',
              padding: '0.4rem 0.875rem',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s, border-color 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--c-text)'
              el.style.borderColor = 'var(--c-dim)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--c-muted)'
              el.style.borderColor = 'var(--c-border)'
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RoleMarquee() {
  return (
    <section
      style={{
        background: 'var(--c-surface)',
        padding: 'var(--section-gap) 0',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--c-muted)',
          textAlign: 'center',
          marginBottom: '2.5rem',
          padding: '0 var(--gutter)',
        }}
      >
        Works for any job title
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <MarqueeRow items={ROW_1} direction="left" />
        <MarqueeRow items={ROW_2} direction="right" />
      </div>
    </section>
  )
}
