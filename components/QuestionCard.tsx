'use client'

import { useState } from 'react'

interface QuestionCardProps {
  question: string
  index: number
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(question)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        borderTop: '1px solid var(--c-border)',
        padding: '1.5rem 0',
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'flex-start',
        opacity: 0,
      }}
      data-question-card
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--c-muted)',
          marginTop: '0.2rem',
          minWidth: '1.5rem',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: 'var(--c-text)',
          flex: 1,
          fontStyle: 'italic',
        }}
      >
        {question}
      </p>

      <button
        onClick={handleCopy}
        aria-label="Copy question"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: copied ? 'var(--c-accent)' : 'var(--c-muted)',
          padding: '0.25rem',
          flexShrink: 0,
          transition: 'color 0.2s',
        }}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}
