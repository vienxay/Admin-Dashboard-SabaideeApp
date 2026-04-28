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
      onSuccess('✅ ສ້າງ Staff ສຳເລັດ')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'ສ້າງ Staff ລົ້ມເຫຼວ')
    } finally { setLoading(false) }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#12122a', border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: '20px', width: '100%', maxWidth: '400px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>👤 ສ້າງ Staff ໃໝ່</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {[
            { label: 'ຊື່', type: 'text',     value: name,     onChange: setName,     placeholder: 'ຊື່ພະນັກງານ' },
            { label: 'ອີເມວ', type: 'email',  value: email,    onChange: setEmail,    placeholder: 'staff@sabaidee.com' },
            { label: 'ລະຫັດຜ່ານ', type: 'password', value: password, onChange: setPassword, placeholder: 'ຢ່າງໜ້ອຍ 8 ຕົວ' },
          ].map(({ label, type, value, onChange, placeholder }) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '6px' }}>{label}</label>
              <input type={type} value={value} placeholder={placeholder} required
                onChange={e => onChange(e.target.value)}
                onFocus={e => e.target.style.border = '1px solid rgba(167,139,250,0.5)'}
                onBlur={e  => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                style={{
                  width: '100%', background: '#0a0a14',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '11px 14px',
                  color: '#fff', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                }} />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', marginTop: '8px',
            background: loading ? 'rgba(167,139,250,0.5)' : '#a78bfa',
            color: '#0a0a14', fontWeight: 700, fontSize: '14px',
            padding: '13px', borderRadius: '12px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'ກຳລັງສ້າງ...' : '👤 ສ້າງ Staff'}
          </button>
        </form>
      </div>
    </div>
  )
}