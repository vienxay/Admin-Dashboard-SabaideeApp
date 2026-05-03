import { useState, useEffect, useRef } from 'react' // ✅ ເພີ່ມ useRef
import { useTheme } from '../../context/useTheme'
import api from '../../services/api'

const fmtNum = (n) => Number(n || 0).toLocaleString()

const STATS_CONFIG = [
  { key: 'totalUsers', label: 'Users ທັງໝົດ', icon: '👥',
    accent: '#6366f1', light: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
  { key: 'totalTx',    label: 'Transactions',  icon: '⚡',
    accent: '#f59e0b', light: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  { key: 'pendingKyc', label: 'KYC Pending',   icon: '⏳',
    accent: '#ef4444', light: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)'  },
  { key: 'totalSats',  label: 'Total Sats',    icon: '₿',
    accent: '#f97316', light: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' },
]

const RATE_CONFIG = [
  { label: '1 BTC = USD', key: 'btcUSD', accent: '#f59e0b', light: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.15)'  },
  { label: '1 BTC = LAK', key: 'btcLAK', accent: '#00d4aa', light: 'rgba(0,212,170,0.06)',   border: 'rgba(0,212,170,0.15)'   },
  { label: '1 USD = LAK', key: 'usdLAK', accent: '#a78bfa', light: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.15)' },
  { label: '1 sat = LAK', key: 'satLAK', accent: '#00d4aa', light: 'rgba(0,212,170,0.06)',   border: 'rgba(0,212,170,0.15)'   },
  { label: '1,000 sats',  key: 'kSats',  accent: '#f59e0b', light: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.15)'  },
  { label: '⏰ Updated',   key: 'time',   accent: '#64748b', light: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.15)' },
]

export function RatePanel({ rate, stats, loading, onRefresh }) {
  const { theme }   = useTheme()
  const inputRef    = useRef(null)       // ✅ ໃຊ້ ref
  const [updating,  setUpdating] = useState(false)
  const [msg,       setMsg]      = useState(null)

  // ✅ sync ຄ່າ input ຈາກ DB — ສະເພາະຕອນ rate ປ່ຽນ ແລະ user ບໍ່ focus
  useEffect(() => {
    if (rate?.usdToLAK && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = String(Math.round(rate.usdToLAK))
    }
  }, [rate])

  const handleUpdate = async () => {
    const val = parseFloat(inputRef.current?.value) // ✅ ດຶງຈາກ ref ໂດຍກົງ
    if (!val || val <= 0) {
      setMsg({ ok: false, text: 'ໃສ່ຕົວເລກທີ່ຖືກຕ້ອງ' })
      return
    }
    setUpdating(true); setMsg(null)
    try {
      await api.post('/admin/rate/update', { usdToLAK: val })
      setMsg({ ok: true, text: '✅ ອັບເດດ Rate ສຳເລັດ' })
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
    totalSats:  fmtNum(stats.totalSats),
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
    borderRadius: '14px',
    padding: '20px 24px',
    transition: 'transform 0.15s',
    cursor: 'default',
  }

  return (
    <>
      {/* ── Stats Cards ── */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {STATS_CONFIG.map(cfg => (
            <div key={cfg.key}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              style={{
                ...cardBase,
                background: theme.name === 'light' ? cfg.light : theme.surface,
                border: `1px solid ${theme.name === 'light' ? cfg.border : theme.border}`,
                boxShadow: theme.name === 'light' ? `0 2px 12px ${cfg.border}` : 'none',
              }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px',
                background: `${cfg.accent}18`, marginBottom: '12px',
              }}>{cfg.icon}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '4px' }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: cfg.accent }}>
                {statsValues[cfg.key] ?? '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Rate Card ── */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: theme.name === 'light' ? '0 2px 12px rgba(99,115,150,0.1)' : 'none',
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: theme.name === 'light'
            ? 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)'
            : 'transparent',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>
            💱 ອັດຕາແລກປ່ຽນ Real-time
          </span>
          <button onClick={onRefresh} style={{
            fontSize: '12px', color: '#00d4aa',
            background: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.2)',
            borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
          }}>↻ ໂຫລດໃໝ່</button>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>
            ກຳລັງໂຫລດ...
          </div>
        ) : rate ? (
          <div style={{
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}>
            {RATE_CONFIG.map(cfg => (
              <div key={cfg.key}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = theme.name === 'light'
                    ? `0 6px 20px ${cfg.border}` : '0 6px 20px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = theme.name === 'light'
                    ? `0 1px 6px ${cfg.border}` : 'none'
                }}
                style={{
                  ...cardBase,
                  background: theme.name === 'light' ? cfg.light : theme.surface2,
                  borderTop:    `1px solid ${theme.name === 'light' ? cfg.border : theme.border}`,
                  borderRight:  `1px solid ${theme.name === 'light' ? cfg.border : theme.border}`,
                  borderBottom: `1px solid ${theme.name === 'light' ? cfg.border : theme.border}`,
                  borderLeft:   `3px solid ${cfg.accent}`,
                  boxShadow: theme.name === 'light' ? `0 1px 6px ${cfg.border}` : 'none',
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
          <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>
            ບໍ່ມີຂໍ້ມູນ Rate
          </div>
        )}
      </div>

      {/* ── Update Rate Form ── */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        padding: '20px 24px',
        marginTop: '16px',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
          ✏️ ແກ້ໄຂ USD → LAK
        </div>

        {msg && (
          <div style={{
            marginBottom: '12px', padding: '10px 14px',
            borderRadius: '8px', fontSize: '13px',
            background: msg.ok ? 'rgba(0,212,170,0.1)' : 'rgba(239,68,68,0.1)',
            color: msg.ok ? '#00d4aa' : '#ef4444',
            border: `1px solid ${msg.ok ? 'rgba(0,212,170,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>{msg.text}</div>
        )}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              color: theme.textMuted, fontSize: '13px',
            }}>1 USD =</span>
            <input
              ref={inputRef}        // ✅ ໃຊ້ ref
              type="number"
              defaultValue=""       // ✅ uncontrolled input
              placeholder="21000"
              style={{
                width: '100%', padding: '12px 60px 12px 70px',
                background: theme.surface2 || '#0d0d1a',
                border: `1px solid ${theme.border}`,
                borderRadius: '10px', color: theme.text,
                fontSize: '15px', fontWeight: 600,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <span style={{
              position: 'absolute', right: '14px', top: '50%',
              transform: 'translateY(-50%)',
              color: theme.textMuted, fontSize: '13px',
            }}>ກີບ</span>
          </div>
          <button
            onClick={handleUpdate}
            disabled={updating}
            style={{
              padding: '12px 24px', borderRadius: '10px',
              border: 'none',
              background: updating ? 'rgba(0,212,170,0.4)' : '#00d4aa',
              color: '#0d0d1a', fontWeight: 700, fontSize: '14px',
              cursor: updating ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}>
            {updating ? 'ກຳລັງອັບເດດ...' : '💱 ອັບເດດ Rate'}
          </button>
        </div>
      </div>
    </>
  )
}