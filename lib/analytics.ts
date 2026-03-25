import 'server-only'
import type { AnalyticsCoachMetric, AnalyticsMonthlyMetric, Employee, EmployeeAnalyticsBundle } from '@/lib/types'
import { getAnalyticsTableRef, getBigQueryClient, isBigQueryConfigured } from '@/lib/bigquery'

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function normalizeMonthlyRow(row: Record<string, unknown>): AnalyticsMonthlyMetric {
  return {
    month_key: String(row.month_key ?? ''),
    revenue_actual: parseNumber(row.revenue_actual),
    revenue_target: parseNumber(row.revenue_target),
    portfolio_value: parseNumber(row.portfolio_value),
    active_coaches: parseNumber(row.active_coaches),
    responsive_coaches: parseNumber(row.responsive_coaches),
    new_coaches_signed: parseNumber(row.new_coaches_signed),
    campaigns_run: parseNumber(row.campaigns_run),
    campaign_revenue: parseNumber(row.campaign_revenue),
    revenue_attainment_pct: parseNumber(row.revenue_attainment_pct),
    trend_vs_prior_month_pct: parseNumber(row.trend_vs_prior_month_pct),
    top_coach_name: row.top_coach_name ? String(row.top_coach_name) : null,
    top_coach_revenue: parseNumber(row.top_coach_revenue),
  }
}

function normalizeCoachRow(row: Record<string, unknown>): AnalyticsCoachMetric {
  return {
    month_key: String(row.month_key ?? ''),
    coach_name: String(row.coach_name ?? 'Unknown coach'),
    revenue_actual: parseNumber(row.revenue_actual),
    revenue_target: parseNumber(row.revenue_target),
    campaign_name: row.campaign_name ? String(row.campaign_name) : null,
    campaign_revenue: parseNumber(row.campaign_revenue),
    responsive: typeof row.responsive === 'boolean' ? row.responsive : null,
    status_label: row.status_label ? String(row.status_label) : null,
  }
}

function monthKeyFor(date = new Date()) {
  return date.toISOString().slice(0, 7)
}

function buildWarnings(latest: AnalyticsMonthlyMetric | null, topCoaches: AnalyticsCoachMetric[]) {
  const warnings: string[] = []
  if (!latest) {
    warnings.push('No BigQuery metrics found yet for this employee.')
    return warnings
  }

  if (latest.revenue_attainment_pct !== null && latest.revenue_attainment_pct < 90) {
    warnings.push(`Revenue is below target at ${latest.revenue_attainment_pct.toFixed(1)}% attainment.`)
  }
  if (latest.trend_vs_prior_month_pct !== null && latest.trend_vs_prior_month_pct < 0) {
    warnings.push(`Revenue trend is down ${Math.abs(latest.trend_vs_prior_month_pct).toFixed(1)}% vs prior month.`)
  }
  if (
    latest.active_coaches !== null &&
    latest.responsive_coaches !== null &&
    latest.active_coaches > 0 &&
    latest.responsive_coaches / latest.active_coaches < 0.7
  ) {
    warnings.push('Responsive coach rate is below 70%.')
  }
  if (topCoaches.length === 0) {
    warnings.push('No coach-level rows were returned for the latest month.')
  }

  return warnings
}

export async function getEmployeeAnalytics(employee: Employee): Promise<EmployeeAnalyticsBundle> {
  if (!isBigQueryConfigured()) {
    return {
      enabled: false,
      sourceLabel: 'BigQuery not configured',
      latest: null,
      trend: [],
      topCoaches: [],
      warnings: ['Add BigQuery environment variables and standardized views to enable live performance metrics.'],
    }
  }

  const employeeName = employee.name
  const currentMonthKey = monthKeyFor()
  const bigquery = getBigQueryClient()
  const monthlyTable = getAnalyticsTableRef('BIGQUERY_EMPLOYEE_MONTHLY_VIEW')
  const coachTable = getAnalyticsTableRef('BIGQUERY_EMPLOYEE_COACH_VIEW')

  const monthlyQuery = `
    SELECT
      month_key,
      revenue_actual,
      revenue_target,
      portfolio_value,
      active_coaches,
      responsive_coaches,
      new_coaches_signed,
      campaigns_run,
      campaign_revenue,
      revenue_attainment_pct,
      trend_vs_prior_month_pct,
      top_coach_name,
      top_coach_revenue
    FROM ${monthlyTable}
    WHERE employee_name = @employeeName
    ORDER BY month_key DESC
    LIMIT 6
  `

  const coachQuery = `
    SELECT
      month_key,
      coach_name,
      revenue_actual,
      revenue_target,
      campaign_name,
      campaign_revenue,
      responsive,
      status_label
    FROM ${coachTable}
    WHERE employee_name = @employeeName
      AND month_key = @monthKey
    ORDER BY revenue_actual DESC NULLS LAST, coach_name ASC
    LIMIT 8
  `

  try {
    const [monthlyRows] = await bigquery.query({
      query: monthlyQuery,
      params: { employeeName },
      location: process.env.BIGQUERY_LOCATION || 'US',
    })

    const trend = (monthlyRows as Record<string, unknown>[]).map(normalizeMonthlyRow)
    const latest = trend[0] ?? null
    const monthForCoachQuery = latest?.month_key ?? currentMonthKey

    const [coachRows] = await bigquery.query({
      query: coachQuery,
      params: { employeeName, monthKey: monthForCoachQuery },
      location: process.env.BIGQUERY_LOCATION || 'US',
    })

    const topCoaches = (coachRows as Record<string, unknown>[]).map(normalizeCoachRow)

    return {
      enabled: true,
      sourceLabel: `${process.env.BIGQUERY_PROJECT_ID}.${process.env.BIGQUERY_DATASET}`,
      latest,
      trend,
      topCoaches,
      warnings: buildWarnings(latest, topCoaches),
    }
  } catch (error) {
    return {
      enabled: true,
      sourceLabel: `${process.env.BIGQUERY_PROJECT_ID}.${process.env.BIGQUERY_DATASET}`,
      latest: null,
      trend: [],
      topCoaches: [],
      warnings: [error instanceof Error ? error.message : 'BigQuery query failed.'],
    }
  }
}

export function buildAnalyticsNarrative(bundle: EmployeeAnalyticsBundle) {
  if (!bundle.enabled || !bundle.latest) return null

  const latest = bundle.latest
  const pieces = [
    latest.revenue_actual !== null ? `Revenue actual: ${latest.revenue_actual}` : null,
    latest.revenue_target !== null ? `Revenue target: ${latest.revenue_target}` : null,
    latest.revenue_attainment_pct !== null ? `Revenue attainment: ${latest.revenue_attainment_pct.toFixed(1)}%` : null,
    latest.portfolio_value !== null ? `Portfolio value: ${latest.portfolio_value}` : null,
    latest.active_coaches !== null ? `Active coaches: ${latest.active_coaches}` : null,
    latest.responsive_coaches !== null ? `Responsive coaches: ${latest.responsive_coaches}` : null,
    latest.new_coaches_signed !== null ? `New coaches signed: ${latest.new_coaches_signed}` : null,
    latest.campaigns_run !== null ? `Campaigns run: ${latest.campaigns_run}` : null,
    latest.campaign_revenue !== null ? `Campaign revenue: ${latest.campaign_revenue}` : null,
    latest.top_coach_name ? `Top coach: ${latest.top_coach_name}` : null,
    latest.top_coach_revenue !== null ? `Top coach revenue: ${latest.top_coach_revenue}` : null,
    latest.trend_vs_prior_month_pct !== null ? `Trend vs prior month: ${latest.trend_vs_prior_month_pct.toFixed(1)}%` : null,
  ].filter(Boolean)

  const coachLines = bundle.topCoaches
    .slice(0, 5)
    .map((coach) => {
      const bits = [
        coach.coach_name,
        coach.revenue_actual !== null ? `revenue ${coach.revenue_actual}` : null,
        coach.campaign_name ? `campaign ${coach.campaign_name}` : null,
        coach.status_label ? `status ${coach.status_label}` : null,
      ].filter(Boolean)
      return bits.join(' | ')
    })

  return {
    summaryLine: pieces.join('; '),
    coachLines,
    warnings: bundle.warnings,
  }
}
