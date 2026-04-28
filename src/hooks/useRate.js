import { useState, useCallback } from 'react'
import { getRate, getStats } from '../services/api'

export function useRate() {
  const [rate,    setRate]    = useState(null)
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchRate = useCallback(async () => {
    setLoading(true)
    try {
      const [rateRes, statsRes] = await Promise.all([getRate(), getStats()])
      setRate(rateRes.data.rate)
      setStats(statsRes.data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  return { rate, stats, loading, fetchRate }
}