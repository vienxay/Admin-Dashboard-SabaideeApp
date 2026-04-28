export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 999,
      padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
      background: toast.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,170,0.12)',
      border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,170,0.3)'}`,
      color: toast.type === 'error' ? '#f87171' : '#00d4aa',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {toast.msg}
    </div>
  )
}