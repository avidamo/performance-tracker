import { notFound } from 'next/navigation'
import { getEmployeeBundle } from '@/lib/data'

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export default async function EmployeeViewPage({ params }: PageProps) {
  const { id } = await params
  const bundle = await getEmployeeBundle(id)

  if (!bundle.employee) notFound()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7faf7',
        padding: '40px 24px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 6 }}>{bundle.employee.name}</h1>
        <p style={{ color: '#5f6b5f', marginBottom: 24 }}>
          {bundle.employee.role_title}
        </p>

        {/* GOALS */}
        <section style={{ marginBottom: 32 }}>
          <h2>Goals</h2>
          {bundle.goals.map((goal: any) => (
            <div key={goal.id} style={{ marginBottom: 16 }}>
              <strong>{goal.title}</strong>
              <ul>
                {goal.goal_tasks?.map((task: any) => (
                  <li key={task.id}>
                    {task.is_completed ? '✅' : '⬜'} {task.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* ACHIEVEMENTS */}
        <section style={{ marginBottom: 32 }}>
          <h2>Achievements</h2>
          {bundle.achievements.map((a: any) => (
            <div key={a.id}>
              {formatDate(a.created_at)} — {a.note || a.title}
            </div>
          ))}
        </section>

        {/* NOTES */}
        <section style={{ marginBottom: 32 }}>
          <h2>Manager Notes</h2>
          {bundle.notes.map((n: any) => (
            <div key={n.id}>
              {formatDate(n.created_at)} — {n.note}
            </div>
          ))}
        </section>

        {/* SUMMARY */}
        <section>
          <h2>Latest Summary</h2>
          {bundle.summaries[0] ? (
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {bundle.summaries[0].summary_text}
            </p>
          ) : (
            <p>No summary yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}