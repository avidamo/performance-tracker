import GenerateSummaryButton from '@/components/generate-summary-button'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEmployeeBundle } from '@/lib/data'
import { employeeGoals } from '@/lib/employee-goals'
import AddNoteForm from '@/components/add-note-form'
import AddAchievementForm from '@/components/add-achievement-form'
import PortfolioEditor from '@/components/portfolio-editor'

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

function PortfolioProgressCard({
  goal,
  current,
  employeeId,
}: {
  goal?: number | null
  current?: number | null
  employeeId: string
}) {
  const safeGoal = Number(goal || 0)
  const safeCurrent = Number(current || 0)
  const percent = safeGoal > 0 ? Math.min((safeCurrent / safeGoal) * 100, 100) : 0
  const remaining = Math.max(safeGoal - safeCurrent, 0)

  let fill = '#f59e0b'
  let bg = '#fff7e6'
  let text = '#6b4f00'

  if (percent < 60) {
    fill = '#ef4444'
    bg = '#fef2f2'
    text = '#7f1d1d'
  } else if (percent >= 85) {
    fill = '#b7df6d'
    bg = '#f3fbe8'
    text = '#2f4a12'
  }

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${fill}55`,
        borderRadius: 22,
        padding: 22,
        marginBottom: 24,
        boxShadow: '0 10px 24px rgba(33, 45, 22, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: text,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Portfolio Goal
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: '#142013',
              letterSpacing: '-0.03em',
            }}
          >
            ${safeCurrent.toLocaleString()} / ${safeGoal.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            background: 'white',
            border: '1px solid #e5e7eb',
            fontWeight: 700,
            color: text,
          }}
        >
          {percent.toFixed(0)}% to goal
        </div>
      </div>

      <div
        style={{
          height: 14,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.8)',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: fill,
            borderRadius: 999,
            transition: 'width 300ms ease',
          }}
        />
      </div>

      <div style={{ color: '#5f6b5f', fontSize: 14 }}>
        {remaining > 0
          ? `$${remaining.toLocaleString()} remaining to hit goal`
          : 'Goal reached'}
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: '#70806c' }}>
        Monthly pace: ${Math.round(safeCurrent / Math.max(new Date().getDate(), 1)).toLocaleString()}/day
      </div>

      <div style={{ marginTop: 12 }}>
        <PortfolioEditor
          employeeId={employeeId}
          goal={safeGoal}
          current={safeCurrent}
        />
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

  const employeeConfig = employeeGoals.find(
    (entry) =>
      entry.name.toLowerCase().trim() ===
      String(bundle.employee.name || '').toLowerCase().trim()
  )

  const staticGoals = employeeConfig?.goals ?? []
  const staticPortfolioGoal = employeeConfig?.portfolioGoal ?? null

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

        <PortfolioProgressCard
          goal={staticPortfolioGoal ?? bundle.employee.portfolio_goal}
          current={bundle.employee.portfolio_current}
          employeeId={bundle.employee.id}
        />

        <SectionCard title="Goals & Action Plan">
          <div style={{ display: 'grid', gap: 18 }}>
            {staticGoals.length === 0 ? (
              <p style={{ color: '#70806c' }}>No goals yet.</p>
            ) : (
              staticGoals.map((goal, index) => (
                <div
                  key={`${goal.title}-${index}`}
                  style={{
                    background: '#fbfef6',
                    border: '1px solid #dfe8cd',
                    borderRadius: 20,
                    padding: 20,
                    boxShadow: '0 10px 24px rgba(34, 45, 22, 0.05)',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      color: '#142013',
                      marginBottom: 10,
                    }}
                  >
                    {goal.title}
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    {goal.actions.map((action, actionIndex) => (
                      <div
                        key={`${goal.title}-${actionIndex}`}
                        style={{
                          color: '#5f6b5f',
                          lineHeight: 1.5,
                          background: 'white',
                          border: '1px solid #e7efd7',
                          borderRadius: 14,
                          padding: '12px 14px',
                        }}
                      >
                        • {action}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
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