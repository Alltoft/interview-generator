'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import QuestionCard from '@/components/QuestionCard'
import SkeletonCard from '@/components/SkeletonCard'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface GeneratorProps {
  initialJobTitle?: string
}

export default function Generator({ initialJobTitle = '' }: GeneratorProps) {
  const [jobTitle, setJobTitle] = useState(initialJobTitle)
  const [questions, setQuestions] = useState<string[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status !== 'success') return
    const cards = resultsRef.current?.querySelectorAll('[data-question-card]')
    if (!cards?.length) return
    gsap.to(Array.from(cards), {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.1,
    })
  }, [status])

  useEffect(() => {
    if (initialJobTitle) {
      handleGenerate(initialJobTitle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJobTitle])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(gridRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom 65%',
          end: 'bottom top',
          scrub: 0.4,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  async function handleGenerate(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    setStatus('loading')
    setQuestions([])
    setErrorMsg('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setQuestions(data.questions)
      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleGenerate(jobTitle)
  }

  return (
    <section
      id="generator"
      ref={sectionRef}
      style={{
        background: 'var(--c-bg)',
        padding: 'var(--section-gap) var(--gutter)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        ref={gridRef}
        style={{
          maxWidth: 'var(--max-w)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
        }}
        className="generator-grid"
      >
        <div className="generator-form-panel">
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--c-muted)',
              marginBottom: '2rem',
            }}
          >
            Generate questions
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label
                htmlFor="gen-input"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--c-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                Job title
              </label>
              <input
                id="gen-input"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Customer Success Manager"
                maxLength={100}
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--c-border)',
                  padding: '0.75rem 0',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '1.2rem',
                  color: 'var(--c-text)',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                background: status === 'loading' ? 'var(--c-border)' : 'var(--c-accent)',
                color: '#000',
                border: 'none',
                padding: '0.875rem 2rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                borderRadius: '2px',
                transition: 'background 0.2s',
                alignSelf: 'flex-start',
              }}
            >
              {status === 'loading' ? 'Generating...' : 'Generate Questions →'}
            </button>

            <p style={{ fontSize: '0.7rem', color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>
              Powered by Gemini 2.0 Flash
            </p>
          </form>
        </div>

        <div ref={resultsRef}>
          {status === 'idle' && (
            <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
              Enter a job title above to generate your questions.
            </p>
          )}

          {status === 'loading' && (
            <div>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {status === 'error' && (
            <div style={{ color: 'var(--c-muted)', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '0.75rem' }}>{errorMsg}</p>
              <button
                onClick={() => handleGenerate(jobTitle)}
                style={{
                  background: 'none',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-dim)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {status === 'success' && questions.map((q, i) => (
            <QuestionCard key={i} question={q} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .generator-grid {
            grid-template-columns: 340px 1fr;
          }
          .generator-form-panel {
            position: sticky;
            top: 8rem;
            align-self: start;
            z-index: 10;
            background: var(--c-bg);
            padding-right: 2rem;
          }
        }
      `}</style>
    </section>
  )
}
