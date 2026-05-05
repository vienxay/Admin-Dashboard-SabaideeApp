import { useState } from 'react'
import { useTheme } from '../../context/useTheme'  // ✅ ເພີ່ມ

const TAB_LABEL = { pending: 'ລໍຖ້າ', verified: 'ຜ່ານແລ້ວ', rejected: 'ປະຕິເສດ' }

export function KycModal({ selected, note, setNote, onClose, onReview }) {
  const [processing, setProcessing] = useState(false)
  const { theme } = useTheme()  // ✅ ເພີ່ມ
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-'

  const handleReview = async (status) => {
    setProcessing(true)
    try { await onReview(status) }
    finally { setProcessing(false) }
  }

  const INFO_ROWS = [
    ['ຊື່ເຕັມ',        selected.fullName],
    ['ເພດ',            selected.gender === 'M' ? '👨 ຊາຍ' : '👩 ຍິງ'],
    ['ວັນເດືອນປີເກີດ', fmtDate(selected.dob)],
    ['ສັນຊາດ',         selected.nationality],
    ['Email',          selected.email],
    ['Passport No.',   selected.passportNumber],
    ['ໝົດອາຍຸ',        fmtDate(selected.expiryDate)],
    ['Ref ID',         selected.referenceId],
  ]

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 40,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}>
      <div style={{
        background:   theme.surface,           // ✅
        border:      `1px solid ${theme.border}`, // ✅
        borderRadius: '20px', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, // ✅
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}> // ✅
            ລາຍລະອຽດ KYC
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: theme.textMuted, // ✅
            fontSize: '20px', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Passport Image */}
          {selected.idFrontUrl && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '11px', color: theme.textMuted, // ✅
                marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                ຮູບ Passport
              </div>
              <img src={selected.idFrontUrl} alt="passport" style={{
                width: '100%', borderRadius: '12px',
                border: `1px solid ${theme.border}`, display: 'block', // ✅
              }} />
            </div>
          )}

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {INFO_ROWS.map(([label, value]) => (
              <div key={label} style={{
                background:   theme.surface2,        // ✅
                borderRadius: '10px', padding: '12px 14px',
                border:      `1px solid ${theme.border}`, // ✅
              }}>
                <div style={{
                  fontSize: '10px', color: theme.textMuted, // ✅
                  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: '13px', color: theme.text, // ✅
                  fontFamily: 'monospace', wordBreak: 'break-all',
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {selected.status === 'pending' ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', color: theme.textMuted, // ✅
                  marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  ໝາຍເຫດ (ສຳລັບປະຕິເສດ)
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="ຮູບບໍ່ຊັດ / ຂໍ້ມູນບໍ່ຕົງ..."
                  rows={3}
                  style={{
                    width: '100%',
                    background:   theme.surface2,        // ✅
                    border:      `1px solid ${theme.border}`, // ✅
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color:        theme.text,            // ✅
                    fontSize: '13px', outline: 'none',
                    resize: 'none', boxSizing: 'border-box',
                    fontFamily: 'Sora, sans-serif',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => handleReview('verified')} disabled={processing} style={{
                  background: '#00d4aa', color: '#0a0a14', fontWeight: 700,
                  fontSize: '14px', padding: '14px', borderRadius: '12px',
                  border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                  opacity: processing ? 0.6 : 1,
                }}>
                  {processing ? '...' : '✅ ອະນຸມັດ'}
                </button>
                <button onClick={() => handleReview('rejected')} disabled={processing} style={{
                  background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: 700,
                  fontSize: '14px', padding: '14px', borderRadius: '12px',
                  border: '1px solid rgba(239,68,68,0.25)',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  opacity: processing ? 0.6 : 1,
                }}>
                  {processing ? '...' : '❌ ປະຕິເສດ'}
                </button>
              </div>
            </>
          ) : (
            <div style={{
              padding: '14px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
              background: `rgba(${selected.status === 'verified' ? '0,212,170' : '239,68,68'},0.08)`,
              border: `1px solid ${selected.status === 'verified' ? 'rgba(0,212,170,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: selected.status === 'verified' ? '#00d4aa' : '#f87171',
            }}>
              {TAB_LABEL[selected.status]}
              {selected.reviewNote ? ` — ${selected.reviewNote}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}