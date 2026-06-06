import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ reply: 'Error: ANTHROPIC_API_KEY not set in environment variables.' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `You are an expert personal training and coaching assistant built into the Revive Training Group coaching platform. Help coaches with workout programming, nutrition, client motivation, exercise technique, recovery, goal setting, and check-in feedback. Keep responses concise and practical. You're talking to a personal trainer.`,
        messages,
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ reply: `API Error: ${data.error?.message ?? JSON.stringify(data)}` })
    }

    const reply = data.content?.[0]?.text ?? 'No response text received.'
    return NextResponse.json({ reply })

  } catch (err: any) {
    return NextResponse.json({ reply: `Request failed: ${err.message}` })
  }
}
