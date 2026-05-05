import { useTheme } from '../../context/useTheme'

const TAB_CONFIG = {
  pending: {
    label:  'ລໍຖ້າ',
    accent: '#FFA02E',  // ✅ ສີສົ້ມ
    icon:   '⏳',
  },
  verified: {
    label:  'ຜ່ານແລ້ວ',
    accent: '#0e7a65',
    icon:   '✓',
  },
  rejected: {
    label:  'ປະຕິເສດ',
    accent: '#b91c1c',
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
              background:   isActive ? cfg.accent : theme.surface,  // ✅ solid color
              border:       isActive ? `2px solid ${cfg.accent}` : `1px solid ${theme.border}`,
              boxShadow:    'none',  // ✅ ລຶບ glow
            }}>

            {/* Icon + Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.2)' : `${cfg.accent}11`,  // ✅
                color:      isActive ? '#ffffff' : cfg.accent,                        // ✅
                border:     isActive ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${cfg.accent}33`,
                transition: 'all 0.2s',
              }}>
                {cfg.icon}
              </div>
              <span style={{
                fontSize:   '12px',
                fontWeight: isActive ? 600 : 500,
                color:      isActive ? '#ffffff' : theme.text,  // ✅
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                transition: 'color 0.2s',
              }}>
                {cfg.label}
              </span>
            </div>

            {/* Count */}
            <div style={{
              fontSize:   isActive ? '32px' : '28px',
              fontWeight: 700,
              color:      isActive ? '#ffffff' : theme.text,  // ✅
              transition: 'all 0.2s',
              lineHeight: 1,
            }}>
              {isActive ? count : '—'}
            </div>

            {/* Active bar */}
            {isActive && (
              <div style={{
                marginTop:    '12px',
                height:       '3px',
                borderRadius: '2px',
                background:   'rgba(255,255,255,0.5)',  // ✅ ຂາວ
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}