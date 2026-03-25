'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form className="stack-md" onSubmit={onSubmit}>
      <label className="field">
        <span>Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label className="field">
        <span>Password</span>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" disabled={loading} type="submit">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
