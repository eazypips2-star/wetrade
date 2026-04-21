import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else {
      if (!name.trim()) { setError('Please enter your full name.'); setLoading(false); return }
      const { error } = await signUp(email, password, name)
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.4
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(0,229,160,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="fade-up" style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12
          }}>
            <div style={{
              width: 36, height: 36, background: 'var(--accent)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <polyline points="2,14 6,8 10,11 14,5 18,7" stroke="#080c10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,5 18,5 18,9" stroke="#080c10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              WeTrade
            </span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Pre-Market Prep Platform</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg3)', borderRadius: 8,
            padding: 3, marginBottom: 28, gap: 3
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: 6,
                  fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13,
                  letterSpacing: '0.03em', cursor: 'pointer', transition: 'all 0.15s',
                  background: mode === m ? 'var(--bg2)' : 'transparent',
                  color: mode === m ? 'var(--text)' : 'var(--text2)',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none'
                }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label className="label">Full name</label>
                <input className="input" type="text" placeholder="Alex Johnson"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="trader@wetrade.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-dim)', border: '1px solid rgba(255,77,106,0.2)',
                borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)',
                borderRadius: 8, padding: '10px 14px', color: 'var(--accent)', fontSize: 13
              }}>
                {success}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ marginTop: 4, padding: '13px', width: '100%', fontSize: 14 }}>
              {loading ? <span className="spinner" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 20 }}>
          WeTrade — Professional trading tools for serious traders
        </p>
      </div>
    </div>
  )
}
