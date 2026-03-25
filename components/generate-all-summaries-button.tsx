'use client'

import { useState, useTransition } from 'react'

export function GenerateAllSummariesButton() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  async function generateAll() {
    setMessage(null)
    const monthKey = new Date().toISOString().slice(0, 7)
    const response = await fetch('/api/generate-summaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthKey }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error ?? 'Failed to generate summaries.')
      return
    }

    setMessage(`Generated ${result.succeeded} of ${result.total} summaries. Refresh to see updates.`)
  }

  return (
    <div className="row-gap">
      <button className="button secondary" onClick={() => startTransition(generateAll)} type="button">
        {pending ? 'Generating all...' : 'Generate all monthly summaries'}
      </button>
      {message ? <span className="muted">{message}</span> : null}
    </div>
  )
}
