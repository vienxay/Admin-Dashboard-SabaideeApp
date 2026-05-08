import { useAuth } from '../context/useAuth'

export function usePermission() {
  const { admin } = useAuth()

  const isAdmin = admin?.role === 'admin'
  const isStaff = admin?.role === 'staff'

  // ✅ ສິດການເຂົ້າຖຶງ
  const can = {
    viewKYC:     isAdmin || isStaff,
    approveKYC:  isAdmin || isStaff,
    viewUsers:   isAdmin,
    changeRole:  isAdmin,
    deleteUser:  isAdmin,
    viewRate:    isAdmin,
    viewStats:   isAdmin,
    viewReport:  isAdmin || isStaff,  // ✅ ເພີ່ມ
  }

  return { isAdmin, isStaff, can }
}