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
    <div style={{ display: 'grid', gap: 18 }}>
      {localGoals.map((goal) => (
        <div
          key={goal.id}
          style={{
            padding: 20,
            border: '1px solid #dfe8cd',
            borderRadius: 20,
            background: '#fbfef6',
            boxShadow: '0 10px 24px rgba(34, 45, 22, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: '#142013',
                  fontSize: 18,
                  letterSpacing: '-0.02em',
                }}
              >
                {goal.title}
              </h3>

              {goal.description && (
                <p
                  style={{
                    marginTop: 10,
                    marginBottom: 0,
                    color: '#5f6b5f',
                    lineHeight: 1.5,
                  }}
                >
                  {goal.description}
                </p>
              )}
            </div>

            <DeleteGoalButton goalId={goal.id} />
          </div>

          <ul
            style={{
              listStyle: 'none',
              paddingLeft: 0,
              margin: '16px 0',
              display: 'grid',
              gap: 10,
            }}
          >
            {goal.goal_tasks?.map((task) => (
              <li
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'white',
                  border: '1px solid #e7efd7',
                  borderRadius: 14,
                  padding: '12px 14px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#142013',
                    flex: 1,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={(e) => toggleTask(task.id, e.target.checked)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: '#b7df6d',
                      cursor: 'pointer',
                    }}
                  />
                  <span
                    style={{
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      opacity: task.is_completed ? 0.6 : 1,
                    }}
                  >
                    {task.title}
                  </span>
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