import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAppUser, getEmployeeBundle } from '@/lib/data'
import { buildAnalyticsNarrative, getEmployeeAnalytics } from '@/lib/analytics'

const payloadSchema = z.object({
  employeeId: z.string().uuid(),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
})

type Snapshot = {
  employee: {
    id: string
    name: string
    role_title: string
    performance_classification: string | null
    review_notes_public: string | null
    current_quarter_focus: string | null
    manager_name: string | null
  }
  goals: Array<{
    title: string
    description: string | null
    status: string
    success_signal: string | null
    tasks: Array<{ title: string; is_completed: boolean }>
  }>
  softSkills: Array<{
    skill_name: string
    status: string
    current_focus: string | null
    description: string | null
  }>
  updates: Array<{
    month_key: string
    update_type: string
    content: string
    created_at: string
  }>
  achievements: Array<{
    title: string
    description: string | null
    achieved_on: string
  }>
  analytics?: {
    summaryLine: string
    coachLines: string[]
    warnings: string[]
  } | null
}

function buildFallbackSummary(snapshot: Snapshot) {
  const completedGoals = snapshot.goals.filter((g) => g.status === 'completed').map((g) => g.title)
  const inProgressGoals = snapshot.goals.filter((g) => g.status !== 'completed').map((g) => g.title)
  const topAchievements = snapshot.achievements.slice(0, 4).map((a) => a.title)
  const updateThemes = snapshot.updates.slice(0, 3).map((u) => u.content.trim())
  const softSkillFocus = snapshot.softSkills.slice(0, 2).map((s) => s.current_focus || s.skill_name)
  const analyticsLine = snapshot.analytics?.summaryLine

  const accomplishments = [
    analyticsLine ? `Analytics: ${analyticsLine}` : null,
    topAchievements.length ? `Achievements: ${topAchievements.join('; ')}` : null,
    completedGoals.length ? `Completed goals: ${completedGoals.join('; ')}` : null,
    updateThemes.length ? `Recent updates: ${updateThemes.join(' ')}` : null,
  ]
    .filter(Boolean)
    .join(' ')

  const nextFocus = [
    ...inProgressGoals.slice(0, 2),
    ...softSkillFocus.slice(0, 2),
    ...(snapshot.analytics?.warnings ?? []).slice(0, 2),
  ]
    .filter(Boolean)
    .join('; ') || 'Clarify next-month priorities with manager.'

  const summary = `${snapshot.employee.name} showed month-over-month progress as a ${snapshot.employee.role_title}. ${analyticsLine ? `${analyticsLine}. ` : ''}${topAchievements.length ? `Standout wins included ${topAchievements.join(', ')}.` : 'The month would benefit from more logged achievements.'} ${inProgressGoals.length ? `Primary active focus areas remain ${inProgressGoals.slice(0, 3).join(', ')}.` : ''}`.trim()

  return {
    summary,
    accomplishments: accomplishments || 'No major accomplishments were logged yet.',
    nextFocus,
  }
}

function buildPrompt(snapshot: Snapshot, monthKey: string) {
  return `You are generating an internal monthly performance summary for a manager dashboard.

Rules:
- Use only the supplied structured data.
- Use BigQuery analytics when present, but never fabricate metrics.
- Be concrete and specific.
- Do not invent facts.
- Keep tone professional, direct, and supportive.
- Recognize both performance progress and development needs.
- If data is thin, say so briefly without sounding robotic.
- Return VALID JSON only with exactly these keys:
  {"summary": string, "accomplishments": string, "nextFocus": string, "managerHighlights": string[]}

Field guidance:
- summary: 90-140 words. One concise paragraph.
- accomplishments: 2-4 short sentences summarizing wins, completed work, momentum, or positive behavior.
- nextFocus: 2-4 short sentences summarizing what to prioritize next month.
- managerHighlights: 3-6 short bullet-style strings. Each should be 4-12 words and useful in an admin view.

Prioritize these inputs, in order:
1. BigQuery analytics for ${monthKey}
2. Achievements and monthly updates from ${monthKey}
3. Goal progress and completed tasks
4. Current quarter focus and review notes
5. Soft-skill focus areas

Employee context:
- Name: ${snapshot.employee.name}
- Role: ${snapshot.employee.role_title}
- Performance classification: ${snapshot.employee.performance_classification ?? 'Not set'}
- Current quarter focus: ${snapshot.employee.current_quarter_focus ?? 'Not set'}
- Review notes: ${snapshot.employee.review_notes_public ?? 'Not set'}
- Manager: ${snapshot.employee.manager_name ?? 'Not set'}

Now summarize the structured data faithfully.`
}

async function generateWithOpenAI(snapshot: Snapshot, monthKey: string) {
  if (!process.env.OPENAI_API_KEY) return null

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.responses.create({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: buildPrompt(snapshot, monthKey) }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: JSON.stringify(snapshot) }],
        },
      ],
    })

    const parsed = JSON.parse(response.output_text)
    if (
      typeof parsed.summary === 'string' &&
      typeof parsed.accomplishments === 'string' &&
      typeof parsed.nextFocus === 'string'
    ) {
      return {
        summary: parsed.summary,
        accomplishments: parsed.accomplishments,
        nextFocus: parsed.nextFocus,
        managerHighlights: Array.isArray(parsed.managerHighlights) ? parsed.managerHighlights : [],
      }
    }
  } catch {
    // fall through to fallback
  }

  return null
}

export async function POST(request: Request) {
  const appUser = await getCurrentAppUser()
  if (appUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = payloadSchema.safeParse(await request.json())
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const bundle = await getEmployeeBundle(payload.data.employeeId)
  const analytics = await getEmployeeAnalytics(bundle.employee)
  const analyticsNarrative = buildAnalyticsNarrative(analytics)

  const updatesForMonth = bundle.updates.filter((u) => u.month_key === payload.data.monthKey)
  const snapshot: Snapshot = {
    employee: {
      id: bundle.employee.id,
      name: bundle.employee.name,
      role_title: bundle.employee.role_title,
      performance_classification: bundle.employee.performance_classification,
      review_notes_public: bundle.employee.review_notes_public,
      current_quarter_focus: bundle.employee.current_quarter_focus,
      manager_name: bundle.employee.manager_name,
    },
    goals: bundle.goals.map((goal) => ({
      title: goal.title,
      description: goal.description,
      status: goal.status,
      success_signal: goal.success_signal,
      tasks: goal.tasks.map((task) => ({ title: task.title, is_completed: task.is_completed })),
    })),
    softSkills: bundle.softSkills.map((skill) => ({
      skill_name: skill.skill_name,
      status: skill.status,
      current_focus: skill.current_focus,
      description: skill.description,
    })),
    updates: updatesForMonth.map((u) => ({
      month_key: u.month_key,
      update_type: u.update_type,
      content: u.content,
      created_at: u.created_at,
    })),
    achievements: bundle.achievements
      .filter((a) => a.achieved_on.startsWith(payload.data.monthKey))
      .map((a) => ({ title: a.title, description: a.description, achieved_on: a.achieved_on })),
    analytics: analyticsNarrative,
  }

  const fallback = buildFallbackSummary(snapshot)
  const generated = (await generateWithOpenAI(snapshot, payload.data.monthKey)) ?? {
    ...fallback,
    managerHighlights: [
      bundle.employee.role_title,
      bundle.employee.performance_classification ?? 'Performance not yet classified',
      bundle.employee.current_quarter_focus ?? 'Quarter focus not yet set',
      ...(analytics.warnings ?? []).slice(0, 2),
    ],
  }

  const sourceSnapshot = {
    ...snapshot,
    managerHighlights: generated.managerHighlights,
  }

  const { error } = await supabase.from('monthly_summaries').upsert(
    {
      employee_id: payload.data.employeeId,
      month_key: payload.data.monthKey,
      summary_text: generated.summary,
      accomplishments_text: generated.accomplishments,
      next_focus_text: generated.nextFocus,
      generated_by_user_id: appUser.id,
      source_snapshot_json: sourceSnapshot,
    },
    { onConflict: 'employee_id,month_key' },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, generated })
}
