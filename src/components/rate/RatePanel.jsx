import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/useTheme'
import api from '../../services/api'

const fmtNum = (n) => Number(n || 0).toLocaleString()

const STATS_CONFIG = [
  { key: 'totalUsers', label: 'Users ທັງໝົດ', icon: '👥', accent: '#0e7a65' },  // ✅ green
  { key: 'totalTx',    label: 'Transactions',  icon: '⚡', accent: '#f97316' },  // ✅ orange
  { key: 'pendingKyc', label: 'KYC Pending',   icon: '⏳', accent: '#b91c1c' },  // ✅ red
  { key: 'balance',    label: 'Total Balance', icon: '₿', accent: '#2F2FE4' },  // ✅ maroon
]

const RATE_CONFIG = [
  { label: '1 BTC = USD', key: 'btcUSD', accent: '#f97316', light: 'rgba(249,115,22,0.06)',  border: 'rgba(249,115,22,0.3)'  },
  { label: '1 BTC = LAK', key: 'btcLAK', accent: '#0e7a65', light: 'rgba(14,122,101,0.06)',  border: 'rgba(14,122,101,0.3)'  },
  { label: '1 USD = LAK', key: 'usdLAK', accent: '#2F2FE4', light: 'rgba(47,47,228,0.06)',   border: 'rgba(47,47,228,0.3)'   },
  { label: '1 sat = LAK', key: 'satLAK', accent: '#0e7a65', light: 'rgba(14,122,101,0.06)',  border: 'rgba(14,122,101,0.3)'  },
  { label: '1,000 sats',  key: 'kSats',  accent: '#f97316', light: 'rgba(249,115,22,0.06)',  border: 'rgba(249,115,22,0.3)'  },
  { label: '⏰ Updated',   key: 'time',   accent: '#b91c1c', light: 'rgba(185,28,28,0.06)',   border: 'rgba(185,28,28,0.3)'   },
]

export function RatePanel({ rate, stats, loading, onRefresh }) {
  const { theme }     = useTheme()
  const inputRef      = useRef(null)
  const spreadRef     = useRef(null)
  const [updating,    setUpdating]   = useState(false)
  const [msg,         setMsg]        = useState(null)
  const [previewSell, setPreviewSell] = useState(null)

  useEffect(() => {
    if (rate) {
      if (inputRef.current && document.activeElement !== inputRef.current)
        inputRef.current.value = String(Math.round(rate.usdToLAKBase || rate.usdToLAK || 0))
      if (spreadRef.current && document.activeElement !== spreadRef.current)
        spreadRef.current.value = String(rate.spreadPercent || 0)
      updatePreview()
    }
  }, [rate])

  const updatePreview = () => {
    const base   = parseFloat(inputRef.current?.value)  || 0
    const spread = parseFloat(spreadRef.current?.value) || 0
    if (base > 0) setPreviewSell(Math.round(base * (1 + spread / 100)))
  }

  const handleUpdate = async () => {
    const usdToLAK      = parseFloat(inputRef.current?.value)
    const spreadPercent = parseFloat(spreadRef.current?.value) ?? 0

    if (!usdToLAK || usdToLAK <= 0)
      return setMsg({ ok: false, text: 'ໃສ່ usdToLAK ທີ່ຖືກຕ້ອງ' })
    if (spreadPercent < 0)
      return setMsg({ ok: false, text: 'Spread % ຕ້ອງ >= 0' })

    setUpdating(true); setMsg(null)
    try {
      await api.post('/admin/rate/update', { usdToLAK, spreadPercent })
      setMsg({ ok: true, text: `✅ ອັບເດດ Rate ສຳເລັດ (spread ${spreadPercent}%)` })
      onRefresh()
    } catch {
      setMsg({ ok: false, text: '❌ ອັບເດດບໍ່ສຳເລັດ' })
    } finally {
      setUpdating(false)
    }
  }

  const statsValues = stats ? {
    totalUsers: fmtNum(stats.totalUsers),
    totalTx:    fmtNum(stats.totalTx),
    pendingKyc: fmtNum(stats.pendingKyc),
  } : {}

  const rateValues = rate ? {
    btcUSD: `$${fmtNum(Math.round(rate.btcToUSD))}`,
    btcLAK: `${fmtNum(Math.round(rate.btcToLAK))} ກີບ`,
    usdLAK: `${fmtNum(Math.round(rate.usdToLAK))} ກີບ`,
    satLAK: `${(rate.btcToLAK / 100_000_000).toFixed(2)} ກີບ`,
    kSats:  `${fmtNum(Math.round(rate.btcToLAK / 100_000))} ກີບ`,
    time:   rate.updatedAt ? new Date(rate.updatedAt).toLocaleTimeString() : '-',
  } : {}

  const cardBase = {
    borderRadius: '14px', padding: '20px 24px',
    transition: 'transform 0.15s', cursor: 'default',
  }

  const inputStyle = {
    background: theme.surface2, border: `1px solid ${theme.border}`,
    borderRadius: '10px', color: theme.text,
    fontSize: '15px', fontWeight: 600,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      {/* ── Stats Cards ── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {STATS_CONFIG.map(cfg => (
            <div key={cfg.key}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              style={{ ...cardBase, background: cfg.accent, border: 'none', boxShadow: 'none' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px',
                background: 'rgba(255,255,255,0.2)', marginBottom: '12px',
              }}>{cfg.icon}</div>
              <div style={{ fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>{cfg.label}</div>

              {cfg.key === 'balance' ? (
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
                    ⚡ {fmtNum(stats?.totalSats)} sats
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
                    💰 {fmtNum(Math.round(stats?.totalLAK || 0))} ກີບ
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff' }}>
                  {statsValues[cfg.key] ?? '—'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Rate Cards ── */}
      <div style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: '16px', overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${theme.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>
            💱 ອັດຕາແລກປ່ຽນ Real-time
          </span>
          <button onClick={onRefresh} style={{
            fontSize: '12px', color: '#ffffff',
            background: '#468432', border: 'none',
            borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
          }}>↻ ໂຫລດໃໝ່</button>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>ກຳລັງໂຫລດ...</div>
        ) : rate ? (
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {RATE_CONFIG.map(cfg => (
              <div key={cfg.key}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                style={{
                  ...cardBase,
                  background:   cfg.light,                   // ✅ ສີອ່ອນ
                  borderTop:    `1px solid ${cfg.border}`,   // ✅
                  borderRight:  `1px solid ${cfg.border}`,   // ✅
                  borderBottom: `1px solid ${cfg.border}`,   // ✅
                  borderLeft:   `4px solid ${cfg.accent}`,   // ✅ ຂອບຊ້າຍໜາ
                  boxShadow: 'none',
                }}>
                <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '10px', fontWeight: 500 }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: cfg.accent }}>
                  {rateValues[cfg.key] ?? '—'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>ບໍ່ມີຂໍ້ມູນ Rate</div>
        )}
      </div>

      {/* ── Update Rate Form ── */}
      <div style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: '16px', padding: '20px 24px', marginTop: '16px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
          ✏️ ຕັ້ງ Rate
        </div>

        {previewSell && (
          <div style={{
            marginBottom: '16px', padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)',
            fontSize: '13px', color: theme.textMuted,
          }}>
            ລາຄາຕັ້ງ: <b style={{ color: '#6d28d9' }}>{fmtNum(parseFloat(inputRef.current?.value) || 0)} ກີບ</b>
            &nbsp;+&nbsp;
            Spread <b style={{ color: '#b45309' }}>{parseFloat(spreadRef.current?.value) || 0}%</b>
            &nbsp;→&nbsp;
            ລາຄາຂາຍ: <b style={{ color: '#0e7a65' }}>{fmtNum(previewSell)} ກີບ</b>
          </div>
        )}

        {msg && (
          <div style={{
            marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
            background: msg.ok ? 'rgba(0,212,170,0.1)' : 'rgba(239,68,68,0.1)',
            color: msg.ok ? '#0e7a65' : '#b91c1c',
            border: `1px solid ${msg.ok ? 'rgba(0,212,170,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>{msg.text}</div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
            Base Rate (USD → LAK)
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '13px' }}>
              1 USD =
            </span>
            <input ref={inputRef} type="number" defaultValue="" placeholder="21000"
              onChange={updatePreview}
              style={{ ...inputStyle, width: '100%', padding: '12px 60px 12px 70px' }} />
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '13px' }}>
              ກີບ
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
            Spread % (ກຳໄລ) — 0 = ບໍ່ມີ spread
          </label>
          <div style={{ position: 'relative' }}>
            <input ref={spreadRef} type="number" min="0" step="0.1" defaultValue="0" placeholder="0"
              onChange={updatePreview}
              style={{ ...inputStyle, width: '100%', padding: '12px 40px 12px 16px' }} />
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '13px' }}>
              %
            </span>
          </div>
        </div>

        <button onClick={handleUpdate} disabled={updating} style={{
          width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
          background: updating ? '#468432' : '#468432',
          color: '#ffffff', fontWeight: 700, fontSize: '15px',
          cursor: updating ? 'not-allowed' : 'pointer',
        }}>
          {updating ? 'ກຳລັງອັບເດດ...' : '💱 ອັບເດດ Rate'}
        </button>
      </div>
    </>
  )
}