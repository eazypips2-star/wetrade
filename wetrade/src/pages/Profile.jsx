import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, signOut } = useAuth()
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const email = user?.email
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

  async function saveName() {
    setSaving(true)
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 28 }}>
        My Profile
      </h1>

      {/* Avatar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--accent-dim)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 24, color: 'var(--accent)'
        }}>{initials}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{name || 'Trader'}</div>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>{email}</div>
          <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>Member since {joined}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <label className="label">Display name</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <button className="btn btn-primary" onClick={saveName} disabled={saving} style={{ whiteSpace: 'nowrap' }}>
            {saving ? <span className="spinner" /> : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 500, marginBottom: 4 }}>Account email</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text2)', background: 'var(--bg3)', padding: '10px 14px', borderRadius: 8 }}>{email}</div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Email cannot be changed here — contact your firm admin.</p>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-danger" onClick={signOut} style={{ padding: '10px 20px' }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 4H17V16H13M8 13L4 10L8 7M4 10H13"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}
