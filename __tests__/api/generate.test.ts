import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

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
          parts: [{ text: '["Question 1?", "Question 2?", "Question 3?"]' }]
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
