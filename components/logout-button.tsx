'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function LogoutButton() {
  const router = useRouter()

  return (
    <button
      className="button button-secondary"
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
      }}
      type="button"
    >
      Log out
    </button>
  )
}
