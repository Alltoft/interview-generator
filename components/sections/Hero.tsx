'use client'

import { useEffect, useRef } from 'react'
import { gsap, SplitText, ScrollTrigger } from '@/lib/gsap'
import Image from 'next/image'

interface HeroProps {
  onSubmit: (jobTitle: string) => void
}

export default function Hero({ onSubmit }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = new SplitText(headlineRef.current, { type: 'words' })
      gsap.fromTo(
        split.words,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', delay: 0.2 }
      )

      gsap.fromTo(
        [subRef.current, formRef.current],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', delay: 0.9 }
      )

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value.trim() ?? ''
    if (value) onSubmit(value)
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center"
      style={{ height: '100svh', background: 'var(--c-bg)' }}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          style={{ objectFit: 'cover', opacity: 0.45 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(18,20,20,0.5) 0%, rgba(18,20,20,0.85) 100%)' }}
        />
      </div>

      <div className="relative z-10 text-center px-[var(--gutter)] max-w-3xl mx-auto w-full">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--c-dim)',
            marginBottom: '1.5rem',
          }}
        >
          AI-powered preparation
        </p>

        <h1
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--c-text)',
            marginBottom: '1.25rem',
          }}
        >
          Ask the right <em>questions.</em>
        </h1>

        <p
          ref={subRef}
          style={{
            opacity: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'var(--c-muted)',
            marginBottom: '2.5rem',
            letterSpacing: '0.01em',
          }}
        >
          AI-generated interview questions for any role, in seconds.
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{ opacity: 0 }}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Customer Success Manager"
            maxLength={100}
            required
            className="flex-1"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--c-border)',
              padding: '0.75rem 0',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: 'var(--c-text)',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderBottomColor = 'var(--c-dim)')}
            onBlur={(e) => (e.target.style.borderBottomColor = 'var(--c-border)')}
          />
          <button
            type="submit"
            style={{
              background: 'var(--c-accent)',
              color: '#000',
              border: 'none',
              padding: '0.75rem 1.75rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            Generate →
          </button>
        </form>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
      >
        <div
          style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, var(--c-dim), transparent)',
            animation: 'scrollIndicator 1.8s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes scrollIndicator {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(0.6); }
        }
      `}</style>
    </section>
  )
}
