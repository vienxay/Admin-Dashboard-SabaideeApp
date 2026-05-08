import { useState } from 'react'
import { createStaff } from '../../services/api'

export function CreateStaffModal({ onClose, onSuccess }) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await createStaff(name, email, password)
      onSuccess('✅ ເພີ່ມພະນັກງານສຳເລັດ')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'ເພີ່ມພະນັກງານບໍ່ສຳເລັດ')
    } finally { setLoading(false) }
  }

  const accent = '#7c3aed'

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        border: `1.5px solid ${accent}20`,
        borderRadius: '24px', width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(124,58,237,0.06)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            👤 ເພີ່ມພະນັກງານໃໝ່
          </span>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', color: '#64748b',
            fontSize: '16px', cursor: 'pointer', width: '32px', height: '32px',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          {[
            { label: 'ຊື່',         type: 'text',     value: name,     onChange: setName,     placeholder: 'ຊື່ພະນັກງານ' },
            { label: 'ອີເມວ',       type: 'email',    value: email,    onChange: setEmail,    placeholder: 'staff@sabaidee.com' },
            { label: 'ລະຫັດຜ່ານ',  type: 'password', value: password, onChange: setPassword, placeholder: 'ຢ່າງໜ້ອຍ 8 ຕົວ' },
          ].map(({ label, type, value, onChange, placeholder }) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                {label}
              </label>
              <input
                type={type} value={value} placeholder={placeholder} required
                onChange={e => onChange(e.target.value)}
                onFocus={e => e.target.style.border = `1.5px solid ${accent}`}
                onBlur={e  => e.target.style.border = '1.5px solid #e2e8f0'}
                style={{
                  width: '100%', background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px', padding: '11px 14px',
                  color: '#0f172a', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s',
                }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', marginTop: '8px',
            background: loading ? `${accent}80` : accent,
            color: '#fff', fontWeight: 700, fontSize: '14px',
            padding: '13px', borderRadius: '12px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : `0 4px 16px ${accent}40`,
            transition: 'all 0.2s',
          }}>
            {loading ? 'ກຳລັງສ້າງ...' : '👤 ເພີ່ມພະນັກງານ'}
          </button>
        </form>
      </div>
    </div>
  )
}