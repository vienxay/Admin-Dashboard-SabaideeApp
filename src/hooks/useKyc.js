import { useState, useCallback, useEffect } from 'react'
import { getKycList, reviewKyc } from '../services/api'

export function useKyc() {
  const [kycTab,  setKycTab]  = useState('pending')
  const [kycList, setKycList] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchKyc = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getKycList(kycTab)
      setKycList(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }, [kycTab])

  // ✅ ໂຫລດອັດຕະໂນມັດທຸກຄັ້ງທີ່ kycTab ປ່ຽນ
  useEffect(() => {
    fetchKyc()
  }, [fetchKyc])

  const handleReview = async (userId, status, note) => {
    await reviewKyc(userId, status, note)
    fetchKyc()
  }

  return { kycTab, setKycTab, kycList, loading, fetchKyc, handleReview }
}