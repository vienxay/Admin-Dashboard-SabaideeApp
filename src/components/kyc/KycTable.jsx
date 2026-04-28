import { useTheme } from '../../context/useTheme'

const TAB_LABEL = { pending: 'ລໍຖ້າ', verified: 'ຜ່ານແລ້ວ', rejected: 'ປະຕິເສດ' }
const TAB_COLOR = { pending: '#f59e0b', verified: '#00d4aa', rejected: '#ef4444' }

// ❌ ລຶບ S ທີ່ນອກ component ອອກ

export function KycTable({ kycTab, kycList, loading, onRefresh, onSelect }) {
  // ✅ useTheme ຢູ່ໃນ component
  const { theme } = useTheme()

  // ✅ S ຢູ່ໃນ component — ໃຊ້ theme ໄດ້
  const S = {
    card: {
      background:   theme.surface,
      border:      `1px solid ${theme.border}`,
      borderRadius: '16px', overflow: 'hidden',
    },
    th: {
      padding: '12px 20px', textAlign: 'left', fontSize: '11px',
      color:        theme.textSub,
      fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      borderBottom: `1px solid ${theme.border}`,
    },
    td: {
      padding: '16px 20px',
      borderBottom: `1px solid ${theme.border}`,
    },
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-'

  return (
    <div style={S.card}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background:  TAB_COLOR[kycTab],
            boxShadow:  `0 0 8px ${TAB_COLOR[kycTab]}`,
          }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>
            KYC {TAB_LABEL[kycTab]}
          </span>
        </div>
        <button onClick={onRefresh} style={{
          fontSize: '12px', color: '#00d4aa', background: 'rgba(0,212,170,0.08)',
          border: '1px solid rgba(0,212,170,0.2)', borderRadius: '8px',
          padding: '6px 14px', cursor: 'pointer',
        }}>↻ ໂຫລດໃໝ່</button>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' }}>
          ກຳລັງໂຫລດ...
        </div>
      ) : kycList.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <p style={{ color: theme.textMuted, fontSize: '14px' }}>ບໍ່ມີ KYC {TAB_LABEL[kycTab]}</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ຊື່ / Email', 'Passport', 'ສັນຊາດ', 'ວັນສົ່ງ', 'ສະຖານະ', ''].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kycList.map(kyc => (
              <tr key={kyc._id}
                onMouseEnter={e => e.currentTarget.style.background = theme.name === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={S.td}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>{kyc.fullName}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{kyc.email}</div>
                </td>
                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '13px', color: theme.textSub }}>
                  {kyc.passportNumber}
                </td>
                <td style={{ ...S.td, fontSize: '13px', color: theme.textSub }}>{kyc.nationality}</td>
                <td style={{ ...S.td, fontSize: '12px', color: theme.textMuted }}>{fmtDate(kyc.submittedAt)}</td>
                <td style={S.td}>
                  <span style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600,
                    background: `rgba(${kycTab === 'pending' ? '245,158,11' : kycTab === 'verified' ? '0,212,170' : '239,68,68'},0.1)`,
                    border: `1px solid ${TAB_COLOR[kycTab]}44`,
                    color: TAB_COLOR[kycTab],
                  }}>
                    {TAB_LABEL[kyc.status]}
                  </span>
                </td>
                <td style={S.td}>
                  <button onClick={() => onSelect(kyc)} style={{
                    fontSize: '12px', color: '#00d4aa', background: 'rgba(0,212,170,0.08)',
                    border: '1px solid rgba(0,212,170,0.2)', borderRadius: '8px',
                    padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>ກວດສອບ →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}