'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  employeeId: string
}

export default function AddAchievementForm({ employeeId }: Props) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return

    setSaving(true)

    const { error } = await supabase.from('achievements').insert({
      employee_id: employeeId,
      title: note.slice(0, 60), // 👈 REQUIRED FIX
      note: note.trim(),
    })

    if (error) {
      console.error('Error adding achievement:', error)
      alert(`Could not save achievement: ${error.message}`)
      setSaving(false)
      return
    }

    setNote('')
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add achievement..."
        rows={3}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 8,
          border: '1px solid #ddd',
          marginBottom: 12,
        }}
      />
      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Add achievement'}
      </button>
    </form>
  )
}