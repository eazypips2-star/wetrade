import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const todayKey = new Date().toISOString().slice(0, 10)

export default function TeamFeed() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [watchlists, setWatchlists] = useState([])
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('plans')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [p, w, s] = await Promise.all([
      supabase.from('daily_plans').select('*').eq('date', todayKey).eq('is_shared', true).neq('user_id', user.id),
      supabase.from('watchlist').select('*').eq('date', todayKey).eq('is_shared', true).neq('user_id', user.id),
      supabase.from('strategies').select('*').eq('is_shared', true).neq('user_id', user.id),
    ])
    if (p.data) setPlans(p.data)
    if (w.data) setWatchlists(w.data)
    if (s.data) setStrategies(s.data)
    setLoading(false)
  }

  const BIAS_COLOR = {
    'Strong Bullish': 'accent', Bullish: 'accent', Neutral: 'blue',
    Bearish: 'red', 'Strong Bearish': 'red', 'No Trade Day': 'amber'
  }

  return (
    <div style={{ padding: 28, maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Team Feed
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          What your teammates chose to share today · read-only
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        display: 'flex', gap: 10, alignItems: 'flex-start'
      }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--blue)" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 7h.01"/>
        </svg>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
          Only content that teammates explicitly chose to share appears here. Their private plans, watchlists, and strategies remain private unless they toggle sharing on.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {[
          { k: 'plans', label: `Daily Plans (${plans.length})` },
          { k: 'watchlist', label: `Watchlists (${watchlists.length})` },
          { k: 'strategies', label: `Strategies (${strategies.length})` },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{
              padding: '10px 18px', border: 'none', background: 'transparent',
              cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-head)', fontWeight: 600,
              color: tab === t.k ? 'var(--accent)' : 'var(--text2)',
              borderBottom: tab === t.k ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, letterSpacing: '0.03em'
            }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 10, color: 'var(--text2)', alignItems: 'center' }}>
          <div className="spinner" /> Loading team feed...
        </div>
      ) : (
        <>
          {tab === 'plans' && (
            plans.length === 0 ? (
              <Empty msg="No teammates have shared a daily plan today yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plans.map((p, i) => (
                  <div key={p.id} className="card" style={{ animation: `fadeUp 0.3s ${i * 0.06}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TraderBadge id={p.user_id} />
                        {p.bias && (
                          <span className={`badge badge-${BIAS_COLOR[p.bias] || 'gray'}`}>{p.bias}</span>
                        )}
                      </div>
                      <span className="mono small muted">{todayKey}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {p.goals && <Field label="Goals" value={p.goals} />}
                      {p.rules && <Field label="Rules" value={p.rules} />}
                    </div>
                    {(p.max_loss || p.target) && (
                      <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        {p.max_loss && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Max loss: <span style={{ color: 'var(--red)' }}>${p.max_loss}</span></span>}
                        {p.target && <span style={{ fontSize: 12, color: 'var(--text3)' }}>Target: <span style={{ color: 'var(--accent)' }}>${p.target}</span></span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'watchlist' && (
            watchlists.length === 0 ? (
              <Empty msg="No teammates have shared watchlist items today yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {watchlists.map((w, i) => (
                  <div key={w.id} className="card" style={{ animation: `fadeUp 0.3s ${i * 0.05}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <TraderBadge id={w.user_id} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15 }}>{w.ticker}</span>
                      <span className={`badge ${w.direction === 'Long' ? 'badge-green' : w.direction === 'Short' ? 'badge-red' : 'badge-blue'}`}>{w.direction}</span>
                      {w.company && <span style={{ color: 'var(--text2)', fontSize: 12 }}>{w.company}</span>}
                      {w.risk_reward && <span className="mono small muted" style={{ marginLeft: 'auto' }}>R:R {w.risk_reward}</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      {w.why_in_play && <Field label="Why in play" value={w.why_in_play} />}
                      {w.entry_criteria && <Field label="Entry criteria" value={w.entry_criteria} />}
                      {w.how_to_trade && <Field label="How to trade" value={w.how_to_trade} />}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'strategies' && (
            strategies.length === 0 ? (
              <Empty msg="No teammates have shared strategies yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {strategies.map((s, i) => (
                  <div key={s.id} className="card" style={{ animation: `fadeUp 0.3s ${i * 0.06}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <TraderBadge id={s.user_id} />
                      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{s.name}</h3>
                      {s.timeframe && <span className="badge badge-blue mono">{s.timeframe}</span>}
                    </div>
                    {s.setup_description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>{s.setup_description}</p>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {s.what_i_need_to_see && <Field label="Pre-conditions" value={s.what_i_need_to_see} accent="amber" />}
                      {s.trigger && <Field label="Trigger" value={s.trigger} accent="accent" />}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

function Field({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: accent ? `var(--${accent})` : 'var(--text3)', marginBottom: 4 }}>{label}</div>
      <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{value}</p>
    </div>
  )
}

function TraderBadge({ id }) {
  const short = id?.slice(0, 4).toUpperCase()
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: 'var(--accent-dim)', border: '1px solid var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', flexShrink: 0
    }}>{short}</div>
  )
}

function Empty({ msg }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
      <p>{msg}</p>
    </div>
  )
}
