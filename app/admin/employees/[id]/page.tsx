<Link
  href={`/employee/${bundle.employee.id}`}
  target="_blank"
  style={{
    display: 'inline-block',
    marginBottom: 20,
    padding: '8px 14px',
    borderRadius: 10,
    background: '#dff5b2',
    color: '#142013',
    fontWeight: 600,
    textDecoration: 'none',
  }}
>
  View as Employee →
</Link>

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
        background: 'rgba(255,255,255,0.84)',
        border: '1px solid #e3edd1',
        borderRadius: 22,
        padding: 24,
        boxShadow: '0 12px 30px rgba(33, 45, 22, 0.06)',
        backdropFilter: 'blur(8px)',
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 18,
          fontSize: 22,
          color: '#142013',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function ItemCard({
  date,
  content,
}: {
  date?: string | null
  content: string
}) {
  return (
    <div
      style={{
        border: '1px solid #e3edd1',
        borderRadius: 16,
        padding: 16,
        background: '#fbfef6',
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: '#70806c',
          marginBottom: 6,
        }}
      >
        {formatDate(date)}
      </div>
      <div style={{ color: '#142013', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {content}
      </div>
    </div>
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
        background: '#f7faf7',
        padding: '40px 24px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/admin"
            style={{
              color: '#4e5f49',
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
            background: 'linear-gradient(135deg, #182415 0%, #24331f 100%)',
            color: 'white',
            borderRadius: 24,
            padding: 28,
            marginBottom: 24,
            boxShadow: '0 16px 40px rgba(20, 32, 19, 0.18)',
            border: '1px solid rgba(183, 223, 109, 0.18)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(223,245,178,0.16)',
              color: '#eef8d8',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Employee Profile
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 36,
              letterSpacing: '-0.03em',
            }}
          >
            {bundle.employee.name}
          </h1>

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
              <p style={{ color: '#70806c' }}>No achievements yet.</p>
            ) : (
              bundle.achievements.map((item: any) => (
                <ItemCard
                  key={item.id}
                  date={item.created_at}
                  content={item.note || item.content || item.title || '—'}
                />
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
              <p style={{ color: '#70806c' }}>No notes yet.</p>
            ) : (
              bundle.notes.map((item: any) => (
                <ItemCard
                  key={item.id}
                  date={item.created_at}
                  content={item.note || item.content || item.title || '—'}
                />
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
              <p style={{ color: '#70806c' }}>No summaries yet.</p>
            ) : (
              bundle.summaries.map((item: any) => (
                <ItemCard
                  key={item.id}
                  date={item.created_at}
                  content={
                    item.summary_text ||
                    item.summary ||
                    item.content ||
                    JSON.stringify(item)
                  }
                />
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}