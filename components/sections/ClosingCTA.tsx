'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Image from 'next/image'

export default function ClosingCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )

      const children = contentRef.current ? Array.from(contentRef.current.children) : []
      if (children.length) {
        gsap.fromTo(
          children,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  function scrollToGenerator() {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--c-bg)',
        padding: 'var(--section-gap) var(--gutter)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <div
        ref={bgRef}
        style={{ position: 'absolute', inset: 0, opacity: 0 }}
      >
        <Image src="/hero.png" alt="" fill style={{ objectFit: 'cover', opacity: 0.06 }} />
      </div>

      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 400,
            lineHeight: 1.15,
            color: 'var(--c-text)',
            fontStyle: 'italic',
            marginBottom: '2rem',
          }}
        >
          &ldquo;Your next interview<br />starts here.&rdquo;
        </h2>

        <button
          onClick={scrollToGenerator}
          style={{
            background: 'transparent',
            border: '1px solid var(--c-border)',
            color: 'var(--c-dim)',
            padding: '0.875rem 2.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: '2px',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--c-gold)'
            el.style.color = 'var(--c-gold)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--c-border)'
            el.style.color = 'var(--c-dim)'
          }}
        >
          Generate Questions →
        </button>
      </div>

      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 'var(--max-w)',
          margin: '6rem auto 0',
          paddingTop: '2rem',
          borderTop: '1px solid var(--c-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--c-muted)', letterSpacing: '0.08em' }}>
          © 2026 Interview Generator
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--c-muted)', letterSpacing: '0.08em' }}>
          Built with Next.js + Gemini
        </span>
        <a
          href="https://github.com/Alltoft/interview-generator"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--c-muted)', textDecoration: 'none', letterSpacing: '0.08em' }}
        >
          GitHub →
        </a>
      </footer>
    </section>
  )
}
