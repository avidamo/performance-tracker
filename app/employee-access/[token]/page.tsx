import { notFound } from 'next/navigation'
import { getEmployeeBundleByAccessToken } from '@/lib/data'
import { employeeGoals } from '@/lib/employee-goals'

type PageProps = {
  params: Promise<{ token: string }>
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
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid #e3edd1',
        borderRadius: 22,
        padding: 24,
        boxShadow: '0 12px 30px rgba(33, 45, 22, 0.06)',
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 22,
          color: '#142013',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function PortfolioBar({
  goal,
  current,
}: {
  goal?: number | null
  current?: number | null
}) {
  const g = Number(goal || 0)
  const c = Number(current || 0)
  const percent = g > 0 ? Math.min((c / g) * 100, 100) : 0

  let color = '#ef4444'
  if (percent >= 60) color = '#f59e0b'
  if (percent >= 85) color = '#b7df6d'

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>
        ${c.toLocaleString()} / ${g.toLocaleString()}
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 999,
          background: '#e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: color,
            transition: 'width 300ms ease',
          }}
        />
      </div>

      <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
        {percent.toFixed(0)}% to goal
      </div>
    </div>
  )
}

export default async function EmployeePage({ params }: PageProps) {
  const { token } = await params
  const bundle = await getEmployeeBundleByAccessToken(token)

  if (!bundle.employee) notFound()

  const staticGoals =
    employeeGoals.find(
      (entry) =>
        entry.name.toLowerCase().trim() ===
        String(bundle.employee.name || '').toLowerCase().trim()
    )?.goals ?? []

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef9d8 0%, #f7fbf2 100%)',
        padding: '40px 24px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1c2a1a 0%, #b7df6d 100%)',
            borderRadius: 26,
            padding: 28,
            marginBottom: 24,
            color: '#142013',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 34 }}>
            {bundle.employee.name}
          </h1>

          <p style={{ marginTop: 8 }}>
            {bundle.employee.role_title}
          </p>

          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              Portfolio Goal
            </div>

            <PortfolioBar
              goal={bundle.employee.portfolio_goal}
              current={bundle.employee.portfolio_current}
            />
          </div>
        </div>

        <SectionCard title="Goals & Action Plan">
          <div style={{ display: 'grid', gap: 18 }}>
            {staticGoals.length === 0 ? (
              <p style={{ color: '#64748b' }}>No goals yet.</p>
            ) : (
              staticGoals.map((goal, index) => (
                <div
                  key={`${goal.title}-${index}`}
                  style={{
                    background: '#f9fdf2',
                    border: '1px solid #e3edd1',
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#142013',
                      marginBottom: 10,
                    }}
                  >
                    {goal.title}
                  </div>

                  <div style={{ display: 'grid', gap: 6 }}>
                    {goal.actions.map((action, actionIndex) => (
                      <div
                        key={`${goal.title}-${actionIndex}`}
                        style={{
                          color: '#5f6b5f',
                          lineHeight: 1.5,
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

        <SectionCard title="Wins This Month">
          <div style={{ display: 'grid', gap: 10 }}>
            {bundle.achievements.map((a: any) => (
              <div key={a.id}>
                {formatDate(a.created_at)} — {a.note || a.title}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Monthly Summary">
          {bundle.summaries[0] ? (
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {bundle.summaries[0].summary_text}
            </p>
          ) : (
            <p>No summary yet.</p>
          )}
        </SectionCard>
      </div>
    </div>
  )
} 