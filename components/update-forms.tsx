'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/browser'

export function AddUpdateForm({ employeeId }: { employeeId: string }) {
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  async function saveUpdate() {
    setMessage(null)
    const monthKey = new Date().toISOString().slice(0, 7)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('progress_updates').insert({
      employee_id: employeeId,
      month_key: monthKey,
      update_type: 'self_update',
      content,
      created_by_user_id: user?.id ?? null,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setContent('')
    setMessage('Saved. Refresh the page to see the new update.')
  }

  return (
    <div className="stack-sm">
      <textarea
        className="textarea"
        placeholder="Add a monthly update, blocker, reflection, or progress note."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
      />
      <div className="row-gap">
        <button
          className="button"
          disabled={pending || content.trim().length === 0}
          onClick={() => startTransition(saveUpdate)}
          type="button"
        >
          {pending ? 'Saving...' : 'Save update'}
        </button>
        {message ? <span className="muted">{message}</span> : null}
      </div>
    </div>
  )
}

export function AddAchievementForm({ employeeId }: { employeeId: string }) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  async function saveAchievement() {
    setMessage(null)
    const { error } = await supabase.from('achievements').insert({
      employee_id: employeeId,
      title,
      description,
      achieved_on: new Date().toISOString().slice(0, 10),
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setTitle('')
    setDescription('')
    setMessage('Saved. Refresh the page to see the new achievement.')
  }

  return (
    <div className="stack-sm">
      <input className="input" placeholder="Achievement title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        className="textarea"
        placeholder="What happened? Why does it matter?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />
      <div className="row-gap">
        <button
          className="button"
          disabled={pending || title.trim().length === 0}
          onClick={() => startTransition(saveAchievement)}
          type="button"
        >
          {pending ? 'Saving...' : 'Save achievement'}
        </button>
        {message ? <span className="muted">{message}</span> : null}
      </div>
    </div>
  )
}
