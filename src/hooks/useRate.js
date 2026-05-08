import { useState, useCallback, useEffect } from 'react'
import { getRate, getStats } from '../services/api'
import { usePermission } from './usePermission'  // ✅ ເພີ່ມ

export function useRate() {
  const [rate,    setRate]    = useState(null)
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAdmin } = usePermission()  // ✅ ເພີ່ມ

  const fetchRate = useCallback(async () => {
    setLoading(true)
    try {
      if (isAdmin) {
        // ✅ Admin — call ທັງ 2
        const [rateRes, statsRes] = await Promise.all([getRate(), getStats()])
        setRate(rateRes.data.rate)
        setStats(statsRes.data.data)
      } else {
        // ✅ Staff — call ສະເພາະ rate
        const rateRes = await getRate()
        setRate(rateRes.data.rate)
      }
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchRate()
  }, [fetchRate])

  return { rate, stats, loading, fetchRate }
}