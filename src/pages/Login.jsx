import { useState, useEffect } from 'react'
import { useNavigate }  from 'react-router-dom'
import { login, hasAdmin, setupAdmin } from '../services/api'
import { useAuth }      from '../context/useAuth'

export default function Login() {
  const [mode,     setMode]     = useState('login')
  const [roleHint, setRoleHint] = useState('admin')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [checking, setChecking] = useState(true)

  const { saveLogin } = useAuth()
  const navigate      = useNavigate()

  const ROLE_CONFIG = {
    admin: { placeholder: 'admin@sabaidee.com', color: '#0e7a65', bg: 'rgba(14,122,101,0.08)', border: 'rgba(14,122,101,0.3)' },
    staff: { placeholder: 'staff@sabaidee.com', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.3)' },
  }
  const current = ROLE_CONFIG[roleHint]

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await hasAdmin()
        if (!cancelled && !res.data.hasAdmin) setMode('setup')
      } catch {
        if (!cancelled) setMode('login')
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await login(email, password)
      const { user, token } = res.data
      if (!['admin', 'staff'].includes(user.role)) {
        setError('ບັນຊີນີ້ບໍ່ມີສິດເຂົ້າ Dashboard')
        return
      }
      saveLogin(user, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'ເຂົ້າລະບົບລົ້ມເຫຼວ')
    } finally { setLoading(false) }
  }

  const handleSetup = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (password !== confirm) { setError('ລະຫັດຜ່ານບໍ່ກົງກັນ'); return }
    if (password.length < 8)  { setError('ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວ'); return }
    setLoading(true)
    try {
      await setupAdmin(name, email, password)
      setSuccess('✅ ສ້າງ Admin ສຳເລັດ — ກະລຸນາ Login')
      setMode('login')
      setName(''); setPassword(''); setConfirm('')
    } catch (err) {
      setError(err.response?.data?.message || 'ສ້າງ Admin ລົ້ມເຫຼວ')
    } finally { setLoading(false) }
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#0e7a65', fontSize: '14px' }}>ກຳລັງກວດສອບ...</div>
    </div>
  )

  const accentColor = mode === 'setup' ? '#f59e0b' : current.color

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '20px',
            background: `${accentColor}15`,
            border: `1.5px solid ${accentColor}40`,
            marginBottom: '16px', transition: 'all 0.3s',
            boxShadow: `0 8px 24px ${accentColor}20`,
          }}>
            <svg width="30" height="30" fill="none" stroke={accentColor} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h1 style={{ color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: 0 }}>
            {mode === 'setup' ? '🔧 ຕັ້ງຄ່າລະບົບຄັ້ງທຳອິດ' : `${roleHint === 'admin' ? '⚙️' : '👤'} Admin Dashboard`}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', fontFamily: 'monospace' }}>
            Sabaidee Wallet
          </p>

          {/* Role Switcher */}
          {mode === 'login' && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
              {['admin', 'staff'].map(r => {
                const cfg      = ROLE_CONFIG[r]
                const isActive = roleHint === r
                return (
                  <button key={r} type="button"
                    onClick={() => { setRoleHint(r); setError(''); setEmail(''); setPassword('') }}
                    style={{
                      fontSize: '12px', padding: '6px 18px', borderRadius: '20px',
                      cursor: 'pointer', transition: 'all 0.2s', fontWeight: isActive ? 700 : 500,
                      background: isActive ? cfg.bg : '#fff',
                      border: `1.5px solid ${isActive ? cfg.border : '#e2e8f0'}`,
                      color: isActive ? cfg.color : '#94a3b8',
                      boxShadow: isActive ? `0 2px 12px ${cfg.color}20` : 'none',
                    }}>
                    {r === 'admin' ? '⚙️ Admin' : '👤 Staff'}
                  </button>
                )
              })}
            </div>
          )}

          {/* Setup badge */}
          {mode === 'setup' && (
            <div style={{
              display: 'inline-block', marginTop: '8px', fontSize: '11px',
              padding: '4px 14px', borderRadius: '20px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b',
            }}>
              ⚠️ ຍັງບໍ່ມີ Admin — ກະລຸນາສ້າງກ່ອນ
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          border: `1.5px solid ${accentColor}20`,
          borderRadius: '24px',
          padding: '28px',
          boxShadow: `0 4px 40px rgba(0,0,0,0.08), 0 0 0 1px ${accentColor}10`,
          transition: 'border 0.3s',
        }}>

          {/* Messages */}
          {error && (
            <div style={{
              marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '13px',
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              marginBottom: '16px', padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(14,122,101,0.06)', border: '1px solid rgba(14,122,101,0.2)',
              color: '#0e7a65', fontSize: '13px',
            }}>
              {success}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <Field label="ອີເມວ" type="email" value={email} onChange={setEmail}
                placeholder={current.placeholder} color={current.color} />
              <Field label="ລະຫັດຜ່ານ" type="password" value={password} onChange={setPassword}
                placeholder="••••••••" color={current.color} />
              <SubmitBtn loading={loading} color={current.color}
                text={loading ? 'ກຳລັງເຂົ້າລະບົບ...' : `ເຂົ້າລະບົບ ${roleHint === 'admin' ? '⚙️' : '👤'}`} />
            </form>
          )}

          {/* SETUP FORM */}
          {mode === 'setup' && (
            <form onSubmit={handleSetup}>
              <Field label="ຊື່ Admin" type="text" value={name} onChange={setName}
                placeholder="Super Admin" color="#f59e0b" />
              <Field label="ອີເມວ" type="email" value={email} onChange={setEmail}
                placeholder="admin@sabaidee.com" color="#f59e0b" />
              <Field label="ລະຫັດຜ່ານ" type="password" value={password} onChange={setPassword}
                placeholder="ຢ່າງໜ້ອຍ 8 ຕົວ" color="#f59e0b" />
              <Field label="ຢືນຢັນລະຫັດຜ່ານ" type="password" value={confirm} onChange={setConfirm}
                placeholder="ໃສ່ລະຫັດຜ່ານອີກຄັ້ງ" color="#f59e0b" />
              <SubmitBtn loading={loading} color="#f59e0b"
                text={loading ? 'ກຳລັງສ້າງ...' : '🔧 ສ້າງ Admin'} />
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reusable Field ──────────────────────────────────────────────────────────
function Field({ label, type, value, onChange, placeholder, color }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder} required
        onChange={e => onChange(e.target.value)}
        onFocus={e => e.target.style.border = `1.5px solid ${color}`}
        onBlur={e  => e.target.style.border = '1.5px solid #e2e8f0'}
        style={{
          width: '100%', background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '12px', padding: '12px 16px',
          color: '#0f172a', fontSize: '14px',
          outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s',
        }}
      />
    </div>
  )
}

// ── Reusable Button ─────────────────────────────────────────────────────────
function SubmitBtn({ loading, color, text }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', marginTop: '8px',
      background: loading ? `${color}80` : color,
      color: '#fff', fontWeight: 700, fontSize: '15px',
      padding: '14px', borderRadius: '12px', border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      boxShadow: loading ? 'none' : `0 4px 16px ${color}40`,
    }}>
      {text}
    </button>
  )
}