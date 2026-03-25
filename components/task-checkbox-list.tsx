'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import AddTaskForm from './add-task-form'
import DeleteTaskButton from './delete-task-button'
import DeleteGoalButton from './delete-goal-button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Task = {
  id: string
  title: string
  is_completed: boolean
}

type Goal = {
  id: string
  title: string
  description: string | null
  goal_tasks?: Task[]
}

type Props = {
  goals: Goal[]
}

export default function TaskCheckboxList({ goals }: Props) {
  const [localGoals, setLocalGoals] = useState(goals)

  async function toggleTask(taskId: string, checked: boolean) {
    setLocalGoals((prev) =>
      prev.map((goal) => ({
        ...goal,
        goal_tasks: goal.goal_tasks?.map((task) =>
          task.id === taskId ? { ...task, is_completed: checked } : task
        ),
      }))
    )

    const { error } = await supabase
      .from('goal_tasks')
      .update({ is_completed: checked })
      .eq('id', taskId)

    if (error) {
      alert(`Could not save checkbox change: ${error.message}`)
      return
    }

    window.location.reload()
  }

  return (
    <div>
      {localGoals.map((goal) => (
        <div
          key={goal.id}
          style={{
            marginBottom: 24,
            padding: 16,
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            background: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>{goal.title}</h3>
            <DeleteGoalButton goalId={goal.id} />
          </div>

          {goal.description && <p>{goal.description}</p>}

          <ul>
            {goal.goal_tasks?.map((task) => (
              <li key={task.id} style={{ marginBottom: 8 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={(e) => toggleTask(task.id, e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  {task.title}
                </label>
                <DeleteTaskButton taskId={task.id} />
              </li>
            ))}
          </ul>

          <AddTaskForm goalId={goal.id} />
        </div>
      ))}
    </div>
  )
}