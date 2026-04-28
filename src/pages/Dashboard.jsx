import { useState, useEffect } from 'react'
import { Header }        from '../components/layout/Header'
import { Toast }         from '../components/layout/Toast'
import { KycStats }      from '../components/kyc/KycStats'
import { KycTable }      from '../components/kyc/KycTable'
import { KycModal }      from '../components/kyc/KycModal'
import { UsersTable }    from '../components/users/UsersTable'
import { RatePanel }     from '../components/rate/RatePanel'
import { useKyc }        from '../hooks/useKyc'
import { useUsers }      from '../hooks/useUsers'
import { useRate }       from '../hooks/useRate'
import { usePermission } from '../hooks/usePermission'
import { useTheme }      from '../context/useTheme'

export default function Dashboard() {
  // ✅ ທຸກ hooks ຢູ່ເທິງ — ກ່ອນ return
  const { theme }        = useTheme()
  const { can }          = usePermission()

  const [mainTab,  setMainTab]  = useState(can.viewKYC ? 'kyc' : 'rate')
  const [selected, setSelected] = useState(null)
  const [note,     setNote]     = useState('')
  const [toast,    setToast]    = useState(null)

  const { kycTab, setKycTab, kycList, loading: kycLoading, fetchKyc, handleReview } = useKyc()
  const { users, loading: usersLoading, fetchUsers, handleRoleChange, handleDelete } = useUsers()
  const { rate, stats, loading: rateLoading, fetchRate } = useRate()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (mainTab === 'kyc')   fetchKyc()
    if (mainTab === 'users') fetchUsers()
    if (mainTab === 'rate')  fetchRate()
  }, [mainTab, fetchKyc, fetchUsers, fetchRate])

  useEffect(() => { fetchKyc() }, [kycTab, fetchKyc])

  const onReview = async (status) => {
    try {
      await handleReview(selected.user._id, status, note)
      showToast(status === 'verified' ? '✅ ອະນຸມັດສຳເລັດ' : '❌ ປະຕິເສດແລ້ວ')
      setSelected(null)
      setNote('')
    } catch (err) {
      showToast(err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ', 'error')
    }
  }

  const onRoleChange = async (userId, role) => {
    try {
      await handleRoleChange(userId, role)
      showToast(`✅ ປ່ຽນ role ເປັນ ${role}`)
    } catch {
      showToast('ລົ້ມເຫຼວ', 'error')
    }
  }

  const onDelete = async (userId, name) => {
    if (!confirm(`ລຶບ "${name}"?`)) return
    try {
      await handleDelete(userId)
      showToast('🗑 ລຶບສຳເລັດ')
    } catch {
      showToast('ລຶບລົ້ມເຫຼວ', 'error')
    }
  }

  // ✅ return ດຽວ — ຢູ່ທ້າຍ
  return (
    <div style={{
        minHeight:  '100vh',
        background: theme.bg,
        color:      theme.text,
        fontFamily: 'Sora, sans-serif',
        transition: 'background 0.3s, color 0.3s',
    }}>
      <Toast toast={toast} />
      <Header mainTab={mainTab} setMainTab={setMainTab} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {mainTab === 'kyc' && can.viewKYC && (
          <>
            <KycStats kycTab={kycTab} setKycTab={setKycTab} count={kycList.length} />
            <KycTable
              kycTab={kycTab}   kycList={kycList}
              loading={kycLoading} onRefresh={fetchKyc}
              onSelect={(kyc) => { setSelected(kyc); setNote('') }}
            />
          </>
        )}

        {mainTab === 'users' && can.viewUsers && (
          <UsersTable
            users={users}        loading={usersLoading}
            onRefresh={fetchUsers}
            onRoleChange={onRoleChange}
            onDelete={onDelete}
          />
        )}

        {mainTab === 'rate' && can.viewRate && (
          <RatePanel
            rate={rate}   stats={stats}
            loading={rateLoading} onRefresh={fetchRate}
          />
        )}

        {!can.viewKYC && !can.viewUsers && !can.viewRate && (
          <div style={{ textAlign: 'center', padding: '80px', color: theme.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <div style={{ fontSize: '16px' }}>ທ່ານບໍ່ມີສິດເຂົ້າຖຶງສ່ວນນີ້</div>
          </div>
        )}
      </div>

      {selected && can.approveKYC && (
        <KycModal
          selected={selected} note={note}
          setNote={setNote}
          onClose={() => setSelected(null)}
          onReview={onReview}
        />
      )}
    </div>
  )
}