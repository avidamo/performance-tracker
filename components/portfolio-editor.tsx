'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PortfolioEditor({
  employeeId,
  goal,
  current,
}: {
  employeeId: string
  goal: number
  current: number
}) {
  const [editing, setEditing] = useState(false)
  const [goalValue, setGoalValue] = useState(goal || 0)
  const [currentValue, setCurrentValue] = useState(current || 0)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)

    const { error } = await supabase
      .from('employees')
      .update({
        portfolio_goal: goalValue,
        portfolio_current: currentValue,
      })
      .eq('id', employeeId)

    setSaving(false)

    if (error) {
      alert(`Could not save portfolio: ${error.message}`)
      return
    }

    setEditing(false)
    window.location.reload()
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        style={{
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid #d8e6b8',
          background: 'white',
          color: '#30431f',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Edit portfolio
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        type="number"
        value={goalValue}
        onChange={(e) => setGoalValue(Number(e.target.value))}
        placeholder="Goal"
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #d8e6b8',
          minWidth: 140,
        }}
      />
      <input
        type="number"
        value={currentValue}
        onChange={(e) => setCurrentValue(Number(e.target.value))}
        placeholder="Current"
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #d8e6b8',
          minWidth: 140,
        }}
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        style={{
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid #b7df6d',
          background: '#dff5b2',
          color: '#142013',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}