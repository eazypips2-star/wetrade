import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const TRADE_DIRECTIONS = ['Long', 'Short', 'Either']
const todayKey = new Date().toISOString().slice(0, 10)

const EMPTY_TICKER = {
  ticker: '', company: '', direction: 'Long',
  why_in_play: '', entry_criteria: '', how_to_trade: '',
  stop_loss: '', target: '', risk_reward: '',
  is_shared: false
}

export default function Watchlist() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_TICKER)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    setLoading(true)
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayKey)
      .order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }

  async function saveItem() {
    if (!form.ticker) return
    setSaving(true)
    const payload = { ...form, user_id: user.id, date: todayKey, ticker: form.ticker.toUpperCase() }
    const { error } = await supabase.from('watchlist').insert(payload)
    if (!error) { setForm(EMPTY_TICKER); setAdding(false); loadItems() }
    setSaving(false)
  }

  async function deleteItem(id) {
    await supabase.from('watchlist').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function toggleShare(item) {
    const { error } = await supabase
      .from('watchlist').update({ is_shared: !item.is_shared }).eq('id', item.id)
    if (!error) setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_shared: !i.is_shared } : i))
  }

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
            My Watchlist
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })} · {items.length} ticker{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M10 4v12M4 10h12"/>
          </svg>
          Add Ticker
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(0,229,160,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15 }}>Add new ticker</h3>
            <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setAdding(false)}>Cancel</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 140px', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label">Ticker</label>
              <input className="input" placeholder="NVDA" value={form.ticker}
                onChange={e => upd('ticker', e.target.value.toUpperCase())} style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }} />
            </div>
            <div>
              <label className="label">Company name</label>
              <input className="input" placeholder="NVIDIA Corporation" value={form.company}
                onChange={e => upd('company', e.target.value)} />
            </div>
            <div>
              <label className="label">Direction</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {TRADE_DIRECTIONS.map(d => (
                  <button key={d} onClick={() => upd('direction', d)}
                    style={{
                      flex: 1, padding: '9px 4px', border: '1px solid var(--border2)',
                      borderRadius: 6, background: form.direction === d
                        ? d === 'Long' ? 'var(--accent-dim)' : d === 'Short' ? 'var(--red-dim)' : 'var(--blue-dim)'
                        : 'transparent',
                      color: form.direction === d
                        ? d === 'Long' ? 'var(--accent)' : d === 'Short' ? 'var(--red)' : 'var(--blue)'
                        : 'var(--text2)',
                      fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 500
                    }}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label">Why is it in play? (catalyst)</label>
              <textarea className="input" rows={3}
                placeholder="Earnings beat, gap up, news catalyst, unusual volume..."
                value={form.why_in_play} onChange={e => upd('why_in_play', e.target.value)} />
            </div>
            <div>
              <label className="label">Entry criteria — what do I need to see?</label>
              <textarea className="input" rows={3}
                placeholder="Break and hold above VWAP, flush and reclaim, halt resume..."
                value={form.entry_criteria} onChange={e => upd('entry_criteria', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">How will I trade it?</label>
            <textarea className="input" rows={3}
              placeholder="Strategy, sizing, scaling plan, what would invalidate the trade..."
              value={form.how_to_trade} onChange={e => upd('how_to_trade', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="label">Stop loss level</label>
              <input className="input" placeholder="$148.50 or below VWAP"
                value={form.stop_loss} onChange={e => upd('stop_loss', e.target.value)} />
            </div>
            <div>
              <label className="label">Target / profit zone</label>
              <input className="input" placeholder="$155 / HOD"
                value={form.target} onChange={e => upd('target', e.target.value)} />
            </div>
            <div>
              <label className="label">Risk / Reward</label>
              <input className="input" placeholder="1:3" value={form.risk_reward}
                onChange={e => upd('risk_reward', e.target.value)} style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2)' }}>
              <input type="checkbox" checked={form.is_shared} onChange={e => upd('is_shared', e.target.checked)} />
              Share with team
            </label>
            <button className="btn btn-primary" onClick={saveItem} disabled={saving || !form.ticker}>
              {saving ? <span className="spinner" /> : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', gap: 10, color: 'var(--text2)', alignItems: 'center', padding: 20 }}>
          <div className="spinner" /> Loading watchlist...
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text2)' }}>
          <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="var(--text3)" strokeWidth="1" style={{ marginBottom: 12 }}>
            <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/>
          </svg>
          <p style={{ marginBottom: 8 }}>No tickers on your watchlist yet</p>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>Add your first ticker</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, i) => (
            <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', animation: `fadeUp 0.3s ${i * 0.05}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 16, color: 'var(--text)', minWidth: 60 }}>{item.ticker}</span>
                <span className={`badge ${item.direction === 'Long' ? 'badge-green' : item.direction === 'Short' ? 'badge-red' : 'badge-blue'}`}>
                  {item.direction}
                </span>
                <span style={{ color: 'var(--text2)', fontSize: 13, flex: 1 }}>{item.company}</span>
                {item.risk_reward && <span className="mono small muted">R:R {item.risk_reward}</span>}
                {item.is_shared && <span className="badge badge-amber">Shared</span>}
                <button onClick={e => { e.stopPropagation(); toggleShare(item) }}
                  className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}>
                  {item.is_shared ? 'Unshare' : 'Share'}
                </button>
                <button onClick={e => { e.stopPropagation(); deleteItem(item.id) }}
                  className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 11 }}>
                  Remove
                </button>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="var(--text3)" strokeWidth="1.5"
                  style={{ transform: expanded === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M5 8l5 5 5-5"/>
                </svg>
              </div>
              {expanded === item.id && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <div className="label">Why in play</div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{item.why_in_play || '—'}</p>
                    </div>
                    <div>
                      <div className="label">Entry criteria</div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{item.entry_criteria || '—'}</p>
                    </div>
                    <div>
                      <div className="label">How to trade it</div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{item.how_to_trade || '—'}</p>
                    </div>
                  </div>
                  {(item.stop_loss || item.target) && (
                    <div style={{ display: 'flex', gap: 20, marginTop: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                      {item.stop_loss && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Stop: <span style={{ color: 'var(--red)' }}>{item.stop_loss}</span></span>}
                      {item.target && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Target: <span style={{ color: 'var(--accent)' }}>{item.target}</span></span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
