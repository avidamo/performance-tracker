'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AddTaskForm({ goalId }: { goalId: string }) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)

    const { error } = await supabase.from('goal_tasks').insert({
      goal_id: goalId,
      title,
      is_completed: false,
    })

    if (error) {
      console.error('Error adding task:', error)
      alert(`Error adding task: ${error.message}`)
      setSaving(false)
      return
    }

    setTitle('')
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <input
        placeholder="New task"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 8, marginRight: 8 }}
      />
      <button type="submit">{saving ? '...' : 'Add'}</button>
    </form>
  )
}