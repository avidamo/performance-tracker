'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DeleteTaskButton({ taskId }: { taskId: string }) {
  async function handleDelete() {
    const confirmed = window.confirm('Delete this task?')
    if (!confirmed) return

    const { error } = await supabase
      .from('goal_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      alert(`Could not delete task: ${error.message}`)
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      style={{
        marginLeft: 8,
        fontSize: 12,
        padding: '2px 8px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: 'white',
        cursor: 'pointer',
      }}
    >
      Delete
    </button>
  )
}