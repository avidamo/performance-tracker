export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'
import { GenerateAllSummariesButton } from '@/components/generate-all-summaries-button'
import { Badge, Card, PageHeader, PageShell, Stat } from '@/components/ui'
import { getCurrentAppUser, getDashboardEmployees } from '@/lib/data'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const user = await getCurrentAppUser()

  const employees = await getDashboardEmployees()
  const activeCount = employees.filter((e) => e.status === 'active').length
  const needsAttention = employees.filter((e) => e.needsAttention).length
  const placeholderCount = employees.filter((e) => e.status === 'placeholder').length

  return (
    <PageShell>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Team-wide view of goals, updates, summaries, and manager-only notes."
        actions={<div className="row-gap"><GenerateAllSummariesButton /><LogoutButton /></div>}
      />

      <div className="stats-grid">
        <Card><Stat label="Active employees" value={activeCount} /></Card>
        <Card><Stat label="Needs attention" value={needsAttention} /></Card>
        <Card><Stat label="Placeholders" value={placeholderCount} /></Card>
      </div>

      <div className="grid-cards">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <div className="row-space card-topline">
              <div>
                <h3>{employee.name}</h3>
                <p className="muted">{employee.role_title}</p>
              </div>
              {employee.status === 'placeholder' ? <Badge tone="warn">Placeholder</Badge> : null}
            </div>
            <div className="stack-sm compact-list">
              <div><strong>Performance:</strong> {employee.performance_classification ?? '—'}</div>
              <div><strong>Focus:</strong> {employee.current_quarter_focus ?? '—'}</div>
              <div><strong>Open goals:</strong> {employee.openTasks}</div>
              <div><strong>Latest update:</strong> {formatDate(employee.latestUpdate)}</div>
            </div>
            <div className="row-gap card-actions">
              <Link className="button" href={`/admin/employees/${employee.id}`}>View employee</Link>
              {employee.needsAttention ? <Badge tone="warn">Needs review</Badge> : <Badge tone="good">On track</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
