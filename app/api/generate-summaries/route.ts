import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAppUser } from '@/lib/data'

const payloadSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  employeeIds: z.array(z.string().uuid()).optional(),
})

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
  let query = supabase.from('employees').select('id').eq('status', 'active').order('name')

  if (payload.data.employeeIds?.length) {
    query = supabase.from('employees').select('id').in('id', payload.data.employeeIds).order('name')
  }

  const { data: employees, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const results: Array<{ employeeId: string; ok: boolean; error?: string }> = []

  for (const employee of employees ?? []) {
    try {
      const cookie = request.headers.get('cookie') ?? ''
      const response = await fetch(`${baseUrl}/api/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie,
        },
        body: JSON.stringify({ employeeId: employee.id, monthKey: payload.data.monthKey }),
        cache: 'no-store',
      })

      const result = await response.json()
      results.push({ employeeId: employee.id, ok: response.ok, error: response.ok ? undefined : result.error })
    } catch (err) {
      results.push({ employeeId: employee.id, ok: false, error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return NextResponse.json({
    ok: results.every((r) => r.ok),
    total: results.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  })
}
