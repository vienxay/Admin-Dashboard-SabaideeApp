import { useTheme } from '../../context/useTheme'

const TAB_CONFIG = {
  pending: {
    label:  'ລໍຖ້າ',
    accent: '#f59e0b',
    light:  'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    glow:   'rgba(245,158,11,0.15)',
    icon:   '⏳',
  },
  verified: {
    label:  'ຜ່ານແລ້ວ',
    accent: '#00d4aa',
    light:  'rgba(0,212,170,0.08)',
    border: 'rgba(0,212,170,0.2)',
    glow:   'rgba(0,212,170,0.15)',
    icon:   '✓',
  },
  rejected: {
    label:  'ປະຕິເສດ',
    accent: '#ef4444',
    light:  'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    glow:   'rgba(239,68,68,0.15)',
    icon:   '✕',
  },
}

const KYC_TABS = ['pending', 'verified', 'rejected']

export function KycStats({ kycTab, setKycTab, count }) {
  const { theme } = useTheme()

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '20px',
    }}>
      {KYC_TABS.map(t => {
        const cfg      = TAB_CONFIG[t]
        const isActive = kycTab === t

        return (
          <div
            key={t}
            onClick={() => setKycTab(t)}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.transform = 'translateY(0)'
            }}
            style={{
              borderRadius: '16px',
              padding:      '20px 24px',
              cursor:       'pointer',
              transition:   'all 0.2s',
              transform:    'translateY(0)',

              // ✅ Active vs Inactive
              background: isActive
                ? theme.name === 'light'
                  ? cfg.light
                  : `${cfg.accent}14`
                : theme.surface,

              border: isActive
                ? `2px solid ${cfg.accent}55`
                : `1px solid ${theme.border}`,

              boxShadow: isActive
                ? theme.name === 'light'
                  ? `0 4px 20px ${cfg.glow}`
                  : `0 4px 20px ${cfg.glow}`
                : theme.name === 'light'
                  ? '0 2px 8px rgba(99,115,150,0.08)'
                  : 'none',
            }}>

            {/* ✅ Icon + Label Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700,
                background: isActive ? `${cfg.accent}22` : `${cfg.accent}11`,
                color:      cfg.accent,
                border:    `1px solid ${cfg.accent}33`,
                transition: 'all 0.2s',
              }}>
                {cfg.icon}
              </div>
              <span style={{
                fontSize:   '12px',
                fontWeight: isActive ? 600 : 400,
                color:      isActive ? cfg.accent : theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                transition: 'color 0.2s',
              }}>
                {cfg.label}
              </span>
            </div>

            {/* ✅ Count */}
            <div style={{
              fontSize:   isActive ? '32px' : '28px',
              fontWeight: 700,
              color:      isActive ? cfg.accent : theme.textMuted,
              transition: 'all 0.2s',
              lineHeight: 1,
            }}>
              {isActive ? count : '—'}
            </div>

            {/* ✅ Active indicator bar */}
            {isActive && (
              <div style={{
                marginTop:    '12px',
                height:       '3px',
                borderRadius: '2px',
                background:   cfg.accent,
                opacity:      0.6,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}