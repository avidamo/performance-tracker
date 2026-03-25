'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AddGoalForm({ employeeId }: { employeeId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)

    const { error } = await supabase.from('goals').insert({
      employee_id: employeeId,
      title: title.trim(),
      description: description.trim(),
      status: 'in_progress',
    })

    if (error) {
      alert(`Error creating goal: ${error.message}`)
      setSaving(false)
      return
    }

    setTitle('')
    setDescription('')
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        placeholder="Goal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 8,
          borderRadius: 8,
          border: '1px solid #ddd',
        }}
      />
      <textarea
        placeholder="Goal description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 8,
          borderRadius: 8,
          border: '1px solid #ddd',
        }}
      />
      <button type="submit">
        {saving ? 'Saving...' : 'Add Goal'}
      </button>
    </form>
  )
}