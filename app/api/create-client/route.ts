import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const COACH_EMAIL = process.env.COACH_EMAIL || 'raikeschristopher@gmail.com'

export async function POST(req: Request) {
  const { email, full_name, password, goal, notes } = await req.json()

  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.email !== COACH_EMAIL) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Step 1: Create auth user
  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'client' }
  })

  if (createError) return NextResponse.json({ error: createError.message }, { status: 400 })

  const newUserId = newUser.user.id

  // Step 2: Create profile directly (don't rely on trigger)
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .upsert({
      id: newUserId,
      email,
      full_name,
      role: 'client',
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('Profile error:', profileError)
    return NextResponse.json({ error: 'Failed to create profile: ' + profileError.message }, { status: 400 })
  }

  // Step 3: Create client record
  const { error: clientError } = await adminSupabase
    .from('clients')
    .insert({
      id: newUserId,
      coach_id: user.id,
      goal: goal || null,
      notes: notes || null,
    })

  if (clientError) {
    console.error('Client error:', clientError)
    return NextResponse.json({ error: 'Failed to create client: ' + clientError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
