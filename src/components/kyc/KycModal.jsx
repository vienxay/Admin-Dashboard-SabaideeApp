import { useState } from 'react'
import { useTheme } from '../../context/useTheme'

const TAB_LABEL = { pending: 'ລໍຖ້າ', verified: 'ຜ່ານແລ້ວ', rejected: 'ປະຕິເສດ' }

// ✅ Preset rejection reasons — admin ກົດເລືອກໄດ້ເລີຍ
const REJECT_PRESETS = [
  { icon: '📷', label: 'ຮູບ Passport ບໍ່ຊັດ' },
  { icon: '📄', label: 'ຮູບ Passport ບໍ່ແມ່ນ BIO-DATA page' },
  { icon: '📋', label: 'ຊື່-ນາມສະກຸນບໍ່ຕົງ' },
  { icon: '🔢', label: 'ເລກ Passport ບໍ່ຖືກຕ້ອງ' },
  { icon: '📅', label: 'Passport ໝົດອາຍຸແລ້ວ' },
  { icon: '🌍', label: 'ສັນຊາດບໍ່ຕົງ' },
  { icon: '📧', label: 'Email ບໍ່ຖືກຕ້ອງ' },
  { icon: '🖼️', label: 'ຮູບ Selfie ບໍ່ຊັດ / ໃບໜ້າບໍ່ຄົບ' },
]

export function KycModal({ selected, note, setNote, onClose, onReview }) {
  const [processing, setProcessing]   = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(null) // ✅ track selected chip
  const { theme } = useTheme()

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-'

  const handleReview = async (status) => {
    setProcessing(true)
    try { await onReview(status) }
    finally { setProcessing(false) }
  }

  // ✅ กด chip → set note + highlight
  const handlePreset = (preset) => {
    if (selectedPreset === preset.label) {
      // กด ซ้ำ = deselect
      setSelectedPreset(null)
      setNote('')
    } else {
      setSelectedPreset(preset.label)
      setNote(`${preset.icon} ${preset.label}`)
    }
  }

  // ✅ พิมเอง → ยกเลิก highlight chip
  const handleNoteChange = (e) => {
    setSelectedPreset(null)
    setNote(e.target.value)
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
        background:   theme.surface,
        border:      `1px solid ${theme.border}`,
        borderRadius: '20px', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: theme.text }}>
            ລາຍລະອຽດ KYC
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: theme.textMuted,
            fontSize: '20px', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Passport Image */}
          {selected.idFrontUrl && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '11px', color: theme.textMuted,
                marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                ຮູບ Passport
              </div>
              <img src={selected.idFrontUrl} alt="passport" style={{
                width: '100%', borderRadius: '12px',
                border: `1px solid ${theme.border}`, display: 'block',
              }} />
            </div>
          )}

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {INFO_ROWS.map(([label, value]) => (
              <div key={label} style={{
                background:   theme.surface2,
                borderRadius: '10px', padding: '12px 14px',
                border:      `1px solid ${theme.border}`,
              }}>
                <div style={{
                  fontSize: '10px', color: theme.textMuted,
                  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: '13px', color: theme.text,
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
              {/* ✅ Note section */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', color: theme.textMuted,
                  marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  ໝາຍເຫດ (ສຳລັບປະຕິເສດ)
                </label>

                {/* ✅ Preset chips */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px',
                }}>
                  {REJECT_PRESETS.map((p) => {
                    const isActive = selectedPreset === p.label
                    return (
                      <button
                        key={p.label}
                        onClick={() => handlePreset(p)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '5px 10px', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: isActive ? 700 : 400,
                          transition: 'all 0.15s',
                          background: isActive
                            ? 'rgba(239,68,68,0.85)'
                            : theme.surface2,
                          color: isActive ? '#fff' : theme.textMuted,
                          border: isActive
                            ? '1px solid rgba(239,68,68,0.9)'
                            : `1px solid ${theme.border}`,
                        }}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* ✅ Free text */}
                <textarea
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="ຫຼືພິມລາຍລະອຽດເພີ່ມຕື່ມ..."
                  rows={3}
                  style={{
                    width: '100%',
                    background:   theme.surface2,
                    border:      `1px solid ${note ? 'rgba(239,68,68,0.5)' : theme.border}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color:        theme.text,
                    fontSize: '13px', outline: 'none',
                    resize: 'none', boxSizing: 'border-box',
                    fontFamily: 'Sora, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                />

                {/* ✅ Warning ຖ້າຍັງບໍ່ໄດ້ລະບຸ note */}
                {!note.trim() && (
                  <div style={{
                    marginTop: '6px', fontSize: '11px',
                    color: 'rgba(239,68,68,0.7)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <span>⚠️</span>
                    <span>ຕ້ອງລະບຸເຫດຜົນກ່ອນ Reject — user ຈະໄດ້ຮັບແຈ້ງເຕືອນ</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => handleReview('verified')}
                  disabled={processing}
                  style={{
                    background: '#00d4aa', color: '#0a0a14', fontWeight: 700,
                    fontSize: '14px', padding: '14px', borderRadius: '12px',
                    border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  {processing ? '...' : '✅ ອະນຸມັດ'}
                </button>
                <button
                  onClick={() => handleReview('rejected')}
                  disabled={processing || !note.trim()} // ✅ disable ຖ້າບໍ່ມີ note
                  title={!note.trim() ? 'ກະລຸນາລະບຸເຫດຜົນກ່ອນ' : ''}
                  style={{
                    background: note.trim()
                      ? 'rgba(239,68,68,0.15)'
                      : theme.surface2,
                    color: note.trim() ? '#f87171' : theme.textMuted,
                    fontWeight: 700,
                    fontSize: '14px', padding: '14px', borderRadius: '12px',
                    border: note.trim()
                      ? '1px solid rgba(239,68,68,0.35)'
                      : `1px solid ${theme.border}`,
                    cursor: (processing || !note.trim()) ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.6 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {processing ? '...' : '❌ ປະຕິເສດ'}
                </button>
              </div>
            </>
          ) : (
            // ── Already reviewed ────────────────────────────────────────────
            <div style={{
              padding: '14px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
              background: `rgba(${selected.status === 'verified' ? '0,212,170' : '239,68,68'},0.08)`,
              border: `1px solid ${selected.status === 'verified'
                ? 'rgba(0,212,170,0.25)'
                : 'rgba(239,68,68,0.25)'}`,
              color: selected.status === 'verified' ? '#00d4aa' : '#f87171',
            }}>
              {TAB_LABEL[selected.status]}
              {selected.reviewNote
                ? ` — ${selected.reviewNote}`
                : selected.status === 'rejected'
                  ? ' — ບໍ່ໄດ້ລະບຸເຫດຜົນ'
                  : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}