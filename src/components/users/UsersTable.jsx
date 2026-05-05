import { useState }      from 'react'
import { useTheme }      from '../../context/useTheme'
import { CreateStaffModal } from './CreateStaffModal'

const ROLE_STYLE = {
  admin: { bg: '#0e7a65', color: '#ffffff' },  // ✅ ຂຽວເຂັ້ມ
  staff: { bg: '#6d28d9', color: '#ffffff' },  // ✅ ມ່ວງເຂັ້ມ
  user:  { bg: '#475569', color: '#ffffff' },  // ✅ ເທົາເຂັ້ມ
}

const fmtNum  = (n) => Number(n || 0).toLocaleString()
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-'

export function UsersTable({ users, loading, onRefresh, onRoleChange, onDelete }) {
  const { theme }            = useTheme()
  const [showCreate, setShowCreate] = useState(false)
  const [toast,      setToast]      = useState(null)

  const S = {
    card: {
      background:   theme.surface,
      border:      `1px solid ${theme.border}`,
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: theme.name === 'light'
        ? '0 2px 12px rgba(99,115,150,0.1)' : 'none',
    },
    th: {
      padding: '12px 20px', textAlign: 'left', fontSize: '11px',
      color:        theme.textMuted,
      fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      borderBottom: `1px solid ${theme.border}`,
      background: theme.name === 'light' ? '#f8fafc' : 'transparent',
    },
    td: {
      padding: '16px 20px',
      borderBottom: `1px solid ${theme.border}`,
    },
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 999,
          padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
          background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.3)',
          color: '#00d4aa', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>{toast}</div>
      )}

      <div style={S.card}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: theme.name === 'light'
            ? 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)'
            : 'transparent',
        }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: theme.text }}>
            👥 Users ທັງໝົດ
            <span style={{
              marginLeft: '8px', fontSize: '12px', fontWeight: 600,
              padding: '2px 10px', borderRadius: '20px',
              background: 'rgba(0,212,170,0.1)', color: '#00d4aa',
              border: '1px solid rgba(0,212,170,0.2)',
            }}>{users.length}</span>
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowCreate(true)} style={{
              fontSize: '12px', fontWeight: 600,
              color: '#ffffff',        // ✅
              background: '#3852B4',   // ✅
              border: 'none',          // ✅
              borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
            }}>+ ເພີ່ມພະນັກງານ</button>
            <button onClick={onRefresh} style={{
              fontSize: '12px', fontWeight: 600,
              color: '#ffffff',        // ✅
              background: '#468432',   // ✅
              border: 'none',          // ✅
              borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
            }}>↻ ໂຫລດໃໝ່</button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>
            ກຳລັງໂຫລດ...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
            <p style={{ color: theme.textMuted, fontSize: '14px' }}>ບໍ່ມີ Users</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ຊື່ / Email', 'Role', 'KYC', 'Balance', 'ວັນສ້າງ', 'Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleStyle = ROLE_STYLE[u.role] || ROLE_STYLE.user
                return (
                  <tr key={u._id}
                    onMouseEnter={e => e.currentTarget.style.background =
                      theme.name === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background 0.15s' }}>

                    {/* Name */}
                    <td style={S.td}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>
                        {u.email}
                      </div>
                    </td>

                    {/* Role */}
                    <td style={S.td}>
                      <select
                        value={u.role || 'user'}
                        onChange={e => onRoleChange(u._id, e.target.value)}
                        style={{
                          background:   roleStyle.bg,
                          border:       'none',          // ✅
                          color:        roleStyle.color,
                          borderRadius: '8px', padding: '5px 10px',
                          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          outline: 'none',
                        }}>
                        <option value="user">user</option>
                        <option value="staff">staff</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>

                    {/* KYC */}
                    <td style={S.td}>
                      <span style={{
                        fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: 600,
                        background: u.kycStatus === 'verified' ? '#0e7a65'
                                  : u.kycStatus === 'rejected' ? '#b91c1c'
                                  : '#f97316',   // ✅ solid color
                        border: 'none',          // ✅ ລຶບ border
                        color: '#ffffff',        // ✅ ຂາວ
                      }}>
                        {u.kycStatus === 'verified' ? '✓ verified' : u.kycStatus || 'pending'}
                      </span>
                    </td>

                    {/* Balance */}
                    <td style={S.td}>
                      <div style={{ fontSize: '13px', color: '#00d4aa', fontWeight: 700 }}>
                        {fmtNum(u.balanceSats)} sats
                      </div>
                      <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>
                        {fmtNum(u.balanceLAK)} LAK
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ ...S.td, fontSize: '12px', color: theme.textMuted }}>
                      {fmtDate(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td style={S.td}>
                      <button onClick={() => onDelete(u._id, u.name)} style={{
                        fontSize: '12px', fontWeight: 600,
                        color: '#ffffff',        // ✅
                        background: '#ef4444',   // ✅
                        border: 'none',          // ✅
                        borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                      }}>🗑 ລຶບ</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onSuccess={(msg) => {
            setShowCreate(false)
            onRefresh()
            setToast(msg)
            setTimeout(() => setToast(null), 3000)
          }}
        />
      )}
    </>
  )
}