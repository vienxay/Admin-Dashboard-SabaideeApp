import { useAuth } from '../context/useAuth'

export function usePermission() {
  const { admin } = useAuth()

  const isAdmin = admin?.role === 'admin'
  const isStaff = admin?.role === 'staff'

  // ✅ ສິດການເຂົ້າຖຶງ
  const can = {
    viewKYC:     isAdmin || isStaff,  // ທັງ 2 ເຫັນ
    approveKYC:  isAdmin || isStaff,  // ທັງ 2 ອະນຸມັດໄດ້
    viewUsers:   isAdmin,             // admin ເທົ່ານັ້ນ
    changeRole:  isAdmin,             // admin ເທົ່ານັ້ນ
    deleteUser:  isAdmin,             // admin ເທົ່ານັ້ນ
    viewRate:    isAdmin,             // admin ເທົ່ານັ້ນ
    viewStats:   isAdmin,             // admin ເທົ່ານັ້ນ
  }

  return { isAdmin, isStaff, can }
}