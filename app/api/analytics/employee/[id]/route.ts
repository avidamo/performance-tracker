import { NextResponse } from 'next/server'
import { getCurrentAppUser, getEmployeeBundle } from '@/lib/data'
import { getEmployeeAnalytics } from '@/lib/analytics'

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const appUser = await getCurrentAppUser()
  if (appUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const bundle = await getEmployeeBundle(id)
  const analytics = await getEmployeeAnalytics(bundle.employee)

  return NextResponse.json({ analytics })
}
