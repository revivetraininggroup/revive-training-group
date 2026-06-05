import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const COACH_EMAIL = process.env.COACH_EMAIL || 'raikeschristopher@gmail.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  const { email, full_name, password, goal, notes } = await req.json()

  // Verify coach
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.email !== COACH_EMAIL) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Step 1: Create auth user via Supabase Admin REST API
  const createUserRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'client' }
    })
  })

  const newUser = await createUserRes.json()
  if (!createUserRes.ok) return NextResponse.json({ error: newUser.message || 'Failed to create user' }, { status: 400 })

  const newUserId = newUser.id

  // Step 2: Wait for trigger to create profile
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Step 3: Create client record via REST API
  const clientRes = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      id: newUserId,
      coach_id: user.id,
      goal: goal || null,
      notes: notes || null,
    })
  })

  if (!clientRes.ok) {
    const err = await clientRes.text()
    return NextResponse.json({ error: 'Failed to create client: ' + err }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
