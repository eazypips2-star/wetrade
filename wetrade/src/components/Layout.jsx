import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/',          label: 'Market Overview',  icon: MarketIcon },
  { to: '/plan',      label: 'Daily Plan',        icon: PlanIcon },
  { to: '/watchlist', label: 'Watchlist',         icon: WatchIcon },
  { to: '/strategy',  label: 'Strategy Sheet',    icon: StrategyIcon },
  { to: '/team',      label: 'Team Feed',         icon: TeamIcon },
  { to: '/profile',   label: 'My Profile',        icon: ProfileIcon },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, minWidth: 220, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, background: 'var(--accent)', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <polyline points="2,14 6,8 10,11 14,5 18,7" stroke="#080c10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
              WeTrade
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                textDecoration: 'none', fontSize: 13,
                fontFamily: 'var(--font-body)', fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.15s'
              })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 10px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent-dim)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', flexShrink: 0
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Trader</div>
            </div>
          </div>
          <button onClick={signOut} className="btn btn-ghost"
            style={{ width: '100%', fontSize: 12, padding: '7px 12px', justifyContent: 'flex-start', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 4H17V16H13M8 13L4 10L8 7M4 10H13"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}

function MarketIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="2,14 6,9 10,11 14,5 18,8"/><polyline points="14,5 18,5 18,9"/>
  </svg>
}
function PlanIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/>
  </svg>
}
function WatchIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/>
  </svg>
}
function StrategyIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 5h14M3 10h9M3 15h6"/><path d="M16 12l2 2-2 2"/>
  </svg>
}
function TeamIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7" cy="7" r="3"/><circle cx="14" cy="7" r="2.5"/><path d="M1 17c0-3 2.5-5 6-5s6 2 6 5M14 12c2 0 4 1.5 4 4"/>
  </svg>
}
function ProfileIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.5 3-6 7-6s7 2.5 7 6"/>
  </svg>
}
