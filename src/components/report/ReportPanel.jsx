import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/useTheme'
import { getReport, getTopUsers } from '../../services/api'  // ✅ ເພີ່ມ getTopUsers

const fmtNum  = (n) => Number(n  || 0).toLocaleString()
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB')

const MONTH_TH = ['','ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ','ພຶດສະພາ','ມິຖຸນາ',
                     'ກໍລະກົດ','ສິງຫາ','ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ']

const TX_TYPES = [
  { value: 'all',      label: 'ທັງໝົດ' },
  { value: 'topup',    label: 'TopUp'  },
  { value: 'withdraw', label: 'ຖອນ'    },
  { value: 'pay',      label: 'ຈ່າຍ'   },
  { value: 'laoQR',   label: 'LaoQR'  },
]

const TYPE_COLOR = {
  topup:    '#0e7a65',
  withdraw: '#b91c1c',
  pay:      '#2F2FE4',
  laoQR:    '#f97316',
  all:      '#475569',
}

export function ReportPanel() {
  const { theme } = useTheme()
  const printRef  = useRef(null)

  const today  = new Date()
  const sixAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  const [from,     setFrom]     = useState(sixAgo.toISOString().slice(0, 10))
  const [to,       setTo]       = useState(today.toISOString().slice(0, 10))
  const [type,     setType]     = useState('all')
  const [data,     setData]     = useState(null)
  const [topUsers, setTopUsers] = useState([])  // ✅ ເພີ່ມ
  const [loading,  setLoading]  = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const [reportRes, topRes] = await Promise.all([  // ✅ fetch ພ້ອມກັນ
        getReport(from, to, type),
        getTopUsers(from, to),
      ])
      setData(reportRes.data.data)
      setTopUsers(topRes.data.data || [])
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport() }, [])

  const summaryMap = {}
  data?.summary?.forEach(s => { summaryMap[s._id] = s })

  const SUMMARY_CONFIG = [
    { key: 'topup',    label: 'TopUp',    icon: '⚡', accent: '#0e7a65' },
    { key: 'withdraw', label: 'ຖອນເງິນ',  icon: '💸', accent: '#b91c1c' },
    { key: 'pay',      label: 'ຈ່າຍເງິນ', icon: '🔄', accent: '#2F2FE4' },
    { key: 'laoQR',   label: 'LaoQR',    icon: '📱', accent: '#f97316' },
  ]

  const S = {
    card: {
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: '16px', overflow: 'hidden', marginBottom: '16px',
    },
    th: {
      padding: '10px 16px', textAlign: 'left', fontSize: '11px',
      color: theme.textMuted, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}`,
      border: `1px solid ${theme.border}`,
      background: theme.surface2,
    },
    td: {
      padding: '12px 16px', fontSize: '13px',
      borderBottom: `1px solid ${theme.border}`,
      border: `1px solid ${theme.border}`,
      color: theme.text,
    },
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden }
          #print-area, #print-area * { visibility: visible }
          #print-area { position: absolute; top: 0; left: 0; width: 100% }
          .no-print { display: none !important }
          .print-header { display: block !important }
          .print-only { display: block !important }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { margin-top: 10mm; size: A4; }
        }
      `}</style>

      {/* ── Filter Bar ── */}
      <div className="no-print" style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: '16px', padding: '20px 24px', marginBottom: '16px',
        display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap',
      }}>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ຈາກວັນທີ</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px 12px', color: theme.text, fontSize: '13px', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ຫາວັນທີ</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px 12px', color: theme.text, fontSize: '13px', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ປະເພດ</label>
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '8px 12px', color: theme.text, fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
            {TX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button onClick={fetchReport} style={{ background: '#0e7a65', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          🔍 ຄົ້ນຫາ
        </button>
        <button onClick={() => window.print()} style={{ background: '#2F2FE4', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          🖨 Print
        </button>
      </div>

      {/* ── Print Area ── */}
      <div id="print-area" ref={printRef}>

        {/* Print Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'none' }} className="print-header">
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
            ລາຍງານທັງໝົດ Sabaidee Admin
          </h2>
          <p style={{ color: '#555', margin: 0, fontSize: '13px' }}>
            {fmtDate(from)} — {fmtDate(to)} | ປະເພດ: {TX_TYPES.find(t => t.value === type)?.label}
          </p>
          <div style={{ borderBottom: '2px solid #0e7a65', marginTop: '12px' }} />
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>ກຳລັງໂຫລດ...</div>
        ) : !data ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>ບໍ່ມີຂໍ້ມູນ</div>
        ) : (
          <>
            {/* ── Summary Cards (ບໍ່ print) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}
              className="no-print">
              {SUMMARY_CONFIG.map(cfg => {
                const s = summaryMap[cfg.key]
                return (
                  <div key={cfg.key} style={{ background: cfg.accent, borderRadius: '14px', padding: '20px 24px', color: '#fff' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{cfg.icon}</div>
                    <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '4px' }}>{cfg.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{fmtNum(s?.count || 0)} ລາຍການ</div>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>{fmtNum(s?.totalSats || 0)} sats</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>{fmtNum(Math.round(s?.totalLAK || 0))} ກີບ</div>
                  </div>
                )
              })}
            </div>

            {/* ── Summary Print Only ── */}
            <div className="print-only" style={{ display: 'none', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>ປະເພດ</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>ລາຍການ</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>ລວມ Sats</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>ລວມ LAK</th>
                  </tr>
                </thead>
                <tbody>
                  {SUMMARY_CONFIG.map(cfg => {
                    const s = summaryMap[cfg.key]
                    return (
                      <tr key={cfg.key}>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{cfg.icon} {cfg.label}</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>{fmtNum(s?.count || 0)}</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>{fmtNum(s?.totalSats || 0)}</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#0e7a65' }}>{fmtNum(Math.round(s?.totalLAK || 0))}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── User Growth ── */}
            <div style={S.card}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>👥 ຜູ້ໃຊ້ເພີ່ມຂຶ້ນຕໍ່ເດືອນ</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr>
                    {['ປີ', 'ເດືອນ', 'ຜູ້ໃຊ້ໃໝ່', 'ການປ່ຽນແປງ'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.userGrowth.map((row, i) => {
                    const prev = data.userGrowth[i - 1]?.count || 0
                    const diff = i === 0 ? 0 : row.count - prev
                    const pct  = prev === 0 ? 0 : Math.round((diff / prev) * 100)
                    return (
                      <tr key={i}>
                        <td style={S.td}>{row._id.year}</td>
                        <td style={S.td}>{MONTH_TH[row._id.month]}</td>
                        <td style={{ ...S.td, fontWeight: 700 }}>{row.count}</td>
                        <td style={S.td}>
                          {i === 0 ? '—' : (
                            <span style={{ color: diff >= 0 ? '#0e7a65' : '#b91c1c', fontWeight: 600 }}>
                              {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)} ({pct}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Top Users ── */}
            <div style={S.card}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>🏆 Top Users (TopUp ຫຼາຍສຸດ)</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'ຊື່', 'Email', 'TopUp (ຄັ້ງ)', 'ລວມ Sats', 'ລວມ LAK'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((u, i) => (
                    <tr key={i}>
                      <td style={{ ...S.td, fontWeight: 700, color: i < 3 ? '#f97316' : theme.text }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{u.name}</td>
                      <td style={{ ...S.td, color: theme.textMuted }}>{u.email}</td>
                      <td style={S.td}>{u.count}</td>
                      <td style={S.td}>{fmtNum(u.totalSats)}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: '#0e7a65' }}>{fmtNum(Math.round(u.totalLAK))}</td>
                    </tr>
                  ))}
                  {topUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ ...S.td, textAlign: 'center', color: theme.textMuted }}>ບໍ່ມີຂໍ້ມູນ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Transaction by Month ── */}
            <div style={S.card}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>📋 ລາຍການ Transaction ຕໍ່ເດືອນ</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr>
                    {['ເດືອນ', 'ປີ', 'ປະເພດ', 'ຈຳນວນລາຍການ', 'ລວມ Sats', 'ລວມ LAK'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.txByMonth.map((row, i) => (
                    <tr key={i}>
                      <td style={S.td}>{MONTH_TH[row._id.month]}</td>
                      <td style={S.td}>{row._id.year}</td>
                      <td style={S.td}>
                        <span style={{
                          background: TYPE_COLOR[row._id.type] || '#475569',
                          color: '#fff', borderRadius: '20px',
                          padding: '2px 10px', fontSize: '11px', fontWeight: 600,
                        }}>
                          {row._id.type}
                        </span>
                      </td>
                      <td style={{ ...S.td, fontWeight: 700 }}>{row.count}</td>
                      <td style={S.td}>{fmtNum(row.totalSats)}</td>
                      <td style={{ ...S.td, fontWeight: 700, color: theme.text }}>
                        {fmtNum(Math.round(row.totalLAK))}
                      </td>
                    </tr>
                  ))}
                  {data.txByMonth?.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ ...S.td, textAlign: 'center', color: theme.textMuted }}>ບໍ່ມີຂໍ້ມູນ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            
          </>
        )}
      </div>
    </>
  )
}