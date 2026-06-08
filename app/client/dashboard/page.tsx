'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ClientDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [latestCheckin, setLatestCheckin] = useState<any>(null)
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: p }, { data: ci }, { data: logs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('checkins').select('*').eq('client_id', user!.id).order('submitted_at', { ascending: false }).limit(1).single(),
        supabase.from('calendar_workout_logs').select('*').eq('client_id', user!.id).order('logged_at', { ascending: false }).limit(5),
      ])
      setProfile(p); setLatestCheckin(ci); setRecentLogs(logs ?? [])
    }
    load()
  }, [])

  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">{greeting}, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="stat-card">
          <span className="stat-label">Workouts logged</span>
          <span className="stat-value">{recentLogs.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Last check-in</span>
          <span className="stat-value text-base">{latestCheckin ? new Date(latestCheckin.submitted_at).toLocaleDateString() : 'None yet'}</span>
        </div>
      </div>

      <div className="card mb-6">
          <h2 className="section-title mb-4">Quick actions</h2>
          <div className="space-y-2">
            <Link href="/client/calendar" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
              <span className="text-xl">🏋️</span>
              <div>
                <p className="text-sm font-medium text-slate-800">My training</p>
                <p className="text-xs text-slate-400">View and log today's workout</p>
              </div>
            </Link>
            <Link href="/client/checkins" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-medium text-slate-800">Weekly check-in</p>
                <p className="text-xs text-slate-400">Update your coach</p>
              </div>
            </Link>
            <Link href="/client/stats" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
              <span className="text-xl">📊</span>
              <div>
                <p className="text-sm font-medium text-slate-800">Log body stats</p>
                <p className="text-xs text-slate-400">Track your progress</p>
              </div>
            </Link>
          </div>
        </div>

      {latestCheckin?.coach_feedback && (
        <div className="card bg-sky-50 border-sky-100">
          <p className="text-xs font-medium text-sky-600 uppercase tracking-wide mb-1">Coach feedback</p>
          <p className="text-slate-700 text-sm">{latestCheckin.coach_feedback}</p>
        </div>
      )}
    </div>
  )
}
