export type AppRole = 'admin' | 'employee'
export type EmployeeStatus = 'active' | 'placeholder' | 'archived'
export type GoalStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed'
export type SoftSkillStatus = 'focus' | 'improving' | 'strong'

export interface Employee {
  id: string
  name: string
  role_title: string
  department: string
  status: EmployeeStatus
  performance_classification: string | null
  manager_name: string | null
  review_notes_public: string | null
  current_quarter_focus: string | null
  last_review_date: string | null
  created_at?: string
  updated_at?: string
}

export interface Goal {
  id: string
  employee_id: string
  title: string
  description: string | null
  success_signal: string | null
  category: string | null
  status: GoalStatus
  sort_order: number
  start_date: string | null
  target_date: string | null
}

export interface GoalTask {
  id: string
  goal_id: string
  title: string
  description: string | null
  is_completed: boolean
  completed_at: string | null
  due_date: string | null
  sort_order: number
}

export interface SoftSkill {
  id: string
  employee_id: string
  skill_name: string
  description: string | null
  current_focus: string | null
  status: SoftSkillStatus
  sort_order: number
}

export interface ProgressUpdate {
  id: string
  employee_id: string
  month_key: string
  update_type: 'reflection' | 'manager_checkin' | 'self_update'
  content: string
  created_by_user_id: string | null
  created_at: string
}

export interface Achievement {
  id: string
  employee_id: string
  goal_id: string | null
  title: string
  description: string | null
  achieved_on: string
  created_at: string
}

export interface MonthlySummary {
  id: string
  employee_id: string
  month_key: string
  summary_text: string
  accomplishments_text: string | null
  next_focus_text: string | null
  generated_at: string
}

export interface ManagerNote {
  id: string
  employee_id: string
  note_type: 'risk' | 'promotion' | 'compensation' | 'private_note'
  content: string
  created_at: string
}

export interface AppUser {
  id: string
  email: string
  role: AppRole
  employee_id: string | null
}

export interface AnalyticsMonthlyMetric {
  month_key: string
  revenue_actual: number | null
  revenue_target: number | null
  portfolio_value: number | null
  active_coaches: number | null
  responsive_coaches: number | null
  new_coaches_signed: number | null
  campaigns_run: number | null
  campaign_revenue: number | null
  revenue_attainment_pct: number | null
  trend_vs_prior_month_pct: number | null
  top_coach_name: string | null
  top_coach_revenue: number | null
}

export interface AnalyticsCoachMetric {
  month_key: string
  coach_name: string
  revenue_actual: number | null
  revenue_target: number | null
  campaign_name: string | null
  campaign_revenue: number | null
  responsive: boolean | null
  status_label: string | null
}

export interface EmployeeAnalyticsBundle {
  enabled: boolean
  sourceLabel: string
  latest: AnalyticsMonthlyMetric | null
  trend: AnalyticsMonthlyMetric[]
  topCoaches: AnalyticsCoachMetric[]
  warnings: string[]
}
