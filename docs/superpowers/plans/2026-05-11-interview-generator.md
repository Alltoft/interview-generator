# Interview Question Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a studio-grade Next.js 15 landing page that accepts a job title and returns 3 AI-generated interview questions via Gemini 2.0 Flash, with GSAP + Lenis animations and Vercel deployment.

**Architecture:** Next.js 15 App Router with server-side API route (`/api/generate`) calling Gemini — keeps the API key off the client. Six animated sections compose the page; GSAP ScrollTrigger drives all scroll choreography, Lenis provides smooth scroll and integrates via GSAP's ticker. All interactive sections are `'use client'`; static sections are Server Components.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, GSAP 3 (SplitText, ScrollTrigger, DrawSVG), Lenis, Google Gemini 2.0 Flash, 21st Dev MCP components, Nano Banana (hero image), Vercel

---

## File Map

| File | Responsibility |
|------|---------------|
| `package.json` | All deps — Next 15, Tailwind v4, Lenis, GSAP already present |
| `next.config.ts` | Minimal Next config |
| `app/layout.tsx` | Root layout: fonts, Lenis provider, metadata |
| `app/page.tsx` | Composes all 6 sections |
| `app/globals.css` | Design tokens (CSS vars), Tailwind imports, base reset |
| `app/api/generate/route.ts` | POST handler: validate input → call Gemini → return questions |
| `lib/gsap.ts` | Register GSAP plugins; export configured instances |
| `lib/lenis.ts` | Lenis singleton + GSAP ticker integration |
| `components/Nav.tsx` | Fixed nav: wordmark + GitHub icon. Client component. |
| `components/sections/Hero.tsx` | §01: full-viewport hero with Nano Banana image, SplitText headline, input |
| `components/sections/HowItWorks.tsx` | §02: 3-step stagger with DrawSVG connector |
| `components/sections/Generator.tsx` | §03: sticky form panel + results (Gemini call lives here) |
| `components/sections/Showcase.tsx` | §04: horizontal scroll scrub of role cards |
| `components/sections/RoleMarquee.tsx` | §05: infinite dual-direction job title marquee |
| `components/sections/ClosingCTA.tsx` | §06: serif quote, CTA, footer |
| `components/QuestionCard.tsx` | Single question card: text + copy-to-clipboard |
| `components/SkeletonCard.tsx` | Pulsing placeholder while Gemini fetches |
| `public/hero.png` | Nano Banana generated image (dark professional texture) |
| `.env.local` | `GEMINI_API_KEY` — gitignored |
| `__tests__/api/generate.test.ts` | Unit tests for POST /api/generate |

---

## Task 1: Scaffold Next.js 15 Project

**Files:**
- Replace: `package.json`
- Create: `tsconfig.json`, `next.config.ts`, `.gitignore`, `.env.local`, `.env.example`

- [ ] **Step 1: Replace package.json with full project deps**

```json
{
  "name": "interview-generator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "gsap": "^3.15.0",
    "@studio-freight/lenis": "^1.0.42"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "vitest": "^2",
    "@vitejs/plugin-react": "^4",
    "msw": "^2"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules` populated, no errors.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.ts**

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['gsap'],
  },
}

export default config
```

- [ ] **Step 5: Create .gitignore**

```
.env.local
.next/
node_modules/
.DS_Store
.superpowers/
```

- [ ] **Step 6: Create .env.local and .env.example**

`.env.local` (never commit):
```
GEMINI_API_KEY=your_key_here
```

`.env.example` (commit this):
```
GEMINI_API_KEY=
```

- [ ] **Step 7: Verify Next.js can start**

```bash
npx next dev --port 3000
```

Expected: `▲ Next.js 15.x.x` ready message. Ctrl+C to stop.

- [ ] **Step 8: Initial commit**

```bash
git init
git add package.json tsconfig.json next.config.ts .gitignore .env.example
git commit -m "chore: scaffold Next.js 15 project"
```

---

## Task 2: Design Tokens + Global CSS + Fonts

**Files:**
- Create: `app/globals.css`
- Create: `app/layout.tsx` (skeleton — full version in Task 13)

- [ ] **Step 1: Create app/globals.css with design tokens**

```css
@import "tailwindcss";

@layer base {
  :root {
    --c-bg:       #121414;
    --c-surface:  #111111;
    --c-border:   #1e1e1e;
    --c-text:     #e8e8e8;
    --c-muted:    #555555;
    --c-accent:   #ffffff;
    --c-dim:      #888888;

    --font-serif: 'Playfair Display', Georgia, serif;
    --font-sans:  'Inter', -apple-system, sans-serif;
    --font-mono:  'JetBrains Mono', monospace;

    --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);

    --max-w:      1200px;
    --gutter:     clamp(1.5rem, 5vw, 4rem);
    --section-gap: clamp(6rem, 12vw, 10rem);
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    background: var(--c-bg);
    color: var(--c-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  body {
    overflow-x: hidden;
  }

  ::selection {
    background: rgba(255, 255, 255, 0.15);
  }
}
```

- [ ] **Step 2: Create skeleton app/layout.tsx (fonts only — wired up fully in Task 13)**

```tsx
import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Interview Generator — Ask the right questions',
  description: 'AI-generated interview questions for any role, instantly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Create placeholder app/page.tsx**

```tsx
export default function Home() {
  return <main style={{ padding: '2rem', color: '#e8e8e8' }}>Interview Generator — coming soon</main>
}
```

- [ ] **Step 4: Verify tokens render**

```bash
npm run dev
```

Open http://localhost:3000. Page should show dark background (#121414) with light text. No errors in console.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx
git commit -m "feat: design tokens, fonts, base layout"
```

---

## Task 3: GSAP + Lenis Setup

**Files:**
- Create: `lib/gsap.ts`
- Create: `lib/lenis.ts`
- Create: `components/providers/SmoothScrollProvider.tsx`

- [ ] **Step 1: Create lib/gsap.ts — register all plugins once**

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin)
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin }
```

- [ ] **Step 2: Create lib/lenis.ts — Lenis singleton with GSAP ticker**

```ts
import Lenis from '@studio-freight/lenis'
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
```

- [ ] **Step 3: Create components/providers/SmoothScrollProvider.tsx**

```tsx
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
```

- [ ] **Step 4: Commit**

```bash
git add lib/gsap.ts lib/lenis.ts components/providers/SmoothScrollProvider.tsx
git commit -m "feat: GSAP plugin registration and Lenis smooth scroll"
```

---

## Task 4: Generate Hero Image via Nano Banana

**Files:**
- Create: `public/hero.png`

- [ ] **Step 1: Generate the image**

Use the Nano Banana tool/service to generate a hero image with this prompt:

```
Dark abstract professional background. Obsidian black base (#121414). 
Subtle gold grain texture, scattered light particles. 
Cinematic depth, slight vignette edges. 
Ultra-wide aspect ratio 16:9. No text, no people, no logos.
```

Save the output as `public/hero.png`.

- [ ] **Step 2: Verify the image**

Open `public/hero.png` locally. Should be: dark, abstract, professional. Minimum 1920×1080px.

- [ ] **Step 3: Commit**

```bash
git add public/hero.png
git commit -m "feat: add Nano Banana generated hero image"
```

---

## Task 5: Nav Component

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Create components/Nav.tsx**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import Link from 'next/link'

export default function Nav() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power3.out' }
    )
  }, [])

  return (
    <nav
      ref={navRef}
      style={{ opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[var(--gutter)] py-5"
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.3em',
          color: 'var(--c-dim)',
          textTransform: 'uppercase',
        }}
      >
        Intrvw
      </span>

      <div className="flex items-center gap-6">
        <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', letterSpacing: '0.1em' }}>
          About
        </span>
        <Link
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          style={{ color: 'var(--c-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: fixed nav with fade-in animation"
```

---

## Task 6: Hero Section

**Files:**
- Create: `components/sections/Hero.tsx`

- [ ] **Step 1: Create components/sections/Hero.tsx**

```tsx
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
      // Word-by-word headline reveal
      const split = new SplitText(headlineRef.current, { type: 'words' })
      gsap.fromTo(
        split.words,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.07,
          ease: 'power3.out',
          delay: 0.2,
        }
      )

      // Subhead + form fade in after headline
      gsap.fromTo(
        [subRef.current, formRef.current],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', delay: 0.9 }
      )

      // Pin hero while §02 slides over it
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
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          style={{ objectFit: 'cover', opacity: 0.45 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(18,20,20,0.5) 0%, rgba(18,20,20,0.85) 100%)' }}
        />
      </div>

      {/* Content */}
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
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
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

      {/* Scroll indicator */}
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

      <style jsx>{`
        @keyframes scrollIndicator {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(0.6); }
        }
      `}</style>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/Hero.tsx
git commit -m "feat: hero section with SplitText headline and pinned ScrollTrigger"
```

---

## Task 7: How It Works Section

**Files:**
- Create: `components/sections/HowItWorks.tsx`

- [ ] **Step 1: Pull Steps component from 21st Dev**

Open Claude Code and run:
```
Use the 21st Dev MCP to search for a "steps" or "process steps" component. Pull the most minimal dark-themed version.
```
Save it to `components/ui/Steps.tsx` if found. If no suitable match, use the inline implementation in Step 2.

- [ ] **Step 2: Create components/sections/HowItWorks.tsx**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { gsap, DrawSVGPlugin } from '@/lib/gsap'

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
      // Stagger steps on scroll entry
      gsap.fromTo(
        stepsRef.current,
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

      // Draw connecting SVG line
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
          {/* SVG connecting line — desktop only */}
          <svg
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '2rem',
              left: 0,
              width: '100%',
              height: '2px',
              overflow: 'visible',
              display: 'none', // shown via CSS at md+
            }}
            className="connector-line"
          >
            <path
              ref={lineRef}
              d="M 16.6% 0 L 83.3% 0"
              stroke="#1e1e1e"
              strokeWidth="1"
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
                {/* Step circle */}
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

      <style jsx>{`
        @media (min-width: 768px) {
          .connector-line { display: block !important; }
        }
      `}</style>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/HowItWorks.tsx
git commit -m "feat: how it works section with stagger reveal and DrawSVG connector"
```

---

## Task 8: Gemini API Route (TDD)

**Files:**
- Create: `app/api/generate/route.ts`
- Create: `__tests__/api/generate.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

- [ ] **Step 2: Write the failing tests**

```ts
// __tests__/api/generate.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Gemini fetch call
const mockFetch = vi.fn()
global.fetch = mockFetch

// We import the handler function we'll extract from route.ts
// The handler validates input, calls Gemini, and returns questions.
import { generateHandler } from '@/app/api/generate/handler'

describe('generateHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GEMINI_API_KEY = 'test-key'
  })

  it('returns 400 when jobTitle is missing', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await generateHandler(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when jobTitle is empty string', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ jobTitle: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await generateHandler(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when jobTitle exceeds 100 chars', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ jobTitle: 'x'.repeat(101) }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await generateHandler(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with 3 questions on valid input', async () => {
    const geminiResponse = {
      candidates: [{
        content: {
          parts: [{
            text: '["Question 1?", "Question 2?", "Question 3?"]'
          }]
        }
      }]
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => geminiResponse,
    })

    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ jobTitle: 'Customer Success Manager' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await generateHandler(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.questions).toHaveLength(3)
    expect(typeof body.questions[0]).toBe('string')
  })

  it('returns 500 when Gemini API call fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 })

    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ jobTitle: 'Product Manager' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await generateHandler(req)
    expect(res.status).toBe(500)
  })

  it('strips HTML tags from jobTitle before sending to Gemini', async () => {
    const geminiResponse = {
      candidates: [{
        content: { parts: [{ text: '["Q1?", "Q2?", "Q3?"]' }] }
      }]
    }
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => geminiResponse })

    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ jobTitle: '<script>alert(1)</script>Engineer' }),
      headers: { 'Content-Type': 'application/json' },
    })
    await generateHandler(req)

    const fetchCall = mockFetch.mock.calls[0]
    const requestBody = JSON.parse(fetchCall[1].body)
    const prompt = requestBody.contents[0].parts[0].text
    expect(prompt).not.toContain('<script>')
    expect(prompt).toContain('Engineer')
  })
})
```

- [ ] **Step 3: Run tests — verify they all fail**

```bash
npm test
```

Expected: 5 failing tests — `generateHandler` is not defined yet.

- [ ] **Step 4: Create app/api/generate/handler.ts — the logic under test**

```ts
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

export async function generateHandler(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = (body as Record<string, unknown>)?.jobTitle
  if (typeof raw !== 'string' || !raw.trim()) {
    return Response.json({ error: 'jobTitle is required' }, { status: 400 })
  }
  if (raw.trim().length > 100) {
    return Response.json({ error: 'jobTitle must be 100 characters or fewer' }, { status: 400 })
  }

  const jobTitle = sanitize(raw)

  const prompt = `You are an expert interviewer. Generate exactly 3 thoughtful, behavioral interview questions for a ${jobTitle} role. Return ONLY a JSON array of 3 strings. No preamble, no numbering, no extra text. Example: ["Question one?", "Question two?", "Question three?"]`

  const apiKey = process.env.GEMINI_API_KEY
  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  })

  if (!geminiRes.ok) {
    return Response.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 })
  }

  const geminiData = await geminiRes.json()
  const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  let questions: string[]
  try {
    questions = JSON.parse(text)
    if (!Array.isArray(questions) || questions.length !== 3) throw new Error('unexpected shape')
  } catch {
    // Try to extract JSON array from text if Gemini added surrounding prose
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) {
      return Response.json({ error: 'Failed to parse response. Please try again.' }, { status: 500 })
    }
    questions = JSON.parse(match[0])
  }

  return Response.json({ questions })
}
```

- [ ] **Step 5: Create app/api/generate/route.ts — Next.js route wrapper**

```ts
import { generateHandler } from './handler'

export async function POST(req: Request): Promise<Response> {
  return generateHandler(req)
}
```

- [ ] **Step 6: Run tests — verify all pass**

```bash
npm test
```

Expected: 5 passing tests.

- [ ] **Step 7: Smoke-test the route manually**

Ensure `GEMINI_API_KEY` is set in `.env.local`, then:
```bash
npm run dev &
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"jobTitle":"Customer Success Manager"}'
```

Expected: `{"questions":["...","...","..."]}` — three real questions.

- [ ] **Step 8: Commit**

```bash
git add app/api/generate/ __tests__/ vitest.config.ts
git commit -m "feat: Gemini API route with input validation and unit tests"
```

---

## Task 9: QuestionCard + SkeletonCard + Generator Section

**Files:**
- Create: `components/QuestionCard.tsx`
- Create: `components/SkeletonCard.tsx`
- Create: `components/sections/Generator.tsx`

- [ ] **Step 1: Pull Card component from 21st Dev**

In Claude Code run:
```
Use the 21st Dev MCP to search for a minimal dark-theme "card" component. Pull it and save to components/ui/Card.tsx.
```
Use it as base in QuestionCard if suitable; otherwise use the inline styles below.

- [ ] **Step 2: Create components/QuestionCard.tsx**

```tsx
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
        opacity: 0, // GSAP animates this in
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
```

- [ ] **Step 3: Create components/SkeletonCard.tsx**

```tsx
export default function SkeletonCard() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--c-border)',
        padding: '1.5rem 0',
        display: 'flex',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          width: '1.5rem',
          height: '0.75rem',
          borderRadius: '2px',
          background: 'var(--c-border)',
          marginTop: '0.2rem',
          animation: 'pulse 1.6s ease-in-out infinite',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div
          style={{
            height: '1rem',
            borderRadius: '2px',
            background: 'var(--c-border)',
            width: '90%',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: '1rem',
            borderRadius: '2px',
            background: 'var(--c-border)',
            width: '70%',
            animation: 'pulse 1.6s ease-in-out infinite 0.2s',
          }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 4: Create components/sections/Generator.tsx**

```tsx
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
  const resultsRef = useRef<HTMLDivElement>(null)

  // Animate question cards in after load
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

  // Pre-fill from Hero section submit
  useEffect(() => {
    if (initialJobTitle) {
      handleGenerate(initialJobTitle)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJobTitle])

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
      style={{
        background: 'var(--c-bg)',
        padding: 'var(--section-gap) var(--gutter)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-w)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
        }}
        className="generator-grid"
      >
        {/* Sticky form panel */}
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

        {/* Results panel */}
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
          }
        }
      `}</style>
    </section>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/QuestionCard.tsx components/SkeletonCard.tsx components/sections/Generator.tsx
git commit -m "feat: generator section with Gemini fetch, loading skeleton, question cards"
```

---

## Task 10: Showcase Section (Horizontal Scrub)

**Files:**
- Create: `components/sections/Showcase.tsx`

- [ ] **Step 1: Create components/sections/Showcase.tsx**

```tsx
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
                fontFamily: 'var(--font-serif)',
                fontSize: '1.05rem',
                lineHeight: 1.65,
                color: 'var(--c-text)',
                fontStyle: 'italic',
              }}
            >
              "{item.question}"
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/Showcase.tsx
git commit -m "feat: showcase section with ScrollTrigger horizontal scrub"
```

---

## Task 11: Role Marquee Section

**Files:**
- Create: `components/sections/RoleMarquee.tsx`

- [ ] **Step 1: Pull Marquee component from 21st Dev**

In Claude Code run:
```
Use the 21st Dev MCP to search for an infinite "marquee" or "ticker" component. Pull and save to components/ui/Marquee.tsx.
```
Use it if suitable; otherwise use the GSAP implementation below.

- [ ] **Step 2: Create components/sections/RoleMarquee.tsx**

```tsx
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

function MarqueeRow({ items, direction }: { items: string[]; direction: 'left' | 'right' }) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const totalWidth = row.scrollWidth / 2
    const speed = direction === 'left' ? -totalWidth : totalWidth

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

    // Pause on hover
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

  // Duplicate items to enable seamless loop
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
              ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--c-dim)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = 'var(--c-muted)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'
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
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/RoleMarquee.tsx
git commit -m "feat: infinite dual-direction role marquee with GSAP seamless loop"
```

---

## Task 12: Closing CTA + Footer

**Files:**
- Create: `components/sections/ClosingCTA.tsx`

- [ ] **Step 1: Create components/sections/ClosingCTA.tsx**

```tsx
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
      // Fade in background image on scroll entry
      gsap.fromTo(
        bgRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )

      // Fade up content
      gsap.fromTo(
        contentRef.current?.children ? Array.from(contentRef.current.children) : [],
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
      {/* Dimmed hero image reprise */}
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
          "Your next interview<br />starts here."
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
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--c-dim)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--c-dim)'
          }}
        >
          Generate Questions →
        </button>
      </div>

      {/* Footer */}
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
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--c-muted)',
            letterSpacing: '0.08em',
          }}
        >
          © 2026 Interview Generator
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--c-muted)',
            letterSpacing: '0.08em',
          }}
        >
          Built with Next.js + Gemini
        </span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--c-muted)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}
        >
          GitHub →
        </a>
      </footer>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/ClosingCTA.tsx
git commit -m "feat: closing CTA section with hero image reprise and footer"
```

---

## Task 13: Wire layout.tsx + page.tsx

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update app/layout.tsx to include SmoothScrollProvider**

```tsx
import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Interview Generator — Ask the right questions',
  description: 'AI-generated interview questions for any role, instantly.',
  openGraph: {
    title: 'Interview Generator',
    description: 'AI-generated interview questions for any role, instantly.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Update app/page.tsx — compose all sections**

```tsx
'use client'

import { useState, useRef } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import Generator from '@/components/sections/Generator'
import Showcase from '@/components/sections/Showcase'
import RoleMarquee from '@/components/sections/RoleMarquee'
import ClosingCTA from '@/components/sections/ClosingCTA'

export default function Home() {
  const [submittedTitle, setSubmittedTitle] = useState('')
  const generatorRef = useRef<HTMLDivElement>(null)

  function handleHeroSubmit(jobTitle: string) {
    setSubmittedTitle(jobTitle)
    // Scroll to generator section after a brief delay
    setTimeout(() => {
      document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <>
      <Nav />
      <main>
        <Hero onSubmit={handleHeroSubmit} />
        <HowItWorks />
        <div ref={generatorRef}>
          <Generator initialJobTitle={submittedTitle} />
        </div>
        <Showcase />
        <RoleMarquee />
        <ClosingCTA />
      </main>
    </>
  )
}
```

- [ ] **Step 3: Run the full app and verify all sections render**

```bash
npm run dev
```

Open http://localhost:3000. Walk through:
- [ ] Hero image loads, headline animates word-by-word
- [ ] Nav fades in
- [ ] Scroll down: §02 How It Works stagger-reveals
- [ ] §03 Generator: enter "Customer Success Manager", click generate, 3 questions appear
- [ ] §04 Showcase horizontal scrub works
- [ ] §05 Marquee scrolls both rows continuously
- [ ] §06 Closing CTA fades in

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: wire all sections in layout and page"
```

---

## Task 14: GitHub + Vercel Deploy

**Files:**
- Create: `README.md` — brief setup instructions

- [ ] **Step 1: Create a GitHub repository**

```bash
gh repo create interview-generator --public --source=. --remote=origin --push
```

If `gh` is not installed: create the repo at github.com/new, then:
```bash
git remote add origin https://github.com/<your-username>/interview-generator.git
git push -u origin main
```

- [ ] **Step 2: Add GEMINI_API_KEY to Vercel**

```bash
npx vercel env add GEMINI_API_KEY production
```

When prompted, paste your Gemini API key.

- [ ] **Step 3: Deploy to Vercel**

```bash
npx vercel --prod
```

Expected: deployment URL printed, e.g. `https://interview-generator-abc123.vercel.app`

- [ ] **Step 4: Smoke-test the live URL**

Open the live URL:
- [ ] Dark hero loads with image
- [ ] Type "Product Manager" in the hero input → click Generate → scrolls to §03 → 3 questions appear
- [ ] Horizontal showcase scrubs
- [ ] Marquee runs

- [ ] **Step 5: Create a minimal README.md**

```markdown
# Interview Generator

AI-generated interview questions for any role, instantly. Built with Next.js 15, GSAP, Lenis, and Gemini 2.0 Flash.

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and add your `GEMINI_API_KEY` from [ai.google.dev](https://ai.google.dev)
4. `npm run dev`

## Deploy

Deployed on Vercel. Set `GEMINI_API_KEY` as an environment variable in your Vercel project settings.
```

- [ ] **Step 6: Final commit and push**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
git push
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Job title input with CSM as example → Hero + Generator sections
- [x] Gemini API call, 3 questions returned → Task 8 + 9
- [x] Loading state → SkeletonCard in Task 9
- [x] Clean, readable UI → design tokens in Task 2
- [x] Error handling with retry → Generator error state in Task 9
- [x] Privacy: no personal data in prompts → sanitize() in handler.ts
- [x] Studio-grade landing page → 6 sections, Tasks 5–12
- [x] GSAP + Lenis → Tasks 3, 6, 7, 10, 11, 12
- [x] 21st Dev MCP components → Tasks 7, 9, 11 (pull steps)
- [x] Nano Banana hero image → Task 4
- [x] GitHub + live URL → Task 14
- [x] #121414 background → locked in design tokens

**Type consistency:**
- `generateHandler` defined in Task 8 Step 4, imported in route.ts Step 5 ✓
- `HeroProps.onSubmit` defined in Task 6, consumed in page.tsx Task 13 ✓
- `GeneratorProps.initialJobTitle` defined in Task 9, passed in Task 13 ✓
- `QuestionCard` receives `question: string` + `index: number` — both passed in Generator ✓
- `Status` type used consistently within Generator.tsx ✓
