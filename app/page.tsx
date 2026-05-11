'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import Generator from '@/components/sections/Generator'
import Showcase from '@/components/sections/Showcase'
import RoleMarquee from '@/components/sections/RoleMarquee'
import ClosingCTA from '@/components/sections/ClosingCTA'

export default function Home() {
  const [submittedTitle, setSubmittedTitle] = useState('')

  function handleHeroSubmit(jobTitle: string) {
    setSubmittedTitle(jobTitle)
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
        <div>
          <Generator initialJobTitle={submittedTitle} />
        </div>
        <Showcase />
        <RoleMarquee />
        <ClosingCTA />
      </main>
    </>
  )
}
