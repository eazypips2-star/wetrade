import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const todayKey = new Date().toISOString().slice(0, 10)

const BIAS_OPTIONS = ['Strong Bullish', 'Bullish', 'Neutral', 'Bearish', 'Strong Bearish', 'No Trade Day']
const BIAS_COLORS  = { 'Strong Bullish': 'accent', Bullish: 'accent', Neutral: 'blue', Bearish: 'red', 'Strong Bearish': 'red', 'No Trade Day': 'amber' }

export default function DailyPlan() {
  const { user } = useAuth()
  const [plan, setPlan] = useState({
    date: todayKey,
    bias: '',
    goals: '',
    rules: '',
    max_loss: '',
    target: '',
    notes: '',
    is_shared: false
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlan()
  }, [])

  async function loadPlan() {
    setLoading(true)
    const { data } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayKey)
      .single()
    if (data) setPlan(data)
    setLoading(false)
  }

  async function savePlan() {
    setSaving(true)
    const payload = { ...plan, user_id: user.id, date: todayKey }
    const { error } = await supabase
      .from('daily_plans')
      .upsert(payload, { onConflict: 'user_id,date' })
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const update = (field, val) => setPlan(p => ({ ...p, [field]: val }))
  const name = user?.user_metadata?.full_name || 'Trader'

  return (
    <div style={{ padding: 28, maxWidth: 820 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Daily Plan
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>
            {name} · {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>✓ Saved</span>
          )}
          <button className="btn btn-primary" onClick={savePlan} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Plan'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 10, color: 'var(--text2)', alignItems: 'center' }}>
          <div className="spinner" /> Loading your plan...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Market bias */}
          <div className="card">
            <label className="label">Market bias for today</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {BIAS_OPTIONS.map(b => {
                const c = BIAS_COLORS[b]
                const active = plan.bias === b
                return (
                  <button key={b} onClick={() => update('bias', b)}
                    style={{
                      padding: '7px 14px', border: `1px solid ${active ? `var(--${c})` : 'var(--border2)'}`,
                      borderRadius: 20, background: active ? `var(--${c}-dim)` : 'transparent',
                      color: active ? `var(--${c})` : 'var(--text2)',
                      fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer',
                      transition: 'all 0.15s', fontWeight: active ? 500 : 400
                    }}>
                    {b}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Goals + Risk */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <label className="label">Goals for today</label>
              <textarea className="input" rows={4}
                placeholder="e.g. Focus on A+ setups only, be patient, no revenge trading..."
                value={plan.goals} onChange={e => update('goals', e.target.value)} />
            </div>
            <div className="card">
              <label className="label">Rules I will follow</label>
              <textarea className="input" rows={4}
                placeholder="e.g. Only trade first 2 hours, cut losers at -$200, no averaging down..."
                value={plan.rules} onChange={e => update('rules', e.target.value)} />
            </div>
          </div>

          {/* Risk params */}
          <div className="card">
            <label className="label" style={{ marginBottom: 14 }}>Risk parameters</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">Max loss limit ($)</label>
                <input className="input" type="number" placeholder="500"
                  value={plan.max_loss} onChange={e => update('max_loss', e.target.value)} />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Stop trading if you hit this</p>
              </div>
              <div>
                <label className="label">Profit target ($)</label>
                <input className="input" type="number" placeholder="1000"
                  value={plan.target} onChange={e => update('target', e.target.value)} />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Consider stopping when you hit this</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <label className="label">Additional notes & observations</label>
            <textarea className="input" rows={4}
              placeholder="Market context, key levels to watch, any special conditions today..."
              value={plan.notes} onChange={e => update('notes', e.target.value)} />
          </div>

          {/* Share toggle */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>Share with team</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Let other WeTrade members see your plan for today</div>
            </div>
            <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
              <input type="checkbox" checked={plan.is_shared} onChange={e => update('is_shared', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }} />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 12,
                background: plan.is_shared ? 'var(--accent)' : 'var(--bg4)',
                transition: 'background 0.2s'
              }} />
              <div style={{
                position: 'absolute', top: 3, left: plan.is_shared ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s'
              }} />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
