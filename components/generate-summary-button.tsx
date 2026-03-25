'use client'

import { useState } from 'react'

export default function GenerateSummaryButton({
  employeeId,
}: {
  employeeId: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    const monthKey = new Date().toISOString().slice(0, 7)

    setLoading(true)

    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId,
        monthKey,
      }),
    })

    const result = await response.json()
    setLoading(false)

    if (!response.ok) {
      alert(result.error || 'Could not generate summary')
      return
    }

    alert('Monthly summary generated')
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      style={{
        padding: '10px 16px',
        borderRadius: 12,
        border: '1px solid #b7df6d',
        background: '#dff5b2',
        color: '#142013',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(183, 223, 109, 0.18)',
      }}
    >
      {loading ? 'Generating...' : 'Generate Monthly Summary'}
    </button>
  )
}