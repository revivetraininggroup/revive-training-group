'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const TRAINING_EXPERIENCE = ['Beginner (0-1 years)', 'Intermediate (1-3 years)', 'Advanced (3+ years)']
const EQUIPMENT_ACCESS = ['Home gym only', 'Commercial gym', 'Both home & gym', 'Minimal / bodyweight only']
const SESSION_DURATION = ['30 minutes', '45 minutes', '60 minutes', '90+ minutes']
const BEST_TIME = ['Early morning (5-8am)', 'Morning (8-11am)', 'Midday (11am-1pm)', 'Afternoon (1-5pm)', 'Evening (5-8pm)', 'Night (8pm+)']
const JOB_TYPE = ['Sedentary (desk job)', 'Lightly active', 'Active / on feet all day', 'Physical labor']
const STRESS_LEVEL = ['Low', 'Moderate', 'High', 'Very high']
const MEALS_PER_DAY = ['2', '3', '4', '5', '6+']
const DAYS_PER_WEEK = [2, 3, 4, 5, 6, 7]

export default function ClientOnboardingPage() {
  const [form, setForm] = useState({
    injuries: '',
    physical_limitations: '',
    training_experience: '',
    years_training: '',
    equipment_access: '',
    equipment_details: '',
    days_per_week: '',
    preferred_days: '',
    session_duration: '',
    best_time_to_train: '',
    job_type: '',
    avg_sleep_hours: '',
    stress_level: '',
    water_intake: '',
    current_supplements: '',
    dietary_restrictions: '',
    meals_per_day: '',
    nutrition_experience: '',
    additional_notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasExisting, setHasExisting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('client_onboarding').select('*').eq('client_id', user.id).single()
      if (data) {
        setHasExisting(true)
        setForm({
          injuries: data.injuries ?? '',
          physical_limitations: data.physical_limitations ?? '',
          training_experience: data.training_experience ?? '',
          years_training: data.years_training ?? '',
          equipment_access: data.equipment_access ?? '',
          equipment_details: data.equipment_details ?? '',
          days_per_week: data.days_per_week?.toString() ?? '',
          preferred_days: data.preferred_days ?? '',
          session_duration: data.session_duration ?? '',
          best_time_to_train: data.best_time_to_train ?? '',
          job_type: data.job_type ?? '',
          avg_sleep_hours: data.avg_sleep_hours ?? '',
          stress_level: data.stress_level ?? '',
          water_intake: data.water_intake ?? '',
          current_supplements: data.current_supplements ?? '',
          dietary_restrictions: data.dietary_restrictions ?? '',
          meals_per_day: data.meals_per_day ?? '',
          nutrition_experience: data.nutrition_experience ?? '',
          additional_notes: data.additional_notes ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { console.error('No user found'); setSaving(false); return }

    const payload = {
      client_id: user.id,
      ...form,
      days_per_week: form.days_per_week ? parseInt(form.days_per_week) : null,
      updated_at: new Date().toISOString(),
    }

    console.log('Saving onboarding for user:', user.id)
    console.log('Has existing:', hasExisting)

    if (hasExisting) {
      const { error } = await supabase.from('client_onboarding').update(payload).eq('client_id', user.id)
      if (error) console.error('Update error:', error)
      else console.log('Update success')
    } else {
      const { error } = await supabase.from('client_onboarding').insert(payload)
      if (error) console.error('Insert error:', error)
      else { console.log('Insert success'); setHasExisting(true) }
    }

    setSaving(false)
    setSaved(true)
  }

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">Onboarding Form</h1>
        <p className="text-slate-500 text-sm mt-1">
          Help your coach get to know you better. You can update this anytime.
        </p>
      </div>

      <div className="space-y-6">

        {/* Injuries & Limitations */}
        <div className="card">
          <h2 className="section-title mb-4">🩹 Injuries & Limitations</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Current or past injuries</label>
              <textarea
                className="input"
                rows={2}
                placeholder="e.g. Left knee surgery 2022, lower back issues..."
                value={form.injuries}
                onChange={e => set('injuries', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Physical limitations or things to avoid</label>
              <textarea
                className="input"
                rows={2}
                placeholder="e.g. No overhead pressing, avoid high impact..."
                value={form.physical_limitations}
                onChange={e => set('physical_limitations', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Training Experience & Equipment */}
        <div className="card">
          <h2 className="section-title mb-4">🏋️ Training Experience & Equipment</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Training experience</label>
              <div className="flex flex-wrap gap-2">
                {TRAINING_EXPERIENCE.map(opt => (
                  <button
                    key={opt}
                    onClick={() => set('training_experience', opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.training_experience === opt ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Equipment access</label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_ACCESS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => set('equipment_access', opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.equipment_access === opt ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Equipment details (optional)</label>
              <input
                className="input"
                placeholder="e.g. Dumbbells up to 50lbs, pull-up bar, cables..."
                value={form.equipment_details}
                onChange={e => set('equipment_details', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Schedule & Availability */}
        <div className="card">
          <h2 className="section-title mb-4">📅 Schedule & Availability</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Days available to train per week</label>
              <div className="flex gap-2">
                {DAYS_PER_WEEK.map(d => (
                  <button
                    key={d}
                    onClick={() => set('days_per_week', d.toString())}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${form.days_per_week === d.toString() ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Preferred training days</label>
              <input
                className="input"
                placeholder="e.g. Mon, Wed, Fri, Sat"
                value={form.preferred_days}
                onChange={e => set('preferred_days', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Preferred session duration</label>
              <div className="flex flex-wrap gap-2">
                {SESSION_DURATION.map(opt => (
                  <button
                    key={opt}
                    onClick={() => set('session_duration', opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.session_duration === opt ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Best time to train</label>
              <div className="flex flex-wrap gap-2">
                {BEST_TIME.map(opt => (
                  <button
                    key={opt}
                    onClick={() => set('best_time_to_train', opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.best_time_to_train === opt ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="card">
          <h2 className="section-title mb-4">🌙 Lifestyle</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Job type / daily activity</label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPE.map(opt => (
                  <button
                    key={opt}
                    onClick={() => set('job_type', opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.job_type === opt ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Average sleep (hours/night)</label>
                <input
                  className="input"
                  placeholder="e.g. 7"
                  value={form.avg_sleep_hours}
                  onChange={e => set('avg_sleep_hours', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Daily water intake</label>
                <input
                  className="input"
                  placeholder="e.g. 1 gallon, 2 liters..."
                  value={form.water_intake}
                  onChange={e => set('water_intake', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Current stress level</label>
              <div className="flex gap-2">
                {STRESS_LEVEL.map(opt => (
                  <button
                    key={opt}
                    onClick={() => set('stress_level', opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.stress_level === opt ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition & Supplements */}
        <div className="card">
          <h2 className="section-title mb-4">🥗 Nutrition & Supplements</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Meals per day</label>
              <div className="flex gap-2">
                {MEALS_PER_DAY.map(opt => (
                  <button
                    key={opt}
                    onClick={() => set('meals_per_day', opt)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${form.meals_per_day === opt ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Dietary restrictions or preferences</label>
              <input
                className="input"
                placeholder="e.g. No dairy, vegetarian, gluten-free..."
                value={form.dietary_restrictions}
                onChange={e => set('dietary_restrictions', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Current supplements</label>
              <textarea
                className="input"
                rows={2}
                placeholder="e.g. Protein powder, creatine, pre-workout, vitamins..."
                value={form.current_supplements}
                onChange={e => set('current_supplements', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Nutrition tracking experience</label>
              <input
                className="input"
                placeholder="e.g. I track macros with MyFitnessPal, or no experience..."
                value={form.nutrition_experience}
                onChange={e => set('nutrition_experience', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Anything else */}
        <div className="card">
          <h2 className="section-title mb-4">💬 Anything else your coach should know?</h2>
          <textarea
            className="input"
            rows={4}
            placeholder="Share anything else that would help your coach understand you better -- goals, motivation, past experiences, concerns..."
            value={form.additional_notes}
            onChange={e => set('additional_notes', e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 pb-8">
          <button onClick={save} disabled={saving} className="btn-primary px-8">
            {saving ? 'Saving...' : hasExisting ? 'Update form' : 'Submit form'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>}
        </div>

      </div>
    </div>
  )
}
