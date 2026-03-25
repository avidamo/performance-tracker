import { createClient } from '@/lib/supabase/server'

// GET EMPLOYEE
export async function getEmployee(id: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  return data
}

// GET DASHBOARD EMPLOYEES
export async function getDashboardEmployees() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error loading dashboard employees:', error)
    return []
  }

  return data ?? []
}

// GET GOALS + TASKS
export async function getGoals(employeeId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('goals')
    .select(`
      *,
      goal_tasks (*)
    `)
    .eq('employee_id', employeeId)

  return data || []
}

// TOGGLE TASK
export async function toggleTask(taskId: string, complete: boolean) {
  const supabase = await createClient()

  return supabase
    .from('goal_tasks')
    .update({ completed: complete })
    .eq('id', taskId)
}

// ADD TASK
export async function addTask(goalId: string, title: string) {
  const supabase = await createClient()

  return supabase.from('goal_tasks').insert({
    goal_id: goalId,
    title,
    completed: false
  })
}

// ADD GOAL
export async function addGoal(employeeId: string, title: string) {
  const supabase = await createClient()

  return supabase.from('goals').insert({
    employee_id: employeeId,
    title,
    status: 'active'
  })
}

// ADD NOTE
export async function addNote(employeeId: string, note: string) {
  const supabase = await createClient()

  return supabase.from('manager_notes').insert({
    employee_id: employeeId,
    note
  })
}

// ADD ACHIEVEMENT
export async function addAchievement(employeeId: string, note: string) {
  const supabase = await createClient()

  return supabase.from('achievements').insert({
    employee_id: employeeId,
    note
  })
}

// GET CURRENT APP USER
export async function getCurrentAppUser() {
  const supabase = await createClient()

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', 'mo@avida.life')
    .single()

  if (error) {
    console.error('Error loading local dev user:', error)
    return null
  }

  return employee
}
export async function getEmployeeBundle(employeeId: string) {
  const supabase = await createClient()

  const [{ data: employee }, { data: goals }, { data: achievements }, { data: notes }, { data: summaries }] =
    await Promise.all([
      supabase.from('employees').select('*').eq('id', employeeId).single(),
      supabase
        .from('goals')
        .select(`
          *,
          goal_tasks (*)
        `)
        .eq('employee_id', employeeId),
      supabase
        .from('achievements')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false }),
      supabase
        .from('manager_notes')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false }),
      supabase
        .from('monthly_summaries')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false }),
    ])

  return {
    employee: employee ?? null,
    goals: goals ?? [],
    achievements: achievements ?? [],
    notes: notes ?? [],
    summaries: summaries ?? [],
  }
}