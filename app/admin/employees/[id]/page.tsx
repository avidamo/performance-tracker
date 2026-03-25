import GenerateSummaryButton from '@/components/generate-summary-button'
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

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 18,
          fontSize: 22,
          color: '#0f172a',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const bundle = await getEmployeeBundle(id)

  if (!bundle.employee) {
    notFound()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '40px 24px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/admin"
            style={{
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ← Back to dashboard
          </Link>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            borderRadius: 24,
            padding: 28,
            marginBottom: 24,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.14)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Employee Profile
          </div>

          <h1 style={{ margin: 0, fontSize: 36 }}>{bundle.employee.name}</h1>
          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: 'rgba(255,255,255,0.78)',
              fontSize: 16,
            }}
          >
            {bundle.employee.role_title || 'Team Member'}
          </p>
        </div>

        <SectionCard title="Goals & Action Plan">
          <div style={{ marginBottom: 20 }}>
            <AddGoalForm employeeId={bundle.employee.id} />
          </div>
          <TaskCheckboxList goals={bundle.goals} />
        </SectionCard>

        <SectionCard title="Achievements">
          <div style={{ marginBottom: 18 }}>
            <AddAchievementForm employeeId={bundle.employee.id} />
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {bundle.achievements.length === 0 ? (
              <p style={{ color: '#64748b' }}>No achievements yet.</p>
            ) : (
              bundle.achievements.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 16,
                    background: '#fcfcfd',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748b',
                      marginBottom: 6,
                    }}
                  >
                    {formatDate(item.created_at)}
                  </div>
                  <div style={{ color: '#0f172a' }}>
                    {item.note || item.content || item.title}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Manager Notes">
          <div style={{ marginBottom: 18 }}>
            <AddNoteForm employeeId={bundle.employee.id} />
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {bundle.notes.length === 0 ? (
              <p style={{ color: '#64748b' }}>No notes yet.</p>
            ) : (
              bundle.notes.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 16,
                    background: '#fcfcfd',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: '#64748b',
                      marginBottom: 6,
                    }}
                  >
                    {formatDate(item.created_at)}
                  </div>
                  <div style={{ color: '#0f172a' }}>
                    {item.note || item.content || item.title}
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
<SectionCard title="Monthly Summaries">
  <div style={{ marginBottom: 18 }}>
    <GenerateSummaryButton employeeId={bundle.employee.id} />
  </div>

  <div style={{ display: 'grid', gap: 12 }}>
    {bundle.summaries.length === 0 ? (
      <p style={{ color: '#64748b' }}>No summaries yet.</p>
    ) : (
      bundle.summaries.map((item: any) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            background: '#fcfcfd',
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            {formatDate(item.created_at)}
          </div>
          <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a' }}>
            {item.summary_text || item.summary || item.content || JSON.stringify(item)}
          </div>
        </div>
      ))
    )}
  </div>
</SectionCard>