export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEmployeeBundle } from '@/lib/data'
import TaskCheckboxList from '@/components/task-checkbox-list'
import AddNoteForm from '@/components/add-note-form'
import AddAchievementForm from '@/components/add-achievement-form'
import AddGoalForm from '@/components/add-goal-form'

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const bundle = await getEmployeeBundle(id)

  if (!bundle.employee) {
    notFound()
  }

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ color: '#0f172a', textDecoration: 'none' }}>
          ← Back to Admin
        </Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>{bundle.employee.name}</h1>
        <p style={{ margin: 0, color: '#666' }}>{bundle.employee.role_title}</p>
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>Goals</h2>
        <AddGoalForm employeeId={bundle.employee.id} />
        <TaskCheckboxList goals={bundle.goals} />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>Achievements</h2>

        <div style={{ marginBottom: 20 }}>
          <AddAchievementForm employeeId={bundle.employee.id} />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {bundle.achievements.length === 0 ? (
            <p style={{ color: '#666' }}>No achievements yet.</p>
          ) : (
            bundle.achievements.map((item: any) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: 16,
                  background: 'white',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>
                  {formatDate(item.created_at)}
                </div>
                <div>{item.note || item.content || item.title}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>Manager Notes</h2>

        <div style={{ marginBottom: 20 }}>
          <AddNoteForm employeeId={bundle.employee.id} />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {bundle.notes.length === 0 ? (
            <p style={{ color: '#666' }}>No notes yet.</p>
          ) : (
            bundle.notes.map((item: any) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: 16,
                  background: 'white',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>
                  {formatDate(item.created_at)}
                </div>
                <div>{item.note || item.content || item.title}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>Monthly Summaries</h2>

        <div style={{ display: 'grid', gap: 12 }}>
          {bundle.summaries.length === 0 ? (
            <p style={{ color: '#666' }}>No summaries yet.</p>
          ) : (
            bundle.summaries.map((item: any) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: 16,
                  background: 'white',
                }}
              >
                <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>
                  {formatDate(item.created_at)}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {item.summary || item.content || JSON.stringify(item)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}