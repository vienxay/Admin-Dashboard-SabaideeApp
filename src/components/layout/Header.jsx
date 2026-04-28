import { useAuth }       from '../../context/useAuth'      // ✅
import { useNavigate }   from 'react-router-dom'           // ✅
import { usePermission } from '../../hooks/usePermission'  // ✅
import { useTheme }      from '../../context/useTheme'  // ✅
import { Sun, Moon, LogOut } from 'lucide-react'
import { useState }      from 'react'


export function Header({ mainTab, setMainTab }) {
  const { admin, logout }       = useAuth()
  const navigate                = useNavigate()
  const { can }                 = usePermission()
  const { mode, theme, toggle } = useTheme()

  const TABS = [
    { key: 'kyc',   label: '📋 KYC',    show: can.viewKYC   },
    { key: 'users', label: '👥 ຜູ້ໃຊ້', show: can.viewUsers },
    { key: 'rate',  label: '💱 ອັດຕາ',  show: can.viewRate  },
  ].filter(t => t.show)

  const ROLE_COLOR = { admin: '#00d4aa', staff: '#a78bfa' }
  const role = admin?.role || 'staff'
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{
      background:   theme.surface,
      borderBottom: `1px solid ${theme.border}`,
      padding: '14px 28px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
      transition: 'all 0.3s',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" fill="none" stroke="#00d4aa" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: theme.text }}>
            ຈັດການລະບົບ
          </div>
          <div style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'monospace' }}>
            Sabaidee Wallet
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)} style={{
            fontSize: '13px', fontWeight: 600, padding: '8px 18px',
            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
            background: mainTab === t.key ? 'rgba(0,212,170,0.15)' : 'transparent',
            border:     mainTab === t.key ? '1px solid rgba(0,212,170,0.4)' : `1px solid ${theme.border}`,
            color:      mainTab === t.key ? '#00d4aa' : theme.textSub,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Theme Toggle */}
        <button onClick={toggle}
          title={mode === 'dark' ? 'ສະລັບໄປ Light' : 'ສະລັບໄປ Dark'}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            border:    `1px solid ${theme.border}`,
            cursor: 'pointer', fontSize: '16px', transition: 'all 0.3s',
          }}>
          {mode === 'dark'
            ? <Sun  size={18} color="#f59e0b" />
            : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User + Role Badge */}
        <span style={{ fontSize: '13px', color: theme.textSub }}>
          👤 {admin?.name}
          <span style={{
            marginLeft: '6px', fontSize: '10px', padding: '2px 8px',
            borderRadius: '20px',
            background: `rgba(${role === 'admin' ? '0,212,170' : '167,139,250'},0.1)`,
            border: `1px solid ${ROLE_COLOR[role]}44`,
            color:  ROLE_COLOR[role],
          }}>
            {role === 'admin' ? 'ຜູ້ດູແລ' : 'ພະນັກງານ'}
          </span>
        </span>

        {/* Logout */}
        <button
  onClick={() => { logout(); navigate('/') }}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{
    display:      'flex',
    alignItems:   'center',
    gap:          '6px',
    fontSize:     '12px',
    padding:      '6px 14px',
    borderRadius: '8px',
    cursor:       'pointer',
    transition:   'all 0.2s',
    // ✅ ປ່ຽນສີຕາມ hover
    color:      hovered ? '#ef4444' : theme.textSub,
    border:     `1px solid ${hovered ? '#ef4444' : theme.border}`,
    background: hovered ? 'rgba(239,68,68,0.08)' : 'transparent',
  }}
>
  <LogOut size={14} />
  ອອກ
</button>

      </div>
    </div>
  )
}