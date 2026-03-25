'use client'

import { useState, useTransition } from 'react'

export function GenerateSummaryButton({ employeeId }: { employeeId: string }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  async function generate() {
    setMessage(null)
    const monthKey = new Date().toISOString().slice(0, 7)
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, monthKey }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error ?? 'Failed to generate summary.')
      return
    }

    setMessage('Summary generated. Refresh to see the latest version and manager highlights.')
  }

  return (
    <div className="row-gap">
      <button className="button" onClick={() => startTransition(generate)} type="button">
        {pending ? 'Generating...' : 'Generate monthly summary'}
      </button>
      {message ? <span className="muted">{message}</span> : null}
    </div>
  )
}
