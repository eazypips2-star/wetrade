import { useState, useEffect } from 'react'

const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

// Free API: Finnhub for news, marketaux for news, manual economic calendar
// We use Yahoo Finance unofficial endpoint + Finviz data for stocks in play
// Since these are CORS-restricted, we show a professional UI with fetch logic ready

const MARKET_OPEN = '09:30'
const PRE_MARKET = '04:00'

function useMarketData() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Marketaux free news API — traders add their own key in .env
    const key = import.meta.env.VITE_MARKETAUX_KEY
    if (!key) { setLoading(false); return }

    fetch(`https://api.marketaux.com/v1/news/all?symbols=AAPL,TSLA,NVDA,SPY&filter_entities=true&language=en&api_token=${key}`)
      .then(r => r.json())
      .then(d => { if (d.data) setNews(d.data.slice(0, 8)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { news, loading }
}

// Economic calendar data (static for now, can be replaced with API)
const ECON_EVENTS = [
  { time: '08:30', event: 'Initial Jobless Claims', impact: 'medium', forecast: '215K', prev: '219K' },
  { time: '10:00', event: 'ISM Manufacturing PMI', impact: 'high', forecast: '48.5', prev: '47.8' },
  { time: '14:00', event: 'FOMC Meeting Minutes', impact: 'high', forecast: '—', prev: '—' },
  { time: '15:00', event: 'Natural Gas Inventories', impact: 'low', forecast: '-32B', prev: '-41B' },
]

// Demo stocks in play (in production this pulls from your screener)
const DEMO_STOCKS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', price: 892.34, change: 4.21, changeP: 4.95, vol: '48.2M', rvol: 3.2, float: '2.46B', catalyst: 'Earnings beat', gap: true },
  { ticker: 'TSLA', name: 'Tesla Inc', price: 178.50, change: -6.30, changeP: -3.41, vol: '32.1M', rvol: 2.1, float: '3.19B', catalyst: 'Delivery miss', gap: false },
  { ticker: 'CRWD', name: 'CrowdStrike', price: 342.10, change: 12.40, changeP: 3.76, vol: '8.9M', rvol: 4.7, float: '223M', catalyst: 'Analyst upgrade', gap: true },
  { ticker: 'GME',  name: 'GameStop Corp', price: 22.18, change: 3.18, changeP: 16.7, vol: '22.4M', rvol: 8.1, float: '305M', catalyst: 'Social momentum', gap: true },
  { ticker: 'AMZN', name: 'Amazon.com', price: 198.76, change: -2.14, changeP: -1.07, vol: '18.3M', rvol: 1.4, float: '10.5B', catalyst: 'News: AWS deal', gap: false },
]

export default function Dashboard() {
  const { news, loading: newsLoading } = useMarketData()
  const [tab, setTab] = useState('play')
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const isPreMarket = now.getHours() < 9 || (now.getHours() === 9 && now.getMinutes() < 30)

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Market Overview
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{today}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isPreMarket ? 'var(--amber)' : 'var(--accent)', animation: 'pulse 2s infinite' }} />
            <span className="mono" style={{ fontSize: 12, color: isPreMarket ? 'var(--amber)' : 'var(--accent)' }}>
              {isPreMarket ? 'PRE-MARKET' : 'MARKET OPEN'} {timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Top row: 3 index cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { name: 'S&P 500', val: '5,248.32', chg: '+0.62%', up: true },
          { name: 'NASDAQ', val: '18,432.15', chg: '+0.91%', up: true },
          { name: 'VIX', val: '14.23', chg: '-1.2%', up: false },
        ].map(idx => (
          <div key={idx.name} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{idx.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500 }}>{idx.val}</span>
              <span className={idx.up ? 'green mono small' : 'red mono small'}>{idx.chg}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stocks tabs */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
              {[
                { k: 'play', label: 'Stocks in Play' },
                { k: 'gap', label: 'Gap Scanner' },
              ].map(t => (
                <button key={t.k} onClick={() => setTab(t.k)}
                  style={{
                    padding: '14px 16px', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-head)', fontWeight: 600,
                    color: tab === t.k ? 'var(--accent)' : 'var(--text2)',
                    borderBottom: tab === t.k ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1, letterSpacing: '0.03em'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 90px 80px 70px 90px 110px',
              padding: '8px 20px', borderBottom: '1px solid var(--border)'
            }}>
              {['Ticker', 'Name', 'Price', 'Chg %', 'RVOL', 'Float', 'Catalyst'].map(h => (
                <span key={h} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {DEMO_STOCKS.filter(s => tab === 'play' || s.gap).map((s, i) => (
              <div key={s.ticker} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 90px 80px 70px 90px 110px',
                padding: '12px 20px', borderBottom: '1px solid var(--border)',
                alignItems: 'center', animation: `fadeUp 0.3s ${i * 0.05}s both`
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text)', fontSize: 13 }}>{s.ticker}</span>
                <span style={{ color: 'var(--text2)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                <span className="mono" style={{ fontSize: 13 }}>${s.price.toFixed(2)}</span>
                <span className={`mono small ${s.change >= 0 ? 'green' : 'red'}`}>
                  {s.change >= 0 ? '+' : ''}{s.changeP.toFixed(2)}%
                </span>
                <span className={`mono small badge ${s.rvol >= 3 ? 'badge-green' : s.rvol >= 2 ? 'badge-amber' : 'badge-gray'}`}>{s.rvol}x</span>
                <span className="mono small muted">{s.float}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.catalyst}</span>
              </div>
            ))}
            <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--text3)' }}>
              ⚡ Connect a screener API (Finviz, Trade Ideas) to populate live data — see setup guide
            </div>
          </div>

          {/* News */}
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: '0.03em' }}>
              Market News & Catalysts
            </h2>
            {newsLoading ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text2)', fontSize: 13 }}>
                <div className="spinner" /> Loading news...
              </div>
            ) : news.length > 0 ? news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noreferrer"
                style={{
                  display: 'block', padding: '12px 0', borderBottom: '1px solid var(--border)',
                  textDecoration: 'none', animation: `fadeUp 0.3s ${i * 0.04}s both`
                }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                  {item.entities?.slice(0,3).map(e => (
                    <span key={e.symbol} className="badge badge-blue">{e.symbol}</span>
                  ))}
                  <span className="mono small muted" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {new Date(item.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{item.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{item.source}</p>
              </a>
            )) : (
              <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                <p style={{ marginBottom: 8 }}>Add your free Marketaux API key to see live news.</p>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>Set <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg3)', padding: '1px 5px', borderRadius: 4 }}>VITE_MARKETAUX_KEY</code> in your Netlify environment variables.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Economic calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, marginBottom: 4, letterSpacing: '0.03em' }}>
              Economic Calendar
            </h2>
            <p className="muted small" style={{ marginBottom: 16 }}>Today's key events (ET)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ECON_EVENTS.map((ev, i) => (
                <div key={i} style={{
                  background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px',
                  borderLeft: `3px solid ${ev.impact === 'high' ? 'var(--red)' : ev.impact === 'medium' ? 'var(--amber)' : 'var(--text3)'}`,
                  animation: `fadeUp 0.3s ${i * 0.07}s both`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="mono small" style={{ color: 'var(--text2)' }}>{ev.time} ET</span>
                    <span className={`badge ${ev.impact === 'high' ? 'badge-red' : ev.impact === 'medium' ? 'badge-amber' : 'badge-gray'}`}>
                      {ev.impact}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{ev.event}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text3)' }}>Fcst <span style={{ color: 'var(--text2)' }}>{ev.forecast}</span></span>
                    <span style={{ color: 'var(--text3)' }}>Prev <span style={{ color: 'var(--text2)' }}>{ev.prev}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tip card */}
          <div style={{
            background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)',
            borderRadius: 'var(--radius-lg)', padding: 16
          }}>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--accent)', marginBottom: 6, letterSpacing: '0.04em' }}>
              PRE-MARKET CHECKLIST
            </p>
            {['Write your daily plan', 'Build your watchlist', 'Define entry criteria', 'Review your strategy rules', 'Set max loss limit'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: 12, color: 'var(--text2)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
