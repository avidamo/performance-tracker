import type { ReactNode } from 'react'
import { cn, formatCurrency, formatDate, formatInteger, formatPercent, titleCase } from '@/lib/utils'

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="page-shell">{children}</div>
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  )
}

export function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('card', className)}>
      {title ? <h2 className="card-title">{title}</h2> : null}
      {children}
    </section>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'info' }) {
  return <span className={cn('badge', `badge-${tone}`)}>{children}</span>
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  )
}

export function GoalStatusBadge({ status }: { status: string }) {
  const tone = status === 'completed' ? 'good' : status === 'at_risk' ? 'warn' : 'info'
  return <Badge tone={tone}>{titleCase(status)}</Badge>
}

export function KeyValueTable({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    <div className="kv-grid">
      {rows.map((row) => (
        <div className="kv-row" key={row.label}>
          <span className="kv-label">{row.label}</span>
          <span className="kv-value">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function SummaryBox({ monthKey, summary, nextFocus }: { monthKey: string; summary: string; nextFocus?: string | null }) {
  return (
    <div className="summary-box">
      <div className="summary-month">{monthKey}</div>
      <p>{summary}</p>
      {nextFocus ? (
        <p>
          <strong>Next focus:</strong> {nextFocus}
        </p>
      ) : null}
    </div>
  )
}

export function ManagerNoteList({ notes }: { notes: Array<{ id: string; note_type: string; content: string; created_at: string }> }) {
  return (
    <div className="stack-sm">
      {notes.length === 0 ? <p className="muted">No manager notes yet.</p> : null}
      {notes.map((note) => (
        <div className="note-box" key={note.id}>
          <div className="note-topline">
            <Badge tone="warn">{titleCase(note.note_type)}</Badge>
            <span className="muted">{formatDate(note.created_at)}</span>
          </div>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsOverview({
  latest,
  sourceLabel,
}: {
  latest: {
    revenue_actual: number | null
    revenue_target: number | null
    revenue_attainment_pct: number | null
    portfolio_value: number | null
    active_coaches: number | null
    responsive_coaches: number | null
    new_coaches_signed: number | null
    campaigns_run: number | null
    campaign_revenue: number | null
    trend_vs_prior_month_pct: number | null
  } | null
  sourceLabel: string
}) {
  if (!latest) {
    return <p className="muted">No BigQuery metrics found yet.</p>
  }

  return (
    <>
      <p className="muted small-text">Source: {sourceLabel}</p>
      <div className="analytics-grid">
        <Stat label="Revenue actual" value={formatCurrency(latest.revenue_actual)} />
        <Stat label="Revenue target" value={formatCurrency(latest.revenue_target)} />
        <Stat label="Attainment" value={formatPercent(latest.revenue_attainment_pct)} />
        <Stat label="Portfolio value" value={formatCurrency(latest.portfolio_value)} />
        <Stat label="Active coaches" value={formatInteger(latest.active_coaches)} />
        <Stat label="Responsive coaches" value={formatInteger(latest.responsive_coaches)} />
        <Stat label="New coaches signed" value={formatInteger(latest.new_coaches_signed)} />
        <Stat label="Campaigns run" value={formatInteger(latest.campaigns_run)} />
        <Stat label="Campaign revenue" value={formatCurrency(latest.campaign_revenue)} />
        <Stat label="Trend vs prior month" value={formatPercent(latest.trend_vs_prior_month_pct)} />
      </div>
    </>
  )
}

export function AnalyticsTrendTable({
  rows,
}: {
  rows: Array<{
    month_key: string
    revenue_actual: number | null
    revenue_target: number | null
    revenue_attainment_pct: number | null
    trend_vs_prior_month_pct: number | null
  }>
}) {
  if (rows.length === 0) return <p className="muted">No historical trend rows yet.</p>

  return (
    <div className="table-wrap">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
            <th>Target</th>
            <th>Attainment</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month_key}>
              <td>{row.month_key}</td>
              <td>{formatCurrency(row.revenue_actual)}</td>
              <td>{formatCurrency(row.revenue_target)}</td>
              <td>{formatPercent(row.revenue_attainment_pct)}</td>
              <td>{formatPercent(row.trend_vs_prior_month_pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CoachMetricList({
  rows,
}: {
  rows: Array<{
    coach_name: string
    revenue_actual: number | null
    campaign_name: string | null
    campaign_revenue: number | null
    responsive: boolean | null
    status_label: string | null
  }>
}) {
  if (rows.length === 0) return <p className="muted">No coach-level metrics returned yet.</p>

  return (
    <div className="stack-sm">
      {rows.map((row) => (
        <div className="note-box" key={`${row.coach_name}-${row.campaign_name ?? 'none'}`}>
          <div className="row-space">
            <strong>{row.coach_name}</strong>
            <span>{formatCurrency(row.revenue_actual)}</span>
          </div>
          <p>
            {row.campaign_name ? `Campaign: ${row.campaign_name}. ` : ''}
            {row.campaign_revenue !== null ? `Campaign revenue: ${formatCurrency(row.campaign_revenue)}. ` : ''}
            {row.status_label ? `Status: ${row.status_label}. ` : ''}
            {row.responsive !== null ? `Responsive: ${row.responsive ? 'Yes' : 'No'}.` : ''}
          </p>
        </div>
      ))}
    </div>
  )
}
