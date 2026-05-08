import { useState, useEffect } from 'react'
import { useTheme } from '../../context/useTheme'
import { getProfitReport, addExpense, deleteExpense } from '../../services/api'
import * as XLSX from 'xlsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const fmtNum = (n) => Number(n || 0).toLocaleString()
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB')

const MONTH_TH = ['','ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ','ພຶດສະພາ','ມິຖຸນາ',
                     'ກໍລະກົດ','ສິງຫາ','ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ']

const CATEGORY_LABEL = {
  server:  '🖥 Server',
  lnbits:  '⚡ LNbits',
  salary:  '👤 ເງິນເດືອນ',
  other:   '📦 ອື່ນໆ',
}

export function ProfitReport() {
  const { theme } = useTheme()

  const today  = new Date()
  const sixAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  const [from,      setFrom]      = useState(sixAgo.toISOString().slice(0, 10))
  const [to,        setTo]        = useState(today.toISOString().slice(0, 10))
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(false)

  // Expense form
  const [expForm,   setExpForm]   = useState({
    title: '', amount: '', category: 'other',
    month: today.getMonth() + 1, year: today.getFullYear(), note: ''
  })
  const [expLoading, setExpLoading] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const profitRes = await getProfitReport(from, to)
      setData(profitRes.data.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ── Chart Data ──────────────────────────────────────────────────────────
  const chartData = (() => {
    if (!data?.profitByMonth) return []
    const map = {}
    data.profitByMonth.forEach(r => {
      const key = `${MONTH_TH[r._id.month]} ${r._id.year}`
      if (!map[key]) map[key] = { name: key, ລາຍຮັບ: 0, Volume: 0 }
      if (r._id.type !== 'withdraw') {
        map[key].ລາຍຮັບ += r.profitLAK
        map[key].Volume  += r.totalLAK
      }
    })
    return Object.values(map)
  })()

  const autoWidth = (ws) => {
    const cols = []
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let C = range.s.c; C <= range.e.c; C++) {
      let max = 10
      for (let R = range.s.r; R <= range.e.r; R++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })]
        if (cell?.v) max = Math.max(max, String(cell.v).length + 2)
      }
      cols.push({ wch: max })
    }
    ws['!cols'] = cols
  }

  // ── Export Excel ────────────────────────────────────────────────────────
  const exportExcel = () => {
    if (!data) return
    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.json_to_sheet(data.profitByMonth.map(r => ({
      'ເດືອນ':        MONTH_TH[r._id.month],
      'ປີ':           r._id.year,
      'ປະເພດ':        r._id.type,
      'Volume (LAK)': Math.round(r.totalLAK),
      'ກຳໄລ (LAK)':   r.profitLAK,
    })))
    autoWidth(ws1)
    XLSX.utils.book_append_sheet(wb, ws1, 'ກຳໄລຕໍ່ເດືອນ')

    const ws2 = XLSX.utils.json_to_sheet(data.profitByDay.map(r => ({
      'ວັນທີ':         `${r._id.day}/${r._id.month}/${r._id.year}`,
      'ປະເພດ':        r._id.type,
      'ລາຍການ':       r.count,
      'Volume (LAK)': Math.round(r.totalLAK),
      'ກຳໄລ (LAK)':   r.profitLAK,
    })))
    autoWidth(ws2)
    XLSX.utils.book_append_sheet(wb, ws2, 'ກຳໄລຕໍ່ວັນ')

    const ws3 = XLSX.utils.json_to_sheet((data.expenses || []).map(e => ({
      'ລາຍການ':        e.title,
      'ປະເພດ':         CATEGORY_LABEL[e.category],
      'ເດືອນ':         MONTH_TH[e.month],
      'ປີ':            e.year,
      'ຈຳນວນ (LAK)':   e.amount,
      'ໝາຍເຫດ':       e.note || '',
    })))
    autoWidth(ws3)
    XLSX.utils.book_append_sheet(wb, ws3, 'ຄ່າໃຊ້ຈ່າຍ')

    XLSX.writeFile(wb, `report_${from}_${to}.xlsx`)
  }

  // ── Add Expense ─────────────────────────────────────────────────────────
  const handleAddExpense = async () => {
    if (!expForm.title || !expForm.amount) return
    setExpLoading(true)
    try {
      await addExpense({ ...expForm, amount: parseFloat(expForm.amount) })
      setExpForm({ title: '', amount: '', category: 'other', month: today.getMonth() + 1, year: today.getFullYear(), note: '' })
      fetchAll()
    } finally {
      setExpLoading(false)
    }
  }

  const handleDeleteExpense = async (id) => {
    if (!confirm('ລຶບຄ່າໃຊ້ຈ່າຍນີ້?')) return
    await deleteExpense(id)
    fetchAll()
  }

  const S = {
    card: {
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: '16px', overflow: 'hidden', marginBottom: '16px',
    },
    th: {
      padding: '10px 16px', textAlign: 'left', fontSize: '11px',
      color: theme.textMuted, fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', border: `1px solid ${theme.border}`,
      background: theme.surface2,
    },
    td: {
      padding: '12px 16px', fontSize: '13px',
      border: `1px solid ${theme.border}`, color: theme.text,
    },
    input: {
      background: theme.surface2, border: `1px solid ${theme.border}`,
      borderRadius: '8px', padding: '8px 12px',
      color: theme.text, fontSize: '13px', outline: 'none',
    },
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden }
          #profit-print, #profit-print * { visibility: visible }
          #profit-print { position: absolute; top: 0; left: 0; width: 100% }
          .no-print { display: none !important }
          .profit-header { display: block !important }
          .print-only { display: block !important }
          .no-break { page-break-inside: avoid }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { margin-top: 10mm; size: A4; }
        }
      `}</style>

      {/* ── Filter ── */}
      <div className="no-print" style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: '16px', padding: '20px 24px', marginBottom: '16px',
        display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap',
      }}>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ຈາກວັນທີ</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={S.input} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ຫາວັນທີ</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={S.input} />
        </div>
        <button onClick={fetchAll} style={{ background: '#0e7a65', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          🔍 ຄົ້ນຫາ
        </button>
        <button onClick={() => window.print()} style={{ background: '#2F2FE4', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          🖨 Print
        </button>
        <button onClick={exportExcel} style={{ background: '#0e7a65', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          📊 Export Excel
        </button>
      </div>

      <div id="profit-print">

        {/* Print Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'none' }} className="profit-header">
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
            ລາຍງານກຳໄລ Sabaidee Admin
          </h2>
          <p style={{ color: '#555', margin: 0, fontSize: '13px' }}>
            {fmtDate(from)} — {fmtDate(to)}
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
              <div style={{ background: '#0e7a65', borderRadius: '14px', padding: '24px', color: '#fff' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>ກຳໄລລວມ (LAK)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{fmtNum(data.totalProfitLAK)} ກີບ</div>
              </div>
              <div style={{ background: '#2F2FE4', borderRadius: '14px', padding: '24px', color: '#fff' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Volume ລວມ (LAK)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{fmtNum(Math.round(data.totalVolumeLAK))} ກີບ</div>
              </div>
              <div style={{ background: '#b91c1c', borderRadius: '14px', padding: '24px', color: '#fff' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💸</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>ຄ່າໃຊ້ຈ່າຍລວມ (LAK)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{fmtNum(data.totalExpenseLAK)} ກີບ</div>
              </div>
              <div style={{ background: data.netProfitLAK >= 0 ? '#f97316' : '#b91c1c', borderRadius: '14px', padding: '24px', color: '#fff' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{data.netProfitLAK >= 0 ? '📈' : '📉'}</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>ກຳໄລສຸດທິ (LAK)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
                  {data.netProfitLAK >= 0 ? '+' : ''}{fmtNum(data.netProfitLAK)} ກີບ
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>ລາຍຮັບ - ຄ່າໃຊ້ຈ່າຍ</div>
              </div>
            </div>

            {/* ── Summary Print Only ── */}
            <div className="print-only" style={{ display: 'none', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>ລາຍການ</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>ຈຳນວນ (LAK)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: '💰 ກຳໄລລວມ',   value: '+' + fmtNum(data.totalProfitLAK),                                           color: '#0e7a65' },
                    { label: '📊 Volume ລວມ', value: fmtNum(Math.round(data.totalVolumeLAK)),                                     color: '#2F2FE4' },
                    { label: '💸 ຄ່າໃຊ້ຈ່າຍ', value: '-' + fmtNum(data.totalExpenseLAK),                                          color: '#b91c1c' },
                    { label: '📈 ກຳໄລສຸດທິ',  value: (data.netProfitLAK >= 0 ? '+' : '') + fmtNum(data.netProfitLAK) + ' ກີບ',  color: '#f97316' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{row.label}</td>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: row.color }}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Chart (ບໍ່ print) ── */}
            <div style={{ ...S.card, padding: '20px 24px' }} className="no-print">
              <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
                📈 ແນວໂນ້ມລາຍຮັບຕໍ່ເດືອນ
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.textMuted }} />
                  <YAxis tick={{ fontSize: 11, fill: theme.textMuted }} />
                  <Tooltip
                    contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px' }}
                    formatter={(v) => fmtNum(v) + ' ກີບ'}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ລາຍຮັບ" stroke="#0e7a65" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Volume"  stroke="#2F2FE4" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ── ລາຍຮັບ vs ຄ່າໃຊ້ຈ່າຍ ── */}
            <div style={S.card}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>📋 ລາຍຮັບ - ຄ່າໃຊ້ຈ່າຍ</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['ລາຍການ', 'ປະເພດ', 'ຈຳນວນ (LAK)'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={S.td}>💰 ກຳໄລຈາກ Spread</td>
                    <td style={S.td}><span style={{ background: '#0e7a65', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' }}>ລາຍຮັບ</span></td>
                    <td style={{ ...S.td, fontWeight: 700, color: '#0e7a65' }}>+{fmtNum(data.totalProfitLAK)}</td>
                  </tr>
                  {(data.expenses || []).map((e, i) => (
                    <tr key={i}>
                      <td style={S.td}>{e.title}</td>
                      <td style={S.td}><span style={{ background: '#b91c1c', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' }}>{CATEGORY_LABEL[e.category]}</span></td>
                      <td style={{ ...S.td, fontWeight: 700, color: '#b91c1c' }}>-{fmtNum(e.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: theme.surface2 }}>
                    <td colSpan={2} style={{ ...S.td, fontWeight: 700, fontSize: '14px' }}>🏆 ກຳໄລສຸດທິ</td>
                    <td style={{
                      ...S.td, fontWeight: 700, fontSize: '16px',
                      color: data.netProfitLAK >= 0 ? '#0e7a65' : '#b91c1c',
                    }}>
                      {data.netProfitLAK >= 0 ? '+' : ''}{fmtNum(data.netProfitLAK)} ກີບ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── ເພີ່ມຄ່າໃຊ້ຈ່າຍ ── */}
            <div className="no-print" style={{ ...S.card, padding: '20px 24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
                ➕ ເພີ່ມຄ່າໃຊ້ຈ່າຍ
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ລາຍການ</label>
                  <input value={expForm.title} onChange={e => setExpForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="ຄ່າ Server..." style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ຈຳນວນ (LAK)</label>
                  <input type="number" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="50000" style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ປະເພດ</label>
                  <select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}
                    style={{ ...S.input, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>
                    {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ເດືອນ</label>
                  <select value={expForm.month} onChange={e => setExpForm(f => ({ ...f, month: parseInt(e.target.value) }))}
                    style={{ ...S.input, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>
                    {MONTH_TH.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ປີ</label>
                  <input type="number" value={expForm.year} onChange={e => setExpForm(f => ({ ...f, year: parseInt(e.target.value) }))}
                    style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, display: 'block', marginBottom: '4px' }}>ໝາຍເຫດ</label>
                  <input value={expForm.note} onChange={e => setExpForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="ໝາຍເຫດ..." style={{ ...S.input, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <button onClick={handleAddExpense} disabled={expLoading} style={{
                background: '#0e7a65', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '10px 24px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
                {expLoading ? 'ກຳລັງບັນທຶກ...' : '➕ ເພີ່ມຄ່າໃຊ້ຈ່າຍ'}
              </button>
            </div>

            {/* ── ຄ່າໃຊ້ຈ່າຍທັງໝົດ ── */}
            {data.expenses?.length > 0 && (
              <div style={S.card} className="no-break">
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>💸 ຄ່າໃຊ້ຈ່າຍທັງໝົດ</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['ລາຍການ', 'ປະເພດ', 'ເດືອນ/ປີ', 'ຈຳນວນ (LAK)', ''].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenses.map((e, i) => (
                      <tr key={i}>
                        <td style={S.td}>{e.title}</td>
                        <td style={S.td}>{CATEGORY_LABEL[e.category]}</td>
                        <td style={S.td}>{MONTH_TH[e.month]} {e.year}</td>
                        <td style={{ ...S.td, color: '#b91c1c', fontWeight: 700 }}>-{fmtNum(e.amount)}</td>
                        <td style={S.td}>
                          <button onClick={() => handleDeleteExpense(e._id)} className="no-print" style={{
                            background: '#b91c1c', color: '#fff', border: 'none',
                            borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer',
                          }}>🗑 ລົບ</button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: theme.surface2 }}>
                      <td colSpan={3} style={{ ...S.td, fontWeight: 700 }}>ລວມ</td>
                      <td style={{ ...S.td, fontWeight: 700, color: '#b91c1c' }}>-{fmtNum(data.totalExpenseLAK)}</td>
                      <td style={S.td} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ── ກຳໄລຕໍ່ເດືອນ ── */}
            <div style={S.card} className="no-break">
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text }}>📅 ກຳໄລຕໍ່ເດືອນ</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['ເດືອນ', 'ປີ', 'ປະເພດ', 'Volume (LAK)', 'ກຳໄລ (LAK)', 'ກຳໄລ (%)'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.profitByMonth.map((row, i) => {
                    const pct   = row.totalLAK > 0 ? ((row.profitLAK / row.totalLAK) * 100).toFixed(2) : 0
                    const isNeg = row.profitLAK < 0
                    const isZero = row.profitLAK === 0

                    return (
                      <tr key={i}>
                        <td style={S.td}>{MONTH_TH[row._id.month]}</td>
                        <td style={S.td}>{row._id.year}</td>
                        <td style={S.td}>
                          <span style={{
                            background:
                              row._id.type === 'topup'    ? '#0e7a65' :
                              row._id.type === 'withdraw' ? '#b91c1c' :
                              row._id.type === 'laoQR'   ? '#f97316' :
                              row._id.type === 'pay'     ? '#2F2FE4' : '#475569',
                            color: '#fff', borderRadius: '20px',
                            padding: '2px 10px', fontSize: '11px', fontWeight: 600,
                          }}>
                            {row._id.type}
                          </span>
                        </td>
                        <td style={S.td}>{fmtNum(Math.round(row.totalLAK))}</td>
                        <td style={{
                          ...S.td, fontWeight: 700,
                          color: isZero ? theme.textMuted : isNeg ? '#b91c1c' : '#0e7a65',
                        }}>
                          {isZero ? '0' : `${isNeg ? '-' : '+'}${fmtNum(Math.abs(row.profitLAK))}`}
                        </td>
                        <td style={{
                          ...S.td,
                          color: isZero ? theme.textMuted : isNeg ? '#b91c1c' : '#0e7a65',
                        }}>
                          {isZero ? '0%' : `${isNeg ? '-' : ''}${Math.abs(pct)}%`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}