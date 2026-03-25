'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DeleteGoalButton({ goalId }: { goalId: string }) {
  async function handleDelete() {
    const confirmed = window.confirm('Delete this goal and all its tasks?')
    if (!confirmed) return

    const { error: tasksError } = await supabase
      .from('goal_tasks')
      .delete()
      .eq('goal_id', goalId)

    if (tasksError) {
      alert(`Could not delete goal tasks: ${tasksError.message}`)
      return
    }

    const { error: goalError } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (goalError) {
      alert(`Could not delete goal: ${goalError.message}`)
      return
    }

    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      style={{
        marginLeft: 12,
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: 'white',
        cursor: 'pointer',
      }}
    >
      Delete goal
    </button>
  )
}