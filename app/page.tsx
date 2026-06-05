import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const COACH_EMAIL = process.env.COACH_EMAIL || 'raikeschristopher@gmail.com'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  if (user.email === COACH_EMAIL) redirect('/coach')
  redirect('/client/dashboard')
}
