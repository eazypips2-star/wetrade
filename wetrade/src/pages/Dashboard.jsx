import { useState, useEffect, useRef } from 'react'

const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

function useMarketNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const key = import.meta.env.VITE_MARKETAUX_KEY
    if (!key) { setLoading(false); return }
    fetch(`https://api.marketaux.com/v1/news/all?filter_entities=true&language=en&api_token=${key}`)
      .then(r => r.json())
      .then(d => { if (d.data) setNews(d.data.slice(0, 12)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { news, loading }
}

// Fixed TradingView ticker tape with correct symbol strings
function TradingViewTape() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'SP:SPX',      title: 'S&P 500'   },
        { proName: 'NASDAQ:QQQ',  title: 'QQQ'       },
        { proName: 'NASDAQ:NDX',  title: 'NASDAQ 100' },
        { proName: 'TVC:VIX',     title: 'VIX'       },
        { proName: 'TVC:DXY',     title: 'DXY'       },
        { proName: 'TVC:GOLD',    title: 'Gold'      },
        { proName: 'TVC:USOIL',   title: 'Crude Oil' },
      ],
      showSymbolLogo: false,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en'
    })
    ref.current.appendChild(script)
  }, [])

  return (
    <div style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <div ref={ref} className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  )
}

// Real live economic calendar from TradingView — no API key, no fake data
function EconomicCalendar() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: '500',
      locale: 'en',
      importanceFilter: '0,1',   // 0 = medium, 1 = high impact only
      currencyFilter: 'USD',     // US events only
    })
    ref.current.appendChild(script)
  }, [])

  return (
    <div ref={ref} className="tradingview-widget-container"
      style={{ minHeight: 500 }}>
      <div className="tradingview-widget-container__widget" />
    </div>
  )
}

export default function Dashboard() {
  const { news, loading: newsLoading } = useMarketNews()
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const isPreMarket = now.getHours() < 9 || (now.getHours() === 9 && now.getMinutes() < 30)

  return (
    <div style={{ padding: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Market Overview
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{today}</p>
        </div>
        <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isPreMarket ? 'var(--amber)' : 'var(--accent)',
            animation: 'pulse 2s infinite'
          }} />
          <span className="mono" style={{ fontSize: 12, color: isPreMarket ? 'var(--amber)' : 'var(--accent)' }}>
            {isPreMarket ? 'PRE-MARKET' : 'MARKET OPEN'} · {timeStr}
          </span>
        </div>
      </div>

      {/* Live ticker tape */}
      <TradingViewTape />

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* Left — News & Catalysts */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            News & Catalysts
          </h2>
          <p className="muted small" style={{ marginBottom: 18 }}>Latest market-moving headlines</p>

          {newsLoading ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text2)', fontSize: 13, padding: '12px 0' }}>
              <div className="spinner" /> Loading news...
            </div>
          ) : news.length > 0 ? (
            news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noreferrer"
                style={{
                  display: 'block', padding: '14px 0',
                  borderBottom: i < news.length - 1 ? '1px solid var(--border)' : 'none',
                  textDecoration: 'none',
                  animation: `fadeUp 0.3s ${i * 0.04}s both`
                }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  {item.entities?.slice(0, 4).map(e => (
                    <span key={e.symbol} className="badge badge-blue">{e.symbol}</span>
                  ))}
                  <span className="mono small muted" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {new Date(item.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, marginBottom: 4 }}>{item.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text3)' }}>{item.source}</p>
              </a>
            ))
          ) : (
            <div style={{ padding: '20px 0' }}>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 10 }}>
                Connect a free news API to see live headlines here.
              </p>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>To enable live news:</p>
                <ol style={{ fontSize: 12, color: 'var(--text3)', paddingLeft: 16, lineHeight: 2 }}>
                  <li>Sign up free at <span style={{ color: 'var(--blue)' }}>marketaux.com</span></li>
                  <li>Copy your API token</li>
                  <li>Netlify → Site settings → Environment variables</li>
                  <li>Add <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg4)', padding: '1px 5px', borderRadius: 4 }}>VITE_MARKETAUX_KEY</code> = your token</li>
                  <li>Redeploy the site</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right — Live Economic Calendar + Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                Economic Calendar
              </h2>
              <p className="muted small">Live · USD events · medium & high impact</p>
            </div>
            <EconomicCalendar />
          </div>

          {/* Pre-market checklist */}
          <div style={{
            background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)',
            borderRadius: 'var(--radius-lg)', padding: 16
          }}>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--accent)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Pre-Market Checklist
            </p>
            {[
              'Write your daily plan',
              'Set your market bias',
              'Build your watchlist',
              'Define entry criteria for each ticker',
              'Review your strategy rules',
              'Set your max loss limit',
            ].map((item, i) => (
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
