import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const EMPTY = {
  name: '', timeframe: '', setup_description: '',
  what_i_need_to_see: '', trigger: '', invalidation: '',
  sizing: '', notes: '', is_shared: false
}

const TIMEFRAMES = ['1min', '2min', '5min', '15min', '1hr', 'Daily']

export default function StrategySheet() {
  const { user } = useAuth()
  const [strategies, setStrategies] = useState([])
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setStrategies(data)
    setLoading(false)
  }

  async function save() {
    if (!form.name) return
    setSaving(true)
    if (editing) {
      await supabase.from('strategies').update(form).eq('id', editing)
    } else {
      await supabase.from('strategies').insert({ ...form, user_id: user.id })
    }
    setSaving(false)
    setAdding(false)
    setEditing(null)
    setForm(EMPTY)
    load()
  }

  async function del(id) {
    await supabase.from('strategies').delete().eq('id', id)
    setStrategies(prev => prev.filter(s => s.id !== id))
  }

  function edit(s) {
    setForm(s)
    setEditing(s.id)
    setAdding(true)
  }

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Strategy Sheet
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Define your strategies and exactly what you need before pulling the trigger</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY) }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10 4v12M4 10h12"/>
          </svg>
          New Strategy
        </button>
      </div>

      {/* Form */}
      {adding && (
        <div className="card" style={{ marginBottom: 24, border: '1px solid rgba(0,229,160,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15 }}>
              {editing ? 'Edit strategy' : 'New strategy'}
            </h3>
            <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}
              onClick={() => { setAdding(false); setEditing(null); setForm(EMPTY) }}>Cancel</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label">Strategy name</label>
              <input className="input" placeholder="e.g. VWAP Reclaim, Halt & Resume, Opening Range Breakout"
                value={form.name} onChange={e => upd('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Timeframe</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {TIMEFRAMES.map(tf => (
                  <button key={tf} onClick={() => upd('timeframe', tf)}
                    style={{
                      padding: '6px 10px', border: '1px solid var(--border2)',
                      borderRadius: 6, fontSize: 12, cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      background: form.timeframe === tf ? 'var(--accent-dim)' : 'transparent',
                      color: form.timeframe === tf ? 'var(--accent)' : 'var(--text2)'
                    }}>{tf}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">Setup description</label>
            <textarea className="input" rows={2}
              placeholder="Briefly describe what this strategy is about..."
              value={form.setup_description} onChange={e => upd('setup_description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label" style={{ color: 'var(--amber)' }}>What I need to see (pre-conditions)</label>
              <textarea className="input" rows={4}
                placeholder="e.g. Stock must have news catalyst, float under 50M, relative volume 3x+, gap up at least 10%..."
                value={form.what_i_need_to_see} onChange={e => upd('what_i_need_to_see', e.target.value)} />
            </div>
            <div>
              <label className="label" style={{ color: 'var(--accent)' }}>The trigger — exactly when I pull</label>
              <textarea className="input" rows={4}
                placeholder="e.g. First 1-min candle closes above VWAP on heavy volume, I enter the break of that candle..."
                value={form.trigger} onChange={e => upd('trigger', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label" style={{ color: 'var(--red)' }}>Invalidation — when I'm wrong</label>
              <textarea className="input" rows={3}
                placeholder="e.g. Price closes back below VWAP, or loses the key level..."
                value={form.invalidation} onChange={e => upd('invalidation', e.target.value)} />
            </div>
            <div>
              <label className="label">Position sizing rules</label>
              <textarea className="input" rows={3}
                placeholder="e.g. Start with 50% size, add on confirmation, max 3 adds..."
                value={form.sizing} onChange={e => upd('sizing', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Additional notes</label>
            <textarea className="input" rows={2}
              placeholder="Historical edge, best market conditions for this setup, common mistakes..."
              value={form.notes} onChange={e => upd('notes', e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.is_shared} onChange={e => upd('is_shared', e.target.checked)} />
              Share with team
            </label>
            <button className="btn btn-primary" onClick={save} disabled={saving || !form.name}>
              {saving ? <span className="spinner" /> : editing ? 'Update Strategy' : 'Save Strategy'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', gap: 10, color: 'var(--text2)', alignItems: 'center' }}>
          <div className="spinner" /> Loading strategies...
        </div>
      ) : strategies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text2)' }}>
          <p style={{ marginBottom: 8 }}>No strategies yet. Define your first setup.</p>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>Create Strategy</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {strategies.map((s, i) => (
            <div key={s.id} className="card" style={{ animation: `fadeUp 0.3s ${i * 0.06}s both` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>{s.name}</h3>
                    {s.timeframe && <span className="badge badge-blue mono">{s.timeframe}</span>}
                    {s.is_shared && <span className="badge badge-amber">Shared</span>}
                  </div>
                  {s.setup_description && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{s.setup_description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => edit(s)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => del(s.id)}>Delete</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {s.what_i_need_to_see && (
                  <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid var(--amber)' }}>
                    <div style={{ fontSize: 10, color: 'var(--amber)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Pre-conditions</div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s.what_i_need_to_see}</p>
                  </div>
                )}
                {s.trigger && (
                  <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Trigger</div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s.trigger}</p>
                  </div>
                )}
                {s.invalidation && (
                  <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid var(--red)' }}>
                    <div style={{ fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Invalidation</div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s.invalidation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
